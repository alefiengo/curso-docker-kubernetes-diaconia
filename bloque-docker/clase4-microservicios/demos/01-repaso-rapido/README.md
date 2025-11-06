# Demo: Repaso Rápido de Clases 1-3

Demostración progresiva de los conceptos aprendidos en las clases anteriores, desde un container simple hasta una aplicación multi-contenedor.

---

## Paso 1: Container básico (Clase 1)

**Concepto:** Ejecutar una imagen (image) existente como container (contenedor)

```bash
# Pull de imagen oficial
docker pull nginx:alpine

# Ver la imagen descargada
docker images nginx

# Ejecutar container en segundo plano
docker run -d -p 8080:80 --name web nginx:alpine

# Verificar que está corriendo
docker ps

# Acceder
curl http://localhost:8080
```

**Salida esperada:**
```
Welcome to nginx!
```

**Limpiar:**
```bash
docker stop web
docker rm web
```

---

## Paso 2: Dockerfile personalizado (Clase 2)

**Concepto:** Crear una imagen (image) personalizada con contenido propio

**Crear archivo `index.html`:**
```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Mi Aplicación Docker</title>
</head>
<body>
    <h1>Hola desde Docker!</h1>
    <p>Esta es una imagen personalizada.</p>
    <p>Clase 1: Containers básicos ✓</p>
    <p>Clase 2: Dockerfile personalizado ✓</p>
</body>
</html>
EOF
```

**Crear `Dockerfile`:**
```bash
cat > Dockerfile << 'EOF'
FROM nginx:alpine

# Configurar timezone para Bolivia
RUN apk add --no-cache tzdata
ENV TZ=America/La_Paz
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
EOF
```

**Build y ejecutar:**
```bash
# Construir imagen
docker build -t mi-web:1.0 .

# Ver la nueva imagen
docker images mi-web

# Ejecutar
docker run -d -p 8080:80 --name mi-web mi-web:1.0

# Acceder
curl http://localhost:8080
```

**Limpiar:**
```bash
docker stop mi-web
docker rm mi-web
```

---

## Paso 3: Docker Compose multi-contenedor (Clase 3)

**Concepto:** Orquestar múltiples servicios que se comunican entre sí

**Crear `docker-compose.yml`:**
```bash
cat > docker-compose.yml << 'EOF'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
    depends_on:
      - api
    networks:
      - app-network

  api:
    image: node:18-alpine
    working_dir: /app
    command: >
      sh -c "echo 'const http = require(\"http\");
      http.createServer((req, res) => {
        res.writeHead(200, {\"Content-Type\": \"application/json\"});
        res.end(JSON.stringify({message: \"API funcionando\", timestamp: new Date().toISOString()}));
      }).listen(3000);' > server.js && node server.js"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
EOF
```

**Actualizar `index.html`:**
```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Aplicación Multi-Contenedor</title>
</head>
<body>
    <h1>Stack Multi-Contenedor</h1>
    <p>Clase 1: Containers básicos ✓</p>
    <p>Clase 2: Dockerfile personalizado ✓</p>
    <p>Clase 3: Docker Compose + Redes ✓</p>
    <hr>
    <p><strong>Frontend (Nginx):</strong> Este archivo HTML</p>
    <p><strong>Backend (Node.js):</strong> API corriendo en red interna</p>
</body>
</html>
EOF
```

**Ejecutar stack completo:**
```bash
# Levantar todos los servicios
docker compose up -d

# Ver servicios corriendo
docker compose ps

# Ver logs
docker compose logs

# Acceder al frontend
curl http://localhost:8080

# Probar comunicación interna (desde el container web hacia api)
docker compose exec web wget -qO- http://api:3000
```

**Salida esperada del API:**
```json
{"message":"API funcionando","timestamp":"2025-10-08T..."}
```

---

## Resumen Visual

```
CLASE 1: Container básico
┌─────────────────┐
│  nginx:alpine   │  ← Imagen oficial
└─────────────────┘
        ↓
   docker run
        ↓
┌─────────────────┐
│   Container     │  → localhost:8080
└─────────────────┘


CLASE 2: Imagen personalizada
┌─────────────────┐
│  nginx:alpine   │  ← Imagen base
└─────────────────┘
        +
┌─────────────────┐
│  index.html     │  ← Contenido propio
└─────────────────┘
        ↓
   Dockerfile
        ↓
┌─────────────────┐
│   mi-web:1.0    │  ← Nueva imagen
└─────────────────┘


CLASE 3: Multi-contenedor
┌─────────────────┐     ┌─────────────────┐
│   nginx:alpine  │────▶│  node:18-alpine │
│   (Frontend)    │     │     (API)       │
└─────────────────┘     └─────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
            Red: app-network
                    │
        Docker Compose orchestration
```

---

## Conceptos Clave Demostrados

### Clase 1: Containers básicos
- Pull de imágenes desde Docker Hub
- Ejecución de containers con `docker run`
- Port mapping (`-p`)
- Modo detached (`-d`)
- Nombrar containers (`--name`)

### Clase 2: Dockerfiles
- Crear imágenes personalizadas
- `FROM`, `COPY`, `EXPOSE`
- Build con `docker build`
- Tagging de imágenes

### Clase 3: Docker Compose
- Definir múltiples servicios en YAML
- Redes internas para comunicación entre servicios
- Volúmenes para compartir archivos
- Dependencias entre servicios (`depends_on`)
- Orquestación con `docker compose up`

---

## Limpieza Final

```bash
# Detener y eliminar todo
docker compose down

# Eliminar imágenes creadas
docker rmi mi-web:1.0

# Verificar limpieza
docker ps -a
docker images
```

---

## Pregunta para Reflexión

**¿Cómo escalaríamos esta arquitectura si tuviéramos miles de usuarios?**

<details>
<summary>Ver respuesta</summary>

Problemas actuales con arquitectura simple:
- Cada request golpea la base de datos → **Solución: Cache (Redis)**
- Un solo punto de entrada → **Solución: API Gateway (Kong)**
- Frontend y backend mezclados → **Solución: Separar servicios**
- Sin control de tráfico → **Solución: Gateway con rate limiting**
- Difícil de escalar horizontalmente → **Solución: Microservicios independientes**

**Esto es exactamente lo que veremos hoy en Clase 4:**
- Redis para cache distribuido
- Kong como API Gateway
- Arquitectura de microservicios
- Separación clara de responsabilidades

</details>

---

## Próxima Evolución

En los laboratorios de hoy veremos cómo expandir estas arquitecturas con:
- Cache distribuido (Redis)
- API Gateway (Kong)
- Frontends profesionales (Angular)
- Múltiples servicios colaborando
