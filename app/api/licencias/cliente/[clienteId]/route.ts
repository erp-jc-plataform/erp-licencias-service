import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { handleError, AppError } from '@/lib/errors'
import { getClienteIdFromToken, isAdmin } from '@/lib/auth'

/**
 * @swagger
 * /api/licencias/cliente/{clienteId}:
 *   get:
 *     summary: Obtener licencias de un cliente
 *     description: Listar todas las licencias de un cliente. Requiere JWT válido.
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de licencias
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puede ver licencias de otro cliente
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

    // Validar acceso
    const clienteIdDelToken = getClienteIdFromToken(request)
    
    if (clienteIdDelToken !== clienteIdSolicitado && !isAdmin(request)) {
      throw new AppError('No autorizado para ver licencias de otro cliente', 403)
    }

    const licencias = await LicenciaService.listarPorCliente(clienteIdSolicitado)
    return NextResponse.json(licencias)
  } catch (error) {
    return handleError(error)
  }
}
