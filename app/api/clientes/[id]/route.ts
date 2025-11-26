import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ClienteUpdateSchema } from '@/lib/validations'
import { handleError, AppError } from '@/lib/errors'

/**
 * GET /api/clientes/[id]
 * Obtener cliente por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        licencias: {
          include: {
            modulo: true,
          },
        },
      },
    })

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404)
    }

    return NextResponse.json(cliente)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/clientes/[id]
 * Actualizar cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = ClienteUpdateSchema.parse(body)

    const cliente = await prisma.cliente.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(cliente)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/clientes/[id]
 * Eliminar cliente (soft delete cambiando estadoId)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: { estadoId: 2 }, // Estado inactivo
    })

    return NextResponse.json({ message: 'Cliente desactivado', cliente })
  } catch (error) {
    return handleError(error)
  }
}
