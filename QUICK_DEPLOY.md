# 🚀 Быстрый деплой Backend на Railway

## ✅ Подготовка завершена!

Все необходимые файлы для деплоя уже созданы и отправлены в GitHub:
- ✅ `railway.json` - конфигурация Railway
- ✅ `Procfile` - команда запуска
- ✅ Health check endpoint (`/health`)
- ✅ Упрощенные маршруты (работают без БД)
- ✅ Обработка ошибок подключения
- ✅ Демо-баннер на странице входа

## 📋 Шаги для деплоя (5 минут)

### 1. Откройте Railway
Перейдите на: **https://railway.app/**

### 2. Войдите через GitHub
Нажмите **"Login with GitHub"**

### 3. Создайте новый проект
1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Найдите репозиторий: **jfsagro-glitch/CMS_chek**
4. Нажмите **"Deploy Now"**

### 4. Добавьте переменные окружения

Перейдите в **"Variables"** и добавьте:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=cms_check_super_secret_key_2024_min_32_chars
CLIENT_URL=https://jfsagro-glitch.github.io/CMS_chek
```

**Важно**: Замените `JWT_SECRET` на свой случайный ключ (минимум 32 символа)!

### 5. Дождитесь деплоя
- Railway автоматически установит зависимости
- Запустит сервер
- Выдаст публичный URL

### 6. Получите URL backend
В разделе **"Settings"** → **"Domains"** скопируйте URL вида:
```
https://cms-check-production.railway.app
```

### 7. Проверьте работу
Откройте в браузере:
```
https://your-app.railway.app/health
```

Должны увидеть:
```json
{
  "status": "ok",
  "message": "CMS Check Backend is running",
  "timestamp": "2024-..."
}
```

## 🔄 Обновление Frontend

### Вариант 1: Создать .env.production (рекомендуется)

Создайте файл `client/.env.production`:
```
REACT_APP_API_URL=https://your-app.railway.app/api
```

### Вариант 2: Изменить напрямую

В файле `client/src/services/api.ts` замените:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-app.railway.app/api';
```

### Пересоберите и задеплойте:

```bash
cd client
npm run build
cd ..
Remove-Item -Recurse -Force docs
xcopy client\build docs\ /E /I /Y
git add .
git commit -m "Connect frontend to Railway backend"
git push origin main
```

Подождите 1-2 минуты пока GitHub Pages обновится.

## ✅ Готово!

Теперь ваше приложение полностью функционально:
- ✅ Frontend: https://jfsagro-glitch.github.io/CMS_chek/
- ✅ Backend: https://your-app.railway.app
- ✅ Авторизация работает
- ✅ API запросы проходят
- ✅ Демо-данные доступны

## 🔐 Тестовый доступ

После деплоя используйте:
- **Email**: `admin@cms.local`
- **Пароль**: `password`

## 📊 Мониторинг

В Railway Dashboard вы можете:
- Просматривать логи
- Мониторить использование ресурсов
- Настроить автоматические деплои
- Добавить PostgreSQL (опционально)

## 💰 Стоимость

Railway предоставляет **$5 бесплатных кредитов** каждый месяц.
Этого достаточно для тестирования и небольших проектов.

## 📚 Подробная инструкция

См. файл `RAILWAY_DEPLOY_GUIDE.md` для детальной информации.

## ❓ Проблемы?

### Backend не запускается
- Проверьте логи в Railway Dashboard
- Убедитесь, что все переменные окружения добавлены

### Frontend не подключается к backend
- Проверьте CORS: CLIENT_URL должен совпадать с URL GitHub Pages
- Убедитесь, что API_URL в клиенте правильный

### Ошибка 401 при входе
- Это нормально! Используйте тестовые данные: `admin@cms.local` / `password`

---

**Backend готов к деплою! Следуйте инструкции выше.** 🚀

