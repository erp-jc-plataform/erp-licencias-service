export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🔐 Business Licensing - Microservicio</h1>
      <p>Microservicio de gestión de licencias para Business ERP</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>📚 API Endpoints:</h2>
        
        <section style={{ marginBottom: '2rem' }}>
          <h3>Licencias</h3>
          <ul>
            <li><code>GET /api/licencias/validate/:clienteId/:moduloCodigo</code> - Validar licencia</li>
            <li><code>GET /api/licencias/active-modules/:clienteId</code> - Módulos activos</li>
            <li><code>GET /api/licencias/cliente/:clienteId</code> - Licencias de cliente</li>
            <li><code>POST /api/licencias</code> - Crear licencia</li>
            <li><code>PUT /api/licencias/:id</code> - Actualizar licencia</li>
            <li><code>PATCH /api/licencias/:id</code> - Activar/Desactivar</li>
            <li><code>DELETE /api/licencias/:id</code> - Eliminar licencia</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3>Clientes</h3>
          <ul>
            <li><code>GET /api/clientes</code> - Listar clientes</li>
            <li><code>GET /api/clientes/:id</code> - Obtener cliente</li>
            <li><code>POST /api/clientes</code> - Crear cliente</li>
            <li><code>PUT /api/clientes/:id</code> - Actualizar cliente</li>
            <li><code>DELETE /api/clientes/:id</code> - Desactivar cliente</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3>Módulos</h3>
          <ul>
            <li><code>GET /api/modulos</code> - Listar módulos</li>
            <li><code>POST /api/modulos</code> - Crear módulo</li>
          </ul>
        </section>

        <section>
          <h3>Health Check</h3>
          <ul>
            <li><code>GET /api/health</code> - Estado del servicio</li>
          </ul>
        </section>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <p><strong>Puerto:</strong> 3001</p>
        <p><strong>Database:</strong> PostgreSQL (business_licensing)</p>
        <p><strong>ORM:</strong> Prisma</p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>📖 Documentación API</h3>
        <p>
          <a href="/api-docs" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
            Ver Swagger UI →
          </a>
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="/api/swagger" style={{ color: '#1976d2', textDecoration: 'none' }}>
            OpenAPI JSON Spec →
          </a>
        </p>
      </div>
    </main>
  )
}
