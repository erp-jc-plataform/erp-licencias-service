import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check del servicio
 *     description: Verificar estado del microservicio
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'business-licensing',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
}
