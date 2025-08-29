# 🚀 Швидкий старт CRM Backend

Цей документ містить мінімальні інструкції для швидкого запуску CRM Backend.

## ⚡ 5 хвилин до запуску

### 1. Передумови

- ✅ Node.js 18+ встановлений
- ✅ PostgreSQL запущений
- ✅ Git встановлений

### 2. Клонування та налаштування

```bash
# Клонування проекту
git clone <your-repo-url>
cd bojumboSAoBcrm/backend

# Копіювання змінних середовища
cp .env.example .env
```

### 3. Налаштування .env

Відредагуйте `.env` файл:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"
JWT_SECRET="your-super-secret-key-here"
PORT=3001
```

### 4. Швидкий запуск

```bash
# Встановлення залежностей
npm install

# Налаштування бази даних
npm run db:generate
npm run db:push
npm run db:seed

# Запуск сервера
npm run dev
```

### 5. Перевірка роботи

```bash
# Health check
curl http://localhost:3001/health

# Тест аутентифікації
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 🎯 Готово!

Ваш CRM Backend запущений на `http://localhost:3001`!

## 📱 Тестові користувачі

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| ivan.p@example.com | manager123 | head |
| maria.i@example.com | manager123 | manager |

## 🔗 Основні endpoints

- **Health**: `GET /health`
- **Login**: `POST /api/auth/login`
- **Managers**: `GET /api/managers`
- **Projects**: `GET /api/projects`
- **Products**: `GET /api/products`
- **Sales**: `GET /api/sales`

## 🆘 Якщо щось не працює

### Помилка підключення до БД
```bash
# Перевірте статус PostgreSQL
sudo systemctl status postgresql

# Створіть базу даних
createdb crm_db
```

### Помилка "Port already in use"
```bash
# Змініть PORT в .env
PORT=3002

# Або зупиніть процес
lsof -ti:3001 | xargs kill -9
```

### Помилка "Prisma client not generated"
```bash
npm run db:generate
```

## 📚 Детальна документація

- **README.md** - загальна інформація
- **SETUP.md** - детальне налаштування
- **API_EXAMPLES.md** - приклади використання
- **FRONTEND_INTEGRATION.md** - підключення фронтенду

## 🎉 Наступні кроки

1. **Підключіть фронтенд** - оновіть API URL на `http://localhost:3001`
2. **Тестуйте API** - використовуйте Postman або curl
3. **Налаштуйте продакшн** - дивіться DEPLOYMENT.md

---

**Питання?** Перегляньте детальну документацію або створіть issue в репозиторії.
