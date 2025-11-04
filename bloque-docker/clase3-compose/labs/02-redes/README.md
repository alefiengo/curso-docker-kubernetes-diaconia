# Lab 02: Redes (Networks) en Docker Compose

## Objetivo

Comprender cómo funcionan las redes en Docker Compose y cómo segmentar servicios para mejorar la seguridad mediante aislamiento de red.

---

## Conceptos Clave

### Redes en Docker

Docker crea redes virtuales que permiten la comunicación entre contenedores. Los contenedores en la misma red pueden comunicarse entre sí usando **nombres de servicio como DNS**.

### Tipos de Redes

- **bridge** (puente): Red por defecto, aislada del host
- **host**: Usa la red del host directamente
- **none**: Sin red
- **overlay**: Para Docker Swarm (múltiples hosts)

### DNS Interno

Docker tiene un servidor DNS integrado. Los contenedores pueden comunicarse usando el **nombre del servicio**:

```bash
# Dentro del contenedor "frontend"
ping backend  # Funciona si están en la misma red
curl http://backend:80
```

---

## Arquitectura del Lab

Este lab demuestra **segmentación de red** para seguridad:

```
┌──────────────┐
│   Frontend   │ (puerto 8080 público)
└──────┬───────┘
       │
       ├─ frontend-net
       └─ backend-net
              │
         ┌────▼────────┐
         │   Backend   │ (sin puerto público)
         └────┬────────┘
              │
              ├─ backend-net
              └─ database-net
                     │
                ┌────▼─────────┐
                │   Database   │ (sin puerto público)
                └──────────────┘
```

**Reglas de comunicación**:
- `frontend` puede hablar con `backend` (comparten `backend-net`)
- `backend` puede hablar con `database` (comparten `database-net`)
- `frontend` NO puede hablar directamente con `database` (no comparten red)

---

## Estructura del Proyecto

```
02-redes/
├── docker-compose.yml    # Definición con 3 servicios y 3 redes
└── README.md            # Este archivo
```

---

## Paso 1: Revisar el docker-compose.yml

```yaml
services:
  frontend:
    image: nginx:alpine
    container_name: frontend
    ports:
      - "8080:80"
    networks:
      - frontend-net
      - backend-net
    depends_on:
      - backend

  backend:
    image: nginx:alpine
    container_name: backend
    networks:
      - backend-net
      - database-net

  database:
    image: postgres:15-alpine
    container_name: database
    environment:
      - POSTGRES_PASSWORD=secret123
      - POSTGRES_DB=testdb
    networks:
      - database-net

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
  database-net:
    driver: bridge
```

### Desglose

| Campo | Descripción |
|-------|-------------|
| `networks:` (en servicio) | Lista de redes a las que pertenece el contenedor |
| `depends_on:` | Orden de inicio (frontend espera a backend) |
| `networks:` (global) | Define las redes custom que usará Compose |
| `driver: bridge` | Tipo de red (bridge es la más común) |

---

## Paso 2: Levantar los Servicios

```bash
docker compose up -d
```

**Salida esperada:**
```
Creating network "02-redes_frontend-net" with driver "bridge"
Creating network "02-redes_backend-net" with driver "bridge"
Creating network "02-redes_database-net" with driver "bridge"
Creating database ... done
Creating backend  ... done
Creating frontend ... done
```

### Verificar servicios:

```bash
docker compose ps
```

**Salida esperada:**
```
   Name                 Command              State          Ports
-------------------------------------------------------------------------
backend     /docker-entrypoint.sh ngin ...   Up      80/tcp
database    docker-entrypoint.sh postgres    Up      5432/tcp
frontend    /docker-entrypoint.sh ngin ...   Up      0.0.0.0:8080->80/tcp
```

---

## Paso 3: Inspeccionar las Redes

### Listar redes creadas:

```bash
docker network ls
```

**Salida esperada:**
```
NETWORK ID     NAME                      DRIVER    SCOPE
abc123def456   02-redes_frontend-net     bridge    local
def456ghi789   02-redes_backend-net      bridge    local
ghi789jkl012   02-redes_database-net     bridge    local
```

### Inspeccionar una red:

```bash
docker network inspect 02-redes_backend-net
```

Verás los contenedores conectados a esa red.

---

## Paso 4: Probar Comunicación entre Servicios

### 1. Desde frontend → backend (Debe funcionar)

```bash
docker compose exec frontend ping -c 3 backend
```

**Salida esperada:**
```
PING backend (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.123 ms
64 bytes from 172.20.0.3: seq=1 ttl=64 time=0.089 ms
64 bytes from 172.20.0.3: seq=2 ttl=64 time=0.095 ms
```

### 2. Desde backend → database (Debe funcionar)

```bash
docker compose exec backend ping -c 3 database
```

**Salida esperada:** Similar al anterior.

### 3. Desde frontend → database (NO debe funcionar)

```bash
docker compose exec frontend ping -c 3 database
```

**Salida esperada:**
```
ping: bad address 'database'
```

**Explicación:** `frontend` y `database` no están en la misma red, por lo tanto **no se conocen** vía DNS.

---

## Paso 5: Verificar DNS Interno

### Entrar al contenedor frontend:

```bash
docker compose exec frontend sh
```

Dentro del contenedor:

```bash
# Verificar resolución DNS
nslookup backend
# Salida: Muestra la IP del contenedor backend

# Intentar resolver database
nslookup database
# Salida: Error (no está en la misma red)

# Salir
exit
```

---

## Paso 6: Prueba con curl (HTTP)

### Instalar curl en frontend:

```bash
docker compose exec frontend sh -c "apk add --no-cache curl"
```

### Hacer request a backend:

```bash
docker compose exec frontend curl http://backend:80
```

**Salida esperada:** HTML de Nginx (página por defecto).

### Intentar request a database:

```bash
docker compose exec frontend curl http://database:5432
```

**Salida esperada:** Error (no puede resolver el nombre).

---

## Conceptos Aprendidos

- **Custom networks**: Crear redes específicas para segmentar servicios
- **DNS interno**: Los contenedores se comunican por nombre de servicio
- **Segmentación**: Mejorar seguridad aislando servicios críticos (database)
- **depends_on**: Controlar orden de inicio de servicios
- **Multi-network**: Un contenedor puede pertenecer a múltiples redes

---

## Arquitectura de Seguridad

### Antes (sin segmentación):

```
Todos en la misma red → frontend, backend, database se ven entre sí
```

**Riesgo:** Si frontend es comprometido, tiene acceso directo a database.

### Después (con segmentación):

```
frontend <-> backend <-> database
```

**Beneficio:** frontend NO tiene acceso directo a database. Debe pasar por backend (capa de seguridad).

---

## Troubleshooting

### Error: "network not found"

**Problema:** Las redes no se crearon correctamente.

**Solución:**
```bash
docker compose down
docker compose up -d
```

### ping: command not found

**Problema:** Alpine Linux no tiene `ping` por defecto.

**Solución:** Instalar herramientas de red:
```bash
docker compose exec frontend sh -c "apk add --no-cache iputils"
```

### Contenedores no se ven entre sí

**Problema:** No están en la misma red.

**Diagnóstico:**
```bash
docker network inspect 02-redes_backend-net
```

Verifica que ambos contenedores aparezcan en la lista de "Containers".

---

## Desafío Adicional

### Nivel 1: Agregar Adminer

Adminer es una GUI para bases de datos. Agrégalo al `docker-compose.yml`:

```yaml
  adminer:
    image: adminer
    container_name: adminer
    ports:
      - "8081:8080"
    networks:
      - database-net
    depends_on:
      - database
```

Acceder a `http://localhost:8081` y conectarse a la base de datos.

### Nivel 2: Crear red para frontend público

Actualmente `frontend` está en 2 redes. Crea una tercera red `public-net` solo para frontend que simule la red pública.

### Nivel 3: Probar con aplicación real

Reemplaza los servicios nginx por aplicaciones reales:
- **frontend**: Servidor estático (HTML)
- **backend**: API REST (Node.js/Python)
- **database**: PostgreSQL con datos reales

---

## Comparación: Red por Defecto vs Custom

### Red por defecto (sin declarar networks):

```yaml
services:
  app:
    image: nginx
  db:
    image: postgres
```

- Compose crea una red `default`
- Todos los servicios están en esa red
- Se pueden comunicar entre sí

### Custom networks:

```yaml
services:
  app:
    networks: [frontend, backend]
  db:
    networks: [backend]
networks:
  frontend:
  backend:
```

- Control granular de comunicación
- Segmentación por capas
- Mejor seguridad

---

## Recursos Adicionales

- [Docker Networking Overview](https://docs.docker.com/network/)
- [Compose Networking](https://docs.docker.com/compose/networking/)
- [Network Drivers](https://docs.docker.com/network/drivers/)

---

[← Volver a Clase 3](../../README.md)
