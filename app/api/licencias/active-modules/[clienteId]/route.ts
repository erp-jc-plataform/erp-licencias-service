import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { handleError } from '@/lib/errors'

/**
 * @swagger
 * /api/licencias/active-modules/{clienteId}:
 *   get:
 *     summary: Obtener módulos activos
 *     description: Listar todos los módulos con licencia activa de un cliente
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
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const clienteId = parseInt(params.clienteId)

    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    const modulos = await LicenciaService.obtenerModulosActivos(clienteId)

    return NextResponse.json({
      clienteId,
      modulos,
      total: modulos.length,
    })
  } catch (error) {
    return handleError(error)
  }
}
