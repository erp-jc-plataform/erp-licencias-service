import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { LicenciaUpdateSchema } from '@/lib/validations'
import { handleError } from '@/lib/errors'

/**
 * PUT /api/licencias/[id]
 * Actualizar licencia
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de licencia inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = LicenciaUpdateSchema.parse(body)

    const licencia = await LicenciaService.actualizar(id, validatedData)
    return NextResponse.json(licencia)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/licencias/[id]
 * Eliminar licencia
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de licencia inválido' },
        { status: 400 }
      )
    }

    await LicenciaService.eliminar(id)
    return NextResponse.json({ message: 'Licencia eliminada' }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PATCH /api/licencias/[id]
 * Activar/Desactivar licencia
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de licencia inválido' },
        { status: 400 }
      )
    }

    const licencia = await LicenciaService.toggleActiva(id)
    return NextResponse.json(licencia)
  } catch (error) {
    return handleError(error)
  }
}
