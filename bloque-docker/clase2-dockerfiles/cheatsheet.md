# Cheatsheet - Clase 2: Dockerfiles

## Comandos de Build

### Construir Imagen

```bash
# Build básico
docker build -t nombre-imagen:tag .

# Build con nombre y tag
docker build -t miapp:1.0 .

# Build desde Dockerfile con otro nombre
docker build -f Dockerfile.dev -t miapp:dev .

# Build sin cache
docker build --no-cache -t miapp:1.0 .

# Build con argumentos
docker build --build-arg VERSION=1.0 -t miapp .
```

### Ver Imágenes

```bash
# Listar todas las imágenes
docker images

# Listar con filtros
docker images miapp

# Ver historial de capas
docker history miapp:1.0

# Ver detalles completos
docker inspect miapp:1.0
```

### Eliminar Imágenes

```bash
# Eliminar una imagen
docker rmi miapp:1.0

# Eliminar por ID
docker rmi abc123def456

# Eliminar forzadamente
docker rmi -f miapp:1.0

# Eliminar imágenes sin usar
docker image prune

# Eliminar todas las imágenes sin usar
docker image prune -a
```

---

## Instrucciones de Dockerfile

### Instrucciones Básicas

| Instrucción | Descripción | Ejemplo |
|-------------|-------------|---------|
| `FROM` | Imagen base | `FROM node:18-alpine` |
| `WORKDIR` | Directorio de trabajo | `WORKDIR /app` |
| `COPY` | Copiar archivos | `COPY package.json ./` |
| `ADD` | Copiar y extraer archivos | `ADD app.tar.gz /app` |
| `RUN` | Ejecutar comando en build | `RUN npm install` |
| `CMD` | Comando por defecto | `CMD ["node", "app.js"]` |
| `ENTRYPOINT` | Comando principal | `ENTRYPOINT ["python"]` |
| `EXPOSE` | Documentar puerto | `EXPOSE 3000` |
| `ENV` | Variable de entorno | `ENV NODE_ENV=production` |
| `ARG` | Argumento de build | `ARG VERSION=1.0` |
| `USER` | Usuario para ejecutar | `USER nodejs` |
| `VOLUME` | Punto de montaje | `VOLUME /data` |
| `LABEL` | Metadata | `LABEL version="1.0"` |
| `HEALTHCHECK` | Verificación de salud | `HEALTHCHECK CMD curl -f http://localhost/health` |

### Multi-Stage Build

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/app.js"]
```

**Ventajas:**
- Reduce tamaño final de imagen
- Separa dependencias de build de runtime
- Mejora seguridad (no incluye herramientas de build)

---

## Docker Hub

### Login

```bash
# Iniciar sesión
docker login

# Login con credenciales
docker login -u usuario -p password

# Logout
docker logout
```

### Tag y Push

```bash
# Tagear imagen para Docker Hub
docker tag miapp:1.0 usuario/miapp:1.0

# Push a Docker Hub
docker push usuario/miapp:1.0

# Push de todos los tags
docker push usuario/miapp --all-tags
```

### Pull

```bash
# Descargar imagen
docker pull usuario/miapp:1.0

# Descargar imagen específica
docker pull nginx:1.21-alpine
```

---

## Build Context y .dockerignore

### .dockerignore

Excluir archivos del contexto de build:

```
node_modules
npm-debug.log
.git
.env
*.md
.DS_Store
```

### Ver Tamaño del Contexto

```bash
# Ver qué se envía al build
docker build --progress=plain -t miapp .
```

---

## Buenas Prácticas

### Optimización de Capas

```dockerfile
# MAL: Crea muchas capas
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim

# BIEN: Una sola capa
RUN apt-get update && \
    apt-get install -y \
        curl \
        vim && \
    rm -rf /var/lib/apt/lists/*
```

### Orden de Instrucciones

```dockerfile
# BIEN: Lo que menos cambia primero
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./    # Cambia poco
RUN npm install          # Cacheable si package.json no cambia
COPY . .                 # Cambia frecuentemente
```

### Non-Root User

```dockerfile
# Crear usuario
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar ownership
RUN chown -R nodejs:nodejs /app

# Ejecutar como usuario
USER nodejs
```

---

## Troubleshooting

### Error: "No space left on device"

```bash
# Limpiar containers detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar todo
docker system prune -a
```

### Build Lento

```bash
# Usar .dockerignore para excluir archivos grandes
# Ordenar instrucciones para maximizar cache
# Usar multi-stage builds
```

### Imagen Muy Grande

```bash
# Ver tamaño de capas
docker history miapp:1.0

# Usar imagen base alpine
FROM node:18-alpine  # vs FROM node:18

# Limpiar archivos temporales en mismo RUN
RUN npm install && npm cache clean --force
```

---

## Workflow Completo

```bash
# 1. Crear Dockerfile
vim Dockerfile

# 2. Crear .dockerignore
vim .dockerignore

# 3. Build
docker build -t miapp:1.0 .

# 4. Probar localmente
docker run -d -p 3000:3000 miapp:1.0

# 5. Verificar
curl http://localhost:3000

# 6. Tag para Docker Hub
docker tag miapp:1.0 usuario/miapp:1.0

# 7. Push
docker push usuario/miapp:1.0

# 8. Cleanup local
docker stop <container-id>
docker rm <container-id>
```

---

## Ejemplos por Lenguaje

### Node.js

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["node", "app.js"]
```

### Python

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER nobody
EXPOSE 8000
CMD ["python", "app.py"]
```

### Java (Spring Boot)

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Go

```dockerfile
# Build stage
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o main .

# Runtime stage
FROM alpine:latest
WORKDIR /app
COPY --from=build /app/main .
EXPOSE 8080
CMD ["./main"]
```

---

## Referencias

- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
