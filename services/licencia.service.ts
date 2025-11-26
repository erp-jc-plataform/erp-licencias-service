import prisma from '@/lib/prisma'
import { LicenciaCreate, LicenciaUpdate } from '@/lib/validations'
import { AppError } from '@/lib/errors'

export class LicenciaService {
  /**
   * Validar si un cliente tiene licencia activa para un módulo
   */
  static async validarLicencia(clienteId: number, moduloCodigo: string) {
    const licencia = await prisma.licencia.findFirst({
      where: {
        clienteId,
        activa: true,
        modulo: {
          codigo: moduloCodigo.toUpperCase(),
          estadoId: 1,
        },
        OR: [
          { fechaVencimiento: null },
          { fechaVencimiento: { gte: new Date() } },
        ],
      },
      include: {
        modulo: true,
      },
    })

    return {
      valida: !!licencia,
      licencia: licencia ? {
        moduloCodigo: licencia.modulo.codigo,
        moduloNombre: licencia.modulo.nombre,
        fechaVencimiento: licencia.fechaVencimiento,
        maxUsuarios: licencia.maxUsuarios,
      } : null,
    }
  }

  /**
   * Obtener todos los módulos activos de un cliente
   */
  static async obtenerModulosActivos(clienteId: number) {
    const licencias = await prisma.licencia.findMany({
      where: {
        clienteId,
        activa: true,
        OR: [
          { fechaVencimiento: null },
          { fechaVencimiento: { gte: new Date() } },
        ],
      },
      include: {
        modulo: {
          where: {
            estadoId: 1,
          },
        },
      },
    })

    return licencias.map(lic => ({
      codigo: lic.modulo.codigo,
      nombre: lic.modulo.nombre,
      icono: lic.modulo.icono,
      vencimiento: lic.fechaVencimiento,
    }))
  }

  /**
   * Crear licencia
   */
  static async crear(data: LicenciaCreate) {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId },
    })
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404)
    }

    // Verificar que el módulo existe
    const modulo = await prisma.modulo.findUnique({
      where: { id: data.moduloId },
    })
    if (!modulo) {
      throw new AppError('Módulo no encontrado', 404)
    }

    // Verificar si ya existe
    const existe = await prisma.licencia.findUnique({
      where: {
        clienteId_moduloId: {
          clienteId: data.clienteId,
          moduloId: data.moduloId,
        },
      },
    })

    if (existe) {
      throw new AppError('Ya existe una licencia para este cliente y módulo', 400)
    }

    return await prisma.licencia.create({
      data: {
        ...data,
        fechaActivacion: new Date(data.fechaActivacion),
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
      },
      include: {
        cliente: true,
        modulo: true,
      },
    })
  }

  /**
   * Listar licencias de un cliente
   */
  static async listarPorCliente(clienteId: number) {
    return await prisma.licencia.findMany({
      where: { clienteId },
      include: {
        modulo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Actualizar licencia
   */
  static async actualizar(licenciaId: number, data: LicenciaUpdate) {
    const licencia = await prisma.licencia.findUnique({
      where: { id: licenciaId },
    })

    if (!licencia) {
      throw new AppError('Licencia no encontrada', 404)
    }

    return await prisma.licencia.update({
      where: { id: licenciaId },
      data: {
        ...data,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
      },
      include: {
        cliente: true,
        modulo: true,
      },
    })
  }

  /**
   * Activar/Desactivar licencia
   */
  static async toggleActiva(licenciaId: number) {
    const licencia = await prisma.licencia.findUnique({
      where: { id: licenciaId },
    })

    if (!licencia) {
      throw new AppError('Licencia no encontrada', 404)
    }

    return await prisma.licencia.update({
      where: { id: licenciaId },
      data: { activa: !licencia.activa },
    })
  }

  /**
   * Eliminar licencia
   */
  static async eliminar(licenciaId: number) {
    return await prisma.licencia.delete({
      where: { id: licenciaId },
    })
  }
}
