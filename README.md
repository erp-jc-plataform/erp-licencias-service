# Business Licensing

Microservicio de gestion de **licencias y modulos** para Business ERP. Controla que clientes tienen acceso a que modulos del sistema y es consultado por el API Gateway antes de permitir el acceso a cada servicio. Desarrollado con Next.js 14 (App Router), Prisma ORM y PostgreSQL.

---

## Lenguaje y Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Lenguaje | **TypeScript** | 5.x |
| Framework | **Next.js** (App Router) | 14.0.4 |
| Runtime | **Node.js** | >= 18 |
| ORM | **Prisma** | 5.7.0 |
| Validacion | **Zod** | 3.22.4 |
| Documentacion API | **next-swagger-doc + swagger-ui-react** | 0.4.1 / 5.30.3 |
| Base de datos | **PostgreSQL** | >= 13 |
| Puerto | **3001** | - |

---

## Caracteristicas

- **Gestion de clientes** — CRUD completo de clientes del ERP
- **Gestion de modulos** — catalogo de modulos disponibles (CLIENTES, EMPLEADOS, VENTAS, etc.)
- **Gestion de licencias** — asignacion de modulos a clientes con fecha de vencimiento y max. usuarios
- **Validacion de acceso** — endpoint que el Gateway consulta para saber si un cliente tiene activo un modulo
- **Modulos activos por cliente** — lista de modulos vigentes para un cliente
- **Swagger UI** integrado en `/api-docs`
- **Seed** de datos iniciales con `tsx`

---

## Estructura del Proyecto

```
Business-Licensing/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── clientes/
│       │   ├── route.ts              # GET (listar) / POST (crear cliente)
│       │   └── [id]/route.ts         # GET / PUT / DELETE por ID
│       ├── licencias/
│       │   ├── route.ts              # POST (crear licencia)
│       │   ├── [id]/route.ts         # GET / PUT / DELETE por ID
│       │   ├── cliente/route.ts      # GET licencias por cliente
│       │   ├── validate/route.ts     # GET validar acceso modulo
│       │   └── active-modules/route.ts # GET modulos activos del cliente
│       ├── modulos/
│       │   └── route.ts              # GET (listar modulos)
│       ├── swagger/route.ts          # GET spec OpenAPI JSON
│       └── health/route.ts           # GET health check
├── lib/
│   ├── auth.ts                       # Validacion JWT, isAdmin()
│   ├── errors.ts                     # AppError, handleError
│   └── validations.ts                # Schemas Zod
├── services/
│   └── licencia.service.ts           # Logica de negocio con Prisma
├── prisma/
│   ├── schema.prisma                 # Modelos: Cliente, Modulo, Licencia
│   ├── migrations/                   # Migraciones de BD
│   └── seed.ts                       # Datos iniciales
├── middleware.ts                     # Auth middleware Next.js
├── next.config.js
├── package.json
└── .env
```

---

## Instalacion

### Requisitos previos

- Node.js >= 18
- PostgreSQL >= 13
- Base de datos `business_licensing` creada

### Pasos

```powershell
# 1. Entrar al directorio
cd C:\Proyectos\BusinessApp\Business-Licensing

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
copy .env.example .env
```

### Variables de entorno (`.env`)

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/business_licensing"

# Puerto
API_PORT=3001
NODE_ENV=development

# Seguridad — debe coincidir con Business-Gateway y Business-Security
API_SECRET_KEY="your-secret-key-change-in-production"
INTERNAL_SERVICE_TOKEN="shared-secret-between-microservices-change-in-production"

# URLs de otros microservicios
AUTH_SERVICE_URL="http://localhost:8000"
EMPLOYEES_SERVICE_URL="http://localhost:8002"

# CORS
ALLOWED_ORIGINS="http://localhost:4200,http://localhost:3000"
```

### Inicializar base de datos

```powershell
# Generar cliente Prisma
npm run prisma:generate

# Crear tablas con migraciones
npm run prisma:migrate

# Poblar datos iniciales (modulos base)
npm run prisma:seed
```

---

## Levantar el Microservicio

### Desarrollo (hot-reload)

```powershell
cd C:\Proyectos\BusinessApp\Business-Licensing
npm run dev
```

El servidor arranca en `http://localhost:3001`.

### Produccion

```powershell
npm run build
npm start
```

### Verificar que esta corriendo

```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/health
```

---

## URLs Disponibles

| URL | Descripcion |
|-----|-------------|
| `http://localhost:3001/api/health` | Health check |
| `http://localhost:3001/api-docs` | Swagger UI interactivo |
| `http://localhost:3001/api/swagger` | Spec OpenAPI JSON |
| `http://localhost:3001/api/clientes` | Endpoint de clientes |
| `http://localhost:3001/api/licencias` | Endpoint de licencias |
| `http://localhost:3001/api/modulos` | Catalogo de modulos |

---

## Endpoints de la API

### Clientes (`/api/clientes`)

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET | `/api/clientes` | JWT | Listar todos los clientes |
| POST | `/api/clientes` | JWT Admin | Crear nuevo cliente |
| GET | `/api/clientes/{id}` | JWT | Obtener cliente por ID |
| PUT | `/api/clientes/{id}` | JWT Admin | Actualizar cliente |
| DELETE | `/api/clientes/{id}` | JWT Admin | Eliminar cliente |

### Licencias (`/api/licencias`)

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | `/api/licencias` | JWT Admin | Crear nueva licencia |
| GET | `/api/licencias/{id}` | JWT | Obtener licencia por ID |
| PUT | `/api/licencias/{id}` | JWT Admin | Actualizar licencia |
| DELETE | `/api/licencias/{id}` | JWT Admin | Eliminar licencia |
| GET | `/api/licencias/cliente` | JWT | Licencias del cliente autenticado |
| GET | `/api/licencias/validate` | Internal | Validar si cliente tiene modulo activo |
| GET | `/api/licencias/active-modules` | JWT | Modulos activos del cliente |

### Modulos (`/api/modulos`)

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET | `/api/modulos` | JWT | Listar todos los modulos disponibles |

---

## Modelo de Datos

### Tabla `clientes`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `cliente_id` | Int (PK) | Identificador unico autoincremental |
| `razon_social` | varchar(255) | Nombre o razon social del cliente |
| `ruc` | varchar(50) | RUC/NIT unico del cliente |
| `email` | varchar(255) | Correo de contacto |
| `telefono` | varchar(50) | Telefono |
| `estado_id` | Int | Estado (activo/inactivo) |

### Tabla `modulos`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `modulo_id` | Int (PK) | Identificador unico |
| `codigo` | varchar(50) | Codigo unico (CLIENTES, EMPLEADOS, VENTAS...) |
| `nombre` | varchar(255) | Nombre descriptivo |
| `precio_base` | Decimal | Precio mensual base |
| `es_base` | Boolean | Si es un modulo incluido por defecto |

### Tabla `cliente_licencias`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `licencia_id` | Int (PK) | Identificador unico |
| `cliente_id` | Int (FK) | Referencia al cliente |
| `modulo_id` | Int (FK) | Referencia al modulo |
| `fecha_activacion` | DateTime | Cuando se activo la licencia |
| `fecha_vencimiento` | DateTime? | Fecha de expiracion (null = sin vencimiento) |
| `max_usuarios` | Int | Cantidad maxima de usuarios |
| `activa` | Boolean | Si la licencia esta vigente |

Restriccion: `(cliente_id, modulo_id)` es unico — un cliente solo puede tener una licencia por modulo.

---

## Flujo de Validacion (usado por el Gateway)

```
1. Frontend --> Gateway: GET /api/clientes (con JWT)
2. Gateway: decodifica JWT, obtiene clienteId
3. Gateway --> Licensing: GET /api/licencias/validate?clienteId=1&modulo=CLIENTES
4. Licensing: consulta BD, verifica licencia activa y no vencida
5. Licensing --> Gateway: { valid: true/false }
6. Si valid=true: Gateway hace proxy al microservicio correspondiente
7. Si valid=false: Gateway retorna 403 (modulo no licenciado)
```

---

## Scripts npm

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload (puerto 3001) |
| `npm run build` | Compilar para produccion |
| `npm start` | Iniciar servidor compilado |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run prisma:migrate` | Aplicar migraciones |
| `npm run prisma:studio` | Abrir Prisma Studio (UI visual de BD) |
| `npm run prisma:seed` | Poblar datos iniciales |

---

## Prisma Studio

Para explorar la base de datos visualmente:

```powershell
npm run prisma:studio
# Abre http://localhost:5555
```

---

## Licencia

Proyecto interno — Business ERP.
