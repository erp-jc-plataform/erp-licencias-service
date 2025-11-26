import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Crear módulos base
  const modulos = await Promise.all([
    prisma.modulo.upsert({
      where: { codigo: 'AUTH' },
      update: {},
      create: {
        codigo: 'AUTH',
        nombre: 'Autenticación y Seguridad',
        descripcion: 'Módulo base de autenticación y gestión de usuarios',
        precioBase: 0,
        esBase: true,
        icono: 'shield',
        orden: 1,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'EMPLEADOS' },
      update: {},
      create: {
        codigo: 'EMPLEADOS',
        nombre: 'Gestión de Empleados',
        descripcion: 'RRHH y gestión de personal',
        precioBase: 500,
        esBase: false,
        icono: 'users',
        orden: 2,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'DASHBOARD' },
      update: {},
      create: {
        codigo: 'DASHBOARD',
        nombre: 'Dashboard',
        descripcion: 'Panel de control y reportes básicos',
        precioBase: 0,
        esBase: true,
        icono: 'dashboard',
        orden: 3,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'CLIENTES' },
      update: {},
      create: {
        codigo: 'CLIENTES',
        nombre: 'Gestión de Clientes',
        descripcion: 'CRM y gestión comercial',
        precioBase: 800,
        esBase: false,
        icono: 'briefcase',
        orden: 4,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'VENTAS' },
      update: {},
      create: {
        codigo: 'VENTAS',
        nombre: 'Ventas y Facturación',
        descripcion: 'Gestión de ventas y facturación electrónica',
        precioBase: 1200,
        esBase: false,
        icono: 'shopping-cart',
        orden: 5,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'INVENTARIO' },
      update: {},
      create: {
        codigo: 'INVENTARIO',
        nombre: 'Inventario y Almacén',
        descripcion: 'Control de stock y movimientos de inventario',
        precioBase: 900,
        esBase: false,
        icono: 'package',
        orden: 6,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'COMPRAS' },
      update: {},
      create: {
        codigo: 'COMPRAS',
        nombre: 'Compras y Proveedores',
        descripcion: 'Gestión de compras y proveedores',
        precioBase: 700,
        esBase: false,
        icono: 'truck',
        orden: 7,
        estadoId: 1,
      },
    }),
    prisma.modulo.upsert({
      where: { codigo: 'CONTABILIDAD' },
      update: {},
      create: {
        codigo: 'CONTABILIDAD',
        nombre: 'Contabilidad',
        descripcion: 'Contabilidad y finanzas',
        precioBase: 1500,
        esBase: false,
        icono: 'calculator',
        orden: 8,
        estadoId: 1,
      },
    }),
  ])

  console.log(`✅ Creados ${modulos.length} módulos`)

  // Crear cliente demo
  const clienteDemo = await prisma.cliente.upsert({
    where: { ruc: '80000000-0' },
    update: {},
    create: {
      razonSocial: 'Empresa Demo S.A.',
      ruc: '80000000-0',
      email: 'demo@empresa.com',
      telefono: '021-123456',
      direccion: 'Asunción, Paraguay',
      estadoId: 1,
    },
  })

  console.log(`✅ Cliente demo creado: ${clienteDemo.razonSocial}`)

  // Crear licencias para cliente demo (módulos base)
  const licenciasCreadas = await Promise.all([
    prisma.licencia.upsert({
      where: {
        clienteId_moduloId: {
          clienteId: clienteDemo.id,
          moduloId: modulos[0].id, // AUTH
        },
      },
      update: {},
      create: {
        clienteId: clienteDemo.id,
        moduloId: modulos[0].id,
        fechaActivacion: new Date(),
        fechaVencimiento: null, // Perpetua
        maxUsuarios: 10,
        activa: true,
      },
    }),
    prisma.licencia.upsert({
      where: {
        clienteId_moduloId: {
          clienteId: clienteDemo.id,
          moduloId: modulos[2].id, // DASHBOARD
        },
      },
      update: {},
      create: {
        clienteId: clienteDemo.id,
        moduloId: modulos[2].id,
        fechaActivacion: new Date(),
        fechaVencimiento: null, // Perpetua
        maxUsuarios: 10,
        activa: true,
      },
    }),
    prisma.licencia.upsert({
      where: {
        clienteId_moduloId: {
          clienteId: clienteDemo.id,
          moduloId: modulos[1].id, // EMPLEADOS
        },
      },
      update: {},
      create: {
        clienteId: clienteDemo.id,
        moduloId: modulos[1].id,
        fechaActivacion: new Date(),
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        maxUsuarios: 5,
        activa: true,
      },
    }),
  ])

  console.log(`✅ Creadas ${licenciasCreadas.length} licencias para cliente demo`)
  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
