# 🚀 Быстрый запуск CMS Check

## Автоматическая установка и настройка

### 1. Клонирование и установка
```bash
git clone https://github.com/jfsagro-glitch/CMS_chek.git
cd CMS_chek
```

### 2. Настройка переменных окружения
```bash
# Скопируйте файл с примером переменных
cp env.example .env

# Отредактируйте .env файл (обязательно настройте базу данных)
nano .env
```

**Минимальные настройки в .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_check
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Автоматическая установка
```bash
# Установка всех зависимостей и инициализация БД
npm run setup
```

### 4. Запуск приложения
```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или быстрый запуск
npm run quick-start
```

### 5. Открытие приложения
- **Веб-интерфейс:** http://localhost:3000
- **API:** http://localhost:5000

### 6. Первый вход
- **Email:** admin@cms.local
- **Пароль:** admin123
- ⚠️ **Обязательно смените пароль после первого входа!**

## Ручная установка

Если автоматическая установка не работает:

### 1. Установка зависимостей
```bash
# Сервер
npm install

# Клиент
cd client
npm install
cd ..
```

### 2. Настройка базы данных
```bash
# Создание БД (PostgreSQL должен быть запущен)
createdb cms_check

# Инициализация схемы
npm run init-db
```

### 3. Запуск
```bash
# В двух терминалах:
# Терминал 1 - сервер
npm run server

# Терминал 2 - клиент
npm run client
```

## Возможные проблемы

### PostgreSQL не установлен
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (с Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Скачайте с https://www.postgresql.org/download/windows/
```

### Порт занят
```bash
# Проверка занятых портов
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Остановка процессов
sudo kill -9 <PID>
```

### Ошибки зависимостей
```bash
# Очистка кэша
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Для клиента
cd client
rm -rf node_modules package-lock.json
npm install
```

## Структура проекта после установки

```
CMS_chek/
├── client/                 # React приложение (порт 3000)
├── database/              # Схема БД
├── routes/                # API маршруты
├── middleware/            # Middleware функции
├── utils/                 # Утилиты
├── uploads/               # Загруженные файлы
├── scripts/               # Скрипты инициализации
├── server.js              # Сервер (порт 5000)
└── .env                   # Переменные окружения
```

## Следующие шаги

1. **Настройте уведомления** (SMS/Email) в .env
2. **Создайте первого пользователя** через интерфейс
3. **Настройте права доступа** для разных ролей
4. **Протестируйте создание осмотра** и мобильный интерфейс

## Поддержка

- 📧 Email: cmsauto@bk.ru
- 🐛 Issues: [GitHub Issues](https://github.com/jfsagro-glitch/CMS_chek/issues)
- 📖 Документация: [README.md](README.md)

---

**Готово! 🎉 Ваша система CMS Check запущена и готова к работе.**
