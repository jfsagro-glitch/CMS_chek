# Исправление настроек GitHub Pages

## ❌ Проблема
Ошибка: "Missing environment. Ensure your workflow's deployment job has an environment"

## ✅ Решение

### Вариант 1: Настройка GitHub Pages Environment

1. **Перейдите в настройки репозитория**: https://github.com/jfsagro-glitch/CMS_chek/settings
2. **Найдите раздел "Pages"** в левом меню
3. **В разделе "Source" выберите "GitHub Actions"**
4. **Сохраните настройки**

### Вариант 2: Использование ветки gh-pages (Рекомендуется)

Если первый вариант не работает, используйте ветку gh-pages:

1. **Перейдите в настройки репозитория**: https://github.com/jfsagro-glitch/CMS_chek/settings
2. **Найдите раздел "Pages"** в левом меню  
3. **В разделе "Source" выберите "Deploy from a branch"**
4. **Выберите ветку "gh-pages"** (она создастся автоматически)
5. **Сохраните настройки**

## 🚀 Workflow файлы

### Активный workflow: `deploy-gh-pages.yml`
- Использует проверенный action `peaceiris/actions-gh-pages`
- Создает ветку `gh-pages` автоматически
- Деплоит файлы из папки `docs`

### Отключенные workflows:
- `deploy.yml` - сложный с проблемами сборки
- `deploy-simple.yml` - требует настройки environment

## 📊 Проверка деплоя

После настройки GitHub Pages:

1. **Actions**: https://github.com/jfsagro-glitch/CMS_chek/actions
2. **Активный workflow**: "Deploy to GitHub Pages (gh-pages branch)"
3. **Сайт**: https://jfsagro-glitch.github.io/CMS_chek/

## 🔧 Если ничего не работает

### Ручной деплой через ветку gh-pages:

```bash
# Создать ветку gh-pages
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Настройка GitHub Pages:
1. Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "gh-pages"
4. Save

## 📝 Структура файлов

```
CMS_chek/
├── .github/workflows/
│   ├── deploy-gh-pages.yml     # ✅ Активный
│   ├── deploy-simple.yml       # ❌ Отключен
│   └── deploy.yml              # ❌ Отключен
├── docs/                       # Файлы для деплоя
│   ├── index.html
│   ├── manifest.json
│   └── static/
└── client/                     # Исходный код
```

## 🎯 Рекомендации

1. **Используйте Вариант 2** (ветка gh-pages) - он более надежный
2. **Дождитесь завершения workflow** после настройки
3. **Проверьте сайт** через 5-10 минут после деплоя
