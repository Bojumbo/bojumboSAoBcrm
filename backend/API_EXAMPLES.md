# Приклади використання API

Цей документ містить приклади запитів до API для тестування та розуміння функціональності.

## Аутентифікація

### Вхід в систему

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Отримання поточного користувача

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Менеджери

### Отримання списку менеджерів

```bash
curl -X GET http://localhost:3001/api/managers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Отримання менеджера за ID

```bash
curl -X GET http://localhost:3001/api/managers/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Створення нового менеджера (тільки admin)

```bash
curl -X POST http://localhost:3001/api/managers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "password": "password123",
    "first_name": "New",
    "last_name": "Manager",
    "role": "manager",
    "phone": "+380991234567"
  }'
```

## Проекти

### Отримання списку проектів

```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Створення проекту

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новий проект",
    "description": "Опис проекту",
    "main_responsible_manager_id": 1,
    "counterparty_id": 1,
    "funnel_id": 1,
    "funnel_stage_id": 1,
    "budget": 100000,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

### Оновлення проекту

```bash
curl -X PUT http://localhost:3001/api/projects/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Оновлена назва проекту",
    "budget": 150000
  }'
```

## Продукти

### Отримання списку продуктів

```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Оновлення залишків продукту

```bash
curl -X POST http://localhost:3001/api/products/1/stock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouse_id": 1,
    "quantity": 100
  }'
```

## Продажі

### Отримання списку продажів

```bash
curl -X GET http://localhost:3001/api/sales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Створення продажу

```bash
curl -X POST http://localhost:3001/api/sales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "counterparty_id": 1,
    "responsible_manager_id": 1,
    "project_id": 1,
    "status": "pending",
    "products": [
      {
        "product_id": 1,
        "quantity": 5,
        "unit_price": 100
      }
    ],
    "services": [
      {
        "service_id": 1,
        "quantity": 1,
        "unit_price": 500
      }
    ]
  }'
```

## Завантаження файлів

### Завантаження файлу

```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "fileName": "document.pdf",
    "fileUrl": "/uploads/1703123456789_document.pdf",
    "fileType": "application/pdf"
  }
}
```

### Видалення файлу

```bash
curl -X DELETE http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "/uploads/1703123456789_document.pdf"
  }'
```

## Коментарі

### Отримання коментарів проекту

```bash
curl -X GET http://localhost:3001/api/comments/projects/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Створення коментаря з файлом

```bash
curl -X POST http://localhost:3001/api/comments/projects/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Коментар з файлом",
    "manager_id": 1,
    "file_url": "/uploads/1703123456789_document.pdf"
  }'
```

## Завдання

### Отримання списку завдань

```bash
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Створення завдання

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Нове завдання",
    "description": "Опис завдання",
    "responsible_manager_id": 1,
    "creator_manager_id": 1,
    "project_id": 1,
    "priority": "high",
    "status": "pending",
    "due_date": "2024-02-01"
  }'
```

## Контрагенти

### Отримання списку контрагентів

```bash
curl -X GET http://localhost:3001/api/counterparties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Створення контрагента

```bash
curl -X POST http://localhost:3001/api/counterparties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Нова компанія",
    "type": "client",
    "responsible_manager_id": 1,
    "email": "info@company.com",
    "phone": "+380991234567",
    "address": "Київ, Україна"
  }'
```

## Тестування з Postman

1. **Імпорт колекції:**
   - Створіть нову колекцію в Postman
   - Додайте змінну середовища `baseUrl` зі значенням `http://localhost:3001`
   - Додайте змінну `token` для зберігання JWT токена

2. **Налаштування запитів:**
   - Використовуйте `{{baseUrl}}/api/...` для URL
   - Додайте заголовок `Authorization: Bearer {{token}}` для захищених endpoints

3. **Автоматизація:**
   - В налаштуваннях login запиту додайте тест:
   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     pm.environment.set("token", response.data.token);
   }
   ```

## Обробка помилок

### Приклад помилки авторизації

```json
{
  "success": false,
  "error": "Not authenticated"
}
```

### Приклад помилки валідації

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### Приклад помилки доступу

```json
{
  "success": false,
  "error": "Access denied"
}
```

## Налаштування CORS

Для тестування з фронтенду переконайтеся, що CORS налаштований правильно:

```typescript
// В src/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

## Моніторинг та логування

Всі запити логуються в консоль сервера. Для продакшну рекомендується налаштувати proper logging з використанням Winston або Pino.
