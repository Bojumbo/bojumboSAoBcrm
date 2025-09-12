import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    // Витягуємо токен з cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies['auth_token'];

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Додаємо Authorization header якщо є токен
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/projects/${projectId}`, {
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Помилка отримання коментарів' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    // Витягуємо токен з cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies['auth_token'];

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Додаємо Authorization header якщо є токен
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/projects/${projectId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Помилка додавання коментаря' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
