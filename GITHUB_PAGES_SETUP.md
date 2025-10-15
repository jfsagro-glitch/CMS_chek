# Настройка GitHub Pages для CMS Check

## Шаги для настройки хостинга на GitHub Pages:

### 1. Перейдите в настройки репозитория
- Откройте https://github.com/jfsagro-glitch/CMS_chek
- Нажмите на вкладку "Settings" (Настройки)

### 2. Настройте GitHub Pages
- В левом меню найдите раздел "Pages"
- В разделе "Source" выберите "Deploy from a branch"
- В выпадающем списке "Branch" выберите "main"
- В выпадающем списке "Folder" выберите "/docs"
- Нажмите "Save"

### 3. Ожидайте деплоя
- GitHub автоматически начнет процесс деплоя
- Обычно это занимает 1-2 минуты
- После завершения ваш сайт будет доступен по адресу:
  **https://jfsagro-glitch.github.io/CMS_chek/**

### 4. Проверьте работу
- Откройте https://jfsagro-glitch.github.io/CMS_chek/
- Убедитесь, что приложение загружается корректно
- Проверьте все функции: логин, реестр осмотров, создание осмотров

## Автоматическое обновление

Для обновления сайта после изменений в коде:

```bash
# 1. Соберите приложение
cd client
npm run build

# 2. Скопируйте файлы в docs
cd ..
xcopy client\build\* docs\ /E /I /Y

# 3. Закоммитьте и запушьте
git add .
git commit -m "Update build"
git push origin main
```

GitHub Pages автоматически обновит сайт через несколько минут.

## Структура проекта

```
CMS_chek/
├── client/          # React приложение
├── docs/            # Собранное приложение для GitHub Pages
├── server/          # Backend (Node.js)
└── database/        # Схема базы данных
```

## Примечания

- GitHub Pages работает только со статическими файлами
- Backend API нужно деплоить отдельно (Heroku, Railway, Vercel)
- Для полной функциональности нужен работающий backend
