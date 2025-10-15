const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Используем упрощенные маршруты без базы данных для быстрого тестирования
const authRoutes = require('./routes/auth-simple');
const inspectionRoutes = require('./routes/inspections-simple');
// Временно отключаем маршруты, требующие БД
// const userRoutes = require('./routes/users');
// const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'CMS Check Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inspections', inspectionRoutes);
// Временно отключаем маршруты, требующие БД
// app.use('/api/users', userRoutes);
// app.use('/api/upload', uploadRoutes);

// Serve static files from React build (only if build exists)
// Frontend is hosted on GitHub Pages, so this is not needed on Render
if (process.env.NODE_ENV === 'production' && process.env.SERVE_STATIC === 'true') {
  const buildPath = path.join(__dirname, 'client/build');
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Что-то пошло не так!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
