# Lab: Node.js + Express con Dockerfile Multi-Stage

## Objetivo

Aprender a construir imágenes optimizadas usando multi-stage builds para una aplicación Node.js + Express, reduciendo el tamaño final de la imagen y mejorando la seguridad.

---

## Descripción de la Aplicación

API REST simple con Express que expone:
- `GET /` - Mensaje de bienvenida con timestamp
- `GET /health` - Estado de salud de la aplicación
- `GET /api/users` - Lista de usuarios (dummy data)
- `GET /api/users/:id` - Usuario específico por ID

---

## Parte 1: Construcción de la Imagen

### Comandos a Ejecutar

```bash
# Navegar al directorio del lab
cd bloque-docker/clase2-dockerfiles/labs/02-nodejs-express-multistage

# Construir la imagen con multi-stage
docker build -t nodejs-api:1.0 .

# Ver la imagen creada
docker images nodejs-api
```

### Salida Esperada

```
[+] Building 45.2s (15/15) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 1.23kB
 => [internal] load .dockerignore
 => [build 1/5] FROM docker.io/library/node:18-alpine
 => [build 2/5] WORKDIR /app
 => [build 3/5] COPY package*.json ./
 => [build 4/5] RUN npm install
 => [build 5/5] COPY . .
 => [stage-1 1/6] FROM docker.io/library/node:18-alpine
 => [stage-1 2/6] RUN addgroup -g 1001 -S nodejs ...
 => [stage-1 3/6] WORKDIR /app
 => [stage-1 4/6] COPY package*.json ./
 => [stage-1 5/6] RUN npm ci --only=production
 => [stage-1 6/6] COPY --from=build /app/app.js ./
 => exporting to image
 => => writing image sha256:abc123...
 => => naming to docker.io/library/nodejs-api:1.0
```

```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
nodejs-api    1.0       abc123def456   2 minutes ago   125MB
```

---

## Desglose del Dockerfile

### Stage 1: Build

| Línea | Propósito |
|-------|-----------|
| `FROM node:18-alpine AS build` | Imagen base ligera de Node.js 18, etapa nombrada "build" |
| `WORKDIR /app` | Directorio de trabajo dentro del container |
| `COPY package*.json ./` | Copiar archivos de dependencias primero (aprovecha cache) |
| `RUN npm install` | Instalar TODAS las dependencias (prod + dev) |
| `COPY . .` | Copiar el código de la aplicación |

### Stage 2: Production

| Línea | Propósito |
|-------|-----------|
| `FROM node:18-alpine` | Nueva imagen base (descarta stage anterior) |
| `RUN addgroup ... adduser ...` | Crear usuario no-root para seguridad |
| `WORKDIR /app` | Directorio de trabajo |
| `COPY package*.json ./` | Copiar archivos de dependencias |
| `RUN npm ci --only=production` | Instalar SOLO dependencias de producción |
| `COPY --from=build /app/app.js ./` | Copiar código desde stage de build |
| `USER nodejs` | Ejecutar como usuario no-root |
| `EXPOSE 3000` | Documentar puerto expuesto |
| `HEALTHCHECK ...` | Verificación automática de salud |
| `CMD ["node", "app.js"]` | Comando para iniciar la app |

---

## Parte 2: Ejecutar el Container

### Comandos

```bash
# Ejecutar en segundo plano con mapeo de puerto
docker run -d -p 3000:3000 --name api-nodejs nodejs-api:1.0

# Verificar que está corriendo
docker ps

# Ver logs
docker logs api-nodejs
```

### Salida Esperada

```
CONTAINER ID   IMAGE            COMMAND         STATUS         PORTS
abc123def456   nodejs-api:1.0   "node app.js"   Up 5 seconds   0.0.0.0:3000->3000/tcp
```

```
Server running on port 3000
Environment: production
```

---

## Parte 3: Probar la API

### Endpoint raíz

```bash
curl http://localhost:3000/
```

**Respuesta:**
```json
{
  "message": "Hello from Node.js + Express!",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Endpoint de salud

```bash
curl http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "UP",
  "uptime": 45.234,
  "timestamp": "2025-01-15T10:30:45.000Z"
}
```

### Endpoint de usuarios

```bash
curl http://localhost:3000/api/users
```

**Respuesta:**
```json
{
  "users": [
    { "id": 1, "name": "Juan Pérez", "email": "juan@example.com" },
    { "id": 2, "name": "María García", "email": "maria@example.com" },
    { "id": 3, "name": "Carlos López", "email": "carlos@example.com" }
  ]
}
```

### Usuario específico

```bash
curl http://localhost:3000/api/users/1
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

---

## Parte 4: Inspeccionar el Container

### Ver detalles de la imagen

```bash
# Ver capas de la imagen
docker history nodejs-api:1.0

# Inspeccionar metadata
docker inspect nodejs-api:1.0
```

### Verificar usuario no-root

```bash
# Ejecutar comando dentro del container
docker exec api-nodejs whoami
```

**Salida esperada:**
```
nodejs
```

### Verificar healthcheck

```bash
# Ver estado de salud
docker inspect api-nodejs | grep -A 5 Health
```

---

## Parte 5: Comparación con Build Sin Multi-Stage

### Crear Dockerfile sin multi-stage

Crea un archivo `Dockerfile.single`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

### Construir y comparar

```bash
# Build sin multi-stage
docker build -f Dockerfile.single -t nodejs-api:single .

# Comparar tamaños
docker images | grep nodejs-api
```

**Salida esperada:**
```
nodejs-api    1.0       abc123   125MB
nodejs-api    single    def456   180MB
```

**Diferencia:** ~55MB más pequeña con multi-stage (no incluye devDependencies)

---

## Conceptos Aprendidos

- **Multi-stage builds**: Múltiples FROM en un Dockerfile para optimizar imagen final
- **Build stage**: Etapa temporal para compilar/preparar artefactos
- **Production stage**: Etapa final con solo lo necesario para ejecutar
- **COPY --from**: Copiar archivos desde otra stage
- **npm ci**: Instalación limpia y determinística (mejor para CI/CD)
- **--only=production**: Instalar solo dependencias de producción
- **Non-root user**: Ejecutar container como usuario sin privilegios
- **HEALTHCHECK**: Verificación automática de salud del container
- **.dockerignore**: Excluir archivos innecesarios del contexto de build

---

## Troubleshooting

### Error: "Cannot find module 'express'"

**Causa:** No se copiaron las dependencias de node_modules

**Solución:** Verifica que el `RUN npm ci --only=production` se ejecutó correctamente

### Error: "EACCES: permission denied"

**Causa:** Usuario nodejs no tiene permisos sobre archivos

**Solución:** Asegúrate de que `chown -R nodejs:nodejs /app` se ejecutó antes de `USER nodejs`

### Container se detiene inmediatamente

**Causa:** Error en la aplicación

**Solución:** Ver logs con `docker logs api-nodejs`

### Puerto ya en uso

**Causa:** Otro proceso usando puerto 3000

**Solución:** Usar otro puerto: `docker run -p 3001:3000 ...`

---

## Limpieza

```bash
# Detener y eliminar container
docker stop api-nodejs
docker rm api-nodejs

# Eliminar imágenes
docker rmi nodejs-api:1.0
docker rmi nodejs-api:single
```

---

## Desafío Adicional

1. Modificar el Dockerfile para usar Node.js 20 en lugar de 18
2. Agregar una nueva ruta `/api/stats` que devuelva estadísticas del sistema
3. Cambiar el puerto a 8080 y verificar que funciona correctamente
4. Agregar un volumen para persistir logs

---

## Recursos Adicionales

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
