# Lab 02: Redis como Cache - Optimización de Rendimiento

## Objetivo

Implementar Redis como capa de cache (caché) para optimizar el rendimiento de una API, reduciendo consultas repetidas a la base de datos.

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│              Docker Compose Stack                      │
│                                                        │
│  ┌─────────────┐    ┌──────────┐    ┌──────────────┐ │
│  │   Cliente   │───►│  Node.js │───►│   MongoDB    │ │
│  │             │    │  Express │    │   Database   │ │
│  └─────────────┘    │  + Redis │    └──────────────┘ │
│                     │  Client  │           │          │
│                     └─────┬────┘    ┌──────▼──────┐   │
│                           │         │ mongo-data  │   │
│                           ▼         │  (volume)   │   │
│                     ┌──────────┐    └─────────────┘   │
│                     │  Redis   │                       │
│                     │  Cache   │                       │
│                     └──────────┘                       │
│                           │                            │
│  ┌────────────────────────▼──────────────────────┐    │
│  │         app-network (custom)                  │    │
│  │         DNS automático habilitado             │    │
│  └───────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

## Estructura del Proyecto

```
02-redis-cache/
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── .dockerignore
└── mongo-init/
    └── init.js
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

**Limpiar y empezar de nuevo:**
```bash
docker compose down -v
docker compose up -d --build
```

## Paso 1: Crear API con Redis

### api/package.json

```json
{
  "name": "products-api-cache",
  "version": "1.0.0",
  "description": "API de productos con Redis cache",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "author": "alefiengo",
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^6.3.0",
    "redis": "^4.6.0"
  }
}
```

### api/server.js

```javascript
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { createClient } = require('redis');

const app = express();
const PORT = 4000;
const MONGO_URL = 'mongodb://mongo:27017';
const DB_NAME = 'productsdb';
const CACHE_TTL = 60; // 60 segundos

app.use(express.json());

let db;
let redisClient;

// Conectar a MongoDB
MongoClient.connect(MONGO_URL)
  .then(client => {
    console.log('Conectado a MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(error => console.error('Error conectando a MongoDB:', error));

// Conectar a Redis
(async () => {
  redisClient = createClient({
    socket: {
      host: 'redis',
      port: 6379
    }
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));
  redisClient.on('connect', () => console.log('Conectado a Redis'));

  await redisClient.connect();
})();

// Middleware de cache
const cacheMiddleware = (keyPrefix) => {
  return async (req, res, next) => {
    const cacheKey = `${keyPrefix}:${req.params.id || 'all'}`;

    try {
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
    } catch (error) {
      console.error('Error en cache:', error);
      next();
    }
  };
};

// GET /products - Listar todos los productos (con cache)
app.get('/products', cacheMiddleware('products'), async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();

    // Guardar en cache
    await redisClient.setEx(req.cacheKey, CACHE_TTL, JSON.stringify(products));

    res.json({
      source: 'database',
      data: products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /products/:id - Obtener producto por ID (con cache)
app.get('/products/:id', cacheMiddleware('product'), async (req, res) => {
  try {
    const product = await db.collection('products').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Guardar en cache
    await redisClient.setEx(req.cacheKey, CACHE_TTL, JSON.stringify(product));

    res.json({
      source: 'database',
      data: product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /products - Crear producto (invalida cache)
app.post('/products', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const result = await db.collection('products').insertOne({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      createdAt: new Date()
    });

    // Invalidar cache de lista de productos
    await redisClient.del('products:all');

    res.status(201).json({
      _id: result.insertedId,
      name,
      price,
      stock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /products/:id - Actualizar producto (invalida cache)
app.put('/products/:id', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, price: parseFloat(price), stock: parseInt(stock), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Invalidar cache del producto y lista
    await redisClient.del(`product:${req.params.id}`);
    await redisClient.del('products:all');

    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /products/:id - Eliminar producto (invalida cache)
app.delete('/products/:id', async (req, res) => {
  try {
    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Invalidar cache del producto y lista
    await redisClient.del(`product:${req.params.id}`);
    await redisClient.del('products:all');

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /cache/stats - Estadísticas de cache
app.get('/cache/stats', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    const stats = {
      totalKeys: keys.length,
      keys: keys
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /cache/clear - Limpiar todo el cache
app.delete('/cache/clear', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: 'Cache limpiado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const redisPing = await redisClient.ping();
    res.json({
      status: 'ok',
      mongodb: db ? 'connected' : 'disconnected',
      redis: redisPing === 'PONG' ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API con cache escuchando en http://localhost:${PORT}`);
});
```

### api/Dockerfile

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
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
```

**Buenas prácticas aplicadas (Clase 2):**

1. **Multi-stage build**: Imagen final solo contiene lo necesario para producción
2. **Non-root user**: Contenedor ejecuta como usuario `nodejs` (no root)
3. **npm install → npm ci**: Build stage genera package-lock.json con `npm install`, production usa `npm ci --omit=dev` (más rápido y reproducible)
4. **Cache cleaning**: Reduce tamaño final de la imagen
5. **HEALTHCHECK**: Permite a Docker monitorear el estado del servicio
6. **Variables de entorno**: Configuración explícita y documentada
7. **Permisos correctos**: Ownership apropiado para el usuario no-root

### api/.dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
```

## Paso 2: Datos de Inicialización

### mongo-init/init.js

```javascript
db = db.getSiblingDB('productsdb');

db.products.insertMany([
  {
    name: 'Laptop Dell XPS 15',
    price: 1299.99,
    stock: 10,
    createdAt: new Date()
  },
  {
    name: 'Mouse Logitech MX Master 3',
    price: 99.99,
    stock: 50,
    createdAt: new Date()
  },
  {
    name: 'Teclado Mecánico Keychron K2',
    price: 89.99,
    stock: 30,
    createdAt: new Date()
  },
  {
    name: 'Monitor LG UltraWide 34"',
    price: 499.99,
    stock: 15,
    createdAt: new Date()
  },
  {
    name: 'Webcam Logitech C920',
    price: 79.99,
    stock: 25,
    createdAt: new Date()
  }
]);

print('Productos de ejemplo insertados');
```

## Paso 3: Docker Compose

### docker-compose.yml

```yaml
services:
  api:
    build: ./api
    container_name: products-api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    networks:
      - app-network
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    container_name: products-mongo
    volumes:
      - mongo-data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: products-redis
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  mongo-data:

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
NAME             IMAGE           STATUS        PORTS
products-api     api             Up 5s         0.0.0.0:4000->4000/tcp
products-mongo   mongo:7         Up 6s         27017/tcp
products-redis   redis:7-alpine  Up 6s         0.0.0.0:6379->6379/tcp
```

### 3. Ver logs

```bash
docker compose logs -f api
```

**Salida esperada:**
```
products-api  | Conectado a MongoDB
products-api  | Conectado a Redis
products-api  | API con cache escuchando en http://localhost:4000
```

## Desglose del docker-compose.yml

| Componente | Descripción |
|------------|-------------|
| `services.api.depends_on` | Espera que `mongo` y `redis` estén listos |
| `services.redis.image` | Usa Redis 7 con Alpine (imagen ligera) |
| `services.redis.ports` | Expone Redis para debugging (opcional) |
| `networks.app-network` | Todos los servicios en misma red custom |

## Probar el Cache

### 1. Health check

```bash
curl http://localhost:4000/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "redis": "connected"
}
```

### 2. Primera consulta (Cache MISS - va a DB)

```bash
curl http://localhost:4000/products
```

**Respuesta:**
```json
{
  "source": "database",
  "data": [...]
}
```

**Logs del API:**
```
Cache MISS: products:all
```

### 3. Segunda consulta (Cache HIT - viene de Redis)

```bash
curl http://localhost:4000/products
```

**Respuesta:**
```json
{
  "source": "cache",
  "data": [...]
}
```

**Logs del API:**
```
Cache HIT: products:all
```

### 4. Ver estadísticas de cache

```bash
curl http://localhost:4000/cache/stats
```

**Respuesta:**
```json
{
  "totalKeys": 1,
  "keys": ["products:all"]
}
```

### 5. Crear producto (invalida cache)

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Audífonos Sony WH-1000XM5",
    "price": 349.99,
    "stock": 20
  }'
```

### 6. Verificar cache invalidado

```bash
curl http://localhost:4000/cache/stats
```

**Respuesta:**
```json
{
  "totalKeys": 0,
  "keys": []
}
```

### 7. Limpiar todo el cache

```bash
curl -X DELETE http://localhost:4000/cache/clear
```

## Medir Mejora de Rendimiento

### Script de prueba

```bash
#!/bin/bash

echo "=== Primera consulta (sin cache) ==="
time curl -s http://localhost:4000/products > /dev/null

echo -e "\n=== Segunda consulta (con cache) ==="
time curl -s http://localhost:4000/products > /dev/null

echo -e "\n=== Tercera consulta (con cache) ==="
time curl -s http://localhost:4000/products > /dev/null
```

**Resultado esperado:**
```
=== Primera consulta (sin cache) ===
real    0m0.045s   # Consulta a MongoDB

=== Segunda consulta (con cache) ===
real    0m0.008s   # Mucho más rápido desde Redis

=== Tercera consulta (con cache) ===
real    0m0.007s   # Consistentemente rápido
```

## Explicación Detallada

### Estrategia de Cache

1. **Cache-Aside Pattern**: La aplicación verifica cache antes de consultar DB
2. **TTL (Time To Live)**: Datos expiran después de 60 segundos
3. **Cache Invalidation**: Se borra cache al modificar/crear/eliminar datos

### Flujo de Lectura

```
GET /products
    │
    ├─► Redis: ¿Existe 'products:all'?
    │       │
    │       ├─► SÍ (Cache HIT)  → Retorna datos de Redis
    │       │
    │       └─► NO (Cache MISS) → Consulta MongoDB
    │                              │
    │                              └─► Guarda en Redis (60s TTL)
    │                                  └─► Retorna datos
```

### Flujo de Escritura

```
POST/PUT/DELETE /products
    │
    ├─► Actualiza MongoDB
    │
    └─► Invalida cache en Redis
        └─► Próxima lectura será Cache MISS (datos frescos)
```

## Conceptos Aprendidos

- Implementación de cache con Redis
- Cache-Aside pattern
- Invalidación de cache al modificar datos
- TTL (Time To Live) para expiración automática
- Medición de mejora de rendimiento
- Gestión de múltiples servicios con `depends_on`
- Estrategias de caching en microservicios

## Troubleshooting

### Error: "Redis connection refused"

**Solución**: Verificar que Redis esté corriendo
```bash
docker compose ps redis
docker compose logs redis
```

### Cache no se invalida

**Solución**: Revisar que las operaciones de escritura llamen a `redisClient.del()`

### TTL muy corto/largo

**Ajustar en server.js**:
```javascript
const CACHE_TTL = 300; // 5 minutos
```

## Desafío Final

Implementa:

1. **Cache selectivo**: Cachear solo productos con stock > 10
2. **Múltiples TTL**: Productos populares con TTL más largo
3. **Cache warming**: Pre-cargar cache al iniciar la app
4. **Métricas**: Contador de cache hits vs misses

## Cleanup

```bash
docker compose down
docker compose down -v  # También elimina volúmenes
```

## Recursos Adicionales

- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Caching Strategies](https://redis.io/docs/manual/patterns/caching/)
- [Redis Data Types](https://redis.io/docs/data-types/)
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
