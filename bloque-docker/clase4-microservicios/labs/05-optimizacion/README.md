# Lab 02: Optimización de Imágenes Docker

## Objetivo

Aplicar técnicas de optimización para reducir el tamaño de imágenes Docker y mejorar su seguridad, comparando resultados antes y después.

---

## Comandos a ejecutar

### 1. Crear imagen sin optimizar (baseline)

**Crear `app-sin-optimizar/`:**
```bash
mkdir app-sin-optimizar
cd app-sin-optimizar
```

**Crear `app.js`:**
```bash
cat > app.js << 'EOF'
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'API sin optimizar', version: '1.0' });
});

app.listen(3000, () => console.log('Server running on :3000'));
EOF
```

**Crear `package.json`:**
```bash
cat > package.json << 'EOF'
{
  "name": "app-sin-optimizar",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF
```

**Crear `Dockerfile.sin-optimizar`:**
```bash
cat > Dockerfile.sin-optimizar << 'EOF'
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "app.js"]
EOF
```

**Build y analizar:**
```bash
# Construir
docker build -t app:sin-optimizar -f Dockerfile.sin-optimizar .

# Ver tamaño
docker images app:sin-optimizar
```

**Salida esperada:** ~1GB

---

### 2. Crear imagen optimizada

**Crear `Dockerfile.optimizado`:**
```bash
cat > Dockerfile.optimizado << 'EOF'
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Production
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY app.js ./
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["node", "app.js"]
EOF
```

**Build y comparar:**
```bash
# Construir optimizada
docker build -t app:optimizado -f Dockerfile.optimizado .

# Comparar tamaños
docker images | grep app
```

**Salida esperada:** ~150MB (reducción de ~85%)

---

### 3. Analizar capas

```bash
# Ver historial de capas (sin optimizar)
docker history app:sin-optimizar

# Ver historial de capas (optimizado)
docker history app:optimizado

# Usar dive para análisis detallado (opcional)
# brew install dive  # o apt-get install dive
dive app:sin-optimizar
dive app:optimizado
```

---

### 4. Probar funcionalidad

```bash
# Ejecutar versión sin optimizar
docker run -d -p 3001:3000 --name test-sin-opt app:sin-optimizar
curl http://localhost:3001

# Ejecutar versión optimizada
docker run -d -p 3002:3000 --name test-opt app:optimizado
curl http://localhost:3002

# Ver usuario que ejecuta el proceso
docker exec test-sin-opt whoami  # root (INCORRECTO)
docker exec test-opt whoami       # nodejs (CORRECTO)

# Limpiar
docker stop test-sin-opt test-opt
docker rm test-sin-opt test-opt
```

---

## Desglose del comando

### Técnicas aplicadas en imagen optimizada

| Técnica | Beneficio |
|---------|-----------|
| `FROM node:18-alpine` | Base ligera (~50MB vs ~1GB) |
| Multi-stage build | Solo archivos necesarios en imagen final |
| `npm install` separado | Aprovecha cache de Docker |
| Non-root user (`nodejs`) | Seguridad: no ejecuta como root |
| `COPY --from=build` | Copia solo `node_modules`, no cache npm |
| `chown` antes de `USER` | Permisos correctos |
| `HEALTHCHECK` | Monitoreo automático |

---

## Explicación detallada

### ¿Por qué la imagen sin optimizar es tan grande?

1. **Base pesada**: node:18 incluye sistema completo (~1GB)
2. **Herramientas innecesarias**: gcc, python, build tools
3. **Cache de npm**: Archivos temporales
4. **Sin multi-stage**: Todo queda en imagen final

### ¿Cómo funciona la optimización?

1. **Alpine Linux**: Base mínima (solo lo esencial)
2. **Multi-stage**:
   - Stage 1: Construye con todas las herramientas
   - Stage 2: Solo copia resultado final
3. **Non-root**: Previene ataques de escalación de privilegios
4. **Healthcheck**: Docker puede detectar si app está funcionando

### Comparativa de tamaños

```
node:18        → 1GB
node:18-slim   → 250MB
node:18-alpine → 150MB (con app)
```

---

## Conceptos aprendidos

- Selección de imagen base (alpine vs slim vs full)
- Multi-stage builds para reducir tamaño
- Ejecución como non-root user
- Aprovechamiento de cache de Docker
- Health checks en containers
- Análisis de capas con `docker history`
- Comparación de tamaños before/after

---

## Troubleshooting

### Error: "COPY --from=build failed"

```bash
# Verificar nombre del stage
FROM node:18-alpine AS build  # ← Debe tener AS nombre
```

### Error: "permission denied" al ejecutar como non-root

```bash
# Asegurar permisos ANTES de cambiar a USER
RUN chown -R nodejs:nodejs /app
USER nodejs
```

### Aplicación no inicia en Alpine

```bash
# Algunas librerías necesitan dependencias adicionales
RUN apk add --no-cache python3 make g++

# O usar node:18-slim en lugar de alpine
FROM node:18-slim
```

---

## Desafío final

**Optimiza el Proyecto Integrador:**

1. Analiza el tamaño actual:
   ```bash
   docker images | grep springboot-api
   ```

2. Identifica oportunidades de mejora:
   - ¿Usa multi-stage?
   - ¿Base alpine?
   - ¿Usuario non-root?
   - ¿Healthcheck?

3. Aplica optimizaciones y compara resultados

4. Objetivo: Reducir al menos 30% del tamaño

---

## Recursos adicionales

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Alpine Linux Docker Images](https://hub.docker.com/_/alpine)
- [Dive - Image Layer Explorer](https://github.com/wagoodman/dive)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
