import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Rutas públicas (no requieren autenticación)
  const publicPaths = [
    '/api/health',
    '/api/swagger',
    '/api-docs',
    '/',
  ]
  
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p))
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Rutas internas (solo llamadas entre microservicios)
  const internalPaths = [
    '/api/licencias/validate',
  ]
  
  const isInternalPath = internalPaths.some(p => path.startsWith(p))
  
  if (isInternalPath) {
    // Verificar token de servicio interno
    const internalToken = request.headers.get('x-internal-service')
    const expectedToken = process.env.INTERNAL_SERVICE_TOKEN
    
    // En desarrollo, permitir sin token
    if (process.env.NODE_ENV !== 'production' && !expectedToken) {
      return NextResponse.next()
    }
    
    if (!internalToken || internalToken !== expectedToken) {
      return NextResponse.json(
        { error: 'No autorizado - Endpoint de uso interno' },
        { status: 403 }
      )
    }
    
    return NextResponse.next()
  }
  
  // Rutas protegidas - Validar JWT
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'No autorizado - Token JWT requerido' },
      { status: 401 }
    )
  }
  
  // En desarrollo, solo verificamos que exista el header
  // En producción, el Gateway ya validó el token
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
