import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/register' || path === '/';
  const isAdminPath = path.startsWith('/admin');
  const isDashboardPath = path.startsWith('/dashboard') || path === '/profile' || path === '/plans' || path === '/referrals' || path === '/wallet' || path === '/withdraw' || path === '/deposit';

  const token = request.cookies.get('token')?.value || '';

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    if (isAdminPath || isDashboardPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect to dashboard if accessing public route with token
  if (isPublicPath && token) {
    // Decode token to check role (basic check, verify signature in real app or use separate auth endpoint)
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (e) {
      // Invalid token, let them proceed to login
    }
  }

  // Admin protection
  if (isAdminPath && token) {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/profile',
    '/plans',
    '/referrals',
    '/wallet',
    '/withdraw',
    '/deposit',
    '/admin/:path*'
  ],
};
