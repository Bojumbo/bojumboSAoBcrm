# CRM Backend

Повноцінний бекенд для CRM-додатку, створений з використанням Node.js, Express.js, PostgreSQL та Prisma.

## Технології

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Authentication**: JWT
- **File Uploads**: Multer

## Структура проекту

```
backend/
├── prisma/
│   ├── schema.prisma      # Схема бази даних
│   └── seed.ts           # Скрипт для заповнення БД
├── src/
│   ├── api/
│   │   ├── routes/       # API роути
│   │   ├── controllers/  # Контролери
│   │   └── services/     # Бізнес-логіка
│   ├── middleware/       # Middleware (auth, validation)
│   ├── config/           # Конфігурація
│   ├── types/            # TypeScript типи
│   └── index.ts          # Головний файл сервера
├── uploads/              # Папка для завантажених файлів
├── .env                  # Змінні середовища
├── package.json
└── tsconfig.json
```

## Встановлення та налаштування

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування бази даних

1. Створіть PostgreSQL базу даних
2. Скопіюйте `.env.example` в `.env` та налаштуйте:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   ```

### 3. Генерація Prisma клієнта

```bash
npm run db:generate
```

### 4. Міграція бази даних

```bash
npm run db:migrate
```

### 5. Заповнення початковими даними

```bash
npm run db:seed
```

## Запуск

### Розробка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

## API Endpoints

### Аутентифікація
- `POST /api/auth/login` - Вхід в систему
- `POST /api/auth/logout` - Вихід з системи
- `GET /api/auth/me` - Поточний користувач

### Менеджери
- `GET /api/managers` - Список менеджерів
- `GET /api/managers/:id` - Менеджер за ID
- `POST /api/managers` - Створення менеджера
- `PUT /api/managers/:id` - Оновлення менеджера
- `DELETE /api/managers/:id` - Видалення менеджера

### Проекти
- `GET /api/projects` - Список проектів
- `GET /api/projects/:id` - Проект за ID
- `POST /api/projects` - Створення проекту
- `PUT /api/projects/:id` - Оновлення проекту
- `DELETE /api/projects/:id` - Видалення проекту

### Продукти
- `GET /api/products` - Список продуктів
- `GET /api/products/:id` - Продукт за ID
- `POST /api/products` - Створення продукту
- `PUT /api/products/:id` - Оновлення продукту
- `DELETE /api/products/:id` - Видалення продукту
- `POST /api/products/:id/stock` - Оновлення залишків

### Продажі
- `GET /api/sales` - Список продажів
- `GET /api/sales/:id` - Продаж за ID
- `POST /api/sales` - Створення продажу
- `PUT /api/sales/:id` - Оновлення продажу
- `DELETE /api/sales/:id` - Видалення продажу

### Завантаження файлів
- `POST /api/upload` - Завантаження файлу
- `DELETE /api/upload` - Видалення файлу

## Авторизація

Система використовує JWT токени та рольову авторизацію:

- **admin** - Повний доступ до всіх даних
- **head** - Доступ до своїх даних та даних підлеглих
- **manager** - Доступ тільки до своїх даних

## Файли

Файли завантажуються в папку `uploads/` та доступні через `/uploads/` endpoint.

## Розробка

### Додавання нових роутів

1. Створіть сервіс в `src/services/`
2. Створіть контролер в `src/controllers/`
3. Створіть роути в `src/routes/`
4. Зареєструйте роути в `src/index.ts`

### Міграції бази даних

```bash
npm run db:migrate
```

### Перегляд бази даних

```bash
npm run db:studio
```

## Тестування

```bash
# Health check
curl http://localhost:3001/health

# Тест аутентифікації
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Логування

Сервер логує всі помилки в консоль. В продакшні рекомендується налаштувати proper logging.

## Безпека

- Всі API endpoints (крім `/api/auth/login`) потребують аутентифікації
- Паролі хешуються з використанням bcrypt
- JWT токени мають термін дії
- Файли перевіряються на тип та розмір
