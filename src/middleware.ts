import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // POC: Autenticación deshabilitada - permitir acceso a todas las rutas
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