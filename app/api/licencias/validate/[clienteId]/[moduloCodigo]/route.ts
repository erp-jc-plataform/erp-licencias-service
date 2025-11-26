import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { handleError } from '@/lib/errors'

/**
 * @swagger
 * /api/licencias/validate/{clienteId}/{moduloCodigo}:
 *   get:
 *     summary: Validar licencia de módulo
 *     description: Verificar si un cliente tiene licencia activa para un módulo específico
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
 *     responses:
 *       200:
 *         description: Licencia válida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacionLicencia'
 *       403:
 *         description: Módulo no activo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Parámetros inválidos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string; moduloCodigo: string } }
) {
  try {
    const clienteId = parseInt(params.clienteId)
    const moduloCodigo = params.moduloCodigo.toUpperCase()

    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    const resultado = await LicenciaService.validarLicencia(clienteId, moduloCodigo)

    if (!resultado.valida) {
      return NextResponse.json(
        { error: 'Módulo no activo para este cliente', valida: false },
        { status: 403 }
      )
    }

    return NextResponse.json(resultado)
  } catch (error) {
    return handleError(error)
  }
}
