const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../database/connection');
const { sendInspectionNotification, sendStatusChangeNotification } = require('../utils/notifications');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware для проверки авторизации
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Недействительный токен' });
  }
};

// Получить список осмотров с фильтрацией
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      address,
      inspector,
      dateFrom,
      dateTo,
      internalNumber
    } = req.query;

    let query = `
      SELECT i.*, u.full_name as created_by_name,
             COUNT(io.id) as objects_count,
             COUNT(p.id) as photos_count
      FROM inspections i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN inspection_objects io ON i.id = io.inspection_id
      LEFT JOIN photos p ON i.id = p.inspection_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    // Фильтр по статусу
    if (status) {
      conditions.push(`i.status = $${++paramCount}`);
      params.push(status);
    }

    // Фильтр по адресу
    if (address) {
      conditions.push(`i.address ILIKE $${++paramCount}`);
      params.push(`%${address}%`);
    }

    // Фильтр по исполнителю
    if (inspector) {
      conditions.push(`i.inspector_name ILIKE $${++paramCount}`);
      params.push(`%${inspector}%`);
    }

    // Фильтр по внутреннему номеру
    if (internalNumber) {
      conditions.push(`i.internal_number ILIKE $${++paramCount}`);
      params.push(`%${internalNumber}%`);
    }

    // Фильтр по дате (по умолчанию последние 6 месяцев)
    if (dateFrom && dateTo) {
      conditions.push(`i.created_at BETWEEN $${++paramCount} AND $${++paramCount}`);
      params.push(dateFrom, dateTo);
    } else {
      // По умолчанию показываем последние 6 месяцев
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      conditions.push(`i.created_at >= $${++paramCount}`);
      params.push(sixMonthsAgo.toISOString());
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY i.id, u.full_name';

    // Подсчет общего количества
    const countQuery = query.replace(
      'SELECT i.*, u.full_name as created_by_name, COUNT(io.id) as objects_count, COUNT(p.id) as photos_count',
      'SELECT COUNT(*) as total'
    ).replace('GROUP BY i.id, u.full_name', '');

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Добавляем сортировку и пагинацию
    query += ` ORDER BY i.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      inspections: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Ошибка получения осмотров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новый осмотр
router.post('/', authenticateToken, [
  body('propertyType').notEmpty(),
  body('address').notEmpty(),
  body('inspectorName').notEmpty(),
  body('inspectorPhone').isMobilePhone('ru-RU'),
  body('objects').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      propertyType,
      address,
      latitude,
      longitude,
      inspectorName,
      inspectorPhone,
      inspectorEmail,
      internalNumber,
      comment,
      objects
    } = req.body;

    // Генерируем токен доступа
    const accessToken = uuidv4();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7 дней

    // Создаем осмотр
    const inspectionResult = await pool.query(
      `INSERT INTO inspections (
        property_type, address, latitude, longitude,
        inspector_name, inspector_phone, inspector_email,
        internal_number, comment, created_by, access_token, token_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        propertyType, address, latitude, longitude,
        inspectorName, inspectorPhone, inspectorEmail,
        internalNumber, comment, req.user.id, accessToken, tokenExpiresAt
      ]
    );

    const inspection = inspectionResult.rows[0];

    // Добавляем объекты осмотра
    for (const obj of objects) {
      await pool.query(
        `INSERT INTO inspection_objects (
          inspection_id, vin, registration_number, category, type, make, model
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          inspection.id, obj.vin, obj.registrationNumber, obj.category,
          obj.type, obj.make, obj.model
        ]
      );
    }

    // Отправляем уведомление исполнителю
    await sendInspectionNotification(inspection);

    res.status(201).json({
      message: 'Осмотр успешно создан',
      inspection: {
        id: inspection.id,
        internalNumber: inspection.internal_number,
        status: inspection.status,
        address: inspection.address,
        inspectorName: inspection.inspector_name,
        accessToken: inspection.access_token
      }
    });

  } catch (error) {
    console.error('Ошибка создания осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить осмотр по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const inspectionResult = await pool.query(
      `SELECT i.*, u.full_name as created_by_name
       FROM inspections i
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (inspectionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    const inspection = inspectionResult.rows[0];

    // Получаем объекты осмотра
    const objectsResult = await pool.query(
      'SELECT * FROM inspection_objects WHERE inspection_id = $1',
      [id]
    );

    // Получаем фотографии
    const photosResult = await pool.query(
      `SELECT p.*, io.make, io.model, io.registration_number
       FROM photos p
       LEFT JOIN inspection_objects io ON p.object_id = io.id
       WHERE p.inspection_id = $1
       ORDER BY p.taken_at`,
      [id]
    );

    // Получаем историю статусов
    const statusHistoryResult = await pool.query(
      `SELECT sh.*, u.full_name as changed_by_name
       FROM status_history sh
       LEFT JOIN users u ON sh.changed_by = u.id
       WHERE sh.inspection_id = $1
       ORDER BY sh.created_at`,
      [id]
    );

    res.json({
      inspection,
      objects: objectsResult.rows,
      photos: photosResult.rows,
      statusHistory: statusHistoryResult.rows
    });

  } catch (error) {
    console.error('Ошибка получения осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить статус осмотра
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['В работе', 'Проверка', 'Готов', 'Доработка']),
  body('comment').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, comment } = req.body;

    // Получаем текущий осмотр
    const currentResult = await pool.query(
      'SELECT * FROM inspections WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    const currentInspection = currentResult.rows[0];

    // Обновляем статус
    const updateResult = await pool.query(
      'UPDATE inspections SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Записываем в историю
    await pool.query(
      `INSERT INTO status_history (inspection_id, old_status, new_status, changed_by, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, currentInspection.status, status, req.user.id, comment]
    );

    // Отправляем уведомление о смене статуса
    await sendStatusChangeNotification(updateResult.rows[0], status, comment);

    res.json({
      message: 'Статус обновлен',
      inspection: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Дублировать осмотр
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем оригинальный осмотр
    const originalResult = await pool.query(
      'SELECT * FROM inspections WHERE id = $1',
      [id]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    const original = originalResult.rows[0];

    // Создаем новый осмотр
    const newInspectionResult = await pool.query(
      `INSERT INTO inspections (
        property_type, address, latitude, longitude,
        inspector_name, inspector_phone, inspector_email,
        internal_number, comment, created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        original.property_type, original.address, original.latitude, original.longitude,
        original.inspector_name, original.inspector_phone, original.inspector_email,
        original.internal_number, original.comment, req.user.id, 'В работе'
      ]
    );

    const newInspection = newInspectionResult.rows[0];

    // Копируем объекты
    const objectsResult = await pool.query(
      'SELECT * FROM inspection_objects WHERE inspection_id = $1',
      [id]
    );

    for (const obj of objectsResult.rows) {
      await pool.query(
        `INSERT INTO inspection_objects (
          inspection_id, vin, registration_number, category, type, make, model
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newInspection.id, obj.vin, obj.registration_number, obj.category,
          obj.type, obj.make, obj.model
        ]
      );
    }

    res.status(201).json({
      message: 'Осмотр успешно дублирован',
      inspection: newInspection
    });

  } catch (error) {
    console.error('Ошибка дублирования осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Экспорт в Excel
router.get('/export/excel', authenticateToken, async (req, res) => {
  try {
    const { exportInspectionsToExcel } = require('../utils/excelExport');
    
    // Получаем осмотры с теми же фильтрами
    const {
      status,
      address,
      inspector,
      dateFrom,
      dateTo,
      internalNumber
    } = req.query;

    let query = `
      SELECT i.*, u.full_name as created_by_name,
             COUNT(io.id) as objects_count,
             COUNT(p.id) as photos_count
      FROM inspections i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN inspection_objects io ON i.id = io.inspection_id
      LEFT JOIN photos p ON i.id = p.inspection_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (status) {
      conditions.push(`i.status = $${++paramCount}`);
      params.push(status);
    }

    if (address) {
      conditions.push(`i.address ILIKE $${++paramCount}`);
      params.push(`%${address}%`);
    }

    if (inspector) {
      conditions.push(`i.inspector_name ILIKE $${++paramCount}`);
      params.push(`%${inspector}%`);
    }

    if (internalNumber) {
      conditions.push(`i.internal_number ILIKE $${++paramCount}`);
      params.push(`%${internalNumber}%`);
    }

    if (dateFrom && dateTo) {
      conditions.push(`i.created_at BETWEEN $${++paramCount} AND $${++paramCount}`);
      params.push(dateFrom, dateTo);
    } else {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      conditions.push(`i.created_at >= $${++paramCount}`);
      params.push(sixMonthsAgo.toISOString());
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY i.id, u.full_name ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    const inspections = result.rows;

    // Создаем Excel файл
    const workbook = await exportInspectionsToExcel(inspections, req.query);
    
    // Настраиваем заголовки для скачивания
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="inspections_${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    // Отправляем файл
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Ошибка экспорта:', error);
    res.status(500).json({ message: 'Ошибка сервера при экспорте' });
  }
});

module.exports = router;
