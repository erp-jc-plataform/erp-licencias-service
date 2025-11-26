import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Licensing API',
  description: 'Microservicio de gestión de licencias',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
