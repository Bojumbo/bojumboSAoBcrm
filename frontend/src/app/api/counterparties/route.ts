import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/counterparties`, {
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Помилка отримання контрагентів:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка отримання контрагентів' },
      { status: 500 }
    );
  }
}
