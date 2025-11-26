import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { LicenciaCreateSchema } from '@/lib/validations'
import { handleError, AppError } from '@/lib/errors'
import { isAdmin } from '@/lib/auth'

/**
 * @swagger
 * /api/licencias:
 *   post:
 *     summary: Crear nueva licencia (solo admins)
 *     description: Asignar un módulo a un cliente con una licencia. Requiere perfil de administrador.
 *     security:
 *       - BearerAuth: []
 *     tags: [Licencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LicenciaCreate'
 *     responses:
 *       201:
 *         description: Licencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Licencia'
 *       400:
 *         description: Datos inválidos o licencia duplicada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de administrador
 *       404:
 *         description: Cliente o módulo no encontrado
 */
export async function POST(request: NextRequest) {
  try {
    // Solo administradores pueden crear licencias
    if (!isAdmin(request)) {
      throw new AppError('Requiere perfil de administrador', 403)
    }
    
    const body = await request.json()
    const validatedData = LicenciaCreateSchema.parse(body)

    const licencia = await LicenciaService.crear(validatedData)
    return NextResponse.json(licencia, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
