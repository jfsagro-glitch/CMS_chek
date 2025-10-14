# 🚀 Быстрый старт CMS Check

## Минимальная установка (без БД)

Если вы хотите быстро протестировать систему без настройки PostgreSQL, используйте упрощенный режим:

### 1. Клонирование и установка
```bash
git clone https://github.com/jfsagro-glitch/CMS_chek.git
cd CMS_chek
npm install
cd client && npm install && cd ..
```

### 2. Создание .env файла
```bash
# Скопируйте пример
cp env.example .env
```

Минимальная конфигурация для теста:
```env
PORT=5000
JWT_SECRET=test_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Запуск в режиме разработки
```bash
# Запуск сервера и клиента одновременно
npm run dev
```

### 4. Доступ к приложению
- Откройте браузер: http://localhost:3000
- Используйте тестовые учетные данные:
  - **Email:** admin@cms.local
  - **Пароль:** password

## Полная установка (с PostgreSQL)

### 1. Установка PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

### 2. Создание базы данных
```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE cms_check;

# Выход
\q

# Выполнение миграций
psql -U postgres -d cms_check -f database/schema.sql
```

### 3. Настройка .env
```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_check
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Сервер
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email (опционально)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (опционально)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Файлы
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### 4. Переключение на полную версию
В файле `server.js` замените:
```javascript
// Было (упрощенная версия):
const authRoutes = require('./routes/auth-simple');
const inspectionRoutes = require('./routes/inspections-simple');

// Должно быть (полная версия):
const authRoutes = require('./routes/auth');
const inspectionRoutes = require('./routes/inspections');
```

### 5. Создание первого администратора
```bash
# Запустите Node.js консоль
node

# Выполните:
const bcrypt = require('bcryptjs');
const pool = require('./database/connection');

(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['admin@cms.local', hash, 'Администратор', '+79991234567', 'admin']
  );
  console.log('Админ создан с ID:', result.rows[0].id);
  process.exit();
})();
```

### 6. Запуск приложения
```bash
npm run dev
```

## Тестирование функционала

### 1. Вход в систему
- Откройте http://localhost:3000
- Войдите как администратор

### 2. Создание осмотра
1. Нажмите "Новый осмотр"
2. Выберите тип имущества (Автотранспорт/Недвижимость)
3. Укажите адрес
4. Добавьте данные исполнителя
5. Добавьте объекты осмотра
6. Сохраните

### 3. Проведение осмотра (мобильный интерфейс)
1. Скопируйте ссылку на осмотр
2. Откройте на мобильном устройстве
3. Сделайте фотографии объектов
4. Отправьте на проверку

### 4. Проверка осмотра
1. Найдите осмотр в статусе "Проверка"
2. Просмотрите фотографии
3. Примите или отправьте на доработку

### 5. Экспорт данных
1. Настройте фильтры на странице осмотров
2. Нажмите кнопку "Экспорт в Excel"
3. Скачайте файл

## Решение проблем

### Ошибка подключения к БД
```bash
# Проверьте статус PostgreSQL
sudo service postgresql status  # Linux
brew services list             # macOS

# Проверьте параметры подключения в .env
# Убедитесь, что пользователь и пароль верны
```

### Ошибка "Port already in use"
```bash
# Найдите и завершите процесс на порту 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Ошибки при установке зависимостей
```bash
# Очистите кэш npm
npm cache clean --force

# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### SMS/Email не отправляются
Это нормально для режима разработки. Сообщения будут выводиться в консоль:
```
SMS не настроен. Сообщение: Новый осмотр создан...
Email не настроен. Сообщение: ...
```

## Полезные команды

```bash
# Просмотр логов сервера
npm run server

# Просмотр логов клиента
npm run client

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start

# Инициализация БД
npm run init-db

# Установка всех зависимостей
npm run install-all

# Быстрый старт (установка + инициализация)
npm run setup
```

## Следующие шаги

1. Настройте реальные SMS/Email провайдеры
2. Настройте продакшен базу данных
3. Настройте домен и SSL
4. Настройте резервное копирование
5. Мониторинг и логирование

---

**Готово!** Теперь вы можете начать использовать CMS Check! 🎉

Если возникнут вопросы: cmsauto@bk.ru

