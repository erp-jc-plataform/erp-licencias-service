import { NextResponse } from 'next/server'
import { getApiDocs } from '@/lib/swagger'

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get OpenAPI specification
 *     tags: [Swagger]
 *     responses:
 *       200:
 *         description: OpenAPI JSON specification
 */
export async function GET() {
  const spec = await getApiDocs()
  return NextResponse.json(spec)
}
