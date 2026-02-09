import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';

export async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const signInRoute = '/sign-in';
  const signUpRoute = '/sign-up';
  const dashboardRoute = '/dashboard';
  const isAuthenticated = !!session?.user;
  const authRoutes = [signInRoute, signUpRoute];
  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );
  const isProtectedRoute = !isAuthRoute;
  const isInsideDashboard = req.nextUrl.pathname.startsWith(dashboardRoute);

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(signInRoute, req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!isInsideDashboard && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/', '/sign-in', '/sign-up'],
};
