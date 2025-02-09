import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Obtener el token de Firebase de las cookies
  const idToken = request.cookies.get('firebase-token')?.value;

  // Rutas protegidas
  const protectedPaths = ['/calculadora', '/resumen'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !idToken) {
    // Guardar la URL a la que intentaba acceder
    const returnUrl = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Solo proteger estas rutas específicas
    '/calculadora',
    '/calculadora/:path*',
    '/resumen',
    '/resumen/:path*'
  ]
};