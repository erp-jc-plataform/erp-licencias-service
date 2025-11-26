# 🔐 Guía de Integración con Auth Service

## Flujo de Autenticación Completo

### 1️⃣ Frontend: Obtener JWT del Auth Service

```typescript
// Angular/Ionic - auth.service.ts
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'http://localhost:8000/api/auth';
  
  async login(usuario: string, contrasenia: string) {
    const response = await this.http.post<{access_token: string}>
      (`${this.authUrl}/login`, { usuario, contrasenia }).toPromise();
    
    // Guardar token
    localStorage.setItem('jwt_token', response.access_token);
    
    // Decodificar token para obtener datos del usuario
    const payload = this.decodeToken(response.access_token);
    localStorage.setItem('cliente_id', payload.cliente_id);
    
    return response;
  }
  
  private decodeToken(token: string) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
  
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
  
  getClienteId(): number | null {
    const id = localStorage.getItem('cliente_id');
    return id ? parseInt(id) : null;
  }
}
```

---

### 2️⃣ Frontend: Usar JWT en llamadas a Licensing

```typescript
// Angular - HTTP Interceptor
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    
    if (token) {
      // Agregar header Authorization a todas las peticiones
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}

// licensing.service.ts
@Injectable({ providedIn: 'root' })
export class LicenciaService {
  private apiUrl = 'http://localhost:3001/api';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  async getModulosActivos() {
    const clienteId = this.authService.getClienteId();
    
    // El interceptor agrega automáticamente el token
    return this.http.get<{modulos: any[]}>
      (`${this.apiUrl}/licencias/active-modules/${clienteId}`).toPromise();
  }
  
  async validarModulo(codigo: string): Promise<boolean> {
    const clienteId = this.authService.getClienteId();
    
    try {
      const response = await this.http.get
        (`${this.apiUrl}/licencias/validate/${clienteId}/${codigo}`).toPromise();
      return response?.valida || false;
    } catch {
      return false;
    }
  }
}
```

---

### 3️⃣ API Gateway: Validar licencias antes de rutear

```javascript
// Express.js Gateway
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para verificar JWT con Auth Service
async function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    // Verificar token con Auth Service
    const response = await axios.get('http://localhost:8000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    req.user = response.data; // Guardar datos del usuario
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware para validar licencia de módulo
function requireModule(moduloCodigo) {
  return async (req, res, next) => {
    const clienteId = req.user.empleado?.cliente_id;
    
    if (!clienteId) {
      return res.status(403).json({ error: 'Usuario sin cliente asignado' });
    }
    
    try {
      // Llamar a Licensing Service con token interno
      const response = await axios.get(
        `http://localhost:3001/api/licencias/validate/${clienteId}/${moduloCodigo}`,
        {
          headers: {
            'X-Internal-Service': process.env.INTERNAL_SERVICE_TOKEN
          }
        }
      );
      
      if (!response.data.valida) {
        return res.status(403).json({ 
          error: `Módulo ${moduloCodigo} no activo` 
        });
      }
      
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Sin acceso al módulo' });
    }
  };
}

// Rutas protegidas por módulo
router.use('/clientes', 
  verifyJWT,
  requireModule('CLIENTES'),
  proxy('http://localhost:8002') // Microservicio de Clientes
);

router.use('/ventas',
  verifyJWT,
  requireModule('VENTAS'),
  proxy('http://localhost:8003') // Microservicio de Ventas
);

router.use('/inventario',
  verifyJWT,
  requireModule('INVENTARIO'),
  proxy('http://localhost:8004') // Microservicio de Inventario
);
```

---

### 4️⃣ Estructura del JWT (emitido por Auth Service)

```json
{
  "sub": 1,
  "usuario": "admin",
  "perfil_id": 1,
  "cliente_id": 1,
  "exp": 1732678800,
  "iat": 1732675200
}
```

**Campos importantes:**
- `sub`: usuario_id
- `perfil_id`: 1 = Admin, 2 = Usuario, etc.
- `cliente_id`: ID del cliente al que pertenece el usuario
- `exp`: Timestamp de expiración

---

### 5️⃣ Testing con cURL

```bash
# 1. Login en Auth Service
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "contrasenia": "password123"}'

# Respuesta:
# {"access_token": "eyJhbGci...", "token_type": "bearer"}

# 2. Usar token en Licensing Service
TOKEN="eyJhbGci..."

curl http://localhost:3001/api/licencias/active-modules/1 \
  -H "Authorization: Bearer $TOKEN"

# 3. Gateway valida licencia internamente
curl http://localhost:3001/api/licencias/validate/1/CLIENTES \
  -H "X-Internal-Service: dev-internal-token-123"
```

---

### 6️⃣ Variables de entorno requeridas

**Business-Security (.env):**
```env
SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**Business-Licensing (.env):**
```env
INTERNAL_SERVICE_TOKEN=dev-internal-token-123
AUTH_SERVICE_URL=http://localhost:8000
```

**API Gateway (.env):**
```env
INTERNAL_SERVICE_TOKEN=dev-internal-token-123
AUTH_SERVICE_URL=http://localhost:8000
LICENSING_SERVICE_URL=http://localhost:3001
```

---

### 7️⃣ Diagrama de flujo

```
┌──────────┐
│ Frontend │
└────┬─────┘
     │ 1. POST /auth/login
     ▼
┌─────────────────┐
│ Auth Service    │
│ (port 8000)     │
└────┬────────────┘
     │ 2. JWT Token
     ▼
┌──────────┐
│ Frontend │
└────┬─────┘
     │ 3. GET /licencias/active-modules/1
     │    Authorization: Bearer <JWT>
     ▼
┌─────────────────┐
│ API Gateway     │◄────────────────┐
└────┬────────────┘                 │
     │ 4a. Verify JWT               │
     ├──────────────────────────────┘
     │
     │ 4b. Validate license
     │    X-Internal-Service: <token>
     ▼
┌─────────────────────┐
│ Licensing Service   │
│ (port 3001)         │
└─────────────────────┘
```

---

### 8️⃣ Roles y permisos

| Perfil | perfil_id | Permisos en Licensing |
|--------|-----------|----------------------|
| Admin | 1 | Crear/editar/eliminar licencias, ver todas las licencias |
| Usuario | 2+ | Solo ver licencias de su cliente |

```typescript
// Verificar en código
if (isAdmin(request)) {
  // Puede hacer operaciones administrativas
} else {
  // Solo puede ver datos de su propio cliente
  const clienteId = getClienteIdFromToken(request);
}
```

---

## ✅ Checklist de implementación

- [x] Auth Service emite JWT con `cliente_id`
- [x] Licensing valida JWT en middleware
- [x] Licensing extrae `cliente_id` del token
- [x] Usuarios solo ven datos de su cliente
- [x] Admins pueden ver todos los datos
- [x] Gateway usa token interno para validaciones
- [x] Endpoints públicos excluidos del middleware
- [x] Swagger documenta autenticación
