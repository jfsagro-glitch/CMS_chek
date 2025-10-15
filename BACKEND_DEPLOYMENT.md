# Деплой Backend для CMS Check

## Проблема
GitHub Pages может размещать только статические файлы (HTML, CSS, JS). Для работы с API нужен отдельный хостинг для backend.

## Решения для деплоя backend

### 1. Railway (Рекомендуется) ⭐
**Бесплатный план**: 500 часов в месяц

**Шаги:**
1. Зарегистрируйтесь на https://railway.app/
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Railway автоматически определит Node.js проект
5. Добавьте переменные окружения:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_secret_key_here
   CLIENT_URL=https://jfsagro-glitch.github.io/CMS_chek
   ```
6. Railway выдаст URL вида: `https://your-app.railway.app`

### 2. Render
**Бесплатный план**: есть

**Шаги:**
1. Зарегистрируйтесь на https://render.com/
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Build Command: `npm install`
   - Start Command: `npm run server`
5. Добавьте переменные окружения
6. Render выдаст URL вида: `https://your-app.onrender.com`

### 3. Vercel
**Бесплатный план**: есть

**Шаги:**
1. Установите Vercel CLI: `npm i -g vercel`
2. В корне проекта выполните: `vercel`
3. Следуйте инструкциям
4. Vercel выдаст URL вида: `https://your-app.vercel.app`

### 4. Heroku
**Платный**: от $5/месяц (бесплатный план отменен)

## После деплоя backend

### Обновите URL API в клиенте

1. Откройте `client/src/services/api.ts`
2. Измените `baseURL`:
   ```typescript
   const api = axios.create({
     baseURL: 'https://your-backend-url.railway.app/api',
     // вместо http://localhost:5000/api
   });
   ```

3. Пересоберите и задеплойте клиент:
   ```bash
   cd client
   npm run build
   cd ..
   xcopy client\build docs\ /E /I /Y
   git add .
   git commit -m "Update API URL"
   git push origin main
   ```

## Демо-режим (без backend)

Если вы хотите показать интерфейс без backend, можно:

1. Использовать упрощенные маршруты (уже реализовано в `routes/auth-simple.js` и `routes/inspections-simple.js`)
2. Добавить mock API в клиенте
3. Использовать демо-данные (уже реализовано в `Inspections.tsx`)

## Текущее состояние

- ✅ **Frontend**: https://jfsagro-glitch.github.io/CMS_chek/
- ❌ **Backend**: не задеплоен (нужно выбрать хостинг)

## Рекомендация

Для быстрого старта используйте **Railway**:
1. Бесплатно
2. Простая настройка
3. Автоматический деплой из GitHub
4. Поддержка PostgreSQL

После деплоя backend на Railway, обновите `API_URL` в клиенте и приложение заработает полностью!
