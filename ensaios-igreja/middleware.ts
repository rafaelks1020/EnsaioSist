import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { Role, canAccessRoute, getDefaultRedirect } from '@/lib/roles';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Se não tem token, redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const userRole = token.role as Role;

    // Verifica se pode acessar a rota
    if (!canAccessRoute(userRole, pathname)) {
      // Redireciona para a página padrão do role
      const defaultRoute = getDefaultRedirect(userRole);
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/app/:path*',
    '/admin/:path*',
    '/acesso/:path*',
  ],
};