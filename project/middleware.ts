import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/products', '/orders', '/upload', '/content', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Auth routes (redirect if already logged in)
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // For API routes, check Authorization header
    if (pathname.startsWith('/api/')) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const user = getUserFromToken(token);
      if (!user) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
    }
    // For page routes, let client-side handle redirects
  }

  if (isAuthRoute) {
    // For auth pages, let client-side handle redirects if user is already logged in
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/products/:path*', 
    '/orders/:path*', 
    '/upload/:path*', 
    '/content/:path*', 
    '/profile/:path*',
    '/api/auth/:path*'
  ],
};