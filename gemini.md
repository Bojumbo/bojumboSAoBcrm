

**Всі відповіді надавай Українською мовою. Перед виконанням завдання ознайомся з всіма файлами проекту та їх наповненням, а потім виконуй завдання.**

**Всі компоненти використовуй з бібліотеки https://ui.shadcn.com/ (shadcn/ui)**
**Всі команди для терміналу я буду виконувати самостійно, тому прописуй що виконувати і я буду їх виконувати.**
**Фронтенд та бекенд вже запущені через `npm run dev` в кожній з папок.**
**Всі сторінки повинні бути адаптивними.**
**Виконуй чітко поставлену задачу та не додавай нічого свого.**
**Якщо потрібно щось уточнити, питай.**

1. Огляд проекту
SAoB CRM — це корпоративна CRM-система для управління проектами, підпроектами, завданнями, продажами, клієнтами та іншими бізнес-процесами.
Цільові користувачі: менеджери, керівники відділів, адміністратори, співробітники компанії, які працюють з проектами, продажами та клієнтською базою.

2. Технологічний стек
Frontend:

Фреймворк: Next.js (React)
UI бібліотеки: Shadcn/ui, Tailwind CSS, Lucide React (іконки)
Форми та валідація: React Hook Form, Zod
HTTP клієнт: Axios
Стейт-менеджмент: React Context (наприклад, AuthContext)
Інші: clsx, class-variance-authority
Backend:

Фреймворк: Express.js
Мова: TypeScript
База даних: PostgreSQL
ORM: Prisma
Аутентифікація: JWT (jsonwebtoken), bcryptjs
Файли: Multer (завантаження файлів)
Інші: dotenv, cors
3. Архітектура та структура проекту
Архітектура:
Класичний Client-Server (моноліт), де фронтенд і бекенд — окремі додатки, що взаємодіють через REST API.

Frontend:

src/app/ — сторінки Next.js (App Router), наприклад, dashboard, projects, subprojects, tasks, login, settings.
src/components/ — реюзабельні React-компоненти (Kanban, Sidebar, Chat, InfoPanel, Dialogи тощо).
src/types/ — TypeScript типи для моделей (projects, auth, services).
src/lib/ — утиліти та API-клієнт.
contexts/ — React Context для аутентифікації.
middleware.ts — захист маршрутів.
Backend:

src/routes/ — визначення API-роутів (projects, subprojects, tasks, auth, sales, products, services, comments).
src/controllers/ — логіка обробки HTTP-запитів.
src/services/ — бізнес-логіка, робота з Prisma.
src/types/ — типи та інтерфейси для моделей.
src/config/ — конфігурація (env, database).
prisma/ — схема бази даних та скрипти для seed.
uploads/ — папка для завантажених файлів.
4. Ключові функції та бізнес-логіка
Аутентифікація користувачів
JWT-based: логін через /api/auth/login, токен зберігається у localStorage та cookies.
Middleware: захист приватних маршрутів через middleware.
Основні маршрути:
POST /api/auth/login — логін
GET /api/auth/me — поточний користувач
POST /api/auth/logout — вихід
Основні бізнес-функції
Управління підпроектами

CRUD для підпроектів (subprojects.ts, subProjectController.ts, subProjectService.ts)
Відображення детальної інформації, товарів, послуг, завдань, коментарів (компонент SubProjectDetailPage)
Канбан-дошка для проектів/підпроектів

Візуалізація проектів/підпроектів у вигляді Kanban (компоненти ProjectsKanban, SubprojectsKanban)
Перетягування, зміна статусу, фільтрація
Управління завданнями

CRUD для завдань (src/routes/tasks.ts, src/controllers/taskController.ts, src/services/taskService.ts)
Відображення завдань у Kanban, деталі завдання (компоненти TasksKanban, TaskDetailsDialog)
5. Потік даних та API-комунікація
Фронтенд ↔ Бекенд:
Взаємодія через REST API (HTTP-запити, Axios).

Ключові API-ендпоінти:

GET /api/projects — отримати всі проекти
GET /api/projects/:id — деталі проекту
GET /api/subprojects — отримати всі підпроекти
GET /api/subprojects/:id — деталі підпроекту
POST /api/auth/login — логін
GET /api/managers — отримати менеджерів
GET /api/products — отримати товари
GET /api/services — отримати послуги
GET /api/tasks — отримати завдання
POST /api/subprojects/:id/products — додати товар до підпроекту
POST /api/subprojects/:id/services — додати послугу до підпроекту
6. Схема бази даних
Основні моделі (Prisma):

Manager: менеджери, ролі, email, пароль, зв’язки з проектами/завданнями
Project: проекти, опис, менеджери, контрагенти, товари, послуги, підпроекти, завдання, продажі
SubProject: підпроекти, зв’язок з проектом, товари, послуги, завдання, коментарі
Task: завдання, статус, відповідальний, проект/підпроект
Product: товари, ціна, залишки
Service: послуги
Sale: продажі, зв’язок з проектом/підпроектом
Counterparty: контрагенти (клієнти, постачальники)
Funnel/FunnelStage: воронки продажів та етапи
Comment: коментарі до проектів/підпроектів
Зв’язки:

Один менеджер може бути відповідальним за багато проектів/підпроектів
Проект має багато підпроектів, завдань, продажів
Підпроект має товари, послуги, завдання, коментарі
Завдання належать проекту або підпроекту
Коментарі прив’язані до проекту/підпроекту та менеджера
7. Запуск проекту
Необхідні змінні середовища (з .env.example):

DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
PORT
NODE_ENV
UPLOAD_DIR
MAX_FILE_SIZE
Команди для запуску:

Backend:

Frontend:

Документ підготовлено для швидкого старту нового AI-асистента. Для деталей дивіться README та SUMMARY-файли у README.md та PROJECT_SUMMARY.md.