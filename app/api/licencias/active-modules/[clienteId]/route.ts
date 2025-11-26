import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { handleError, AppError } from '@/lib/errors'
import { getClienteIdFromToken, isAdmin } from '@/lib/auth'

/**
 * @swagger
 * /api/licencias/active-modules/{clienteId}:
 *   get:
 *     summary: Obtener módulos activos
 *     description: Listar todos los módulos con licencia activa de un cliente. Requiere JWT válido.
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de módulos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clienteId:
 *                   type: integer
 *                 modulos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ModuloActivo'
 *                 total:
 *                   type: integer
 *       401:
 *         description: No autorizado - Token requerido
 *       403:
 *         description: No puede ver módulos de otro cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const clienteIdSolicitado = Number.parseInt(params.clienteId)

    if (Number.isNaN(clienteIdSolicitado)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    // Obtener cliente_id del token JWT
    const clienteIdDelToken = getClienteIdFromToken(request)
    
    // Validar que solo pueda ver sus propios módulos (a menos que sea admin)
    if (clienteIdDelToken !== clienteIdSolicitado && !isAdmin(request)) {
      throw new AppError('No autorizado para ver módulos de otro cliente', 403)
    }

    const modulos = await LicenciaService.obtenerModulosActivos(clienteIdSolicitado)

    return NextResponse.json({
      clienteId: clienteIdSolicitado,
      modulos,
      total: modulos.length,
    })
  } catch (error) {
    return handleError(error)
  }
}
