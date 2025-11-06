# Tarea 4 - Microservicios con Cache y Gateway

## Objetivo

Construir una aplicación de microservicios que integre:
- Múltiples servicios backend
- Redis como cache
- Nginx como API Gateway
- Persistencia de datos

## Parte 1: Diseño de la Arquitectura

### Opción A: Sistema de Blog (Más Simple)

**Stack mínimo:**
- **Frontend**: HTML estático con Nginx
- **API Posts**: Node.js/Python con endpoints de posts
- **Redis**: Cache de posts populares
- **MongoDB/PostgreSQL**: Persistencia de posts
- **Gateway**: Nginx distribuyendo `/api/posts` al backend

**Endpoints mínimos:**
- `GET /api/posts` - Listar posts (con cache)
- `GET /api/posts/:id` - Ver post (con cache)
- `POST /api/posts` - Crear post (invalida cache)

### Opción B: Sistema de E-commerce Básico (Intermedio)

**Stack:**
- **Frontend**: HTML + JavaScript
- **API Products**: Backend de productos
- **API Cart**: Backend de carrito
- **Redis**: Cache de productos
- **MongoDB/PostgreSQL**: Base de datos
- **Gateway**: Nginx distribuyendo entre servicios

**Endpoints mínimos:**
- `GET /api/products` - Listar productos (con cache)
- `POST /api/cart/add` - Agregar al carrito
- `GET /api/cart` - Ver carrito

### Opción C: Tu Propia Idea

Debe incluir mínimo:
- 2 servicios backend diferentes
- 1 base de datos
- Redis para cache
- Nginx como gateway
- Frontend básico

## Parte 2: Implementación

Debes crear un repositorio con la siguiente estructura:

```
mi-microservicios/
├── docker-compose.yml
├── gateway/
│   └── nginx.conf
├── service1/
│   ├── Dockerfile
│   ├── package.json (o requirements.txt)
│   └── server.js (o main.py)
├── service2/ (opcional)
│   └── ...
├── frontend/
│   ├── Dockerfile
│   └── index.html
└── README.md
```

## Parte 3: Requisitos Técnicos

**Docker Compose debe incluir:**
- Mínimo 4 servicios: gateway, backend(s), redis, database
- Named volumes para persistencia de datos
- Custom network con DNS automático
- Variables de entorno donde sea necesario
- Configuración de depends_on correcta

**Backend debe implementar:**
- Mínimo 3 endpoints
- Integración con Redis para cache
- Conexión a base de datos
- Cache invalidation al modificar datos
- Health check endpoint

**Gateway (Nginx) debe:**
- Rutear `/api/*` a backend
- Rutear `/` a frontend
- Tener endpoint `/gateway/health`

**Frontend debe:**
- Mostrar datos del backend
- Permitir realizar operaciones CRUD
- Consumir API a través del gateway (puerto 8080)

## Parte 4: Documentación en README.md

Tu README.md debe incluir:

### 1. Título y Descripción
- Nombre del proyecto
- Descripción breve de qué hace
- Tecnologías utilizadas

### 2. Arquitectura
```
Diagrama ASCII mostrando:
- Cliente
- Gateway (Nginx)
- Servicios backend
- Redis
- Base de datos
- Redes Docker
```

### 3. Servicios

Tabla describiendo cada servicio:

| Servicio | Tecnología | Puerto | Descripción |
|----------|------------|--------|-------------|
| gateway | Nginx | 8080 | API Gateway |
| backend | Node.js | 5000 | API principal |
| redis | Redis | 6379 | Cache |
| db | MongoDB | 27017 | Base de datos |
| frontend | Nginx | 80 | Interfaz web |

### 4. Instrucciones de Uso

```bash
# Clonar repositorio
git clone <tu-repo>

# Levantar servicios
docker compose up -d

# Verificar estado
docker compose ps

# Ver logs
docker compose logs -f

# Acceder a la aplicación
http://localhost:8080
```

### 5. Endpoints de la API

Documenta cada endpoint con:
- Método HTTP
- Ruta
- Descripción
- Ejemplo de request/response

Ejemplo:
```
GET /api/posts
Descripción: Lista todos los posts
Response: { "source": "cache|database", "data": [...] }
```

### 6. Capturas de Pantalla

Incluye mínimo:
- Frontend funcionando
- Resultado de `docker compose ps`
- Logs mostrando conexión a Redis y DB
- Respuesta de API con `"source": "cache"`
- Respuesta de API con `"source": "database"`

## Parte 5: Pruebas a Realizar

Documenta los resultados de:

### 1. Cache Hit/Miss
```bash
# Primera consulta (cache MISS)
curl http://localhost:8080/api/posts

# Segunda consulta (cache HIT)
curl http://localhost:8080/api/posts
```

Captura los logs mostrando "Cache MISS" y "Cache HIT"

### 2. Invalidación de Cache
```bash
# Crear nuevo post
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"..."}'

# Verificar que cache se invalidó
curl http://localhost:8080/api/posts
```

### 3. Persistencia de Datos
```bash
# Crear datos
curl -X POST ...

# Detener servicios
docker compose down

# Levantar de nuevo
docker compose up -d

# Verificar que datos persisten
curl http://localhost:8080/api/posts
```

### 4. Gateway Routing
```bash
# Verificar que gateway rutea correctamente
curl http://localhost:8080/gateway/health
curl http://localhost:8080/api/health
curl http://localhost:8080/  # Debe mostrar frontend
```

## Parte 6: Criterios de Evaluación

**Docker Compose (25%)**
- Configuración correcta de servicios
- Uso de named volumes
- Custom network
- depends_on apropiado

**Backend con Cache (25%)**
- Implementación de cache con Redis
- Cache invalidation funcional
- Conexión a base de datos
- Endpoints funcionales

**API Gateway (20%)**
- Nginx configurado correctamente
- Routing funcionando
- Headers de proxy configurados

**Documentación (20%)**
- README completo y claro
- Arquitectura documentada
- Instrucciones detalladas
- Capturas de pantalla

**Funcionalidad (10%)**
- Aplicación funciona end-to-end
- Cache mejora rendimiento
- Datos persisten

## Parte 7: Entrega

### Formato de Entrega

1. Repositorio público en GitHub o GitLab
2. Nombre del repositorio: `docker-microservicios-clase4`
3. README.md completo en la raíz
4. Código limpio y organizado
5. docker-compose.yml funcional
6. Incluir archivo `.gitignore` para `node_modules`, `__pycache__`, etc.

### Contenido Mínimo del Repositorio

- docker-compose.yml
- Directorios de cada servicio con sus Dockerfiles
- nginx.conf para el gateway
- README.md con toda la documentación
- Capturas de pantalla en carpeta `docs/screenshots/`

### Cómo Entregar

1. Sube tu repositorio a GitHub/GitLab
2. Verifica que sea público
3. Copia la URL del repositorio
4. Entrega la URL en Moodle antes de la próxima clase

### Antes de Entregar, Verifica

- `docker compose up -d` levanta todos los servicios sin errores
- Puedes acceder al frontend en http://localhost:8080
- Las APIs responden correctamente
- El cache funciona (se ve en los logs)
- Los datos persisten después de `docker compose down && docker compose up -d`
- README.md incluye todas las secciones solicitadas
- Capturas de pantalla están incluidas

## Recursos Adicionales

- [Labs de la clase 4](../labs/)
- [Cheatsheet de la clase 4](../cheatsheet.md)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Nginx Proxy Configuration](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/caching/)

## Ayuda y Dudas

Si tienes dudas:
1. Revisa los labs de la clase
2. Consulta la documentación oficial
3. Pregunta en el foro de Moodle
4. Asiste a horarios de consulta

## Fecha de Entrega

**Antes de la Clase 5**

Consulta la fecha exacta en Moodle.
