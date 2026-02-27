import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/onboarding', '/courses', '/progress', '/settings'];
const AUTH_ONLY = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('edulearn_token')?.value;
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login/register
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/courses/:path*', '/progress/:path*', '/settings/:path*', '/login', '/register'],
};
