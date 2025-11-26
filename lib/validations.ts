import { z } from 'zod'

// ============================================
// VALIDACIONES: CLIENTE
// ============================================
export const ClienteCreateSchema = z.object({
  razonSocial: z.string().min(3, 'Razón social muy corta').max(255),
  ruc: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  estadoId: z.number().int().default(1),
})

export const ClienteUpdateSchema = ClienteCreateSchema.partial()

// ============================================
// VALIDACIONES: MÓDULO
// ============================================
export const ModuloCreateSchema = z.object({
  codigo: z.string().min(2).max(50).transform(val => val.toUpperCase()),
  nombre: z.string().min(3).max(255),
  descripcion: z.string().optional(),
  precioBase: z.number().optional(),
  esBase: z.boolean().default(false),
  icono: z.string().optional(),
  orden: z.number().int().default(0),
  estadoId: z.number().int().default(1),
})

export const ModuloUpdateSchema = ModuloCreateSchema.partial()

// ============================================
// VALIDACIONES: LICENCIA
// ============================================
export const LicenciaCreateSchema = z.object({
  clienteId: z.number().int().positive(),
  moduloId: z.number().int().positive(),
  fechaActivacion: z.string().datetime().or(z.date()),
  fechaVencimiento: z.string().datetime().or(z.date()).optional().nullable(),
  maxUsuarios: z.number().int().positive().default(1),
  activa: z.boolean().default(true),
  observaciones: z.string().optional(),
})

export const LicenciaUpdateSchema = z.object({
  fechaVencimiento: z.string().datetime().or(z.date()).optional().nullable(),
  maxUsuarios: z.number().int().positive().optional(),
  activa: z.boolean().optional(),
  observaciones: z.string().optional(),
})

// ============================================
// TIPOS EXPORTADOS
// ============================================
export type ClienteCreate = z.infer<typeof ClienteCreateSchema>
export type ClienteUpdate = z.infer<typeof ClienteUpdateSchema>
export type ModuloCreate = z.infer<typeof ModuloCreateSchema>
export type ModuloUpdate = z.infer<typeof ModuloUpdateSchema>
export type LicenciaCreate = z.infer<typeof LicenciaCreateSchema>
export type LicenciaUpdate = z.infer<typeof LicenciaUpdateSchema>
