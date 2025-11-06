# Cheatsheet - Clase 4: Microservicios, Cache y API Gateway

## Comandos Docker Compose

### Gestión de Servicios

```bash
# Levantar todos los servicios
docker compose up -d

# Levantar y reconstruir imágenes
docker compose up -d --build

# Detener servicios sin eliminarlos
docker compose stop

# Detener y eliminar containers y redes
docker compose down

# Detener y eliminar containers, redes Y volúmenes
docker compose down -v

# Reiniciar servicios
docker compose restart

# Reiniciar servicio específico
docker compose restart api
```

### Monitoreo

```bash
# Ver estado de servicios
docker compose ps

# Ver logs de todos los servicios
docker compose logs

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de servicio específico
docker compose logs -f api

# Ver últimas 100 líneas
docker compose logs --tail=100

# Ver logs desde tiempo específico
docker compose logs --since 5m
```

### Ejecutar Comandos

```bash
# Ejecutar comando en servicio
docker compose exec api sh

# Ejecutar comando sin TTY
docker compose exec -T api npm test

# Ejecutar como usuario específico
docker compose exec -u root api sh
```

### Escalado

```bash
# Escalar servicio a 3 instancias
docker compose up -d --scale api=3
```

### Cuándo usar --build

| Situación | Comando | Razón |
|-----------|---------|-------|
| **Primera vez** | `docker compose up -d --build` | No hay imágenes construidas |
| **Cambié Dockerfile** | `docker compose up -d --build` | Dockerfile no se autodetecta |
| **Cambié código (server.js, package.json)** | `docker compose up -d --build` | Necesita COPY nuevo código |
| **Cambié docker-compose.yml (puertos, env)** | `docker compose up -d` | No afecta imagen, solo runtime |
| **Cambié archivo con bind mount (nginx.conf)** | `docker compose restart gateway` | Es volume, no necesita rebuild |
| **Solo bajé y subo de nuevo** | `docker compose up -d` | Imagen ya existe |
| **Problemas raros / debugging** | `docker compose up -d --build --no-cache` | Rebuild completo sin cache |

**Comandos útiles adicionales:**

```bash
# Rebuild sin cache (limpia cache de layers)
docker compose build --no-cache
docker compose up -d

# Rebuild con actualización de imágenes base
docker compose build --pull
docker compose up -d

# Recrear containers sin rebuild
docker compose up -d --force-recreate

# Reset completo
docker compose down -v
docker compose up -d --build
```

## Conexión entre Servicios

### DNS Interno

```yaml
services:
  api:
    # Se conecta a MongoDB usando nombre del servicio
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - REDIS_HOST=redis

  mongo:
    # Accesible como 'mongo' desde otros servicios

  redis:
    # Accesible como 'redis' desde otros servicios
```

### depends_on

```yaml
services:
  api:
    depends_on:
      - mongo
      - redis
    # API espera que mongo y redis estén creados antes de iniciar
```

## MongoDB

### Comandos Básicos

```bash
# Conectar a MongoDB
docker compose exec mongo mongosh

# Dentro de mongosh:
show dbs
use tasksdb
show collections
db.tasks.find()
db.tasks.findOne()
db.tasks.insertOne({title: "Test"})
db.tasks.deleteMany({})
```

### Connection String

```javascript
// Node.js con MongoDB driver
const { MongoClient } = require('mongodb');
const MONGO_URL = 'mongodb://mongo:27017';
const DB_NAME = 'tasksdb';

MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
  });
```

### Script de Inicialización

```javascript
// mongo-init/init.js
db = db.getSiblingDB('nombre_db');

db.coleccion.insertMany([
  { campo1: 'valor1', campo2: 'valor2' },
  { campo1: 'valor3', campo2: 'valor4' }
]);

print('Base de datos inicializada');
```

## Redis

### Comandos en docker-compose.yml

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"  # Opcional para debugging
    networks:
      - app-network
```

### Comandos Redis CLI

```bash
# Conectar a Redis
docker compose exec redis redis-cli

# Comandos básicos:
KEYS *                    # Listar todas las keys
GET products:all          # Obtener valor
SET mikey "valor"         # Guardar valor
DEL products:all          # Eliminar key
FLUSHALL                  # Eliminar todo
TTL products:all          # Ver tiempo de expiración
PING                      # Verificar conexión
```

### Redis en Node.js

```javascript
const { createClient } = require('redis');

// Conectar
const redisClient = createClient({
  socket: {
    host: 'redis',
    port: 6379
  }
});

await redisClient.connect();

// Guardar con TTL
await redisClient.setEx('cacheKey', 60, JSON.stringify(data));

// Obtener
const cachedData = await redisClient.get('cacheKey');

// Eliminar
await redisClient.del('cacheKey');

// Eliminar todo
await redisClient.flushAll();

// Listar keys
const keys = await redisClient.keys('*');
```

### Middleware de Cache

```javascript
const cacheMiddleware = (keyPrefix) => {
  return async (req, res, next) => {
    const cacheKey = `${keyPrefix}:${req.params.id || 'all'}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedData)
      });
    }

    console.log(`Cache MISS: ${cacheKey}`);
    req.cacheKey = cacheKey;
    next();
  };
};

// Uso:
app.get('/products', cacheMiddleware('products'), async (req, res) => {
  const products = await db.collection('products').find().toArray();
  await redisClient.setEx(req.cacheKey, 60, JSON.stringify(products));
  res.json({ source: 'database', data: products });
});
```

### Invalidación de Cache

```javascript
// Al crear/actualizar/eliminar, invalidar cache
app.post('/products', async (req, res) => {
  // ... insertar en DB ...

  // Invalidar cache de lista
  await redisClient.del('products:all');

  res.status(201).json(newProduct);
});

app.put('/products/:id', async (req, res) => {
  // ... actualizar en DB ...

  // Invalidar cache del producto específico y lista
  await redisClient.del(`product:${req.params.id}`);
  await redisClient.del('products:all');

  res.json({ message: 'Actualizado' });
});
```

## Nginx como API Gateway

### Estructura nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    # Definir backends
    upstream backend_service {
        server backend:5000;
    }

    upstream frontend_service {
        server frontend:80;
    }

    server {
        listen 8080;
        server_name localhost;

        # Logs
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        # Rutear API al backend
        location /api/ {
            proxy_pass http://backend_service/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Rutear todo lo demás al frontend
        location / {
            proxy_pass http://frontend_service/;
            proxy_set_header Host $host;
        }

        # Health check del gateway
        location /gateway/health {
            return 200 "Gateway OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Configuración en docker-compose.yml

```yaml
services:
  gateway:
    image: nginx:alpine
    container_name: api-gateway
    ports:
      - "8080:8080"
    volumes:
      - ./nginx-config/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend
    networks:
      - app-network
```

### Headers de Proxy Importantes

```nginx
# Preservar información del cliente original
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# Para WebSockets
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_cache_bypass $http_upgrade;
```

### Balanceo de Carga

```nginx
upstream backend_service {
    # Round-robin (por defecto)
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;

    # Otras estrategias:
    # least_conn;  # Menos conexiones
    # ip_hash;     # Sticky sessions por IP
}
```

### Ver Logs de Nginx

```bash
# Logs del gateway
docker compose logs -f gateway

# Logs de acceso
docker compose exec gateway tail -f /var/log/nginx/access.log

# Logs de errores
docker compose exec gateway tail -f /var/log/nginx/error.log
```

## Patrones de Arquitectura

### Cache-Aside Pattern

```
1. Cliente hace request
2. API verifica cache
3. Si está en cache (HIT): devuelve de Redis
4. Si no está (MISS):
   - Consulta DB
   - Guarda en cache con TTL
   - Devuelve resultado
5. En escritura: invalida cache
```

### API Gateway Pattern

```
Cliente → Gateway :8080
    ├─→ /api/*  → Backend API
    ├─→ /admin/* → Admin Service
    └─→ /*       → Frontend
```

## Troubleshooting

### Error: "Connection refused" a MongoDB

```bash
# Verificar que MongoDB esté corriendo
docker compose ps mongo

# Ver logs
docker compose logs mongo

# Reiniciar
docker compose restart mongo

# Verificar conexión desde API
docker compose exec api ping mongo
```

### Error: "Redis connection failed"

```bash
# Verificar Redis
docker compose ps redis
docker compose logs redis

# Probar conexión manual
docker compose exec redis redis-cli PING

# Verificar desde API
docker compose exec api ping redis
```

### Error: "502 Bad Gateway" en Nginx

```bash
# Verificar que backend esté corriendo
docker compose ps backend

# Ver logs de Nginx
docker compose logs gateway

# Ver logs de backend
docker compose logs backend

# Verificar configuración de Nginx
docker compose exec gateway cat /etc/nginx/nginx.conf

# Probar configuración de Nginx
docker compose exec gateway nginx -t

# Reload de configuración
docker compose exec gateway nginx -s reload
```

### Cache no funciona

```bash
# Verificar conexión a Redis
docker compose logs api | grep -i redis

# Ver keys en Redis
docker compose exec redis redis-cli KEYS '*'

# Ver TTL de una key
docker compose exec redis redis-cli TTL 'products:all'

# Verificar logs de cache hits/misses
docker compose logs -f api | grep -i cache
```

### Datos no persisten

```bash
# Verificar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect <volume-name>

# Verificar montaje en docker-compose.yml
# Debe ser:
volumes:
  - mongo-data:/data/db  # Named volume

# NO:
# - ./data:/data/db      # Bind mount depende de host
```

## Configuración de Timezone

### Para imágenes propias (Node.js, Python)

**En Dockerfile (recomendado - más portable):**

```dockerfile
# Stage 2: Production
FROM node:18-alpine

# Configurar timezone
RUN apk add --no-cache tzdata
ENV TZ=America/La_Paz
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Resto del Dockerfile...
```

**Por qué en Dockerfile:**
- Funciona en Docker Compose, Swarm y Kubernetes
- Imagen portable y auto-documentada
- No necesitas reconfigurar en cada ambiente

### Para imágenes oficiales (MongoDB, Redis, PostgreSQL)

**En docker-compose.yml:**

```yaml
services:
  mongo:
    image: mongo:7
    environment:
      - TZ=America/La_Paz
    # Opcional: Más preciso con bind mounts del host
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
```

**En Kubernetes:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo
spec:
  template:
    spec:
      containers:
      - name: mongo
        image: mongo:7
        env:
        - name: TZ
          value: "America/La_Paz"
        volumeMounts:
        - name: timezone
          mountPath: /etc/timezone
          readOnly: true
        - name: localtime
          mountPath: /etc/localtime
          readOnly: true
      volumes:
      - name: timezone
        hostPath:
          path: /etc/timezone
      - name: localtime
        hostPath:
          path: /etc/localtime
```

**En Docker Swarm:**

```yaml
services:
  mongo:
    image: mongo:7
    environment:
      - TZ=America/La_Paz
    volumes:
      - type: bind
        source: /etc/timezone
        target: /etc/timezone
        read_only: true
```

### Patrón híbrido (flexible)

```dockerfile
# Dockerfile - default timezone
FROM node:18-alpine

RUN apk add --no-cache tzdata
ENV TZ=America/La_Paz
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone
```

```yaml
# docker-compose.yml - override para testing
services:
  api:
    build: ./app
    environment:
      - TZ=America/Lima  # Override temporal
```

### Verificar timezone configurada

```bash
# Dentro del container
docker compose exec api date
docker compose exec mongo date

# Debe mostrar: Hora de Bolivia (BOT, UTC-4)
```

### Timezones comunes en Latinoamérica

```bash
America/La_Paz        # Bolivia (UTC-4)
America/Lima          # Perú (UTC-5)
America/Bogota        # Colombia (UTC-5)
America/Santiago      # Chile (UTC-3/UTC-4 con DST)
America/Buenos_Aires  # Argentina (UTC-3)
America/Sao_Paulo     # Brasil (UTC-3)
America/Mexico_City   # México (UTC-6/UTC-5 con DST)
```

## Conceptos Clave

### Microservicios
- Servicios independientes que se comunican entre sí
- Cada servicio tiene su propia responsabilidad
- Se comunican vía red (HTTP, gRPC, etc.)

### Cache
- Almacenamiento temporal de datos frecuentes
- Reduce carga en base de datos
- Mejora tiempos de respuesta
- Requiere estrategia de invalidación

### API Gateway
- Punto de entrada único para clientes
- Distribuye requests entre servicios
- Centraliza autenticación, logging, rate limiting
- Abstrae complejidad interna

### Service Discovery
- Docker DNS resuelve nombres de servicios automáticamente
- `backend` se resuelve a IP del container backend
- Solo funciona en redes custom (no en bridge default)

### Persistencia
- Named volumes para datos que deben sobrevivir
- Independientes del ciclo de vida de containers
- Gestionados por Docker

## Verificación Rápida

```bash
# Stack completo funcionando
docker compose ps  # Todos "Up"

# Cache activo
curl http://localhost:8080/api/products  # Primera: MISS
curl http://localhost:8080/api/products  # Segunda: HIT

# Gateway ruteando
curl http://localhost:8080/gateway/health  # Gateway
curl http://localhost:8080/api/health      # Backend via gateway
curl http://localhost:8080/                 # Frontend via gateway

# Persistencia
docker compose down && docker compose up -d
curl http://localhost:8080/api/products  # Datos siguen ahí
```

## Mejores Prácticas

1. **Siempre usar custom networks** para DNS automático
2. **Usar named volumes** para persistencia
3. **No exponer puertos innecesarios** al host
4. **Implementar health checks** en todos los servicios
5. **Invalidar cache** al modificar datos
6. **Usar depends_on** para orden de inicio
7. **Centralizar configuración** con variables de entorno
8. **Documentar arquitectura** en README
9. **Usar .dockerignore** para no copiar node_modules
10. **Probar antes de entregar**: `docker compose up -d` debe funcionar siempre
