import { NextRequest, NextResponse } from 'next/server';

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/me'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith('/api/auth/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Verificar se o usuário está autenticado
  const token = request.cookies.get('auth_token')?.value;
  
  // Se não estiver autenticado, redirecionar para a página de login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    // Rotas que requerem autenticação
    '/proprietarios/:path*',
    '/imoveis/:path*',
    '/inquilinos/:path*',
    '/recibos/:path*',
    '/api/proprietarios/:path*',
    '/api/imoveis/:path*',
    '/api/inquilinos/:path*',
    '/api/recibos/:path*',
    // Excluir rotas públicas
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
