# Business Licensing - Microservicio

Microservicio de gestión de licencias y módulos para Business ERP.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Validaciones**: Zod
- **Puerto**: 3001

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL

# Generar cliente Prisma
npm run prisma:generate

# Crear base de datos y ejecutar migraciones
npm run prisma:migrate

# Seed de datos iniciales
npm run prisma:seed
```

## 🏃 Ejecutar

```bash
# Modo desarrollo (puerto 3001)
npm run dev

# Modo producción
npm run build
npm start

# Ver base de datos con Prisma Studio
npm run prisma:studio
```

## 📚 API Endpoints

### Licencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/licencias/validate/:clienteId/:moduloCodigo` | Validar si cliente tiene licencia activa |
| GET | `/api/licencias/active-modules/:clienteId` | Obtener módulos activos |
| GET | `/api/licencias/cliente/:clienteId` | Listar licencias de un cliente |
| POST | `/api/licencias` | Crear nueva licencia |
| PUT | `/api/licencias/:id` | Actualizar licencia |
| PATCH | `/api/licencias/:id` | Activar/Desactivar licencia |
| DELETE | `/api/licencias/:id` | Eliminar licencia |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Listar todos los clientes |
| GET | `/api/clientes/:id` | Obtener cliente por ID |
| POST | `/api/clientes` | Crear nuevo cliente |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Desactivar cliente |

### Módulos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/modulos` | Listar módulos activos |
| POST | `/api/modulos` | Crear nuevo módulo |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servicio |

## 🗄️ Modelos de Base de Datos

### Cliente
- `razonSocial`: Nombre/razón social
- `ruc`: RUC único
- `email`, `telefono`, `direccion`: Datos de contacto
- `estadoId`: Estado (1=Activo, 2=Inactivo)

### Modulo
- `codigo`: Código único (AUTH, EMPLEADOS, CLIENTES, etc.)
- `nombre`: Nombre descriptivo
- `precioBase`: Precio base del módulo
- `esBase`: Si es módulo obligatorio (incluido siempre)
- `icono`: Icono para UI

### Licencia
- `clienteId`: Cliente propietario
- `moduloId`: Módulo licenciado
- `fechaActivacion`: Fecha de inicio
- `fechaVencimiento`: Fecha fin (NULL = perpetua)
- `maxUsuarios`: Usuarios concurrentes permitidos
- `activa`: Estado de la licencia

## 🔐 Autenticación

Este microservicio **NO tiene login propio**. Utiliza JWT del microservicio Business-Security.

### Flujo de autenticación:

1. **Cliente hace login en Auth Service:**
```bash
POST http://localhost:8000/api/auth/login
{
  "usuario": "admin",
  "contrasenia": "password123"
}
```

2. **Auth Service responde con JWT:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

3. **Cliente usa token para acceder a Licensing:**
```bash
GET http://localhost:3001/api/licencias/active-modules/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints protegidos:
- Todos los endpoints requieren header `Authorization: Bearer <token>`
- Endpoint `/api/licencias/validate` requiere header adicional `X-Internal-Service` (uso del Gateway)
- Endpoints de administración requieren `perfil_id: 1` en el JWT

### Endpoints públicos (no requieren auth):
- `GET /api/health`
- `GET /api/swagger`
- `GET /api-docs`

## 🔐 Módulos Disponibles

### Módulos Base (Incluidos)
- **AUTH**: Autenticación y Seguridad
- **DASHBOARD**: Panel de control

### Módulos Opcionales
- **EMPLEADOS**: Gestión de empleados ($500)
- **CLIENTES**: CRM y gestión comercial ($800)
- **VENTAS**: Ventas y facturación ($1200)
- **INVENTARIO**: Control de stock ($900)
- **COMPRAS**: Gestión de compras ($700)
- **CONTABILIDAD**: Contabilidad y finanzas ($1500)

## 🔄 Integración con Otros Microservicios

### Validar licencia desde API Gateway

```typescript
// Llamada desde otro microservicio o gateway
const response = await fetch(
  `http://localhost:3001/api/licencias/validate/${clienteId}/CLIENTES`
)
const { valida } = await response.json()
```

### Obtener módulos activos para frontend

```typescript
const response = await fetch(
  `http://localhost:3001/api/licencias/active-modules/${clienteId}`
)
const { modulos } = await response.json()
// modulos: [{ codigo: "AUTH", nombre: "Autenticación", ... }]
```

## 🧪 Testing

```bash
# Probar health check
curl http://localhost:3001/api/health

# Validar licencia
curl http://localhost:3001/api/licencias/validate/1/AUTH

# Obtener módulos activos
curl http://localhost:3001/api/licencias/active-modules/1

# Listar módulos disponibles
curl http://localhost:3001/api/modulos
```

## 📝 Comandos Prisma Útiles

```bash
# Ver base de datos
npm run prisma:studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Reset de base de datos
npx prisma migrate reset

# Generar cliente después de cambios en schema
npm run prisma:generate
```

## 🏗️ Arquitectura de Microservicios

```
Business-Security (Auth)  ←→  Business-Licensing (Este)
         ↓                              ↓
    Usuarios/Auth              Clientes/Módulos/Licencias
         ↓                              ↓
    Puerto 8000                    Puerto 3001
    FastAPI/Python                Next.js/TypeScript
```

## 📄 Licencia

Proyecto privado - Business ERP
