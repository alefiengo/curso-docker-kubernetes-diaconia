# Desafío Rápido - Clase 3

**Dificultad:** Intermedia

---

## Objetivo

Agregar un bind mount con script de inicialización SQL a PostgreSQL en el Lab 03 y verificar que los datos se crean automáticamente.

---

## Contexto

En el Lab 03 trabajaste con volúmenes y persistencia de datos con PostgreSQL. Ahora agregarás un script de inicialización que se ejecuta automáticamente cuando el contenedor se crea por primera vez.

PostgreSQL ejecuta automáticamente cualquier script `.sql` que encuentre en el directorio `/docker-entrypoint-initdb.d/` durante la inicialización.

---

## Pasos a Seguir

### 1. Ubicarte en el directorio del Lab 03

```bash
cd bloque-docker/clase3-compose/labs/03-volumenes
```

### 2. Verificar que existe el archivo init.sql

El archivo `init.sql` ya está creado con el siguiente contenido:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, email) VALUES
    ('Juan Pérez', 'juan@example.com'),
    ('María García', 'maria@example.com'),
    ('Carlos López', 'carlos@example.com');
```

### 3. Modificar el docker-compose.yml

Abre el archivo `docker-compose.yml` y agrega la línea del bind mount:

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
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # AGREGAR ESTA LÍNEA

volumes:
  postgres-data:
    driver: local
```

### 4. Recrear el contenedor

**Importante:** El script solo se ejecuta si el volumen está vacío (primera inicialización).

```bash
# Eliminar volumen anterior
docker compose down -v

# Levantar de nuevo
docker compose up -d
```

### 5. Verificar que el script se ejecutó

```bash
docker compose exec db psql -U curso -d coursedb -c "SELECT * FROM usuarios;"
```

**Resultado esperado:**

```
 id |     nombre     |       email
----+----------------+-------------------
  1 | Juan Pérez     | juan@example.com
  2 | María García   | maria@example.com
  3 | Carlos López   | carlos@example.com
(3 rows)
```

---

## Criterios de Éxito

- El archivo `init.sql` está montado en el contenedor
- La tabla `usuarios` se creó automáticamente
- Los 3 registros se insertaron correctamente
- Puedes consultar los datos con `psql`

---

## Concepto Aprendido

Los **bind mounts** permiten montar archivos específicos del host en el contenedor. PostgreSQL (y muchas otras imágenes oficiales) ejecutan scripts de inicialización automáticamente, lo cual es útil para:

- Crear esquemas de base de datos
- Insertar datos de prueba
- Configurar usuarios y permisos
- Ejecutar migraciones iniciales

---

## Bonus (Opcional)

Si terminas antes, intenta:

1. **Agregar más datos al init.sql**:
   - Crear una tabla `productos`
   - Insertar algunos productos

2. **Verificar que el script solo se ejecuta una vez**:
   - Modificar el `init.sql` (agregar más usuarios)
   - Hacer `docker compose restart db`
   - Verificar que NO se agregaron los nuevos usuarios (porque el volumen ya existe)

3. **Probar con un segundo script**:
   - Crear `init2.sql` con otra tabla
   - Montarlo: `./init2.sql:/docker-entrypoint-initdb.d/init2.sql`
   - PostgreSQL ejecuta los scripts en orden alfabético

---

## Recursos

- [PostgreSQL Docker Image - Initialization Scripts](https://hub.docker.com/_/postgres)
- [Docker Volumes Documentation](https://docs.docker.com/storage/volumes/)
