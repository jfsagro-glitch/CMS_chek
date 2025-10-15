# 🚀 Пошаговая инструкция по деплою Backend на Railway

## Шаг 1: Регистрация на Railway

1. Перейдите на https://railway.app/
2. Нажмите **"Start a New Project"** или **"Login"**
3. Войдите через GitHub (рекомендуется)

## Шаг 2: Создание нового проекта

1. После входа нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Найдите и выберите репозиторий: **jfsagro-glitch/CMS_chek**
4. Railway автоматически определит Node.js проект

## Шаг 3: Настройка переменных окружения

В разделе **"Variables"** добавьте следующие переменные:

### Обязательные переменные:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_12345
CLIENT_URL=https://jfsagro-glitch.github.io/CMS_chek
```

### Опциональные переменные (для полной функциональности):

```
# База данных (если используете PostgreSQL на Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# Email уведомления (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS уведомления (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Как добавить переменные:
1. Откройте ваш проект в Railway
2. Перейдите на вкладку **"Variables"**
3. Нажмите **"New Variable"**
4. Введите имя и значение
5. Нажмите **"Add"**

## Шаг 4: Добавление PostgreSQL (опционально)

Если хотите использовать полную версию с базой данных:

1. В проекте нажмите **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway автоматически создаст базу данных
3. Переменная `DATABASE_URL` будет добавлена автоматически
4. Выполните миграции (см. ниже)

## Шаг 5: Деплой

1. Railway автоматически начнет деплой после подключения репозитория
2. Следите за логами в разделе **"Deployments"**
3. После успешного деплоя получите URL вида: `https://cms-check-production.railway.app`

## Шаг 6: Проверка работы

Откройте в браузере:
```
https://your-app-name.railway.app/api/auth/verify
```

Если видите ответ (даже ошибку 401) - backend работает!

## Шаг 7: Обновление Frontend

Теперь нужно обновить URL API в клиенте:

### Вариант 1: Через переменную окружения (рекомендуется)

Создайте файл `client/.env.production`:
```
REACT_APP_API_URL=https://your-app-name.railway.app/api
```

### Вариант 2: Напрямую в коде

Отредактируйте `client/src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-app-name.railway.app/api';
```

### Пересоберите и задеплойте клиент:

```bash
cd client
npm run build
cd ..
xcopy client\build docs\ /E /I /Y  # Windows
# или
cp -r client/build/* docs/  # Linux/Mac

git add .
git commit -m "Update API URL to Railway backend"
git push origin main
```

## Шаг 8: Инициализация базы данных (если используете PostgreSQL)

### Через Railway CLI:

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Выполните миграцию
railway run npm run init-db
```

### Или вручную через Railway Shell:

1. В Railway откройте ваш проект
2. Перейдите в **"Settings"** → **"Deploy"**
3. Нажмите **"Open Shell"**
4. Выполните: `npm run init-db`

## Режимы работы

### Упрощенный режим (без БД)
Backend уже настроен на работу без базы данных через файлы:
- `routes/auth-simple.js`
- `routes/inspections-simple.js`

Для использования упрощенного режима убедитесь, что в `server.js` используются эти маршруты.

### Полный режим (с БД)
Для работы с PostgreSQL:
1. Добавьте PostgreSQL в Railway
2. Выполните `npm run init-db`
3. Переключите маршруты в `server.js` на полные версии

## Мониторинг и логи

- **Логи**: Railway → Deployments → View Logs
- **Метрики**: Railway → Metrics
- **Статус**: Railway → Deployments

## Автоматический деплой

Railway автоматически деплоит при каждом push в main ветку GitHub!

## Troubleshooting

### Ошибка: "Application failed to respond"
- Проверьте, что PORT установлен в переменных окружения
- Убедитесь, что server.js использует `process.env.PORT`

### Ошибка: "Database connection failed"
- Проверьте DATABASE_URL
- Убедитесь, что PostgreSQL добавлен в проект

### Ошибка CORS
- Проверьте CLIENT_URL в переменных окружения
- Убедитесь, что URL совпадает с GitHub Pages URL

## Стоимость

Railway предоставляет:
- **$5 бесплатных кредитов** каждый месяц
- Этого достаточно для небольших проектов
- Можно добавить платежную карту для увеличения лимита

## Альтернативы Railway

Если Railway не подходит, можно использовать:
- **Render**: https://render.com/
- **Vercel**: https://vercel.com/
- **Fly.io**: https://fly.io/

## Полезные ссылки

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app/
- GitHub Repo: https://github.com/jfsagro-glitch/CMS_chek

---

**После деплоя backend ваше приложение будет полностью функциональным!** 🎉

