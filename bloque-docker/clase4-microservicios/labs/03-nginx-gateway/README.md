# Lab 03: Nginx como API Gateway

## Objetivo

Configurar Nginx como API Gateway (puerta de enlace) para centralizar y distribuir requests entre múltiples servicios backend y frontend.

## Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│              Docker Compose Stack                        │
│                                                          │
│  ┌──────────┐                                           │
│  │ Cliente  │                                           │
│  │ (curl)   │                                           │
│  └────┬─────┘                                           │
│       │                                                  │
│       │ http://localhost:8080                           │
│       ▼                                                  │
│  ┌─────────────────┐                                    │
│  │  NGINX GATEWAY  │                                    │
│  │   Port: 8080    │                                    │
│  └────┬───────┬────┘                                    │
│       │       │                                          │
│  /api │       │ /                                        │
│       │       │                                          │
│       ▼       ▼                                          │
│  ┌─────────┐ ┌──────────┐                              │
│  │Backend  │ │ Frontend │                              │
│  │API:5000 │ │ Nginx:80 │                              │
│  └─────────┘ └──────────┘                              │
│       │                                                  │
│  ┌────▼─────────────────────────────────────────┐      │
│  │      app-network (custom bridge)             │      │
│  │      DNS automático: backend, frontend       │      │
│  └──────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

## Estructura del Proyecto

```
03-nginx-gateway/
├── docker-compose.yml
├── nginx-config/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── frontend/
    ├── Dockerfile
    └── index.html
```

## Comandos Docker Compose

### Levantar el laboratorio

**Primera vez:**
```bash
docker compose up -d --build
```

**Si hiciste cambios al código o Dockerfile:**
```bash
docker compose up -d --build
```

**Solo reiniciar sin cambios:**
```bash
docker compose restart
```

**Si cambiaste nginx.conf (bind mount):**
```bash
docker compose restart gateway
# O recargar configuración sin reiniciar:
docker compose exec gateway nginx -s reload
```

**Limpiar y empezar de nuevo:**
```bash
docker compose down -v
docker compose up -d --build
```

## Paso 1: Configurar Nginx Gateway

### nginx-config/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    # Configuración de upstream para backend
    upstream backend_service {
        server backend:5000;
    }

    # Configuración de upstream para frontend
    upstream frontend_service {
        server frontend:80;
    }

    # Servidor principal
    server {
        listen 8080;
        server_name localhost;

        # Logs
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        # Ruta para API (backend)
        location /api/ {
            proxy_pass http://backend_service/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Ruta para frontend (default)
        location / {
            proxy_pass http://frontend_service/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check del gateway
        location /gateway/health {
            access_log off;
            return 200 "Gateway OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## Paso 2: Crear Backend API

### backend/package.json

```json
{
  "name": "backend-api",
  "version": "1.0.0",
  "description": "Backend API simple",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "author": "alefiengo",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### backend/server.js

```javascript
const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Simular base de datos en memoria
let users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, name: 'María García', email: 'maria@example.com' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com' }
];

// GET /users
app.get('/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET /users/:id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  res.json({ success: true, data: user });
});

// POST /users
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// Info del servicio
app.get('/info', (req, res) => {
  res.json({
    service: 'Backend API',
    version: '1.0.0',
    endpoints: ['/users', '/users/:id', '/health', '/info']
  });
});

app.listen(PORT, () => {
  console.log(`Backend API escuchando en puerto ${PORT}`);
});
```

### backend/Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Stage 2: Production
FROM node:18-alpine

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código desde stage de build
COPY --from=build /app/server.js ./

# Cambiar ownership de los archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
```

**Buenas prácticas aplicadas (Clase 2):**

1. **Multi-stage build**: Separación entre build y producción
2. **Non-root user**: Usuario `nodejs` para mayor seguridad
3. **npm install → npm ci**: Build usa `npm install` (crea lockfile), production usa `npm ci --omit=dev` (instalación determinística)
4. **npm cache clean**: Imagen final más liviana
5. **HEALTHCHECK**: Monitoreo automático del estado del contenedor
6. **ENV variables**: Configuración explícita del entorno
7. **Ownership correcto**: Permisos apropiados para usuario no-root

## Paso 3: Crear Frontend

### frontend/index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend - API Gateway Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin: 5px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .response {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 400px;
            overflow-y: auto;
        }
        .architecture {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
        }
        .architecture pre {
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            line-height: 1.5;
        }
        .info-box {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>API Gateway con Nginx</h1>
            <p>Clase 4: Microservicios, Cache y API Gateway</p>
        </div>

        <div class="content">
            <div class="section">
                <h2>Arquitectura</h2>
                <div class="architecture">
                    <pre>Cliente → NGINX Gateway :8080
    ├─→ /api/*  → Backend API :5000
    └─→ /*      → Frontend :80</pre>
                </div>
                <div class="info-box">
                    <strong>Todas las requests pasan por Nginx</strong><br>
                    Nginx actúa como punto de entrada único y distribuye el tráfico según la ruta.
                </div>
            </div>

            <div class="section">
                <h2>Probar Backend API (via Gateway)</h2>
                <p>Todas las consultas pasan por el gateway en puerto 8080</p>
                <button class="button" onclick="testBackend('/api/info')">GET /api/info</button>
                <button class="button" onclick="testBackend('/api/users')">GET /api/users</button>
                <button class="button" onclick="testBackend('/api/health')">GET /api/health</button>
                <div id="backend-response" class="response" style="display:none"></div>
            </div>

            <div class="section">
                <h2>Estado del Gateway</h2>
                <button class="button" onclick="testGateway()">Health Check Gateway</button>
                <div id="gateway-response" class="response" style="display:none"></div>
            </div>

            <div class="section">
                <h2>Información</h2>
                <div class="info-box">
                    <p><strong>Puerto Gateway:</strong> 8080</p>
                    <p><strong>Puerto Backend:</strong> 5000 (no accesible directamente desde fuera)</p>
                    <p><strong>Puerto Frontend:</strong> 80 (no accesible directamente desde fuera)</p>
                    <p><strong>Beneficios:</strong></p>
                    <ul>
                        <li>Punto de entrada único</li>
                        <li>Servicios backend no expuestos directamente</li>
                        <li>Fácil agregar autenticación, rate limiting, etc.</li>
                        <li>Balanceo de carga entre múltiples instancias</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function testBackend(endpoint) {
            const responseDiv = document.getElementById('backend-response');
            responseDiv.style.display = 'block';
            responseDiv.textContent = 'Cargando...';

            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                responseDiv.textContent = `Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`;
            } catch (error) {
                responseDiv.textContent = `Error: ${error.message}`;
            }
        }

        async function testGateway() {
            const responseDiv = document.getElementById('gateway-response');
            responseDiv.style.display = 'block';
            responseDiv.textContent = 'Verificando gateway...';

            try {
                const response = await fetch('/gateway/health');
                const text = await response.text();
                responseDiv.textContent = `Status: ${response.status}\n\n${text}`;
            } catch (error) {
                responseDiv.textContent = `Error: ${error.message}`;
            }
        }
    </script>
</body>
</html>
```

### frontend/Dockerfile

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Paso 4: Docker Compose

### docker-compose.yml

```yaml
services:
  gateway:
    image: nginx:alpine
    container_name: api-gateway
    ports:
      - "8080:8080"
    volumes:
      - ./nginx-config/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - app-network
    depends_on:
      - backend
      - frontend

  backend:
    build: ./backend
    container_name: backend-api
    networks:
      - app-network

  frontend:
    build: ./frontend
    container_name: frontend-web
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Comandos a Ejecutar

### 1. Levantar el stack

```bash
docker compose up -d --build
```

### 2. Verificar servicios

```bash
docker compose ps
```

**Salida esperada:**
```
NAME            IMAGE             STATUS        PORTS
api-gateway     nginx:alpine      Up 5s         0.0.0.0:8080->8080/tcp
backend-api     backend           Up 6s
frontend-web    frontend          Up 6s
```

### 3. Ver logs del gateway

```bash
docker compose logs -f gateway
```

## Desglose del nginx.conf

| Componente | Descripción |
|------------|-------------|
| `upstream backend_service` | Define el servicio backend accesible como `backend:5000` |
| `upstream frontend_service` | Define el servicio frontend accesible como `frontend:80` |
| `location /api/` | Rutea requests `/api/*` al backend |
| `location /` | Rutea todo lo demás al frontend |
| `proxy_pass` | Reenvía la request al servicio correspondiente |
| `proxy_set_header` | Preserva headers originales del cliente |

## Probar el API Gateway

### 1. Acceder al frontend

Abre en el navegador:
```
http://localhost:8080
```

Verás la interfaz web que permite probar el backend a través del gateway.

### 2. Probar backend via gateway (desde terminal)

```bash
# Info del backend
curl http://localhost:8080/api/info

# Listar usuarios
curl http://localhost:8080/api/users

# Health check del backend
curl http://localhost:8080/api/health

# Health check del gateway
curl http://localhost:8080/gateway/health
```

### 3. Crear nuevo usuario

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Martínez",
    "email": "ana@example.com"
  }'
```

### 4. Verificar que backend NO es accesible directamente

```bash
# Esto debe FALLAR (puerto 5000 no expuesto)
curl http://localhost:5000/users
```

**Resultado esperado:** Connection refused

## Explicación Detallada

### Flujo de Requests

1. **Cliente** hace request a `http://localhost:8080/api/users`
2. **Nginx Gateway** recibe la request en puerto 8080
3. **Nginx** identifica que la ruta empieza con `/api/`
4. **Nginx** reenvía la request a `backend:5000` (usando DNS de Docker)
5. **Backend API** procesa la request y responde
6. **Nginx** devuelve la respuesta al cliente

### Ventajas del API Gateway

1. **Punto de entrada único**: Un solo puerto expuesto al exterior
2. **Seguridad**: Servicios backend no accesibles directamente
3. **Centralización**: Fácil agregar autenticación, logging, rate limiting
4. **Flexibilidad**: Cambiar backends sin afectar clientes
5. **Balanceo de carga**: Nginx puede distribuir entre múltiples instancias

### Configuración de Upstream

```nginx
upstream backend_service {
    server backend:5000;
    # Podrías agregar más instancias:
    # server backend2:5000;
    # server backend3:5000;
}
```

## Conceptos Aprendidos

- Configuración de Nginx como API Gateway
- Routing de requests basado en path
- Upstream servers y proxy_pass
- DNS interno de Docker para comunicación entre servicios
- Aislamiento de servicios (no exponer puertos innecesarios)
- Headers de proxy para preservar información del cliente

## Troubleshooting

### Error: "502 Bad Gateway"

**Causa**: Backend no está corriendo o no es accesible.

**Solución**:
```bash
docker compose logs backend
docker compose restart backend
```

### Error: Frontend no carga

**Causa**: Configuración incorrecta de `location /` en nginx.conf.

**Solución**: Verificar que `proxy_pass http://frontend_service/;` está correctamente configurado.

### Error: "connect() failed"

**Causa**: Nombre de servicio incorrecto en upstream.

**Solución**: Verificar que los nombres en nginx.conf coinciden con los nombres en docker-compose.yml.

## Desafío Final

Extiende el gateway para incluir:

1. **Autenticación**: Agregar header de autenticación básica
2. **Rate Limiting**: Limitar requests por IP
3. **CORS**: Configurar CORS headers
4. **Logging personalizado**: Formato de logs más detallado

## Cleanup

```bash
docker compose down
```

## Recursos Adicionales

- [Nginx as API Gateway](https://www.nginx.com/blog/deploying-nginx-plus-as-an-api-gateway/)
- [Nginx Proxy Configuration](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Docker Networking](https://docs.docker.com/network/)
- [Nginx Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
