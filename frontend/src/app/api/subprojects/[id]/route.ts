import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const subprojectId = params.id;
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
