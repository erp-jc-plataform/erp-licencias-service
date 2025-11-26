import { NextRequest } from 'next/server'
import { AppError } from './errors'

export interface JWTPayload {
  sub: number // usuario_id
  usuario: string
  perfil_id: number
  cliente_id?: number // Puede venir o no dependiendo del usuario
  exp: number
  iat?: number
}

/**
 * Extraer token JWT del header Authorization
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

/**
 * Decodificar JWT sin verificar firma
 * En producción, el Gateway ya validó el token
 */
export function decodeToken(token: string): JWTPayload {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Token inválido')
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    )
    
    // Verificar expiración
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new AppError('Token expirado', 401)
    }
    
    return payload
  } catch (error) {
    throw new AppError('Token inválido', 401)
  }
}

/**
 * Obtener cliente_id del token JWT
 * Si el usuario no tiene cliente_id, lanza error
 */
export function getClienteIdFromToken(request: NextRequest): number {
  const token = extractToken(request)
  
  if (!token) {
    throw new AppError('No autorizado - Token requerido', 401)
  }
  
  const payload = decodeToken(token)
  
  if (!payload.cliente_id) {
    throw new AppError('Usuario no asociado a un cliente', 403)
  }
  
  return payload.cliente_id
}

/**
 * Obtener payload completo del token
 */
export function getTokenPayload(request: NextRequest): JWTPayload {
  const token = extractToken(request)
  
  if (!token) {
    throw new AppError('No autorizado - Token requerido', 401)
  }
  
  return decodeToken(token)
}

/**
 * Verificar si el usuario es admin (perfil_id = 1)
 */
export function isAdmin(request: NextRequest): boolean {
  try {
    const payload = getTokenPayload(request)
    return payload.perfil_id === 1
  } catch {
    return false
  }
}

/**
 * Validar token de servicio interno (para llamadas entre microservicios)
 */
export function validateInternalServiceToken(request: NextRequest): boolean {
  const internalToken = request.headers.get('x-internal-service')
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN
  
  // Si no hay token configurado, permitir (desarrollo)
  if (!expectedToken) {
    return true
  }
  
  return internalToken === expectedToken
}
