const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Получить профиль пользователя
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, department, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        department: user.department,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить профиль пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, department } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET full_name = $1, phone = $2, department = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, full_name, phone, department, role`,
      [fullName, phone, department, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Профиль обновлен',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        department: user.department,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Изменить пароль
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Текущий и новый пароль обязательны' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен содержать минимум 6 символов' });
    }

    // Получаем текущий пароль
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Пароль успешно изменен' });

  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить список всех пользователей (только для администраторов)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Проверяем права администратора
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }

    const result = await pool.query(
      `SELECT id, email, full_name, phone, department, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      users: result.rows.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        department: user.department,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }))
    });

  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать пользователя (только для администраторов)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Проверяем права администратора
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }

    const { email, password, fullName, phone, department, role } = req.body;

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
      [email, passwordHash, fullName, phone, department, role || 'inspector']
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Активировать/деактивировать пользователя (только для администраторов)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    // Проверяем права администратора
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, is_active',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    res.json({
      message: `Пользователь ${isActive ? 'активирован' : 'деактивирован'}`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Ошибка изменения статуса пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
