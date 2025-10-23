# 02: Anatomía de docker-compose.yml

**Objetivo:** Entender la estructura y sintaxis de un archivo docker-compose.yml

---

## Estructura General

Un archivo docker-compose.yml tiene **3 secciones principales**:

```yaml
services:      # Contenedores que forman tu aplicación
  # ...

networks:      # Redes personalizadas (opcional)
  # ...

volumes:       # Volúmenes nombrados (opcional)
  # ...
```

---

## Archivo Completo Comentado

Vamos a diseccionar un docker-compose.yml completo línea por línea:

```yaml
# ============================================
# SECCIÓN 1: SERVICIOS (contenedores)
# ============================================
services:

  # Servicio 1: Aplicación web
  web:
    # Construir desde Dockerfile
    build:
      context: ./app              # Directorio con Dockerfile
      dockerfile: Dockerfile      # Nombre del Dockerfile (opcional si es "Dockerfile")
      args:                       # Build arguments
        - NODE_ENV=production

    # O usar imagen existente (alternativa a build)
    # image: nginx:alpine

    # Nombre específico del contenedor (opcional)
    container_name: mi-web

    # Mapeo de puertos (host:contenedor)
    ports:
      - "3000:3000"               # Puerto único
      - "8080-8085:8080-8085"     # Rango de puertos

    # Variables de entorno
    environment:
      - NODE_ENV=production       # Formato KEY=VALUE
      - DEBUG=true
      - DATABASE_URL=postgresql://db:5432/mydb

    # O cargar desde archivo
    env_file:
      - .env                      # Variables desde archivo
      - .env.production

    # Volúmenes
    volumes:
      - ./app:/usr/src/app        # Bind mount (desarrollo)
      - app-data:/data            # Named volume
      - /usr/src/app/node_modules # Anonymous volume

    # Redes a las que pertenece
    networks:
      - frontend-net
      - backend-net

    # Dependencias (orden de inicio)
    depends_on:
      - db
      - cache

    # Política de reinicio
    restart: unless-stopped       # Opciones: no, always, on-failure, unless-stopped

    # Override del CMD del Dockerfile
    command: npm start

    # Trabajar en modo interactivo (equivalente a -it)
    stdin_open: true
    tty: true

    # Healthcheck
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # Límites de recursos
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M

  # Servicio 2: Base de datos
  db:
    image: postgres:15-alpine
    container_name: postgres-db

    environment:
      - POSTGRES_USER=curso
      - POSTGRES_PASSWORD=secret123
      - POSTGRES_DB=mydb

    ports:
      - "5432:5432"

    volumes:
      - postgres-data:/var/lib/postgresql/data   # Datos persistentes
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Script de inicialización

    networks:
      - backend-net

    restart: always

  # Servicio 3: Cache
  cache:
    image: redis:7-alpine
    container_name: redis-cache

    ports:
      - "6379:6379"

    networks:
      - backend-net

    restart: always

# ============================================
# SECCIÓN 2: REDES
# ============================================
networks:

  # Red para frontend
  frontend-net:
    driver: bridge                # Tipo de red
    name: proyecto-frontend       # Nombre personalizado (opcional)

  # Red para backend
  backend-net:
    driver: bridge
    name: proyecto-backend
    ipam:                         # Configuración de IPs
      config:
        - subnet: 172.28.0.0/16   # Subred personalizada

# ============================================
# SECCIÓN 3: VOLÚMENES
# ============================================
volumes:

  # Volumen para datos de la app
  app-data:
    driver: local                 # Driver (por defecto: local)
    name: mi-app-data             # Nombre personalizado

  # Volumen para PostgreSQL
  postgres-data:
    driver: local
    name: mi-postgres-data
```

---

## Sintaxis YAML Básica

### Indentación

```yaml
# CORRECTO: 2 espacios
services:
  web:
    image: nginx

# INCORRECTO: tabs o 4 espacios
services:
    web:              # 4 espacios (inconsistente)
	image: nginx      # tab (error)
```

**Regla:** Siempre usar **2 espacios** para indentación.

### Listas

```yaml
# Formato compacto
ports:
  - "3000:3000"
  - "8080:8080"

# Formato extendido (equivalente)
ports:
  - "3000:3000"
  - "8080:8080"
```

### Mapas (Diccionarios)

```yaml
# Estilo de flujo
environment: {NODE_ENV: production, DEBUG: true}

# Estilo de bloque (recomendado, más legible)
environment:
  NODE_ENV: production
  DEBUG: true

# Estilo de lista (también válido)
environment:
  - NODE_ENV=production
  - DEBUG=true
```

---

## Campos Más Comunes por Servicio

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `image` | Imagen a usar | `nginx:alpine` |
| `build` | Construir desde Dockerfile | `./app` o `{context: ./app}` |
| `container_name` | Nombre del contenedor | `mi-web` |
| `ports` | Mapeo de puertos | `"8080:80"` |
| `environment` | Variables de entorno | `NODE_ENV=production` |
| `volumes` | Volúmenes y bind mounts | `./app:/app` |
| `networks` | Redes a conectar | `frontend-net` |
| `depends_on` | Dependencias de inicio | `[db, cache]` |
| `restart` | Política de reinicio | `always` |
| `command` | Override del CMD | `npm start` |

---

## Ejemplo Mínimo Funcional

El docker-compose.yml más simple posible:

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
```

**Esto es suficiente para:**
- Levantar nginx
- Publicar en puerto 8080
- Docker Compose crea red automática

---

## Validación de Sintaxis

```bash
# Verificar sintaxis sin ejecutar
docker compose config

# Ver configuración procesada con valores por defecto
docker compose config --services

# Ver solo servicios
docker compose config --services

# Ver solo volúmenes
docker compose config --volumes
```

---

## Orden de Precedencia (Override)

Docker Compose permite múltiples archivos. El orden de precedencia es:

```bash
# Archivos por defecto (en orden)
1. docker-compose.yml
2. docker-compose.override.yml

# Archivos específicos
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

**Ejemplo:**

**docker-compose.yml** (base):
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
```

**docker-compose.override.yml** (desarrollo):
```yaml
services:
  web:
    volumes:
      - ./src:/usr/share/nginx/html
    environment:
      - DEBUG=true
```

**Resultado final:**
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./src:/usr/share/nginx/html
    environment:
      - DEBUG=true
```

---

## Variables de Entorno en Compose

Puedes usar variables en el archivo docker-compose.yml:

**Archivo .env:**
```bash
POSTGRES_VERSION=15
DB_PASSWORD=secret123
API_PORT=3000
```

**docker-compose.yml:**
```yaml
services:
  db:
    image: postgres:${POSTGRES_VERSION}-alpine
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  api:
    build: ./api
    ports:
      - "${API_PORT}:3000"
```

**Resultado:** Docker Compose sustituye las variables automáticamente.

---

## Errores Comunes

### 1. Indentación incorrecta

```yaml
# INCORRECTO
services:
web:
  image: nginx
```

**Error:** `web` debe estar indentado 2 espacios.

### 2. Mezclar tabs y espacios

```yaml
# INCORRECTO
services:
  web:
	image: nginx    # tab usado aquí
```

**Error:** Solo usar espacios, nunca tabs.

### 3. Olvidar comillas en puertos

```yaml
# ADVERTENCIA: PUEDE CAUSAR PROBLEMAS
ports:
  - 8080:80       # YAML interpreta como 8080 en base 60

# CORRECTO
ports:
  - "8080:80"     # Siempre usar comillas
```

### 4. Volumen sin named volume declarado

```yaml
services:
  db:
    volumes:
      - postgres-data:/var/lib/postgresql/data

# FALTA: Declarar el volumen
```

**Corrección:**
```yaml
volumes:
  postgres-data:    # Declaración necesaria
```

---

## Ejemplo Práctico

**Crear archivo docker-compose.yml mínimo:**

```bash
# Crear archivo
cat > docker-compose.yml <<EOF
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
EOF

# Validar sintaxis
docker compose config

# Levantar
docker compose up -d

# Verificar
curl http://localhost:8080

# Ver logs
docker compose logs

# Detener y limpiar
docker compose down
```

---

## Conceptos Aprendidos

- docker-compose.yml tiene 3 secciones: `services`, `networks`, `volumes`
- YAML usa indentación de 2 espacios (nunca tabs)
- Cada servicio es un contenedor
- Puertos deben ir entre comillas: `"8080:80"`
- `depends_on` controla orden de inicio (no espera que estén listos)
- `docker compose config` valida sintaxis
- Variables de entorno pueden cargarse desde `.env`
- Los volúmenes nombrados deben declararse en la sección `volumes`

---

## Relación con los Labs

En los laboratorios verás estos conceptos en acción:
- **Lab 01:** Compose básico (mínimo)
- **Lab 02:** Múltiples redes
- **Lab 03:** Volúmenes nombrados
- **Lab 04:** Todo integrado (build, networks, volumes)

---

## Siguiente Paso

¡Ahora estás listo para los labs!

[Ir a Lab 01: Docker Compose Básico →](../../labs/01-compose-basico/)

---

[← Volver a Fundamentos](../README.md)
