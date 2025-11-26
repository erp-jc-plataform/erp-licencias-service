import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ClienteCreateSchema, ClienteUpdateSchema } from '@/lib/validations'
import { handleError } from '@/lib/errors'

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar clientes
 *     description: Obtener todos los clientes con sus licencias
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        licencias: {
          include: {
            modulo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * @swagger
 *   post:
 *     summary: Crear nuevo cliente
 *     description: Registrar un nuevo cliente en el sistema
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteCreate'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ClienteCreateSchema.parse(body)

    const cliente = await prisma.cliente.create({
      data: validatedData,
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
