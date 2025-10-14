const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Простая база данных в памяти для тестирования
const users = [
  {
    id: 1,
    email: 'admin@cms.local',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    fullName: 'Администратор системы',
    role: 'admin',
    isActive: true
  }
];

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Аккаунт деактивирован' });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
      process.env.JWT_SECRET || 'cms_check_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Успешный вход в систему',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, department } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const newUser = {
      id: users.length + 1,
      email,
      password: passwordHash,
      fullName,
      phone,
      department,
      role: 'inspector',
      isActive: true
    };

    users.push(newUser);

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'cms_check_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Проверка токена
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cms_check_secret_key_2024');
    
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Аккаунт деактивирован' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(401).json({ message: 'Недействительный токен' });
  }
});

module.exports = router;
