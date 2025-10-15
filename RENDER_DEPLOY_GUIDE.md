# 🚀 Пошаговая инструкция по деплою Backend на Render

## Преимущества Render

- ✅ **Бесплатный план** (Free tier)
- ✅ Автоматический SSL сертификат
- ✅ Автоматические деплои из GitHub
- ✅ Простая настройка
- ✅ Хорошая документация

## Шаг 1: Регистрация на Render

1. Перейдите на https://render.com/
2. Нажмите **"Get Started"** или **"Sign Up"**
3. Войдите через GitHub (рекомендуется)
4. Подтвердите email

## Шаг 2: Создание нового Web Service

### Вариант A: Через Blueprint (автоматически)

1. В Dashboard нажмите **"New +"** → **"Blueprint"**
2. Подключите репозиторий: **jfsagro-glitch/CMS_chek**
3. Render автоматически найдет `render.yaml`
4. Нажмите **"Apply"**
5. Готово! Render создаст сервис с настройками из файла

### Вариант B: Вручную

1. В Dashboard нажмите **"New +"** → **"Web Service"**
2. Подключите GitHub репозиторий
3. Выберите репозиторий: **jfsagro-glitch/CMS_chek**
4. Заполните настройки:

#### Основные настройки:
```
Name: cms-check-backend
Region: Frankfurt (или ближайший к вам)
Branch: main
Root Directory: (оставьте пустым)
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### План:
```
Instance Type: Free
```

## Шаг 3: Настройка переменных окружения

В разделе **"Environment"** добавьте переменные:

### Обязательные:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=cms_check_super_secret_key_min_32_characters_2024
CLIENT_URL=https://jfsagro-glitch.github.io/CMS_chek
```

**Важно**: 
- `PORT` на Render должен быть `10000` (или используйте переменную Render)
- Замените `JWT_SECRET` на свой случайный ключ (минимум 32 символа)

### Опциональные (для полной функциональности):

```
# База данных PostgreSQL (если добавите)
DATABASE_URL=postgresql://user:password@host:port/database

# Email уведомления
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS уведомления (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Шаг 4: Добавление PostgreSQL (опционально)

Если хотите использовать базу данных:

1. Нажмите **"New +"** → **"PostgreSQL"**
2. Заполните:
   ```
   Name: cms-check-db
   Database: cmscheck
   User: cmscheck_user
   Region: Frankfurt (тот же, что и сервис)
   Plan: Free
   ```
3. После создания скопируйте **Internal Database URL**
4. Добавьте в переменные окружения Web Service:
   ```
   DATABASE_URL=<скопированный URL>
   ```

## Шаг 5: Деплой

1. Нажмите **"Create Web Service"** (если создавали вручную)
2. Render автоматически начнет деплой
3. Следите за логами в реальном времени
4. Деплой занимает 2-5 минут

## Шаг 6: Получение URL

После успешного деплоя вы получите URL вида:
```
https://cms-check-backend.onrender.com
```

## Шаг 7: Проверка работы

Откройте в браузере:
```
https://cms-check-backend.onrender.com/health
```

Должны увидеть:
```json
{
  "status": "ok",
  "message": "CMS Check Backend is running",
  "timestamp": "2024-..."
}
```

## Шаг 8: Настройка Health Check

Render автоматически проверяет доступность сервиса:

1. Перейдите в **Settings** → **Health & Alerts**
2. Убедитесь, что:
   ```
   Health Check Path: /health
   ```

## Шаг 9: Обновление Frontend

Теперь нужно подключить frontend к backend:

### Создайте файл `client/.env.production`:

```bash
REACT_APP_API_URL=https://cms-check-backend.onrender.com/api
```

### Или измените напрямую в `client/src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cms-check-backend.onrender.com/api';
```

### Пересоберите и задеплойте клиент:

```bash
cd client
npm run build
cd ..
Remove-Item -Recurse -Force docs
xcopy client\build docs\ /E /I /Y
git add .
git commit -m "Connect frontend to Render backend"
git push origin main
```

Подождите 1-2 минуты пока GitHub Pages обновится.

## Шаг 10: Инициализация базы данных (если используете PostgreSQL)

### Через Render Shell:

1. В Dashboard откройте ваш Web Service
2. Перейдите в **Shell** (в верхнем меню)
3. Выполните:
   ```bash
   npm run init-db
   ```

### Или локально через DATABASE_URL:

```bash
# Экспортируйте DATABASE_URL из Render
export DATABASE_URL="postgresql://..."
npm run init-db
```

## Автоматические деплои

Render автоматически деплоит при каждом push в main ветку!

Чтобы отключить:
1. Settings → Build & Deploy
2. Отключите "Auto-Deploy"

## Мониторинг и логи

### Просмотр логов:
1. Dashboard → Ваш сервис → **Logs**
2. Логи обновляются в реальном времени

### Метрики:
1. Dashboard → Ваш сервис → **Metrics**
2. Доступны: CPU, Memory, Bandwidth

### Алерты:
1. Settings → Health & Alerts
2. Настройте уведомления на email

## Важные особенности Render Free Plan

### ⚠️ Ограничения бесплатного плана:

1. **Сервис засыпает** после 15 минут неактивности
2. **Холодный старт** занимает 30-60 секунд
3. **750 часов** в месяц (достаточно для одного сервиса)
4. **100 GB bandwidth** в месяц

### 💡 Решение проблемы засыпания:

Используйте сервис для пинга (например, UptimeRobot):
1. Зарегистрируйтесь на https://uptimerobot.com/
2. Создайте монитор для вашего URL
3. Интервал проверки: 5 минут
4. Сервис будет постоянно активен

## Обновление сервиса

### Автоматическое:
Просто сделайте `git push` - Render автоматически задеплоит

### Ручное:
1. Dashboard → Ваш сервис
2. Нажмите **"Manual Deploy"** → **"Deploy latest commit"**

## Переменные окружения

### Добавление новой переменной:
1. Dashboard → Ваш сервис → **Environment**
2. Нажмите **"Add Environment Variable"**
3. Введите Key и Value
4. Нажмите **"Save Changes"**
5. Сервис автоматически перезапустится

### Секретные переменные:
Render автоматически скрывает значения переменных в логах

## Troubleshooting

### Ошибка: "Application failed to respond"
**Решение:**
- Проверьте, что `PORT` установлен правильно
- Render использует переменную `PORT` автоматически
- В `server.js` используйте: `process.env.PORT || 10000`

### Ошибка: "Build failed"
**Решение:**
- Проверьте логи сборки
- Убедитесь, что `package.json` корректен
- Проверьте, что все зависимости указаны

### Ошибка CORS
**Решение:**
- Проверьте `CLIENT_URL` в переменных окружения
- URL должен точно совпадать с GitHub Pages URL
- Не забудьте `/` в конце, если нужно

### Сервис постоянно перезапускается
**Решение:**
- Проверьте логи на наличие ошибок
- Убедитесь, что health check endpoint работает
- Проверьте, что порт правильный

### База данных не подключается
**Решение:**
- Проверьте `DATABASE_URL`
- Убедитесь, что PostgreSQL создан в том же регионе
- Используйте **Internal Database URL** (быстрее)

## Стоимость

### Free Plan:
- **$0/месяц**
- 750 часов работы
- 100 GB bandwidth
- Сервис засыпает после 15 мин неактивности

### Starter Plan ($7/месяц):
- Сервис не засыпает
- 400 часов работы
- Больше ресурсов

## Альтернативы

Если Render не подходит:
- **Railway**: https://railway.app/
- **Fly.io**: https://fly.io/
- **Vercel**: https://vercel.com/ (для serverless)

## Полезные ссылки

- Render Dashboard: https://dashboard.render.com/
- Render Docs: https://render.com/docs
- GitHub Repo: https://github.com/jfsagro-glitch/CMS_chek
- Render Status: https://status.render.com/

## Поддержка

- Render Support: support@render.com
- Render Community: https://community.render.com/
- Документация: https://render.com/docs

---

**После деплоя на Render ваше приложение будет полностью функциональным!** 🎉

**Тестовый доступ:**
- Email: `admin@cms.local`
- Пароль: `password`

