import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Almacenamiento en memoria para el rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// Configuración del rate limit
const WINDOW_SIZE = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 5; // 5 requests por minuto

export function middleware(request: NextRequest) {
  // Obtener el token de la cookie
  const session = request.cookies.get('session')?.value;

  // Rutas protegidas
  const protectedPaths = ['/calculadora', '/resumen'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !session) {
    // Guardar la URL a la que intentaba acceder
    const returnUrl = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/calculadora/:path*', '/resumen/:path*']
}; 