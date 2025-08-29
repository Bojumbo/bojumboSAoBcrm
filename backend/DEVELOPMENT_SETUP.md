# 🛠️ Налаштування середовища розробки CRM Backend

Цей документ містить детальні інструкції по налаштуванню середовища розробки для CRM Backend.

## 📋 Передумови

### Необхідне програмне забезпечення

1. **Node.js** версія 18 LTS або вище
2. **npm** або **yarn** менеджер пакетів
3. **Git** для контролю версій
4. **PostgreSQL** версія 12 або вище
5. **VS Code** або інший редактор коду

### Перевірка встановлення

```bash
# Перевірка Node.js
node --version

# Перевірка npm
npm --version

# Перевірка Git
git --version

# Перевірка PostgreSQL
psql --version
```

## 🟢 Встановлення Node.js

### Ubuntu/Debian

```bash
# Додавання NodeSource репозиторію
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Встановлення Node.js
sudo apt-get install -y nodejs

# Перевірка встановлення
node --version
npm --version
```

### CentOS/RHEL/Fedora

```bash
# Додавання NodeSource репозиторію
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Встановлення Node.js
sudo yum install -y nodejs

# Перевірка встановлення
node --version
npm --version
```

### macOS

```bash
# За допомогою Homebrew
brew install node@18

# Додавання в PATH
echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Перевірка встановлення
node --version
npm --version
```

### Windows

1. Завантажте Node.js з [офіційного сайту](https://nodejs.org/)
2. Запустіть інсталятор
3. Слідуйте інструкціям майстра встановлення
4. Перезапустіть командний рядок

### NVM (Node Version Manager)

```bash
# Встановлення NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезавантаження терміналу
source ~/.bashrc

# Встановлення Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Перевірка
node --version
npm --version
```

## 🔧 Налаштування npm

### Глобальні налаштування

```bash
# Налаштування реєстру
npm config set registry https://registry.npmjs.org/

# Налаштування користувача
npm config set init.author.name "Your Name"
npm config set init.author.email "your.email@example.com"
npm config set init.license "MIT"

# Перегляд налаштувань
npm config list
```

### Встановлення глобальних пакетів

```bash
# TypeScript
npm install -g typescript

# tsx для швидкого запуску
npm install -g tsx

# nodemon для автоматичного перезапуску
npm install -g nodemon

# Prisma CLI
npm install -g prisma

# ESLint
npm install -g eslint

# Prettier
npm install -g prettier
```

## 📁 Налаштування проекту

### 1. Клонування репозиторію

```bash
# Клонування
git clone <your-repo-url>
cd bojumboSAoBcrm/backend

# Перевірка статусу
git status
```

### 2. Встановлення залежностей

```bash
# Встановлення залежностей
npm install

# Перевірка встановлених пакетів
npm list --depth=0
```

### 3. Налаштування змінних середовища

```bash
# Копіювання прикладу
cp .env.example .env

# Редагування .env
nano .env
```

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

## 🗃️ Налаштування бази даних

### 1. Створення бази даних

```bash
# Підключення до PostgreSQL
sudo -u postgres psql

# Створення користувача та бази даних
CREATE USER crm_user WITH PASSWORD 'your_password';
CREATE DATABASE crm_db OWNER crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
\q
```

### 2. Налаштування Prisma

```bash
# Генерація Prisma клієнта
npm run db:generate

# Застосування схеми
npm run db:push

# Заповнення початковими даними
npm run db:seed
```

## 🎯 Налаштування VS Code

### 1. Встановлення розширень

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "prisma.prisma",
    "ms-vscode.vscode-node-debug2",
    "ms-vscode.vscode-js-debug"
  ]
}
```

### 2. Налаштування робочого простору

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.prisma": "prisma"
  },
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

### 3. Налаштування запуску та дебагу

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Program",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "runtimeArgs": ["-r", "tsx/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "${workspaceFolder}"
    }
  ]
}
```

### 4. Налаштування задач

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "npm: dev",
      "type": "npm",
      "script": "dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "npm: build",
      "type": "npm",
      "script": "build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "npm: db:generate",
      "type": "npm",
      "script": "db:generate",
      "group": "build"
    },
    {
      "label": "npm: db:push",
      "type": "npm",
      "script": "db:push",
      "group": "build"
    },
    {
      "label": "npm: db:seed",
      "type": "npm",
      "script": "db:seed",
      "group": "build"
    }
  ]
}
```

## 🧹 Налаштування лінтингу та форматування

### 1. ESLint

```bash
# Встановлення ESLint
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Ініціалізація ESLint
npx eslint --init
```

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### 2. Prettier

```bash
# Встановлення Prettier
npm install --save-dev prettier

# Створення конфігурації
npx prettier --init
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. Husky та lint-staged

```bash
# Встановлення
npm install --save-dev husky lint-staged

# Налаштування Husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 🚀 Налаштування скриптів розробки

### 1. Оновлення package.json

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "dev:debug": "tsx --inspect=0.0.0.0:9229 src/index.ts",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma db push --force-reset && npm run db:seed",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 2. Налаштування nodemon (опціонально)

```bash
# Встановлення nodemon
npm install --save-dev nodemon
```

```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "tsx src/index.ts"
}
```

## 🔍 Налаштування дебагу

### 1. Запуск з дебагом

```bash
# Запуск з дебагом
npm run dev:debug

# Або з tsx
npx tsx --inspect=0.0.0.0:9229 src/index.ts
```

### 2. Підключення дебагера

1. Відкрийте VS Code
2. Натисніть F5 або використайте меню Run and Debug
3. Виберіть "Attach to Process"
4. Встановіть breakpoints в коді

### 3. Chrome DevTools

```bash
# Запуск з дебагом
node --inspect=0.0.0.0:9229 dist/index.js

# Відкрийте Chrome і перейдіть на chrome://inspect
```

## 📊 Налаштування моніторингу

### 1. Логування

```bash
# Встановлення Winston
npm install winston
```

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

### 2. Health checks

```typescript
// src/health/database.ts
import { prisma } from '../config/database';

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}
```

## 🧪 Налаштування тестування

### 1. Jest

```bash
# Встановлення Jest
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

```javascript
// jest.config.js
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

### 2. Тестова база даних

```bash
# Створення тестової бази даних
sudo -u postgres createdb crm_test

# Налаштування тестового .env
cp .env .env.test
```

```env
# .env.test
DATABASE_URL="postgresql://crm_user:your_password@localhost:5432/crm_test"
NODE_ENV="test"
```

## 🔧 Налаштування Git

### 1. .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Prisma
prisma/migrations/

# Uploads
uploads/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 2. Git hooks

```bash
# Налаштування pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## 🎯 Перевірний список

### ✅ Базова налаштування

- [ ] Node.js 18+ встановлений
- [ ] npm встановлений та налаштований
- [ ] Git встановлений та налаштований
- [ ] PostgreSQL встановлений та запущений

### ✅ Проект

- [ ] Репозиторій клонований
- [ ] Залежності встановлені
- [ ] .env файл налаштований
- [ ] База даних створена та налаштована

### ✅ Розробка

- [ ] VS Code налаштований
- [ ] ESLint та Prettier налаштовані
- [ ] TypeScript налаштований
- [ ] Дебаг налаштований

### ✅ Тестування

- [ ] Jest налаштований
- [ ] Тестова база даних створена
- [ ] Тести запускаються

## 🎉 Висновок

Після виконання всіх кроків у вас буде:

- ✅ **Повноцінне середовище розробки**
- ✅ **Налаштовані інструменти якості коду**
- ✅ **Готові до використання скрипти**
- ✅ **Налаштований дебаг та тестування**

Середовище розробки готове для продуктивної роботи! 🚀
