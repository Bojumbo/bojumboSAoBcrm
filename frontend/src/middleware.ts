import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  // Маршрути, які потребують аутентифікації
  const protectedPaths = ['/dashboard'];
  
  // Публічні маршрути
  const publicPaths = ['/login', '/'];
  
  const { pathname } = request.nextUrl;

  // Якщо користувач намагається увійти на захищений маршрут без токену
  if (protectedPaths.some(path => pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Якщо користувач з токеном намагається увійти на сторінку входу
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Редірект з головної сторінки
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
