import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if the route requires authentication
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = [
    '/profile',
    '/settings',
    '/lists/create',
    '/reviews/create',
  ].some(path => req.nextUrl.pathname.startsWith(path));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Redirect unauthenticated users to login page from protected routes
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Add cache headers for static assets
  if (req.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/)) {
    res.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // Add cache headers for API responses
  if (req.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=30'
    );
  }

  // Refresh session if needed
  if (session?.expires_at && Date.now() > session.expires_at * 1000) {
    await supabase.auth.refreshSession();
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};