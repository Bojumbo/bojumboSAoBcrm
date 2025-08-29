# 🚀 Швидкий старт CRM системи

## 📋 Передумови

- Node.js 18+ встановлений
- npm або yarn встановлений
- PowerShell (для Windows) або Bash (для Linux/macOS)

## ⚡ Швидкий запуск

### Варіант 1: Автоматичний запуск (рекомендується)

```powershell
# Windows PowerShell
.\start-servers.ps1
```

```bash
# Linux/macOS
./start-servers.sh
```

### Варіант 2: Ручний запуск

#### Крок 1: Запуск бекенду
```bash
cd backend
node test-server.mjs
```

#### Крок 2: Запуск фронтенду (в новому терміналі)
```bash
npm run dev
```

## 🌐 Доступ до системи

- **Фронтенд**: http://localhost:5173
- **Бекенд**: http://localhost:3001

## 🔐 Тестові облікові дані

| Роль | Email | Пароль |
|------|-------|---------|
| **Адміністратор** | admin@example.com | admin123 |
| **Керівник** | ivan.p@example.com | head123 |
| **Менеджер** | maria.i@example.com | manager123 |

## 🧪 Тестування API

```powershell
# Тестування всіх API ендпоінтів
.\test-api.ps1
```

## 📁 Структура проекту

```
bojumboSAoBcrm/
├── backend/                 # Бекенд сервер
│   ├── test-server.mjs     # Тестовий сервер без БД
│   ├── src/                # Основний код бекенду
│   └── prisma/             # Схема бази даних
├── src/                     # Код фронтенду
│   ├── components/          # React компоненти
│   ├── services/            # API сервіси
│   ├── contexts/            # React контексти
│   └── hooks/               # Кастомні хуки
├── pages/                   # Сторінки додатку
├── .env                     # Змінні середовища фронтенду
└── start-servers.ps1       # Скрипт запуску
```

## 🔧 Налаштування

### Змінні середовища

#### Фронтенд (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
```

#### Бекенд (backend/.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

## 🚨 Поширені проблеми

### Порт 3001 зайнятий
```bash
# Знайти процес
netstat -ano | findstr :3001

# Зупинити процес
taskkill /PID <PID> /F
```

### Порт 5173 зайнятий
```bash
# Знайти процес
netstat -ano | findstr :5173

# Зупинити процес
taskkill /PID <PID> /F
```

### Модулі не знайдені
```bash
# Перевстановити залежності
npm install
```

## 📚 Додаткова інформація

- [API Документація](API_EXAMPLES.md)
- [Інтеграція фронтенду](FRONTEND_INTEGRATION_README.md)
- [Налаштування бази даних](DATABASE_SETUP.md)
- [Тестування](TESTING.md)

## 🆘 Підтримка

Якщо виникли проблеми:

1. Перевірте, чи всі залежності встановлені
2. Переконайтеся, що порти 3001 та 5173 вільні
3. Запустіть тестовий скрипт: `.\test-api.ps1`
4. Перевірте логи в терміналах серверів

## 🎯 Наступні кроки

1. **Тестування**: Відкрийте http://localhost:5173 та увійдіть з тестовими обліковими даними
2. **Огляд функціоналу**: Перегляньте різні розділи CRM системи
3. **Налаштування БД**: Якщо потрібно, налаштуйте PostgreSQL та запустіть повний бекенд
4. **Розробка**: Внесіть зміни та перезапустіть сервери

---

**🎉 Вітаємо! Ваша CRM система готова до роботи!**
