const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../database/connection');
const { sendSMS, sendEmail } = require('../utils/notifications');

const router = express.Router();

// Регистрация нового пользователя
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('phone').isMobilePhone('ru-RU')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, phone, department } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, department, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName, phone, department || null, 'inspector']
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Вход в систему
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Находим пользователя
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Аккаунт деактивирован' });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Успешный вход в систему',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

// Упрощенная регистрация для исполнителей (по номеру телефона из осмотра)
router.post('/register-inspector', [
  body('phone').isMobilePhone('ru-RU'),
  body('fullName').notEmpty().trim(),
  body('inspectionId').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, fullName, inspectionId } = req.body;

    // Проверяем, что осмотр существует и номер телефона совпадает
    const inspectionResult = await pool.query(
      'SELECT id, inspector_phone FROM inspections WHERE id = $1 AND inspector_phone = $2',
      [inspectionId, phone]
    );

    if (inspectionResult.rows.length === 0) {
      return res.status(400).json({ message: 'Осмотр не найден или номер телефона не совпадает' });
    }

    // Генерируем временный пароль
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Создаем пользователя
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role`,
      [`temp_${phone}@cms.local`, passwordHash, fullName, phone, 'inspector']
    );

    const user = result.rows[0];

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Отправляем SMS с паролем
    await sendSMS(phone, `Ваш временный пароль: ${tempPassword}. Сохраните его для входа в систему.`);

    res.json({
      message: 'Регистрация успешна. Пароль отправлен в SMS.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации исполнителя:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Запрос на регистрацию администратора
router.post('/request-admin', [
  body('fullName').notEmpty().trim(),
  body('department').notEmpty().trim(),
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { fullName, department, email } = req.body;

    // Отправляем email администратору
    const adminEmail = 'cmsauto@bk.ru';
    const subject = 'Запрос на регистрацию администратора';
    const message = `
      Новый запрос на регистрацию администратора:
      
      ФИО: ${fullName}
      Подразделение: ${department}
      Email: ${email}
      
      Пожалуйста, создайте аккаунт для этого пользователя.
    `;

    await sendEmail(adminEmail, subject, message);

    res.json({ message: 'Запрос отправлен администратору' });

  } catch (error) {
    console.error('Ошибка отправки запроса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Проверка токена
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Аккаунт деактивирован' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(401).json({ message: 'Недействительный токен' });
  }
});

module.exports = router;
