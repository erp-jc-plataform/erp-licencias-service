import { NextRequest, NextResponse } from 'next/server'
import { LicenciaService } from '@/services/licencia.service'
import { LicenciaCreateSchema } from '@/lib/validations'
import { handleError } from '@/lib/errors'

/**
 * @swagger
 * /api/licencias:
 *   post:
 *     summary: Crear nueva licencia
 *     description: Asignar un módulo a un cliente con una licencia
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
 *       404:
 *         description: Cliente o módulo no encontrado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = LicenciaCreateSchema.parse(body)

    const licencia = await LicenciaService.crear(validatedData)
    return NextResponse.json(licencia, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
