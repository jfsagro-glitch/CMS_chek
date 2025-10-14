const express = require('express');
const jwt = require('jsonwebtoken');

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
router.post('/', authenticateToken, (req, res) => {
  try {
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
      status: 'В работе',
      comment,
      created_by: req.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      objects_count: objects?.length || 0,
      photos_count: 0
    };

    inspections.push(newInspection);

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
    }

    res.status(201).json({
      message: 'Осмотр успешно создан',
      inspection: newInspection
    });

  } catch (error) {
    console.error('Ошибка создания осмотра:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
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
