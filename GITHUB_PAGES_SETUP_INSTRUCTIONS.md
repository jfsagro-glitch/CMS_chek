# Инструкция по настройке GitHub Pages

## ✅ Что уже сделано

1. **Создан GitHub Actions workflow** (`.github/workflows/deploy.yml`)
2. **Скопированы файлы сборки** в корень проекта
3. **Добавлен файл `.nojekyll`** для правильной обработки файлов
4. **Все изменения отправлены** на GitHub

## 🔧 Настройка GitHub Pages

### Шаг 1: Включить GitHub Pages
1. Перейдите в настройки репозитория: `https://github.com/jfsagro-glitch/CMS_chek/settings`
2. Найдите раздел "Pages" в левом меню
3. В разделе "Source" выберите "GitHub Actions"
4. Сохраните настройки

### Шаг 2: Проверить деплой
1. Перейдите в раздел "Actions": `https://github.com/jfsagro-glitch/CMS_chek/actions`
2. Найдите workflow "Deploy to GitHub Pages"
3. Дождитесь завершения (зеленая галочка)
4. Перейдите по ссылке на сайт

### Шаг 3: URL сайта
После успешного деплоя сайт будет доступен по адресу:
`https://jfsagro-glitch.github.io/CMS_chek/`

## 🚀 Автоматический деплой

Теперь при каждом push в ветку `main`:
1. GitHub Actions автоматически соберет проект
2. Задеплоит его на GitHub Pages
3. Сайт обновится автоматически

## 📁 Структура файлов

```
CMS_chek/
├── .github/workflows/deploy.yml  # GitHub Actions workflow
├── .nojekyll                     # Отключает Jekyll обработку
├── index.html                    # Главная страница
├── manifest.json                 # PWA манифест
├── static/                       # Статические ресурсы
│   ├── css/
│   └── js/
└── client/                       # Исходный код React
```

## 🔍 Проверка деплоя

### Проверить статус:
- Actions: `https://github.com/jfsagro-glitch/CMS_chek/actions`
- Pages: `https://github.com/jfsagro-glitch/CMS_chek/settings/pages`

### Проверить сайт:
- URL: `https://jfsagro-glitch.github.io/CMS_chek/`

## ❗ Возможные проблемы

1. **Сайт не загружается**: Проверьте, что в настройках Pages выбран "GitHub Actions"
2. **404 ошибка**: Убедитесь, что файл `index.html` есть в корне репозитория
3. **Стили не загружаются**: Проверьте, что папка `static/` скопирована правильно

## 🎯 Следующие шаги

После успешного деплоя:
1. Проверьте работу сайта
2. Протестируйте все функции
3. При необходимости настройте домен (опционально)
