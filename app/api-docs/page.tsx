'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocPage() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/api/swagger')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error('Error loading API spec:', err))
  }, [])

  if (!spec) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando documentación...</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <SwaggerUI spec={spec} />
    </div>
  )
}
