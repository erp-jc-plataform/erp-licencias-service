import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Business Licensing API',
        version: '1.0.0',
        description: 'Microservicio de gestión de licencias y módulos para Business ERP',
        contact: {
          name: 'Business ERP',
          email: 'soporte@businesserp.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Servidor de desarrollo',
        },
        {
          url: 'https://api.businesserp.com/licensing',
          description: 'Servidor de producción',
        },
      ],
      tags: [
        {
          name: 'Health',
          description: 'Endpoints de salud del servicio',
        },
        {
          name: 'Licencias',
          description: 'Gestión de licencias de módulos',
        },
        {
          name: 'Clientes',
          description: 'Gestión de clientes',
        },
        {
          name: 'Módulos',
          description: 'Catálogo de módulos disponibles',
        },
      ],
      components: {
        schemas: {
          Cliente: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              razonSocial: { type: 'string', example: 'Empresa Demo S.A.' },
              ruc: { type: 'string', example: '80000000-0' },
              email: { type: 'string', format: 'email', example: 'demo@empresa.com' },
              telefono: { type: 'string', example: '021-123456' },
              direccion: { type: 'string', example: 'Asunción, Paraguay' },
              estadoId: { type: 'integer', example: 1 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          ClienteCreate: {
            type: 'object',
            required: ['razonSocial'],
            properties: {
              razonSocial: { type: 'string', example: 'Nueva Empresa S.A.' },
              ruc: { type: 'string', example: '80000001-0' },
              email: { type: 'string', format: 'email', example: 'contacto@empresa.com' },
              telefono: { type: 'string', example: '021-654321' },
              direccion: { type: 'string', example: 'Asunción, Paraguay' },
              estadoId: { type: 'integer', default: 1 },
            },
          },
          Modulo: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              codigo: { type: 'string', example: 'AUTH' },
              nombre: { type: 'string', example: 'Autenticación y Seguridad' },
              descripcion: { type: 'string', example: 'Módulo base de autenticación' },
              precioBase: { type: 'number', format: 'decimal', example: 0 },
              esBase: { type: 'boolean', example: true },
              icono: { type: 'string', example: 'shield' },
              orden: { type: 'integer', example: 1 },
              estadoId: { type: 'integer', example: 1 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          ModuloCreate: {
            type: 'object',
            required: ['codigo', 'nombre'],
            properties: {
              codigo: { type: 'string', example: 'VENTAS' },
              nombre: { type: 'string', example: 'Ventas y Facturación' },
              descripcion: { type: 'string', example: 'Gestión de ventas' },
              precioBase: { type: 'number', example: 1200 },
              esBase: { type: 'boolean', default: false },
              icono: { type: 'string', example: 'shopping-cart' },
              orden: { type: 'integer', default: 0 },
              estadoId: { type: 'integer', default: 1 },
            },
          },
          Licencia: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              clienteId: { type: 'integer', example: 1 },
              moduloId: { type: 'integer', example: 1 },
              fechaActivacion: { type: 'string', format: 'date-time' },
              fechaVencimiento: { type: 'string', format: 'date-time', nullable: true },
              maxUsuarios: { type: 'integer', example: 10 },
              activa: { type: 'boolean', example: true },
              observaciones: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          LicenciaCreate: {
            type: 'object',
            required: ['clienteId', 'moduloId', 'fechaActivacion'],
            properties: {
              clienteId: { type: 'integer', example: 1 },
              moduloId: { type: 'integer', example: 1 },
              fechaActivacion: { type: 'string', format: 'date-time' },
              fechaVencimiento: { type: 'string', format: 'date-time', nullable: true },
              maxUsuarios: { type: 'integer', default: 1 },
              activa: { type: 'boolean', default: true },
              observaciones: { type: 'string' },
            },
          },
          LicenciaUpdate: {
            type: 'object',
            properties: {
              fechaVencimiento: { type: 'string', format: 'date-time', nullable: true },
              maxUsuarios: { type: 'integer' },
              activa: { type: 'boolean' },
              observaciones: { type: 'string' },
            },
          },
          ValidacionLicencia: {
            type: 'object',
            properties: {
              valida: { type: 'boolean', example: true },
              licencia: {
                type: 'object',
                nullable: true,
                properties: {
                  moduloCodigo: { type: 'string', example: 'AUTH' },
                  moduloNombre: { type: 'string', example: 'Autenticación y Seguridad' },
                  fechaVencimiento: { type: 'string', format: 'date-time', nullable: true },
                  maxUsuarios: { type: 'integer', example: 10 },
                },
              },
            },
          },
          ModuloActivo: {
            type: 'object',
            properties: {
              codigo: { type: 'string', example: 'AUTH' },
              nombre: { type: 'string', example: 'Autenticación y Seguridad' },
              icono: { type: 'string', example: 'shield' },
              vencimiento: { type: 'string', format: 'date-time', nullable: true },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Descripción del error' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
          HealthCheck: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              service: { type: 'string', example: 'business-licensing' },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'string', example: '1.0.0' },
            },
          },
        },
      },
    },
  })

  return spec
}
