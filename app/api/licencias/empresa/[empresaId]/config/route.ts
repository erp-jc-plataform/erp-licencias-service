import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleError, AppError } from '@/lib/errors'
import { extractToken, decodeToken } from '@/lib/auth'

/**
 * Mapa de códigos de módulo en BD ↔ claves de módulo en la app Flutter.
 * Mantener sincronizado con los moduleKey de cada AppModule en el cliente.
 */
const MODULE_CODE_TO_KEY: Record<string, string> = {
  DASHBOARD: 'dashboard',
  CRM: 'crm',
  REPORTES: 'reportes',
  MENSAJERIA: 'mensajeria',
  NOTIFICACIONES: 'notificaciones',
  REPORTES_BI: 'reportes',
  CHAT: 'mensajeria',
}

/** Determina el nombre del plan en base a los módulos activos */
function calcularPlan(modulos: string[]): string {
  if (
    modulos.includes('mensajeria') &&
    modulos.includes('notificaciones') &&
    modulos.includes('reportes')
  )
    return 'PREMIUM'
  if (modulos.includes('reportes')) return 'STANDARD'
  return 'BASIC'
}

/**
 * @swagger
 * /api/licencias/empresa/{empresaId}/config:
 *   get:
 *     summary: Obtener configuración de tenant para la app móvil
 *     description: Devuelve módulos activos, plan y configuración visual del cliente.
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente / empresa
 *     responses:
 *       200:
 *         description: Configuración del tenant
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { empresaId: string } },
) {
  try {
    const token = extractToken(request)
    if (!token) throw new AppError('Token requerido', 401)

    const payload = decodeToken(token)
    const empresaIdNum = parseInt(params.empresaId, 10)

    if (isNaN(empresaIdNum)) {
      throw new AppError('empresaId inválido', 400)
    }

    // Solo el propio cliente o un admin puede ver su config
    if (payload.cliente_id && payload.cliente_id !== empresaIdNum) {
      throw new AppError('Acceso no autorizado a este tenant', 403)
    }

    // Buscar cliente con sus licencias activas
    const cliente = await prisma.cliente.findUnique({
      where: { id: empresaIdNum },
      include: {
        licencias: {
          where: {
            activa: true,
            OR: [
              { fechaVencimiento: null },
              { fechaVencimiento: { gte: new Date() } },
            ],
          },
          include: { modulo: true },
        },
      },
    })

    if (!cliente) throw new AppError('Cliente no encontrado', 404)

    // Mapear módulos de BD a claves Flutter (deduplicar)
    const modulosFlutter = [
      ...new Set(
        cliente.licencias
          .map((l) => MODULE_CODE_TO_KEY[l.modulo.codigo.toUpperCase()])
          .filter(Boolean),
      ),
    ]

    // Siempre incluir dashboard
    if (!modulosFlutter.includes('dashboard')) {
      modulosFlutter.unshift('dashboard')
    }

    const plan = calcularPlan(modulosFlutter)

    return NextResponse.json({
      empresaId: String(cliente.id),
      empresaNombre: cliente.razonSocial,
      logoUrl: cliente.logoUrl ?? null,
      plan,
      modulos: modulosFlutter,
      tema: {
        primaryColor: cliente.primaryColor,
        secondaryColor: cliente.secondaryColor,
        appBarColor: cliente.appBarColor,
        appName: cliente.appName ?? cliente.razonSocial,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
