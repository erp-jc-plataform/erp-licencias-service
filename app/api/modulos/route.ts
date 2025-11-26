import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ModuloCreateSchema, ModuloUpdateSchema } from '@/lib/validations'
import { handleError } from '@/lib/errors'

/**
 * @swagger
 * /api/modulos:
 *   get:
 *     summary: Listar módulos
 *     description: Obtener catálogo de módulos disponibles
 *     tags: [Módulos]
 *     responses:
 *       200:
 *         description: Lista de módulos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Modulo'
 */
export async function GET() {
  try {
    const modulos = await prisma.modulo.findMany({
      where: {
        estadoId: 1, // Solo activos
      },
      orderBy: {
        orden: 'asc',
      },
    })

    return NextResponse.json(modulos)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * @swagger
 *   post:
 *     summary: Crear nuevo módulo
 *     description: Agregar un nuevo módulo al catálogo
 *     tags: [Módulos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModuloCreate'
 *     responses:
 *       201:
 *         description: Módulo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modulo'
 *       400:
 *         description: Datos inválidos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ModuloCreateSchema.parse(body)

    const modulo = await prisma.modulo.create({
      data: validatedData,
    })

    return NextResponse.json(modulo, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
