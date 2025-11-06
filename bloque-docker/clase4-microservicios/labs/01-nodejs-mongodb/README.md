# Lab 01: Node.js + MongoDB - API REST con Base de Datos

## Objetivo

Construir una aplicación full-stack con Node.js y MongoDB usando Docker Compose, implementando una API REST completa con operaciones CRUD.

## Arquitectura

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack            │
│                                         │
│  ┌─────────────┐      ┌──────────────┐ │
│  │   Node.js   │◄────►│   MongoDB    │ │
│  │   Express   │      │   Database   │ │
│  │  (API REST) │      │              │ │
│  │  Port: 3000 │      │  Port: 27017 │ │
│  └─────────────┘      └──────────────┘ │
│         │                     │         │
│         │              ┌──────▼──────┐  │
│         │              │ mongo-data  │  │
│         │              │  (volume)   │  │
│         │              └─────────────┘  │
│         │                               │
│  ┌──────▼───────────────────────────┐   │
│  │      app-network (custom)        │   │
│  │      DNS automático habilitado   │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Estructura del Proyecto

```
01-nodejs-mongodb/
├── docker-compose.yml
├── app/
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

## Paso 1: Crear la Aplicación Node.js

### app/package.json

```json
{
  "name": "tasks-api",
  "version": "1.0.0",
  "description": "REST API de tareas con Node.js y MongoDB",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "author": "alefiengo",
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^6.3.0"
  }
}
```

### app/server.js

```javascript
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;
const MONGO_URL = 'mongodb://mongo:27017';
const DB_NAME = 'tasksdb';

app.use(express.json());

let db;

// Conectar a MongoDB
MongoClient.connect(MONGO_URL)
  .then(client => {
    console.log('Conectado a MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(error => console.error('Error conectando a MongoDB:', error));

// GET /tasks - Listar todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await db.collection('tasks').find().toArray();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/:id - Obtener una tarea por ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id)
    });
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks - Crear nueva tarea
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const result = await db.collection('tasks').insertOne({
      title,
      description: description || '',
      completed: completed || false,
      createdAt: new Date()
    });
    res.status(201).json({
      _id: result.insertedId,
      title,
      description,
      completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /tasks/:id - Actualizar tarea
app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, description, completed, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /tasks/:id - Eliminar tarea
app.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: db ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
```

### app/Dockerfile

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
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
```

**Buenas prácticas aplicadas (Clase 2):**

1. **Multi-stage build**: Separamos build y production para imagen más pequeña
2. **Non-root user**: Ejecutamos como usuario `nodejs` (UID 1001) por seguridad
3. **npm install → npm ci**: En build usamos `npm install` (genera package-lock.json), en production usamos `npm ci --omit=dev` (más rápido y determinístico)
4. **Cache cleaning**: `npm cache clean --force` reduce tamaño de imagen
5. **HEALTHCHECK**: Docker puede verificar si el contenedor está saludable
6. **ENV explícitas**: Variables de entorno documentadas
7. **Ownership correcto**: `chown` asegura permisos correctos para usuario nodejs

### app/.dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
```

## Paso 2: Script de Inicialización de MongoDB

### mongo-init/init.js

```javascript
db = db.getSiblingDB('tasksdb');

db.tasks.insertMany([
  {
    title: 'Aprender Docker Compose',
    description: 'Completar los labs de la clase 4',
    completed: false,
    createdAt: new Date()
  },
  {
    title: 'Configurar MongoDB',
    description: 'Entender volúmenes y persistencia',
    completed: true,
    createdAt: new Date()
  },
  {
    title: 'Crear API REST',
    description: 'Implementar CRUD completo con Node.js',
    completed: false,
    createdAt: new Date()
  }
]);

print('Base de datos inicializada con datos de ejemplo');
```

## Paso 3: Docker Compose

### docker-compose.yml

```yaml
services:
  api:
    build: ./app
    container_name: tasks-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    networks:
      - app-network
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    container_name: tasks-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
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
docker compose up -d
```

**Salida esperada:**
```
[+] Running 4/4
 ✔ Network 01-nodejs-mongodb_app-network    Created
 ✔ Volume "01-nodejs-mongodb_mongo-data"    Created
 ✔ Container tasks-mongo                    Started
 ✔ Container tasks-api                      Started
```

### 2. Verificar servicios corriendo

```bash
docker compose ps
```

**Salida esperada:**
```
NAME          IMAGE        COMMAND                  STATUS        PORTS
tasks-api     app          "docker-entrypoint..."   Up 10s        0.0.0.0:3000->3000/tcp
tasks-mongo   mongo:7      "docker-entrypoint..."   Up 11s        0.0.0.0:27017->27017/tcp
```

### 3. Ver logs de la API

```bash
docker compose logs -f api
```

**Salida esperada:**
```
tasks-api  | Conectado a MongoDB
tasks-api  | API escuchando en http://localhost:3000
```

## Desglose del docker-compose.yml

| Componente | Descripción |
|------------|-------------|
| `services.api.build` | Construye imagen desde `./app/Dockerfile` |
| `services.api.ports` | Expone puerto 3000 del container al host |
| `services.api.depends_on` | Inicia `mongo` antes que `api` |
| `services.api.networks` | Conecta a red custom con DNS |
| `services.mongo.image` | Usa imagen oficial de MongoDB v7 |
| `services.mongo.volumes[0]` | Named volume para persistencia de datos |
| `services.mongo.volumes[1]` | Bind mount para script de inicialización |
| `volumes.mongo-data` | Declaración de named volume |
| `networks.app-network` | Red bridge custom con DNS automático |

## Probar la API

### 1. Health check

```bash
curl http://localhost:3000/health
```

**Respuesta:**
```json
{"status":"ok","mongodb":"connected"}
```

### 2. Listar todas las tareas

```bash
curl http://localhost:3000/tasks
```

**Respuesta:**
```json
[
  {
    "_id": "...",
    "title": "Aprender Docker Compose",
    "description": "Completar los labs de la clase 4",
    "completed": false,
    "createdAt": "2025-10-07T..."
  },
  ...
]
```

### 3. Crear nueva tarea

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar cache con Redis",
    "description": "Optimizar rendimiento de la API",
    "completed": false
  }'
```

**Respuesta:**
```json
{
  "_id": "...",
  "title": "Implementar cache con Redis",
  "description": "Optimizar rendimiento de la API",
  "completed": false
}
```

### 4. Actualizar tarea

```bash
curl -X PUT http://localhost:3000/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar cache con Redis",
    "description": "Optimizar rendimiento de la API",
    "completed": true
  }'
```

### 5. Eliminar tarea

```bash
curl -X DELETE http://localhost:3000/tasks/<TASK_ID>
```

## Verificar Persistencia de Datos

### 1. Detener servicios

```bash
docker compose down
```

### 2. Verificar que el volumen persiste

```bash
docker volume ls | grep mongo-data
```

### 3. Volver a levantar

```bash
docker compose up -d
```

### 4. Verificar datos

```bash
curl http://localhost:3000/tasks
```

Los datos creados anteriormente deben seguir ahí.

## Explicación Detallada

### Comunicación entre Servicios

1. **DNS interno**: El servicio `api` se conecta a MongoDB usando `mongodb://mongo:27017`
2. **Red custom**: `app-network` provee resolución de nombres automática
3. **Orden de inicio**: `depends_on` asegura que MongoDB esté listo antes de la API

### Persistencia de Datos

1. **Named volume**: `mongo-data` almacena datos de MongoDB
2. **Ubicación**: `/var/lib/docker/volumes/01-nodejs-mongodb_mongo-data`
3. **Independencia**: Sobrevive a `docker compose down`

### Inicialización de Base de Datos

1. **Script de init**: `mongo-init/init.js` se ejecuta al crear el container
2. **Mount point**: `/docker-entrypoint-initdb.d/`
3. **Ejecución única**: Solo se ejecuta si la DB no existe

## Conceptos Aprendidos

- Construcción de API REST con Node.js y Express
- Conexión entre servicios usando DNS de Docker
- Persistencia de datos con MongoDB y named volumes
- Inicialización automática de bases de datos
- Operaciones CRUD completas
- Uso de `depends_on` para orden de inicio
- Health checks para verificar estado de servicios

## Troubleshooting

### Error: "MongoNetworkError: failed to connect"

**Causa**: El servicio API inicia antes que MongoDB esté listo.

**Solución 1**: Agregar healthcheck a MongoDB
```yaml
mongo:
  healthcheck:
    test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
    interval: 10s
    timeout: 5s
    retries: 5
```

**Solución 2**: Implementar retry logic en Node.js

### Error: "Cannot find module 'express'"

**Causa**: Dependencias no instaladas.

**Solución**: Reconstruir la imagen
```bash
docker compose build --no-cache
docker compose up -d
```

### Los datos no persisten

**Causa**: El volumen se eliminó con `docker compose down -v`.

**Solución**: Nunca usar `-v` a menos que quieras borrar datos
```bash
docker compose down  # Sin -v
```

## Desafío Final

Extiende la API para incluir:

1. **Usuarios**: Agregar colección `users` con autenticación básica
2. **Categorías**: Permitir categorizar tareas
3. **Búsqueda**: Endpoint para buscar tareas por título
4. **Paginación**: Limitar resultados y agregar paginación

## Cleanup

```bash
# Detener y eliminar containers y redes
docker compose down

# También eliminar volumen (perderás los datos)
docker compose down -v
```

## Recursos Adicionales

- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Express.js Documentation](https://expressjs.com/)
- [Docker Compose depends_on](https://docs.docker.com/compose/compose-file/05-services/#depends_on)
- [MongoDB Docker Official Image](https://hub.docker.com/_/mongo)
