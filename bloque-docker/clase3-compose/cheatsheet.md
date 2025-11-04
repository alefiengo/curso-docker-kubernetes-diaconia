# Cheatsheet - Clase 3: Docker Compose, Redes y Volúmenes

## Comandos Docker Compose

### Gestión de Servicios

```bash
# Levantar servicios
docker compose up                    # Foreground (ver logs en consola)
docker compose up -d                 # Detached (segundo plano)
docker compose up --build            # Rebuild de imágenes antes de levantar
docker compose up -d --force-recreate  # Forzar recreación de contenedores

# Detener servicios
docker compose stop                  # Detener sin eliminar contenedores
docker compose start                 # Iniciar servicios detenidos
docker compose restart               # Reiniciar servicios
docker compose restart app           # Reiniciar servicio específico

# Eliminar servicios
docker compose down                  # Detener y eliminar contenedores y redes
docker compose down -v               # También eliminar volúmenes (¡CUIDADO!)
docker compose down --rmi all        # También eliminar imágenes
```

### Inspección y Logs

```bash
# Ver estado de servicios
docker compose ps                    # Servicios activos
docker compose ps -a                 # Todos los servicios
docker compose top                   # Procesos corriendo en cada servicio

# Logs
docker compose logs                  # Logs de todos los servicios
docker compose logs app              # Logs de servicio específico
docker compose logs -f               # Seguir logs en tiempo real
docker compose logs -f --tail 100    # Últimas 100 líneas en tiempo real
docker compose logs --since 5m       # Logs de los últimos 5 minutos
```

### Ejecutar Comandos

```bash
# Ejecutar comando en servicio corriendo
docker compose exec app sh           # Shell interactivo
docker compose exec app ls -la       # Comando específico
docker compose exec db psql -U postgres  # Cliente PostgreSQL

# Ejecutar comando one-off (crea contenedor temporal)
docker compose run app npm install   # Instalar dependencias
docker compose run --rm app node script.js  # Ejecutar y eliminar
```

### Construcción y Configuración

```bash
# Build
docker compose build                 # Construir todas las imágenes
docker compose build app             # Construir imagen específica
docker compose build --no-cache      # Build sin cache

# Validar configuración
docker compose config                # Ver configuración procesada
docker compose config --services     # Listar servicios definidos
docker compose config --volumes      # Listar volúmenes definidos
```

### Escalado

```bash
# Escalar servicios
docker compose up -d --scale app=3   # Levantar 3 instancias del servicio app
```

---

## Anatomía del docker-compose.yml

### Estructura Básica

```yaml
services:
  app:
    build: ./app                     # Build desde Dockerfile
    image: nginx:alpine              # O usar imagen existente
    container_name: mi-app           # Nombre específico (opcional)
    ports:
      - "3000:3000"                  # Puerto host:contenedor
    environment:
      - NODE_ENV=production          # Variables de entorno
    env_file:
      - .env                         # Archivo de variables
    depends_on:
      - db                           # Dependencias de inicio
    networks:
      - app-network                  # Redes a las que pertenece
    volumes:
      - ./app:/usr/src/app           # Bind mount
      - app-data:/data               # Named volume
    restart: unless-stopped          # Política de reinicio
    command: npm start               # Override del CMD del Dockerfile

volumes:
  app-data:                          # Named volume
    driver: local

networks:
  app-network:                       # Red custom
    driver: bridge
```

---

## Redes (Networks)

### Comandos de Redes

```bash
# Listar redes
docker network ls

# Inspeccionar red
docker network inspect nombre-red
docker network inspect 02-redes_backend-net

# Crear red manualmente
docker network create mi-red

# Eliminar red
docker network rm mi-red

# Limpiar redes no usadas
docker network prune
```

### Tipos de Configuración

```yaml
# Red por defecto (Compose crea automáticamente)
services:
  app:
    image: nginx

# Red custom simple
services:
  app:
    networks:
      - frontend
networks:
  frontend:

# Múltiples redes (segmentación)
services:
  web:
    networks: [frontend]
  backend:
    networks: [frontend, database]
  db:
    networks: [database]
networks:
  frontend:
  database:
```

### Comunicación entre Servicios

```bash
# Desde un contenedor, hacer ping a otro servicio
docker compose exec app ping db

# Conectarse usando nombre de servicio como hostname
# En código Node.js:
mongoose.connect('mongodb://db:27017/mydb')

# En código Python:
engine = create_engine('postgresql://user:pass@db:5432/mydb')
```

---

## Volúmenes (Volumes)

### Comandos de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect nombre-volumen
docker volume inspect 03-volumenes_postgres-data

# Crear volumen manualmente
docker volume create mi-volumen

# Eliminar volumen
docker volume rm mi-volumen

# Limpiar volúmenes no usados
docker volume prune

# Ver ubicación física del volumen
docker volume inspect mi-volumen | grep Mountpoint
```

### Tipos de Volúmenes

```yaml
services:
  app:
    volumes:
      # Named volume (gestionado por Docker)
      - postgres-data:/var/lib/postgresql/data

      # Bind mount (directorio del host)
      - ./app:/usr/src/app

      # Bind mount de archivo específico
      - ./nginx.conf:/etc/nginx/nginx.conf

      # Anonymous volume
      - /usr/src/app/node_modules

volumes:
  postgres-data:  # Definir named volume
```

### Persistencia

```bash
# Detener SIN eliminar volúmenes
docker compose down

# Detener Y eliminar volúmenes
docker compose down -v

# Backup de volumen
docker run --rm \
  -v mi-volumen:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data

# Restaurar volumen
docker run --rm \
  -v mi-volumen:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /
```

---

## Variables de Entorno

### En docker-compose.yml

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
```

### Archivo .env

Crear archivo `.env` en el mismo directorio que `docker-compose.yml`:

```env
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
SECRET_KEY=mi-secreto
```

```yaml
services:
  app:
    env_file:
      - .env
```

### Variables de Compose

```yaml
services:
  app:
    image: ${REGISTRY}/myapp:${TAG}
```

Luego:
```bash
REGISTRY=myregistry.io TAG=1.0.0 docker compose up
```

---

## Buenas Prácticas

### Orden de Inicio

```yaml
services:
  app:
    depends_on:
      - db
      - cache
```

**Nota**: `depends_on` solo garantiza orden de inicio, no espera a que el servicio esté "listo".

### Health Checks

```yaml
services:
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Restart Policies

```yaml
services:
  app:
    restart: always          # Siempre reiniciar
    restart: unless-stopped  # Reiniciar a menos que se detenga manualmente
    restart: on-failure      # Solo si falla
    restart: no              # Nunca reiniciar (por defecto)
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## Troubleshooting

### Ver configuración procesada

```bash
docker compose config
```

### Recrear servicios desde cero

```bash
docker compose down -v
docker compose up --build --force-recreate
```

### Ver qué puertos están en uso

```bash
docker compose ps
netstat -tuln | grep LISTEN
```

### Verificar conectividad entre servicios

```bash
docker compose exec app ping db
docker compose exec app nslookup db
```

### Ver logs de error

```bash
docker compose logs app | grep -i error
docker compose logs --tail 50 app
```

### Eliminar todo (reset completo)

```bash
docker compose down -v --rmi all --remove-orphans
```

---

## Workflow Completo

### Desarrollo

```bash
# 1. Crear docker-compose.yml
vim docker-compose.yml

# 2. Levantar servicios
docker compose up -d

# 3. Ver logs
docker compose logs -f

# 4. Hacer cambios en código (con bind mount, se reflejan automáticamente)

# 5. Reiniciar servicio si es necesario
docker compose restart app

# 6. Detener al terminar
docker compose down
```

### Producción

```bash
# 1. Build de imágenes
docker compose build

# 2. Levantar con restart policy
docker compose up -d

# 3. Monitorear
docker compose ps
docker compose logs -f

# 4. Backup de volúmenes (según necesidad)

# 5. Actualizaciones
docker compose pull
docker compose up -d --force-recreate
```

---

## Ejemplos Rápidos

### Stack Web Completo

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
  backend:
    build: ./backend
    environment:
      - DB_URL=postgresql://db:5432
    depends_on: [db, cache]
  db:
    image: postgres:15
    volumes: [db-data:/var/lib/postgresql/data]
  cache:
    image: redis:alpine
volumes:
  db-data:
```

### Stack de Monitoreo

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes: [./prometheus.yml:/etc/prometheus/prometheus.yml]
  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]
    depends_on: [prometheus]
```

---

## Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Networking in Compose](https://docs.docker.com/compose/networking/)
- [Volumes in Compose](https://docs.docker.com/compose/compose-file/#volumes)
