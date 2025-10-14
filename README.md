# CMS Check - Система дистанционных осмотров имущества

Веб-сервис для планирования, проведения и контроля дистанционных осмотров различного имущества (автотранспорт, недвижимость и т.д.).

## 🚀 Возможности

### Для администраторов:
- Создание и управление осмотрами
- Просмотр реестра осмотров с фильтрацией
- Проверка и утверждение осмотров
- Экспорт данных в Excel
- Дублирование существующих осмотров
- Управление пользователями

### Для исполнителей:
- Мобильный интерфейс для проведения осмотров
- Фотосъемка с автоматической фиксацией геолокации
- Загрузка фотографий с метаданными
- Уведомления о новых осмотрах

## 🛠 Технологии

### Backend:
- **Node.js** с Express.js
- **PostgreSQL** для базы данных
- **JWT** для аутентификации
- **Multer** для загрузки файлов
- **Nodemailer** для email-уведомлений
- **Twilio** для SMS-уведомлений

### Frontend:
- **React 18** с TypeScript
- **React Router** для навигации
- **TanStack Query** для управления состоянием
- **React Hook Form** с Yup для валидации
- **Lucide React** для иконок
- **React Hot Toast** для уведомлений

## 📋 Требования

- Node.js 16+ 
- PostgreSQL 12+
- npm или yarn

## 🚀 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/jfsagro-glitch/CMS_chek.git
cd CMS_chek
```

### 2. Установка зависимостей
```bash
# Установка зависимостей сервера
npm install

# Установка зависимостей клиента
cd client
npm install
cd ..
```

### 3. Настройка базы данных
```bash
# Создание базы данных
createdb cms_check

# Выполнение миграций
psql -d cms_check -f database/schema.sql
```

### 4. Настройка переменных окружения
Скопируйте файл `env.example` в `.env` и заполните необходимые значения:

```bash
cp env.example .env
```

Обязательные переменные:
```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_check
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Email (опционально)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (опционально)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Файлы
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Клиент
CLIENT_URL=http://localhost:3000
```

### 5. Запуск в режиме разработки
```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или по отдельности:
# Сервер (порт 5000)
npm run server

# Клиент (порт 3000)
npm run client
```

### 6. Сборка для продакшена
```bash
# Сборка клиента
npm run build

# Запуск сервера
npm start
```

## 📱 Использование

### Регистрация и вход
1. Откройте приложение в браузере: `http://localhost:3000`
2. Для регистрации администратора отправьте запрос на `cmsauto@bk.ru`
3. Исполнители могут регистрироваться через упрощенную форму

### Создание осмотра
1. Нажмите "Новый осмотр"
2. Выберите тип имущества
3. Заполните основную информацию
4. Добавьте объекты осмотра (до 150 шт.)
5. Отправьте осмотр исполнителю

### Проведение осмотра (мобильный интерфейс)
1. Исполнитель получает SMS со ссылкой
2. Переходит по ссылке на мобильный интерфейс
3. Делает фотографии объектов с геолокацией
4. Отправляет осмотр на проверку

### Проверка осмотра
1. Администратор видит осмотр в статусе "Проверка"
2. Просматривает все фотографии с метаданными
3. Принимает или возвращает на доработку

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/register-inspector` - Упрощенная регистрация исполнителя
- `GET /api/auth/verify` - Проверка токена

### Осмотры
- `GET /api/inspections` - Список осмотров
- `POST /api/inspections` - Создание осмотра
- `GET /api/inspections/:id` - Детали осмотра
- `PATCH /api/inspections/:id/status` - Изменение статуса
- `POST /api/inspections/:id/duplicate` - Дублирование
- `GET /api/inspections/export/excel` - Экспорт в Excel

### Загрузка файлов
- `POST /api/upload/photo` - Загрузка фотографии
- `GET /api/upload/photo/:filename` - Получение фотографии
- `DELETE /api/upload/photo/:id` - Удаление фотографии

### Пользователи
- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновление профиля
- `PUT /api/users/password` - Изменение пароля

## 📁 Структура проекта

```
CMS_chek/
├── client/                 # React приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── contexts/       # React контексты
│   │   ├── services/       # API сервисы
│   │   └── ...
│   └── public/
├── database/              # Схема базы данных
├── routes/                # API маршруты
├── middleware/            # Middleware функции
├── utils/                 # Утилиты
├── uploads/               # Загруженные файлы
├── server.js              # Точка входа сервера
└── package.json
```

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Валидация входных данных
- Защита от XSS и CSRF
- Rate limiting для API
- Проверка прав доступа

## 📊 Статусы осмотров

- **В работе** - Осмотр создан, отправлен исполнителю
- **Проверка** - Исполнитель завершил съемку, ожидает проверки
- **Готов** - Осмотр принят администратором
- **Доработка** - Требуются дополнительные материалы

## 🚀 Деплой

### Heroku
```bash
# Установка Heroku CLI
npm install -g heroku

# Логин в Heroku
heroku login

# Создание приложения
heroku create cms-check-app

# Настройка переменных окружения
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your_db_host
# ... другие переменные

# Деплой
git push heroku main
```

### Vercel (только фронтенд)
```bash
# Установка Vercel CLI
npm install -g vercel

# Деплой
cd client
vercel --prod
```

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Для получения поддержки или вопросов:
- Email: cmsauto@bk.ru
- GitHub Issues: [Создать issue](https://github.com/jfsagro-glitch/CMS_chek/issues)

## 📈 Планы развития

- [ ] Интеграция с картами (Yandex Maps, Google Maps)
- [ ] Мобильное приложение (React Native)
- [ ] Расширенная аналитика и отчеты
- [ ] Интеграция с внешними системами
- [ ] Система уведомлений в реальном времени
- [ ] Автоматическое распознавание объектов на фото

---

**CMS Check** - Современное решение для дистанционных осмотров имущества 🏠🚗📱
