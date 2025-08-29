# Розгортання CRM Backend

Цей документ містить інструкції по розгортанню CRM Backend в продакшн середовищі.

## Передумови

### Необхідне програмне забезпечення

1. **Node.js** (версія 18 LTS або вище)
2. **PostgreSQL** (версія 12 або вище)
3. **PM2** (для управління процесами)
4. **Nginx** (як reverse proxy, опціонально)
5. **SSL сертифікат** (для HTTPS)

## Варіанти розгортання

### 1. VPS/Cloud Server

#### Налаштування сервера

1. **Оновлення системи:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Встановлення Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Встановлення PostgreSQL:**
   ```bash
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

4. **Встановлення PM2:**
   ```bash
   sudo npm install -g pm2
   ```

#### Налаштування бази даних

1. **Створення користувача та бази даних:**
   ```bash
   sudo -u postgres psql
   
   CREATE USER crm_user WITH PASSWORD 'strong_password_here';
   CREATE DATABASE crm_db OWNER crm_user;
   GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
   \q
   ```

2. **Налаштування PostgreSQL:**
   ```bash
   sudo nano /etc/postgresql/*/main/postgresql.conf
   # Додайте: max_connections = 100
   
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   # Налаштуйте доступ для crm_user
   ```

#### Розгортання додатку

1. **Клонування репозиторію:**
   ```bash
   git clone <your-repo> /var/www/crm-backend
   cd /var/www/crm-backend
   ```

2. **Налаштування змінних середовища:**
   ```bash
   cp .env.example .env
   nano .env
   ```

   ```env
   NODE_ENV=production
   DATABASE_URL="postgresql://crm_user:strong_password_here@localhost:5432/crm_db"
   JWT_SECRET="very-long-random-secret-key-here"
   PORT=3001
   UPLOAD_DIR="/var/www/crm-backend/uploads"
   MAX_FILE_SIZE=10485760
   ```

3. **Встановлення залежностей та збірка:**
   ```bash
   npm ci --only=production
   npm run build
   ```

4. **Налаштування бази даних:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Запуск з PM2:**
   ```bash
   pm2 start dist/index.js --name "crm-backend"
   pm2 startup
   pm2 save
   ```

### 2. Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Встановлення залежностей
COPY package*.json ./
RUN npm ci --only=production

# Копіювання коду
COPY . .

# Збірка
RUN npm run build

# Створення користувача
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Створення папки для завантажень
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://crm_user:password@db:5432/crm_db
      - JWT_SECRET=your-secret-key
      - PORT=3001
      - UPLOAD_DIR=./uploads
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=crm_db
      - POSTGRES_USER=crm_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Запуск

```bash
docker-compose up -d
```

### 3. Heroku

#### Налаштування

1. **Встановлення Heroku CLI:**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Логін:**
   ```bash
   heroku login
   ```

3. **Створення додатку:**
   ```bash
   heroku create your-crm-backend
   ```

4. **Додавання PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Налаштування змінних:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set UPLOAD_DIR=./uploads
   ```

6. **Розгортання:**
   ```bash
   git push heroku main
   ```

## Налаштування Nginx (опціонально)

### Конфігурація Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/crm-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL сертифікат з Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Моніторинг та логування

### PM2 Monitoring

```bash
# Перегляд процесів
pm2 list

# Перегляд логів
pm2 logs crm-backend

# Перегляд ресурсів
pm2 monit

# Перезапуск
pm2 restart crm-backend
```

### Логування

Для продакшну рекомендується використовувати Winston або Pino:

```typescript
// src/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Безпека

### Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Оновлення

```bash
# Створення скрипту оновлення
cat > update.sh << 'EOF'
#!/bin/bash
cd /var/www/crm-backend
git pull origin main
npm ci --only=production
npm run build
pm2 restart crm-backend
EOF

chmod +x update.sh
```

### Backup

```bash
# Створення скрипту backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/crm"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup бази даних
pg_dump -U crm_user crm_db > $BACKUP_DIR/db_$DATE.sql

# Backup завантажених файлів
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Видалення старих backup'ів (старше 30 днів)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Додавання в cron
echo "0 2 * * * /var/www/crm-backend/backup.sh" | sudo crontab -
```

## Масштабування

### Горизонтальне масштабування

1. **Load Balancer** (Nginx, HAProxy)
2. **Кілька екземплярів додатку**
3. **Shared storage** для завантажених файлів

### Вертикальне масштабування

1. **Збільшення ресурсів сервера**
2. **Оптимізація бази даних**
3. **Кешування** (Redis)

## Перевірка розгортання

```bash
# Health check
curl https://your-domain.com/health

# Тест API
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Troubleshooting

### Помилки підключення

1. Перевірте статус PostgreSQL: `sudo systemctl status postgresql`
2. Перевірте логи: `sudo journalctl -u postgresql`
3. Перевірте підключення: `psql -U crm_user -d crm_db`

### Помилки додатку

1. Перевірте логи PM2: `pm2 logs crm-backend`
2. Перевірте статус: `pm2 status`
3. Перевірте змінні середовища: `pm2 env crm-backend`

### Проблеми з Nginx

1. Перевірте конфігурацію: `sudo nginx -t`
2. Перезапустіть: `sudo systemctl restart nginx`
3. Перевірте логи: `sudo tail -f /var/log/nginx/error.log`
