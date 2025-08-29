# Налаштування CRM Backend

Цей документ містить детальні інструкції по налаштуванню та запуску CRM Backend.

## Передумови

### Необхідне програмне забезпечення

1. **Node.js** (версія 18 або вище)
   - Завантажте з [nodejs.org](https://nodejs.org/)
   - Перевірте встановлення: `node --version`

2. **PostgreSQL** (версія 12 або вище)
   - Завантажте з [postgresql.org](https://postgresql.org/)
   - Або використовуйте Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`

3. **Git** (для клонування репозиторію)

## Крок 1: Клонування проекту

```bash
git clone <your-repository-url>
cd bojumboSAoBcrm/backend
```

## Крок 2: Налаштування змінних середовища

1. Створіть файл `.env` в папці `backend/`:
   ```bash
   cp .env.example .env
   ```

2. Відредагуйте `.env` файл:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="24h"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   
   # File Upload
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=10485760
   ```

### Налаштування бази даних

1. **Створення бази даних:**
   ```sql
   CREATE DATABASE crm_db;
   ```

2. **Налаштування користувача (опціонально):**
   ```sql
   CREATE USER crm_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
   ```

3. **Оновлення DATABASE_URL в .env:**
   ```env
   DATABASE_URL="postgresql://crm_user:your_password@localhost:5432/crm_db"
   ```

## Крок 3: Встановлення залежностей

```bash
npm install
```

## Крок 4: Налаштування Prisma

1. **Генерація Prisma клієнта:**
   ```bash
   npm run db:generate
   ```

2. **Застосування схеми до бази даних:**
   ```bash
   npm run db:push
   ```

## Крок 5: Заповнення початковими даними

```bash
npm run db:seed
```

Це створить:
- Тестових користувачів з різними ролями
- Базові дані для всіх сутностей
- Тестові проекти, контрагенти, товари та послуги

### Тестові користувачі

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| ivan.p@example.com | manager123 | head |
| maria.i@example.com | manager123 | manager |
| oleg.s@example.com | manager123 | manager |
| anna.k@example.com | manager123 | head |

## Крок 6: Запуск сервера

### Розробка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

### Швидкий запуск (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

### Швидкий запуск (Windows)
```bash
start.bat
```

## Крок 7: Перевірка роботи

1. **Health check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Тест аутентифікації:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

3. **Перегляд бази даних:**
   ```bash
   npm run db:studio
   ```

## Структура проекту

```
backend/
├── prisma/
│   ├── schema.prisma      # Схема бази даних
│   └── seed.ts           # Початкові дані
├── src/
│   ├── api/
│   │   ├── routes/       # API роути
│   │   ├── controllers/  # Контролери
│   │   └── services/     # Бізнес-логіка
│   ├── middleware/       # Middleware
│   ├── config/           # Конфігурація
│   ├── types/            # TypeScript типи
│   └── index.ts          # Головний файл
├── uploads/              # Завантажені файли
├── .env                  # Змінні середовища
└── package.json
```

## Розв'язання проблем

### Помилка підключення до бази даних

1. Перевірте, чи запущений PostgreSQL
2. Перевірте правильність DATABASE_URL
3. Перевірте права доступу користувача

### Помилка "Port already in use"

1. Змініть PORT в .env файлі
2. Або зупиніть процес, що використовує порт 3001

### Помилка "Prisma client not generated"

1. Виконайте `npm run db:generate`
2. Перевірте, чи встановлений Prisma CLI

### Помилка "Upload directory not found"

1. Створіть папку `uploads/` в корені проекту
2. Перевірте права доступу до папки

## Наступні кроки

1. **Підключення фронтенду:**
   - Оновіть API URL в фронтенді на `http://localhost:3001`
   - Перевірте CORS налаштування

2. **Тестування API:**
   - Використовуйте Postman або curl для тестування endpoints
   - Перевірте авторизацію та рольову систему

3. **Моніторинг:**
   - Переглядайте логи сервера
   - Використовуйте Prisma Studio для аналізу даних

## Підтримка

При виникненні проблем:
1. Перевірте логи сервера
2. Перевірте налаштування бази даних
3. Зверніться до команди розробки
