# SAoB CRM Frontend

Frontend частина CRM системи SAoB, побудована на Next.js з використанням Shadcn UI та TypeScript.

## Технології

- **Next.js 15** - React фреймворк
- **TypeScript** - Типізація
- **Tailwind CSS** - Стилізація
- **Shadcn UI** - Компоненти інтерфейсу
- **React Hook Form** - Робота з формами
- **Zod** - Валідація
- **Axios** - HTTP клієнт
- **Lucide React** - Іконки

## Встановлення та запуск

### Вимоги
- Node.js 18+ 
- npm або yarn

### Встановлення залежностей
```bash
npm install
```

### Налаштування середовища
Створіть файл `.env.local` в корені frontend папки:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Запуск в режимі розробки
```bash
npm run dev
```

Додаток буде доступний за адресою: `http://localhost:3000`
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
