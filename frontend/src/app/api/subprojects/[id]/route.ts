import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Виправлена сигнатура згідно Next.js App Router
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const subprojectId = context.params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const authToken = req.cookies.get('auth_token')?.value || '';

  try {
    const response = await fetch(`${apiUrl}/subprojects/${subprojectId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return NextResponse.json({ error: result.error || 'Не вдалося завантажити підпроект' }, { status: response.status });
    }
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Помилка завантаження' }, { status: 500 });
  }
}

// Додаємо обробку PUT-запиту для оновлення підпроекту
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const subprojectId = context.params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const authToken = req.cookies.get('auth_token')?.value || '';
  const body = await req.json();

  try {
    const response = await fetch(`${apiUrl}/subprojects/${subprojectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return NextResponse.json({ error: result.error || 'Не вдалося оновити підпроект' }, { status: response.status });
    }
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Помилка оновлення' }, { status: 500 });
  }
}
