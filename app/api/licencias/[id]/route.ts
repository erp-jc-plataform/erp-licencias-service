import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { LicenciaUpdateSchema } from '@/lib/validations'
import { handleError, AppError } from '@/lib/errors'
import { isAdmin } from '@/lib/auth'

/**
 * @swagger
 * /api/licencias/{id}:
 *   put:
 *     summary: Actualizar licencia (solo admins)
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LicenciaUpdate'
 *     responses:
 *       200:
 *         description: Licencia actualizada
 *       403:
 *         description: Requiere perfil de administrador
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      throw new AppError('Requiere perfil de administrador', 403)
    }
    
    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
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
 * @swagger
 *   delete:
 *     summary: Eliminar licencia (solo admins)
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Licencia eliminada
 *       403:
 *         description: Requiere perfil de administrador
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      throw new AppError('Requiere perfil de administrador', 403)
    }
    
    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
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
 * @swagger
 *   patch:
 *     summary: Activar/Desactivar licencia (solo admins)
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado de licencia actualizado
 *       403:
 *         description: Requiere perfil de administrador
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      throw new AppError('Requiere perfil de administrador', 403)
    }
    
    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
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
