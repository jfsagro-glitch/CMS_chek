const express = require('express');
const jwt = require('jsonwebtoken');
const { sendSMS, sendEmail } = require('../utils/notifications');

const router = express.Router();

// Простая база данных в памяти для осмотров
let inspections = [
  {
    id: 1,
    internal_number: 'INS-001',
    property_type: 'Автотранспорт',
    address: 'г. Москва, ул. Ленина, д. 1',
    latitude: 55.7558,
    longitude: 37.6176,
    inspector_name: 'Иванов Иван Иванович',
    inspector_phone: '+79991234567',
    inspector_email: 'ivanov@example.com',
    status: 'В работе',
    comment: 'Тестовый осмотр',
    created_by: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    objects_count: 2,
    photos_count: 0
  }
];

let inspectionObjects = [
  {
    id: 1,
    inspection_id: 1,
    vin: '1HGBH41JXMN109186',
    registration_number: 'А123БВ77',
    category: 'Легковой автомобиль',
    type: 'Седан',
    make: 'Toyota',
    model: 'Camry'
  },
  {
    id: 2,
    inspection_id: 1,
    vin: '1HGBH41JXMN109187',
    registration_number: 'В456ГД78',
    category: 'Легковой автомобиль',
    type: 'Хэтчбек',
    make: 'Honda',
    model: 'Civic'
  }
];

let photos = [];
let statusHistory = [];

// Middleware для проверки авторизации
const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cms_check_secret_key_2024');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Недействительный токен' });
  }
};

// Получить список осмотров
router.get('/', authenticateToken, (req, res) => {
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

    let filteredInspections = [...inspections];

    // Применяем фильтры
    if (status) {
      filteredInspections = filteredInspections.filter(i => i.status === status);
    }
    if (address) {
      filteredInspections = filteredInspections.filter(i => 
        i.address.toLowerCase().includes(address.toLowerCase())
      );
    }
    if (inspector) {
      filteredInspections = filteredInspections.filter(i => 
        i.inspector_name.toLowerCase().includes(inspector.toLowerCase())
      );
    }
    if (internalNumber) {
      filteredInspections = filteredInspections.filter(i => 
        i.internal_number?.toLowerCase().includes(internalNumber.toLowerCase())
      );
    }

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedInspections = filteredInspections.slice(startIndex, endIndex);

    res.json({
      inspections: paginatedInspections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredInspections.length,
        pages: Math.ceil(filteredInspections.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Ошибка получения осмотров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить осмотр по ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const inspection = inspections.find(i => i.id === parseInt(id));

    if (!inspection) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    const objects = inspectionObjects.filter(o => o.inspection_id === parseInt(id));
    const inspectionPhotos = photos.filter(p => p.inspection_id === parseInt(id));
    const history = statusHistory.filter(h => h.inspection_id === parseInt(id));

    res.json({
      inspection,
      objects,
      photos: inspectionPhotos,
      statusHistory: history
    });

  } catch (error) {
    console.error('Ошибка получения осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новый осмотр
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Получен запрос на создание осмотра:', req.body);
    
    // Поддерживаем оба формата (snake_case и camelCase) для совместимости
    const {
      propertyType = req.body.property_type,
      address,
      latitude = req.body.coordinates?.lat,
      longitude = req.body.coordinates?.lng,
      inspectorName = req.body.inspector_name,
      inspectorPhone = req.body.inspector_phone,
      inspectorEmail = req.body.inspector_email,
      internalNumber = req.body.internal_number,
      comment = req.body.comments || req.body.comment,
      objects
    } = req.body;

    const newInspection = {
      id: inspections.length + 1,
      internal_number: internalNumber || `INS-${String(inspections.length + 1).padStart(3, '0')}`,
      property_type: propertyType,
      address,
      latitude,
      longitude,
      inspector_name: inspectorName,
      inspector_phone: inspectorPhone,
      inspector_email: inspectorEmail,
      status: 'Новый',
      comment,
      created_by: req.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      objects_count: objects?.length || 0,
      photos_count: 0
    };

    inspections.push(newInspection);
    console.log('Осмотр создан:', newInspection.internal_number);

    // Добавляем объекты осмотра
    if (objects && objects.length > 0) {
      objects.forEach((obj, index) => {
        inspectionObjects.push({
          id: inspectionObjects.length + 1,
          inspection_id: newInspection.id,
          vin: obj.vin,
          registration_number: obj.registrationNumber,
          category: obj.category,
          type: obj.type,
          make: obj.make,
          model: obj.model
        });
      });
      console.log(`Добавлено объектов: ${objects.length}`);
    }

    // СНАЧАЛА отправляем ответ клиенту, чтобы не зависать
    res.status(201).json({
      message: 'Осмотр успешно создан и отправлен исполнителю',
      inspection: newInspection
    });

    // ПОТОМ асинхронно отправляем уведомления (не блокируя ответ)
    const inspectionLink = `${process.env.CLIENT_URL || 'https://jfsagro-glitch.github.io/CMS_chek'}/inspection/${newInspection.id}`;
    
    // Отправляем SMS в фоне
    sendSMS(inspectorPhone, `CMS Check: Вам назначен осмотр №${newInspection.internal_number}. Ссылка: ${inspectionLink}`)
      .then(() => console.log(`SMS отправлено: ${inspectorPhone}`))
      .catch(err => console.error('Ошибка SMS:', err.message));

    // Отправляем Email в фоне
    if (inspectorEmail) {
      const emailSubject = `Новый осмотр №${newInspection.internal_number}`;
      const emailHtml = `
        <h2>Назначен новый осмотр</h2>
        <p>Здравствуйте, ${inspectorName}!</p>
        <p>Вам назначен осмотр №${newInspection.internal_number}</p>
        
        <h3>Детали осмотра:</h3>
        <ul>
          <li><strong>Адрес:</strong> ${address}</li>
          <li><strong>Тип имущества:</strong> ${propertyType}</li>
          <li><strong>Количество объектов:</strong> ${objects?.length || 0}</li>
          ${comment ? `<li><strong>Комментарий:</strong> ${comment}</li>` : ''}
        </ul>
        
        <p><strong>Для выполнения осмотра перейдите по ссылке:</strong></p>
        <p><a href="${inspectionLink}" style="display: inline-block; padding: 12px 24px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 6px;">Перейти к осмотру</a></p>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Это письмо отправлено автоматически системой CMS Check. Пожалуйста, не отвечайте на него.
        </p>
      `;
      
      const emailText = `Новый осмотр №${newInspection.internal_number}\n\nЗдравствуйте, ${inspectorName}!\nВам назначен осмотр №${newInspection.internal_number}\n\nДетали осмотра:\n- Адрес: ${address}\n- Тип имущества: ${propertyType}\n- Количество объектов: ${objects?.length || 0}\n${comment ? `- Комментарий: ${comment}\n` : ''}\nДля выполнения осмотра перейдите по ссылке: ${inspectionLink}`;
      
      sendEmail(inspectorEmail, emailSubject, emailText, emailHtml)
        .then(() => console.log(`Email отправлен: ${inspectorEmail}`))
        .catch(err => console.error('Ошибка Email:', err.message));
    }

  } catch (error) {
    console.error('Ошибка создания осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Обновить статус осмотра
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const inspection = inspections.find(i => i.id === parseInt(id));
    if (!inspection) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    const oldStatus = inspection.status;
    inspection.status = status;
    inspection.updated_at = new Date().toISOString();

    // Записываем в историю
    statusHistory.push({
      id: statusHistory.length + 1,
      inspection_id: parseInt(id),
      old_status: oldStatus,
      new_status: status,
      changed_by: req.user.userId,
      comment,
      created_at: new Date().toISOString()
    });

    res.json({
      message: 'Статус обновлен',
      inspection
    });

  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Дублировать осмотр
router.post('/:id/duplicate', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const originalInspection = inspections.find(i => i.id === parseInt(id));

    if (!originalInspection) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    const newInspection = {
      ...originalInspection,
      id: inspections.length + 1,
      internal_number: `INS-${String(inspections.length + 1).padStart(3, '0')}`,
      status: 'В работе',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos_count: 0
    };

    inspections.push(newInspection);

    // Копируем объекты
    const originalObjects = inspectionObjects.filter(o => o.inspection_id === parseInt(id));
    originalObjects.forEach(obj => {
      inspectionObjects.push({
        ...obj,
        id: inspectionObjects.length + 1,
        inspection_id: newInspection.id
      });
    });

    res.status(201).json({
      message: 'Осмотр успешно дублирован',
      inspection: newInspection
    });

  } catch (error) {
    console.error('Ошибка дублирования осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Экспорт в Excel (заглушка)
router.get('/export/excel', authenticateToken, (req, res) => {
  try {
    res.json({ message: 'Экспорт в Excel будет реализован' });
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
