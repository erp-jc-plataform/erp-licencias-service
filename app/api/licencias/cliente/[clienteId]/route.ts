import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { LicenciaCreateSchema, LicenciaUpdateSchema } from '@/lib/validations'
import { handleError } from '@/lib/errors'

/**
 * GET /api/licencias/cliente/[clienteId]
 * Obtener todas las licencias de un cliente
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

    const licencias = await LicenciaService.listarPorCliente(clienteId)
    return NextResponse.json(licencias)
  } catch (error) {
    return handleError(error)
  }
}
