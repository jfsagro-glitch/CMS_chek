const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const inspectionId = req.body.inspectionId;
    const objectId = req.body.objectId;
    
    // Создаем структуру папок: /inspections/{inspection_id}/{object_id}/
    const fullPath = path.join(uploadPath, 'inspections', inspectionId, objectId);
    
    // Создаем папки если их нет
    fs.mkdirSync(fullPath, { recursive: true });
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Имя файла: timestamp_geolocation.jpg
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const lat = req.body.latitude || 'unknown';
    const lng = req.body.longitude || 'unknown';
    const extension = path.extname(file.originalname);
    
    const filename = `${timestamp}_${lat}_${lng}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB по умолчанию
  },
  fileFilter: (req, file, cb) => {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'), false);
    }
  }
});

// Загрузка фотографии
router.post('/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const { inspectionId, objectId, latitude, longitude, timestamp } = req.body;

    // Проверяем, что осмотр существует
    const inspectionResult = await pool.query(
      'SELECT id FROM inspections WHERE id = $1',
      [inspectionId]
    );

    if (inspectionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Осмотр не найден' });
    }

    // Проверяем, что объект существует
    const objectResult = await pool.query(
      'SELECT id FROM inspection_objects WHERE id = $1 AND inspection_id = $2',
      [objectId, inspectionId]
    );

    if (objectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Объект осмотра не найден' });
    }

    // Сохраняем информацию о фото в базу данных
    const photoResult = await pool.query(
      `INSERT INTO photos (
        inspection_id, object_id, filename, original_name, file_path, 
        file_size, latitude, longitude, device_id, taken_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        inspectionId,
        objectId,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        req.headers['user-agent'] || null,
        timestamp || new Date().toISOString()
      ]
    );

    res.json({
      message: 'Фотография успешно загружена',
      photo: photoResult.rows[0]
    });

  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке фото' });
  }
});

// Получение фотографии
router.get('/photo/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { inspectionId, objectId } = req.query;
    
    const filePath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      'inspections',
      inspectionId,
      objectId,
      filename
    );

    // Проверяем, что файл существует
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    // Отправляем файл
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('Ошибка получения фото:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление фотографии
router.delete('/photo/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем информацию о фото
    const photoResult = await pool.query(
      'SELECT * FROM photos WHERE id = $1',
      [id]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Фотография не найдена' });
    }

    const photo = photoResult.rows[0];

    // Удаляем файл с диска
    if (fs.existsSync(photo.file_path)) {
      fs.unlinkSync(photo.file_path);
    }

    // Удаляем запись из базы данных
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    res.json({ message: 'Фотография удалена' });

  } catch (error) {
    console.error('Ошибка удаления фото:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении фото' });
  }
});

// Получение списка фотографий для осмотра
router.get('/photos/:inspectionId', authenticateToken, async (req, res) => {
  try {
    const { inspectionId } = req.params;

    const result = await pool.query(
      `SELECT p.*, io.make, io.model, io.registration_number
       FROM photos p
       LEFT JOIN inspection_objects io ON p.object_id = io.id
       WHERE p.inspection_id = $1
       ORDER BY p.taken_at`,
      [inspectionId]
    );

    res.json({
      photos: result.rows
    });

  } catch (error) {
    console.error('Ошибка получения фотографий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
