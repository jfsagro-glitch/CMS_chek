# Демо-режим CMS Check

## Текущее состояние

✅ **Frontend (GitHub Pages)**: https://jfsagro-glitch.github.io/CMS_chek/
❌ **Backend**: не задеплоен

## Почему возникают ошибки подключения?

GitHub Pages может размещать только статические файлы (HTML, CSS, JavaScript). Backend API нужно деплоить отдельно.

Ошибки типа:
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
localhost:5000/api/auth/login
```

Это нормально - приложение пытается подключиться к локальному серверу, которого нет на GitHub Pages.

## Решение 1: Задеплоить Backend (Рекомендуется)

См. подробную инструкцию в файле `BACKEND_DEPLOYMENT.md`

**Быстрый старт с Railway:**
1. Зарегистрируйтесь на https://railway.app/
2. Создайте проект из GitHub репозитория
3. Добавьте переменные окружения
4. Получите URL backend
5. Обновите `REACT_APP_API_URL` в клиенте

## Решение 2: Демо-режим (только интерфейс)

Если вы хотите показать только интерфейс без функциональности:

### Вариант A: Mock API в клиенте

Создайте файл `client/src/services/mockApi.ts`:

```typescript
// Mock API для демонстрации без backend
export const mockApi = {
  login: (email: string, password: string) => {
    // Демо-логин
    if (email === 'admin@cms.local' && password === 'password') {
      return Promise.resolve({
        data: {
          token: 'demo-token',
          user: { id: 1, email, role: 'admin', fullName: 'Демо Администратор' }
        }
      });
    }
    return Promise.reject(new Error('Неверные данные'));
  },
  
  getInspections: () => {
    // Вернуть демо-данные из Inspections.tsx
    return Promise.resolve({ data: { inspections: getDemoInspections() } });
  }
};
```

### Вариант B: Использовать существующие демо-данные

В `Inspections.tsx` уже реализованы демо-данные. Можно расширить этот подход на другие страницы.

## Что работает сейчас?

✅ **Интерфейс полностью загружается**
✅ **Дизайн реестра осмотров**
✅ **Демо-данные в таблице**
✅ **Навигация по страницам**
✅ **Адаптивный дизайн**

❌ **Авторизация** (требует backend)
❌ **Создание осмотров** (требует backend)
❌ **Загрузка фото** (требует backend)
❌ **Экспорт в Excel** (требует backend)

## Для полноценной работы

1. **Задеплойте backend** на Railway/Render/Vercel
2. **Настройте базу данных** PostgreSQL
3. **Обновите API URL** в клиенте
4. **Пересоберите и задеплойте** клиент

## Быстрый тест локально

Если хотите протестировать полную функциональность локально:

```bash
# Терминал 1: Backend
npm run server

# Терминал 2: Frontend
cd client
npm start
```

Откройте: http://localhost:3000
Логин: admin@cms.local
Пароль: password

## Контакты

Для запроса доступа администратора: cmsauto@bk.ru

