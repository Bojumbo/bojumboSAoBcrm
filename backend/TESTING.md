# Тестування CRM Backend

Цей документ містить інструкції по тестуванню API та перевірці функціональності CRM Backend.

## Автоматизоване тестування

### Встановлення залежностей для тестування

```bash
npm install --save-dev jest @types/jest supertest @types/supertest
```

### Налаштування Jest

Створіть файл `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### Структура тестів

```
tests/
├── setup.ts                 # Налаштування тестів
├── auth.test.ts            # Тести аутентифікації
├── managers.test.ts        # Тести менеджерів
├── projects.test.ts        # Тести проектів
├── products.test.ts        # Тести продуктів
├── sales.test.ts           # Тести продажів
├── upload.test.ts          # Тести завантаження файлів
└── integration.test.ts     # Інтеграційні тести
```

### Приклад тесту

```typescript
// tests/auth.test.ts
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/database';

describe('Auth API', () => {
  beforeAll(async () => {
    // Очищення бази даних перед тестами
    await prisma.$executeRaw`TRUNCATE TABLE "Manager" CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Створення тестового користувача
      const testUser = await prisma.manager.create({
        data: {
          email: 'test@example.com',
          password_hash: '$2b$10$...', // хешований пароль
          first_name: 'Test',
          last_name: 'User',
          role: 'manager'
        }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Ручне тестування

### 1. Тестування аутентифікації

#### Вхід в систему

```bash
# Тест з валідними даними
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Тест з невалідними даними
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'

# Тест без email
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "admin123"
  }'
```

#### Перевірка токена

```bash
# Отримання токена
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | \
  jq -r '.data.token')

echo "Token: $TOKEN"

# Тест захищеного endpoint
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Тест без токена
curl -X GET http://localhost:3001/api/auth/me
```

### 2. Тестування авторизації

#### Перевірка ролей

```bash
# Створення менеджера (тільки admin)
curl -X POST http://localhost:3001/api/managers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "password": "password123",
    "first_name": "New",
    "last_name": "Manager",
    "role": "manager"
  }'

# Тест з користувачем manager ролі
MANAGER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.i@example.com","password":"manager123"}' | \
  jq -r '.data.token')

# Спроба створити менеджера з manager ролі
curl -X POST http://localhost:3001/api/managers \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "manager"
  }'
```

### 3. Тестування CRUD операцій

#### Створення проекту

```bash
# Створення проекту
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовий проект",
    "description": "Опис тестового проекту",
    "main_responsible_manager_id": 1,
    "counterparty_id": 1,
    "funnel_id": 1,
    "funnel_stage_id": 1,
    "budget": 50000,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.data.id')
echo "Created project ID: $PROJECT_ID"

# Отримання створеного проекту
curl -X GET http://localhost:3001/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Оновлення проекту
curl -X PUT http://localhost:3001/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Оновлений тестовий проект",
    "budget": 75000
  }'

# Видалення проекту
curl -X DELETE http://localhost:3001/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Тестування завантаження файлів

#### Завантаження файлу

```bash
# Створення тестового файлу
echo "Test content" > test.txt

# Завантаження файлу
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt")

FILE_URL=$(echo $UPLOAD_RESPONSE | jq -r '.data.fileUrl')
echo "File URL: $FILE_URL"

# Перевірка доступності файлу
curl -X GET http://localhost:3001$FILE_URL

# Видалення файлу
curl -X DELETE http://localhost:3001/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fileUrl\": \"$FILE_URL\"}"

# Очищення
rm test.txt
```

### 5. Тестування валідації

#### Тест невалідних даних

```bash
# Створення проекту без обов'язкових полів
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": ""
  }'

# Створення менеджера з невалідним email
curl -X POST http://localhost:3001/api/managers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123",
    "first_name": "Test",
    "last_name": "User",
    "role": "invalid-role"
  }'
```

## Тестування з Postman

### Імпорт колекції

1. Створіть нову колекцію "CRM Backend"
2. Додайте змінні середовища:
   - `baseUrl`: `http://localhost:3001`
   - `token`: (порожнє, буде заповнено автоматично)

### Налаштування запитів

#### Login Request

**URL:** `{{baseUrl}}/api/auth/login`
**Method:** POST
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Tests:**
```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("token", response.data.token);
  pm.test("Login successful", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.token).to.exist;
  });
}
```

#### Protected Request Example

**URL:** `{{baseUrl}}/api/managers`
**Method:** GET
**Headers:** `Authorization: Bearer {{token}}`

**Tests:**
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has data", function () {
  const response = pm.response.json();
  pm.expect(response.success).to.be.true;
  pm.expect(response.data).to.be.an('array');
});
```

## Тестування продуктивності

### Load Testing з Artillery

```bash
npm install -g artillery

# Створення файлу тесту
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Authorization: 'Bearer YOUR_TOKEN_HERE'

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/projects"
      - get:
          url: "/api/managers"
      - get:
          url: "/api/products"
EOF

# Запуск тесту
artillery run load-test.yml
```

### Memory Leak Testing

```bash
# Запуск з Node.js --inspect
node --inspect=0.0.0.0:9229 dist/index.js

# Або з tsx
npx tsx --inspect=0.0.0.0:9229 src/index.ts
```

## Тестування безпеки

### SQL Injection Testing

```bash
# Тест з потенційно небезпечними символами
curl -X GET "http://localhost:3001/api/projects?search=' OR 1=1--" \
  -H "Authorization: Bearer $TOKEN"
```

### XSS Testing

```bash
# Тест з потенційно небезпечним контентом
curl -X POST http://localhost:3001/api/comments/projects/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<script>alert(\"XSS\")</script>",
    "manager_id": 1
  }'
```

### Rate Limiting Testing

```bash
# Тест обмеження швидкості
for i in {1..100}; do
  curl -X GET http://localhost:3001/api/projects \
    -H "Authorization: Bearer $TOKEN" &
done
wait
```

## Моніторинг під час тестування

### Логи сервера

```bash
# Перегляд логів в реальному часі
npm run dev 2>&1 | tee server.log

# Або з PM2
pm2 logs crm-backend --lines 100
```

### Моніторинг бази даних

```bash
# Підключення до PostgreSQL
psql -U crm_user -d crm_db

# Перегляд активних з'єднань
SELECT * FROM pg_stat_activity;

# Перегляд статистики
SELECT * FROM pg_stat_database;
```

### Моніторинг системи

```bash
# Використання пам'яті та CPU
htop

# Використання диску
df -h

# Мережева активність
iftop
```

## Автоматизація тестування

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: crm_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup database
      run: |
        npm run db:generate
        npm run db:push
        npm run db:seed
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/crm_test
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/crm_test
```

### Pre-commit Hooks

```bash
npm install --save-dev husky lint-staged

# package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}

# .husky/pre-commit
npx lint-staged
npm test
```

## Результати тестування

### Покриття коду

```bash
npm run test:coverage
```

### Відповідність стандартам

```bash
npm run lint
npm run format:check
```

### Безпека

```bash
npm audit
npm run security:check
```

## Troubleshooting

### Поширені проблеми

1. **Помилка підключення до бази даних:**
   - Перевірте статус PostgreSQL
   - Перевірте DATABASE_URL

2. **Помилка "Port already in use":**
   - Змініть PORT в .env
   - Зупиніть інші процеси

3. **Помилка "Token expired":**
   - Отримайте новий токен
   - Перевірте JWT_EXPIRES_IN

4. **Помилка "File upload failed":**
   - Перевірте права доступу до папки uploads
   - Перевірте MAX_FILE_SIZE
