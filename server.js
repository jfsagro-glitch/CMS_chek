const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'docs')));

// API маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/upload', require('./routes/upload'));

// Обработка для GitHub Pages - все маршруты ведут к index.html
app.get(['/', '/login', '/register', '/inspections', '/inspections/create', '/inspections/*', '/mobile', '/inspection/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Fallback для всех остальных маршрутов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});