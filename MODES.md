# Режимы работы CMS Check

## 🚀 Упрощенный режим (без БД)

Текущий режим - **упрощенный**, работает без PostgreSQL для быстрого тестирования.

### Особенности:
- ✅ Работает сразу после `npm install`
- ✅ Не требует настройки базы данных
- ✅ Данные хранятся в памяти
- ✅ Тестовый пользователь: `admin@cms.local` / `password`
- ⚠️ Данные теряются при перезапуске
- ⚠️ Нет загрузки файлов
- ⚠️ Нет уведомлений

### Используемые файлы:
- `routes/auth-simple.js` - упрощенная аутентификация
- `routes/inspections-simple.js` - упрощенные осмотры

### Запуск:
```bash
npm run dev
```

Откройте http://localhost:3000 и войдите:
- Email: `admin@cms.local`
- Пароль: `password`

---

## 🏢 Полный режим (с PostgreSQL)

Для продакшена и полного функционала нужно переключиться на полный режим.

### Шаг 1: Установка PostgreSQL

**Windows:**
1. Скачайте с https://www.postgresql.org/download/windows/
2. Установите PostgreSQL 12+
3. Запомните пароль для пользователя `postgres`

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Шаг 2: Создание базы данных

```bash
# Подключение к PostgreSQL
psql -U postgres

# В консоли PostgreSQL:
CREATE DATABASE cms_check;
\q

# Выполнение миграций
psql -U postgres -d cms_check -f database/schema.sql
```

### Шаг 3: Настройка .env

Отредактируйте файл `.env`:

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_check
DB_USER=postgres
DB_PASSWORD=ваш_пароль

# JWT
JWT_SECRET=замените_на_случайную_строку_минимум_32_символа
JWT_EXPIRES_IN=24h

# Сервер
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email (опционально, для уведомлений)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ваш_email@gmail.com
EMAIL_PASS=пароль_приложения_gmail

# SMS (опционально, для уведомлений)
TWILIO_ACCOUNT_SID=ваш_twilio_sid
TWILIO_AUTH_TOKEN=ваш_twilio_token
TWILIO_PHONE_NUMBER=ваш_twilio_номер

# Файлы
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Шаг 4: Переключение режима

Откройте `server.js` и измените строки 8-13:

**Было (упрощенный режим):**
```javascript
const authRoutes = require('./routes/auth-simple');
const inspectionRoutes = require('./routes/inspections-simple');
// const userRoutes = require('./routes/users');
// const uploadRoutes = require('./routes/upload');
```

**Должно быть (полный режим):**
```javascript
const authRoutes = require('./routes/auth');
const inspectionRoutes = require('./routes/inspections');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
```

И строки 36-40:

**Было:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/inspections', inspectionRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/upload', uploadRoutes);
```

**Должно быть:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
```

### Шаг 5: Создание первого администратора

**Вариант 1: Через SQL**
```sql
-- Подключитесь к базе
psql -U postgres -d cms_check

-- Вставьте администратора (пароль: admin123)
INSERT INTO users (email, password_hash, full_name, phone, role)
VALUES (
  'admin@cms.local',
  '$2a$10$rOzJKjKZjKzKzKzKzKzKzOzJKjKZjKzKzKzKzKzKzOzJKjKZjKzKz',
  'Администратор',
  '+79991234567',
  'admin'
);
```

**Вариант 2: Через Node.js**

Создайте файл `create-admin.js`:
```javascript
const bcrypt = require('bcryptjs');
const pool = require('./database/connection');

(async () => {
  try {
    const email = 'admin@cms.local';
    const password = 'admin123'; // Измените на свой пароль
    const fullName = 'Администратор';
    const phone = '+79991234567';
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [email, passwordHash, fullName, phone, 'admin']
    );
    
    console.log('✅ Администратор создан:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
})();
```

Запустите:
```bash
node create-admin.js
```

### Шаг 6: Перезапуск

```bash
# Остановите процессы (Ctrl+C)
# Или в новом терминале:
taskkill /F /IM node.exe  # Windows
# killall node             # macOS/Linux

# Запустите заново
npm run dev
```

### Шаг 7: Проверка

1. Откройте http://localhost:3000
2. Войдите с учетными данными администратора
3. Создайте тестовый осмотр
4. Загрузите фотографии
5. Проверьте экспорт в Excel

---

## 📊 Сравнение режимов

| Функция | Упрощенный режим | Полный режим |
|---------|------------------|--------------|
| Аутентификация | ✅ In-memory | ✅ PostgreSQL |
| Осмотры | ✅ In-memory | ✅ PostgreSQL |
| Загрузка фото | ❌ | ✅ |
| Геолокация | ✅ | ✅ |
| Уведомления | ❌ (в консоль) | ✅ SMS/Email |
| Экспорт Excel | ✅ | ✅ |
| История статусов | ❌ | ✅ |
| Управление пользователями | ❌ | ✅ |
| Постоянное хранение | ❌ | ✅ |

---

## 🔧 Устранение проблем

### Ошибка: "listen EADDRINUSE: address already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Ошибка: "connect ECONNREFUSED" (БД)
1. Проверьте, запущен ли PostgreSQL
2. Проверьте параметры в `.env`
3. Проверьте, создана ли база данных

### Ошибка: "relation does not exist"
```bash
# Заново выполните миграции
psql -U postgres -d cms_check -f database/schema.sql
```

---

## 🚀 Рекомендации

**Для разработки/тестирования:**
- Используйте упрощенный режим
- Быстрый запуск без настройки

**Для продакшена:**
- Используйте полный режим
- Настройте PostgreSQL
- Настройте SMS/Email уведомления
- Настройте резервное копирование
- Используйте SSL сертификаты

---

**Текущий режим приложения: УПРОЩЕННЫЙ**

Для переключения на полный режим следуйте инструкциям выше.

