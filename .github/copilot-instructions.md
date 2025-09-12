# GitHub Copilot Інструкції для SAoBCRM

## Загальні Принципи Роботи

**Всі відповіді надавай Українською мовою. Перед виконанням завдання ознайомся з всіма файлами проекту та їх наповненням, а потім виконуй завдання.**

## Архітектура Проекту

**Монорепозиторій з двома додатками:**
- **Frontend**: React + TypeScript + Vite + TailwindCSS (корінь проекту)
- **Backend**: Node.js + Express + Prisma + PostgreSQL (папка `backend/`)

## Glass UI Система

Проект використовує унікальну дизайн-систему "Liquid Glass":

```tsx
// Основні компоненти
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassDrawer from '../components/GlassDrawer';
import GlassModal from '../components/GlassModal';
import GlassIconButton from '../components/GlassIconButton';

// CSS класи
.glass          // основний glass ефект
.glass-input    // для input полів
.glass-light    // світліша версія
.glass-ultra    // надпрозора версія
```

**Структура glass компонентів:**
```tsx
<div className="glass">
  <div className="glass-hdr"></div>     // HDR шар
  <div className="glass-lens"></div>    // лінза ефект
  <div className="glass-tint"></div>    // тонування
  <div className="glass-reflect"></div> // відображення
  <div className="glass-content">{children}</div>
</div>
```

## Аутентифікація та Авторизація

**Ролева система (backend):**
- `admin` - повний доступ
- `head` - доступ до своїх даних + підлеглих
- `manager` - тільки свої дані

**Middleware pattern:**
```typescript
// Всі API роути вимагають аутентифікації
router.use(authenticateToken);

// Спеціальні ролі
router.post('/', requireAdmin, Controller.create);
router.put('/:id', requireHeadOrAdmin, Controller.update);
```

**Фільтрація даних в сервісах:**
```typescript
// Приклад з ProjectService.getAll(userRole, userId)
if (userRole === 'admin') {
  // повний доступ
} else if (userRole === 'head') {
  // + підлеглі через AuthService.getSubordinateIds()
} else {
  // тільки свої
}
```

## Prisma Patterns

**Обов'язково include related data:**
```typescript
// Продажі завжди включають продукти/послуги з цінами
sales: { 
  include: { 
    products: { include: { product: true } },
    services: { include: { service: true } }
  }
}
```

**Decimal конвертація (критично!):**
```typescript
// В сервісах завжди конвертуйте Decimal в number
price: Number(item.price) || 0
```

## Структура API

**Стандартна відповідь:**
```typescript
res.json({
  success: true,
  data: result
});

// Або при помилці
res.status(400).json({
  success: false,
  error: 'Error message'
});
```

**Controller → Service → Database pattern:**
```typescript
// Controller тільки обробляє HTTP
export class ProjectController {
  static async getAll(req: Request, res: Response) {
    const projects = await ProjectService.getAll(req.user.role, req.user.manager_id);
    res.json({ success: true, data: projects });
  }
}
```

## Frontend Service Layer

**HTTP клієнт з автоматичною аутентифікацією:**
```typescript
// Всі сервіси наслідують від api/httpClient.ts
export const ProjectsService = {
  async getAll() {
    const { data } = await api.get('/projects');
    return data.data; // розпакування { success: true, data: ... }
  }
};
```

## Важливі Drawer Patterns

**Проекти та підпроекти мають ідентичну структуру:**
```tsx
// Sidebar (300px) + Tabs (comments/sales/products/tasks)
<div className="lg:flex gap-4">
  <div className="lg:w-[300px] lg:flex-shrink-0">
    <GlassCard>/* метадані */</GlassCard>
  </div>
  <div className="flex-1">/* tabs content */</div>
</div>
```

## Розрахунки Продажів

**Критично:** Ціни зберігаються в пов'язаних таблицях, не в junction tables:
```typescript
// ПРАВИЛЬНО - ціна з product.price
const total = sale.products.reduce((sum, p) => 
  sum + (Number(p.product?.price) || 0) * (Number(p.quantity) || 0), 0
);

// НЕ з p.price (junction table не має ціни)
```

## Команди Розробки

```bash
# Frontend (корінь)
npm run dev          # Vite dev server
npm run build        # Production build

# Backend
cd backend
npm run dev          # tsx watch
npm run db:generate  # після зміни schema.prisma
npm run db:migrate   # створити міграцію
npm run db:studio    # Prisma Studio
```

## Файлова Структура

```
src/
├── components/        # Glass UI компоненти
├── pages/            # Drawer компоненти (великі)
├── services/         # API клієнти
├── context/          # React Context (Auth, Prefs)
└── hooks/            # usePointerLight для glass ефектів

backend/src/
├── controllers/      # HTTP обробники
├── services/         # Бізнес-логіка + авторизація
├── routes/           # Express роути
├── middleware/       # auth.ts, тощо
└── types/            # TypeScript типи
```

## Українська Локалізація

Весь інтерфейс українською. Типові фрази:
- `'Завантаження...'` для loading
- `'Збереження...'` для saving
- `'Створити'` / `'Зберегти'` для кнопок
- `'Закрити'` для close buttons
