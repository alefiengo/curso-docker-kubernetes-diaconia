# Lab 03: Volúmenes (Volumes) y Persistencia

## Objetivo

Comprender los diferentes tipos de volúmenes en Docker y cómo garantizar la persistencia de datos entre reinicios de contenedores.

---

## Conceptos Clave

### ¿Por qué necesitamos volúmenes?

Los contenedores son **efímeros** por naturaleza. Cuando eliminas un contenedor, **todos sus datos se pierden**. Los volúmenes permiten:

- **Persistencia**: Datos sobreviven al ciclo de vida del contenedor
- **Compartir datos**: Múltiples contenedores pueden acceder al mismo volumen
- **Performance**: Mejor rendimiento que almacenamiento en capa del contenedor

### Tipos de Volúmenes

| Tipo | Descripción | Uso Común |
|------|-------------|-----------|
| **Named volume** | Gestionado por Docker, ubicación abstracta | Bases de datos, datos de producción |
| **Bind mount** | Monta directorio específico del host | Desarrollo, código fuente |
| **Anonymous volume** | Temporal, se elimina con el contenedor | Datos temporales |

---

## Arquitectura del Lab

```
Host                          Contenedor PostgreSQL
┌─────────────────────┐      ┌──────────────────────────┐
│                     │      │                          │
│  Docker Volume      │◄─────┤  /var/lib/postgresql/data│
│  postgres-data      │      │  (datos de la DB)        │
│                     │      │                          │
└─────────────────────┘      └──────────────────────────┘
```

**Garantía**: Los datos persisten aunque elimines y recrees el contenedor.

---

## Estructura del Proyecto

```
03-volumenes/
├── docker-compose.yml    # Definición con volumen nombrado
├── init.sql             # Script de inicialización (bind mount)
└── README.md            # Este archivo
```

---

## Paso 1: Revisar el docker-compose.yml

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_USER=curso
      - POSTGRES_PASSWORD=docker123
      - POSTGRES_DB=coursedb
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
    driver: local
```

### Desglose

| Campo | Descripción |
|-------|-------------|
| `volumes:` (en servicio) | Monta el volumen en el path dentro del contenedor |
| `postgres-data:/var/lib/postgresql/data` | Formato: `volumen:path-contenedor` |
| `volumes:` (global) | Define volúmenes named que Docker gestionará |
| `driver: local` | Almacenamiento local (por defecto) |

---

## Paso 2: Levantar PostgreSQL

```bash
docker compose up -d
```

**Salida esperada:**
```
Creating network "03-volumenes_default" with the default driver
Creating volume "03-volumenes_postgres-data" with local driver
Creating postgres-db ... done
```

### Verificar el volumen creado:

```bash
docker volume ls
```

**Salida esperada:**
```
DRIVER    VOLUME NAME
local     03-volumenes_postgres-data
```

---

## Paso 3: Insertar Datos en la Base de Datos

### Conectarse a PostgreSQL:

```bash
docker compose exec db psql -U curso -d coursedb
```

Dentro de psql:

```sql
-- Crear tabla
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    precio DECIMAL(10,2)
);

-- Insertar datos
INSERT INTO productos (nombre, precio) VALUES
    ('Laptop', 1200.00),
    ('Mouse', 25.50),
    ('Teclado', 89.99);

-- Consultar
SELECT * FROM productos;

-- Salir
\q
```

**Salida esperada:**
```
 id |  nombre  | precio
----+----------+---------
  1 | Laptop   | 1200.00
  2 | Mouse    |   25.50
  3 | Teclado  |   89.99
(3 rows)
```

---

## Paso 4: Probar Persistencia

### 1. Detener y eliminar el contenedor:

```bash
docker compose down
```

**Salida esperada:**
```
Stopping postgres-db ... done
Removing postgres-db ... done
Removing network 03-volumenes_default
```

**Nota importante:** El volumen `postgres-data` NO se elimina.

### 2. Verificar que el volumen sigue existiendo:

```bash
docker volume ls | grep postgres-data
```

**Salida esperada:**
```
local     03-volumenes_postgres-data
```

### 3. Levantar de nuevo el servicio:

```bash
docker compose up -d
```

### 4. Verificar que los datos persisten:

```bash
docker compose exec db psql -U curso -d coursedb -c "SELECT * FROM productos;"
```

**Salida esperada:**
```
 id |  nombre  | precio
----+----------+---------
  1 | Laptop   | 1200.00
  2 | Mouse    |   25.50
  3 | Teclado  |   89.99
(3 rows)
```

**✓ Los datos persisten** porque están en el volumen `postgres-data`.

---

## Paso 5: Eliminar Volumen (Datos se Pierden)

### 1. Detener y eliminar incluyendo volúmenes:

```bash
docker compose down -v
```

**Salida esperada:**
```
Stopping postgres-db ... done
Removing postgres-db ... done
Removing network 03-volumenes_default
Removing volume 03-volumenes_postgres-data
```

### 2. Verificar que el volumen fue eliminado:

```bash
docker volume ls | grep postgres-data
```

**Salida esperada:** (vacío, no hay resultados)

### 3. Levantar de nuevo:

```bash
docker compose up -d
```

### 4. Intentar consultar productos:

```bash
docker compose exec db psql -U curso -d coursedb -c "SELECT * FROM productos;"
```

**Salida esperada:**
```
ERROR:  relation "productos" does not exist
```

**Los datos se perdieron** porque el volumen fue eliminado con `-v`.

---

## Paso 6: Bind Mount para Inicialización

PostgreSQL ejecuta automáticamente scripts SQL del directorio `/docker-entrypoint-initdb.d/` al inicializar.

### Modificar docker-compose.yml:

```yaml
services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # AGREGAR ESTA LÍNEA
```

### Recrear el contenedor:

```bash
docker compose down -v
docker compose up -d
```

### Verificar que init.sql se ejecutó:

```bash
docker compose exec db psql -U curso -d coursedb -c "SELECT * FROM usuarios;"
```

**Salida esperada:**
```
 id |     nombre     |       email
----+----------------+-------------------
  1 | Juan Pérez     | juan@example.com
  2 | María García   | maria@example.com
  3 | Carlos López   | carlos@example.com
(3 rows)
```

---

## Paso 7: Inspeccionar Volúmenes

### Detalles del volumen:

```bash
docker volume inspect 03-volumenes_postgres-data
```

**Salida esperada:**
```json
[
    {
        "CreatedAt": "2025-01-15T10:30:00Z",
        "Driver": "local",
        "Labels": {
            "com.docker.compose.project": "03-volumenes",
            "com.docker.compose.volume": "postgres-data"
        },
        "Mountpoint": "/var/lib/docker/volumes/03-volumenes_postgres-data/_data",
        "Name": "03-volumenes_postgres-data",
        "Scope": "local"
    }
]
```

**Mountpoint**: Ubicación física en el host (en Linux).

---

## Conceptos Aprendidos

- **Named volumes**: Persistencia gestionada por Docker
- **Bind mounts**: Montar archivos/directorios específicos del host
- **docker compose down**: Elimina contenedores pero NO volúmenes
- **docker compose down -v**: Elimina contenedores Y volúmenes
- **Inicialización automática**: PostgreSQL ejecuta scripts de `/docker-entrypoint-initdb.d/`
- **docker volume inspect**: Ver detalles y ubicación de volúmenes

---

## Comparación: Volume vs Bind Mount

### Named Volume

```yaml
volumes:
  - mi-volumen:/data
```

**Ventajas**:
- Docker gestiona la ubicación
- Mejor portabilidad
- Rendimiento optimizado
- Recomendado para producción

### Bind Mount

```yaml
volumes:
  - ./mi-carpeta:/data
```

**Ventajas**:
- Control total del path
- Ideal para desarrollo
- Cambios en tiempo real
- Fácil acceso desde el host

---

## Troubleshooting

### Error: "permission denied" al montar bind mount

**Problema:** Permisos incorrectos en el host.

**Solución (Linux):**
```bash
chmod 755 ./init.sql
```

### Los datos no persisten

**Problema:** Usaste `docker compose down -v` por error.

**Prevención:** Nunca usar `-v` en producción sin respaldo.

### init.sql no se ejecuta

**Problema:** El volumen ya tiene datos (PostgreSQL ya inicializó).

**Solución:** Eliminar volumen y recrear:
```bash
docker compose down -v
docker compose up -d
```

---

## Desafío Adicional

### Nivel 1: Agregar más datos

1. Modificar `init.sql` para agregar más tablas
2. Recrear el contenedor y verificar

### Nivel 2: Backup manual

1. Crear un backup de la base de datos:
```bash
docker compose exec db pg_dump -U curso coursedb > backup.sql
```

2. Restaurar desde el backup:
```bash
cat backup.sql | docker compose exec -T db psql -U curso coursedb
```

### Nivel 3: Múltiples volúmenes

Agregar un segundo volumen para logs:

```yaml
volumes:
  - postgres-data:/var/lib/postgresql/data
  - postgres-logs:/var/log/postgresql
```

---

## Recursos Adicionales

- [Docker Volumes Documentation](https://docs.docker.com/storage/volumes/)
- [Compose Volumes Reference](https://docs.docker.com/compose/compose-file/#volumes)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [PostgreSQL Initialization Scripts](https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts)

---

[← Volver a Clase 3](../../README.md)
