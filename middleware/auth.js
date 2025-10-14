const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

const authenticateToken = async (req, res, next) => {
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

    req.user = user;
    next();
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(401).json({ message: 'Недействительный токен' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
  }
  next();
};

const requireInspector = (req, res, next) => {
  if (req.user.role !== 'inspector' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireInspector
};
