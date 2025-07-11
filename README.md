# Feature Flags Test Server

Servidor de prueba para testing de la librería de Feature Flags en NestJS.

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose
- Git

### Ejecutar el proyecto
```bash
# Clonar el repositorio
git clone https://github.com/GCrespo17/feature-flags-test-server.git
cd feature-flags-test-server

# Levantar los servicios
docker-compose up --build
```

El servidor estará disponible en: **http://localhost:3000**

## 📋 Servicios Incluidos

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| API Server | 3000 | http://localhost:3000 | Servidor NestJS principal |
| MongoDB | 27017 | mongodb://localhost:27017 | Base de datos |
| Mongo Express | 8081 | http://localhost:8081 | Interfaz web para MongoDB |

## 🎯 Feature Flags Disponibles

| Flag | Estado Inicial | Descripción |
|------|---------------|-------------|
| `DATA_ACCESS` | ❌ Deshabilitado | Controla acceso al endpoint `/data` |
| `PREMIUM_FEATURES` | ❌ Deshabilitado | Controla acceso al endpoint `/premium` |
| `USER_MANAGEMENT` | ✅ Habilitado | Gestión básica de usuarios |

## 🔧 Endpoints Principales

### Gestión de Users
```bash
GET    /users              # Listar usuarios
POST   /users              # Crear usuario
POST   /auth/login         # Login
```

### Endpoints Protegidos
```bash
GET    /data               # Requiere DATA_ACCESS
GET    /premium            # Requiere PREMIUM_FEATURES
```

### Gestión de Feature Flags
```bash
# Activar/desactivar flags específicos
PUT    /feature-flags/data-access/enable
PUT    /feature-flags/data-access/disable
PUT    /feature-flags/premium/enable
PUT    /feature-flags/premium/disable

# Consultar estados
GET    /feature-flags/all
GET    /feature-flags/status/{flagName}
```

### Testing y Debug
```bash
GET    /debug              # Información de debug
GET    /test/data-access   # Test específico de DATA_ACCESS
```

## 🧪 Pruebas de Feature Flags

### Secuencia de Prueba Básica

1. **Verificar estado inicial**
   ```bash
   GET http://localhost:3000/debug
   ```

2. **Intentar acceso bloqueado**
   ```bash
   GET http://localhost:3000/data
   # Respuesta: 403 Forbidden
   ```

3. **Activar feature flag**
   ```bash
   PUT http://localhost:3000/feature-flags/data-access/enable
   Content-Type: application/json
   {}
   ```

4. **Probar acceso permitido**
   ```bash
   GET http://localhost:3000/data
   # Respuesta: 200 OK con datos
   ```

5. **Desactivar y confirmar bloqueo**
   ```bash
   PUT http://localhost:3000/feature-flags/data-access/disable
   GET http://localhost:3000/data
   # Respuesta: 403 Forbidden
   ```

## 💾 Datos de Prueba

### Crear un usuario
```bash
POST http://localhost:3000/users
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "role": "user"
}
```

### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

## 🛠️ Desarrollo

### Estructura del Proyecto
```
src/
├── controller/          # Controladores de la API
├── service/            # Lógica de negocio
├── repository/         # Acceso a datos
├── schemas/           # Esquemas de MongoDB
├── app.module.ts      # Módulo principal
└── main.ts           # Punto de entrada
```

### Comandos Útiles
```bash
# Ver logs
docker-compose logs nestjs-server

# Reiniciar servicios
docker-compose restart

# Limpiar y reconstruir
docker-compose down -v
docker-compose up --build
```

## 🔍 Troubleshooting

### El servidor no arranca
```bash
# Verificar logs
docker-compose logs

# Limpiar volúmenes
docker-compose down -v
docker-compose up --build
```

### MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
docker-compose logs mongodb

# Debería mostrar: "Waiting for connections on port 27017"
```

### Feature flags no funcionan
```bash
# Verificar configuración
GET http://localhost:3000/feature-flags/all
```

## 📚 Recursos

- **Librería Feature Flags**: [feature-flags-nestjs-lib](https://github.com/GCrespo17/feature-flags-nestjs-lib)
- **NestJS**: https://nestjs.com/
- **MongoDB**: https://www.mongodb.com/

## 📝 Notas

- Este es un **servidor de prueba** para desarrollo y testing
- Los datos se pierden al reiniciar los contenedores
- El servidor usa verificación manual de feature flags (sin decoradores)

---

**¡Servidor listo para probar feature flags!** 🎉