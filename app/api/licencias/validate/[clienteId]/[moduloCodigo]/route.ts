import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { handleError, AppError } from '@/lib/errors'
import { validateInternalServiceToken } from '@/lib/auth'

/**
 * @swagger
 * /api/licencias/validate/{clienteId}/{moduloCodigo}:
 *   get:
 *     summary: Validar licencia de módulo (uso interno)
 *     description: Endpoint llamado por el API Gateway para validar acceso a módulos. Requiere token de servicio interno.
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *       - in: path
 *         name: moduloCodigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del módulo (ej. AUTH, CLIENTES, VENTAS)
 *       - in: header
 *         name: X-Internal-Service
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de servicio interno
 *     responses:
 *       200:
 *         description: Licencia válida
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ValidacionLicencia'
 *                 - type: object
 *                   properties:
 *                     clienteId:
 *                       type: integer
 *                     moduloCodigo:
 *                       type: string
 *       403:
 *         description: Módulo no activo o no autorizado
 *       400:
 *         description: Parámetros inválidos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string; moduloCodigo: string } }
) {
  try {
    // Validar que la llamada viene de un servicio interno (Gateway)
    if (!validateInternalServiceToken(request)) {
      throw new AppError('No autorizado - Endpoint de uso interno', 403)
    }
    
    const clienteId = Number.parseInt(params.clienteId)
    const moduloCodigo = params.moduloCodigo.toUpperCase()

    if (Number.isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    const resultado = await LicenciaService.validarLicencia(clienteId, moduloCodigo)

    if (!resultado.valida) {
      return NextResponse.json(
        { 
          error: 'Módulo no activo para este cliente',
          valida: false,
          clienteId,
          moduloCodigo
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      valida: true,
      clienteId,
      moduloCodigo,
      ...resultado.licencia
    })
  } catch (error) {
    return handleError(error)
  }
}
