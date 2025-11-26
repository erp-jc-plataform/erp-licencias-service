/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para modo standalone (útil para microservicios)
  output: 'standalone',
  
  // Puerto personalizado definido en scripts
  // Ejecutar con: npm run dev (puerto 3001)
}

module.exports = nextConfig
