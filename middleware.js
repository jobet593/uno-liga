import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname === '/admin';
  const isAdminApi = pathname.startsWith('/api/admin/');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('uno_admin_auth');
  const authed = cookie && cookie.value === 'ok';

  if (authed) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return new NextResponse(JSON.stringify({ error: 'No autorizado. Inicia sesión en /admin.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/admin-login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/api/admin/:path*'],
};
