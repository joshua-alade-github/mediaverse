import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

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

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};