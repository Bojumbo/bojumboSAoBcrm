# 🗄️ Налаштування бази даних CRM Backend

Цей документ містить детальні інструкції по налаштуванню PostgreSQL бази даних для CRM Backend.

## 📋 Передумови

### Необхідне програмне забезпечення

1. **PostgreSQL** версія 12 або вище
2. **Node.js** версія 18 або вище
3. **Git** для клонування проекту

### Перевірка встановлення

```bash
# Перевірка PostgreSQL
psql --version

# Перевірка Node.js
node --version

# Перевірка npm
npm --version
```

## 🐘 Встановлення PostgreSQL

### Ubuntu/Debian

```bash
# Оновлення пакетів
sudo apt update

# Встановлення PostgreSQL
sudo apt install postgresql postgresql-contrib

# Запуск сервісу
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Перевірка статусу
sudo systemctl status postgresql
```

### CentOS/RHEL/Fedora

```bash
# Встановлення PostgreSQL
sudo dnf install postgresql postgresql-server postgresql-contrib

# Ініціалізація бази даних
sudo postgresql-setup --initdb

# Запуск сервісу
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS

```bash
# За допомогою Homebrew
brew install postgresql

# Запуск сервісу
brew services start postgresql
```

### Windows

1. Завантажте PostgreSQL з [офіційного сайту](https://postgresql.org/download/windows/)
2. Запустіть інсталятор
3. Слідуйте інструкціям майстра встановлення
4. Запам'ятайте пароль для користувача `postgres`

### Docker

```bash
# Запуск PostgreSQL в Docker
docker run --name postgres-crm \
  -e POSTGRES_DB=crm_db \
  -e POSTGRES_USER=crm_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Перевірка статусу
docker ps
```

## 🔧 Налаштування PostgreSQL

### 1. Підключення до PostgreSQL

```bash
# Підключення як postgres користувач
sudo -u postgres psql

# Або створення користувача та підключення
sudo -u postgres createuser --interactive
sudo -u postgres createdb crm_db
psql -U your_username -d crm_db
```

### 2. Створення користувача та бази даних

```sql
-- Створення користувача
CREATE USER crm_user WITH PASSWORD 'your_secure_password';

-- Створення бази даних
CREATE DATABASE crm_db OWNER crm_user;

-- Надання прав
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;

-- Підключення до бази даних
\c crm_db

-- Надання прав на схему public
GRANT ALL ON SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crm_user;

-- Вихід
\q
```

### 3. Налаштування аутентифікації

#### Ubuntu/Debian

```bash
# Редагування pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Додайте або змініть рядки:
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

#### CentOS/RHEL/Fedora

```bash
# Редагування pg_hba.conf
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Додайте або змініть рядки:
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### 4. Перезапуск PostgreSQL

```bash
# Ubuntu/Debian
sudo systemctl restart postgresql

# CentOS/RHEL/Fedora
sudo systemctl restart postgresql

# macOS
brew services restart postgresql

# Docker
docker restart postgres-crm
```

### 5. Тестування підключення

```bash
# Тест підключення
psql -U crm_user -d crm_db -h localhost

# Введіть пароль коли запитає
# Перевірка підключення
\conninfo

# Вихід
\q
```

## 🚀 Налаштування проекту

### 1. Клонування проекту

```bash
# Клонування репозиторію
git clone <your-repo-url>
cd bojumboSAoBcrm/backend

# Копіювання змінних середовища
cp .env.example .env
```

### 2. Налаштування .env файлу

```bash
# Редагування .env
nano .env
```

```env
# Database
DATABASE_URL="postgresql://crm_user:your_secure_password@localhost:5432/crm_db"

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

### 3. Встановлення залежностей

```bash
# Встановлення npm пакетів
npm install

# Перевірка встановлення
npm list --depth=0
```

## 🗃️ Налаштування Prisma

### 1. Генерація Prisma клієнта

```bash
# Генерація клієнта
npm run db:generate

# Перевірка створених файлів
ls -la node_modules/.prisma/
```

### 2. Застосування схеми до бази даних

```bash
# Застосування схеми
npm run db:push

# Перевірка створених таблиць
psql -U crm_user -d crm_db -c "\dt"
```

### 3. Заповнення початковими даними

```bash
# Заповнення даними
npm run db:seed

# Перевірка даних
psql -U crm_user -d crm_db -c "SELECT COUNT(*) FROM \"Manager\";"
```

## 🔍 Перевірка налаштування

### 1. Тест підключення

```bash
# Тест з Node.js
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const managerCount = await prisma.manager.count();
    console.log('📊 Managers in database:', managerCount);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

test();
"
```

### 2. Тест API endpoints

```bash
# Запуск сервера
npm run dev

# В іншому терміналі - тест health endpoint
curl http://localhost:3001/health

# Тест аутентифікації
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 🛠️ Розв'язання проблем

### Помилка "Connection refused"

```bash
# Перевірка статусу PostgreSQL
sudo systemctl status postgresql

# Перевірка порту
sudo netstat -tlnp | grep 5432

# Перевірка логів
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Помилка "Authentication failed"

```bash
# Перевірка pg_hba.conf
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v '^#' | grep -v '^$'

# Перевірка користувача
sudo -u postgres psql -c "\du"

# Скидання пароля
sudo -u postgres psql -c "ALTER USER crm_user PASSWORD 'new_password';"
```

### Помилка "Database does not exist"

```bash
# Створення бази даних
sudo -u postgres createdb crm_db

# Надання прав
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;"
```

### Помилка "Permission denied"

```bash
# Перевірка прав користувача
sudo -u postgres psql -c "\du crm_user"

# Надання додаткових прав
sudo -u postgres psql -d crm_db -c "GRANT ALL ON SCHEMA public TO crm_user;"
sudo -u postgres psql -d crm_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;"
```

## 📊 Моніторинг бази даних

### 1. Основні команди PostgreSQL

```sql
-- Підключення до бази даних
\c crm_db

-- Перегляд таблиць
\dt

-- Перегляд структури таблиці
\d "Manager"

-- Перегляд користувачів
\du

-- Перегляд активних з'єднань
SELECT * FROM pg_stat_activity;

-- Перегляд статистики
SELECT * FROM pg_stat_database;
```

### 2. Моніторинг продуктивності

```sql
-- Найповільніші запити
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Розмір таблиць
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Очищення та оптимізація

```sql
-- Аналіз таблиць
ANALYZE;

-- Очищення статистики
SELECT pg_stat_reset();

-- Перегляд та очищення логів
SELECT pg_current_logfile();
```

## 🔒 Безпека

### 1. Налаштування firewall

```bash
# Ubuntu/Debian
sudo ufw allow 5432/tcp

# CentOS/RHEL/Fedora
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### 2. Обмеження доступу

```bash
# Редагування postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Додайте:
listen_addresses = 'localhost'
max_connections = 100
```

### 3. Регулярні backup

```bash
# Створення скрипту backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/crm"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U crm_user -h localhost crm_db > $BACKUP_DIR/crm_db_$DATE.sql

# Видалення старих backup'ів (старше 30 днів)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
EOF

chmod +x backup.sh

# Додавання в cron
echo "0 2 * * * /path/to/backup.sh" | sudo crontab -
```

## 🎯 Перевірний список

### ✅ Базова налаштування

- [ ] PostgreSQL встановлений та запущений
- [ ] База даних `crm_db` створена
- [ ] Користувач `crm_user` створений з правами
- [ ] Файл `.env` налаштований
- [ ] Prisma клієнт згенерований
- [ ] Схема застосована до бази даних
- [ ] Початкові дані завантажені

### ✅ Тестування

- [ ] Підключення до бази даних працює
- [ ] Сервер запускається без помилок
- [ ] Health endpoint відповідає
- [ ] Аутентифікація працює
- [ ] API endpoints відповідають

### ✅ Безпека

- [ ] Firewall налаштований
- [ ] Доступ обмежений до localhost
- [ ] Backup скрипт створений
- [ ] Cron job налаштований

## 🎉 Висновок

Після виконання всіх кроків у вас буде:

- ✅ **Працююча PostgreSQL база даних**
- ✅ **Налаштований CRM Backend**
- ✅ **Заповнена тестовими даними**
- ✅ **Готовий до використання API**

База даних готова для роботи з CRM системою! 🚀
