# Lab 04 – Docker Hub

## Objetivo

Explorar Docker Hub, el registro público de images (imágenes) de Docker, comprender cómo encontrar images oficiales, leer su documentación y seleccionar tags (versiones) apropiados.

---

## ¿Qué es Docker Hub?

**Docker Hub** (https://hub.docker.com/) es el registro público de images más grande del mundo.

### Características principales:

- **Images oficiales** - Mantenidas por Docker y los proyectos oficiales
- **Images públicas** - Compartidas por la comunidad
- **Images privadas** - Para equipos y empresas
- **Multi-arquitectura** - Soporte para x86_64, ARM, etc.
- **Búsqueda y documentación** - Fácil de encontrar y usar

---

## Parte 1: Explorar Docker Hub en el navegador

### 1. Acceder a Docker Hub

Visita: https://hub.docker.com/

### 2. Buscar images oficiales

En la barra de búsqueda, busca:
- `nginx`
- `redis`
- `mysql`
- `python`
- `node`

**Tip:** Filtra por "Docker Official Image" para ver solo las oficiales.

### 3. Explorar una image: Nginx

Abre: https://hub.docker.com/_/nginx

#### Información importante:

**a) Description (Descripción)**
- ¿Qué es Nginx?
- ¿Para qué se usa?
- Casos de uso

**b) Tags**

Los **tags** representan diferentes versiones de la image:

| Tag | Descripción | Cuándo usarlo |
|-----|-------------|---------------|
| `latest` | Última versión estable | Desarrollo, testing (no recomendado para producción) |
| `1.27` | Versión mayor y menor | Balance entre estabilidad y features |
| `1.27.3` | Versión específica (major.minor.patch) | **Producción** - máxima estabilidad |
| `alpine` | Versión minimalista basada en Alpine Linux | Optimización de espacio (~5-10 MB) |
| `1.27-alpine` | Versión específica con Alpine | Producción optimizada |

**Ejemplo de tags:**
```
nginx:latest          → ~150 MB
nginx:1.27            → ~150 MB
nginx:1.27.3          → ~150 MB
nginx:alpine          → ~40 MB
nginx:1.27-alpine     → ~40 MB
```

**c) Quick reference**
- Link al código fuente
- Documentación oficial
- Issues y soporte

**d) How to use this image**

Ejemplos de comandos `docker run` y configuraciones.

---

## Parte 2: Buscar images desde la terminal

### Buscar en Docker Hub

```bash
docker search nginx
```

**Salida esperada:**
```
NAME                              DESCRIPTION                                     STARS     OFFICIAL
nginx                             Official build of Nginx.                        20000+    [OK]
nginxinc/nginx-unprivileged       Unprivileged NGINX Dockerfiles                  200+
bitnami/nginx                     Bitnami nginx Docker Image                      100+
...
```

**Columnas importantes:**
- **OFFICIAL** - `[OK]` indica que es una image oficial
- **STARS** - Popularidad (similar a GitHub stars)
- **DESCRIPTION** - Descripción breve

### Buscar con filtros

```bash
# Solo images oficiales
docker search --filter "is-official=true" nginx

# Con al menos 100 stars
docker search --filter "stars=100" nginx
```

---

## Parte 3: Trabajar con tags

### Descargar una image con tag específico

```bash
# Última versión (latest)
docker pull nginx

# Equivalente a:
docker pull nginx:latest

# Versión específica
docker pull nginx:1.27.3

# Versión Alpine (ligera)
docker pull nginx:alpine
```

### Ver images descargadas

```bash
docker images
```

**Salida esperada:**
```
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
nginx        latest    605c77e624dd   2 weeks ago   145MB
nginx        1.27.3    605c77e624dd   2 weeks ago   145MB
nginx        alpine    9ac47a2e2d8f   2 weeks ago   43MB
```

**Nota:** `latest` y `1.27.3` pueden tener el mismo **IMAGE ID** porque apuntan a la misma image.

### Ejecutar containers con diferentes tags

```bash
# Nginx versión latest
docker run -d -p 8080:80 --name web-latest nginx:latest

# Nginx versión alpine
docker run -d -p 8081:80 --name web-alpine nginx:alpine

# Verificar ambos
docker ps
```

Prueba ambos en el navegador:
- http://localhost:8080 (latest)
- http://localhost:8081 (alpine)

**Verás la misma página de bienvenida**, pero `alpine` usa mucho menos espacio.

---

## Parte 4: Explorar otras images oficiales

### Redis - Base de datos en memoria

```bash
# Explorar en Docker Hub
# https://hub.docker.com/_/redis

# Ejecutar Redis
docker run -d --name cache redis

# Ver logs
docker logs cache

# Conectarse a Redis
docker exec -it cache redis-cli
```

Dentro de `redis-cli`:
```bash
SET nombre "Docker"
GET nombre
EXIT
```

### MySQL - Base de datos relacional

```bash
# Explorar en Docker Hub
# https://hub.docker.com/_/mysql

# Ejecutar MySQL (requiere contraseña)
docker run -d \
  --name db \
  -e MYSQL_ROOT_PASSWORD=mipassword \
  -p 3306:3306 \
  mysql

# Ver logs (inicialización de la DB)
docker logs db

# Conectarse a MySQL
docker exec -it db mysql -p
```

**Nota:** Las environment variables (`-e`) se explican en las siguientes clases.

### Python - Entorno de desarrollo

```bash
# Ejecutar Python interactivo
docker run -it --rm python:3.12

# Probar Python
>>> print("Hello from Docker!")
>>> import sys
>>> sys.version
>>> exit()
```

El flag `--rm` elimina el container automáticamente al salir.

---

## Parte 5: Comparar versiones y tamaños

```bash
# Descargar diferentes versiones de Node.js
docker pull node:22
docker pull node:22-alpine
docker pull node:22-slim

# Comparar tamaños
docker images node
```

**Salida esperada:**
```
REPOSITORY   TAG         IMAGE ID       SIZE
node         22          abc123         1.1GB
node         22-slim     def456         240MB
node         22-alpine   ghi789         180MB
```

**Lección:** Las variantes `alpine` y `slim` son mucho más pequeñas.

---

## Conceptos aprendidos

- **Docker Hub** - Registro público de images de Docker
- **Images oficiales** - Verificadas y mantenidas por Docker y proyectos oficiales
- **Tags** - Versiones diferentes de una image
- **latest vs versión específica** - Usar versiones específicas en producción
- **Alpine** - Variante minimalista para optimizar espacio
- **`docker search`** - Buscar images desde la terminal
- **`docker pull`** - Descargar images con tags específicos
- **Multi-versión** - Ejecutar múltiples versiones simultáneamente

---

## Mejores prácticas con tags

### Hacer en producción

```bash
# Usar versión específica (pinning)
docker pull nginx:1.27.3-alpine
```

**Ventajas:**
- Reproducibilidad garantizada
- Sin cambios inesperados
- Actualizaciones controladas

### Evitar en producción

```bash
# Usar latest
docker pull nginx:latest
```

**Problemas:**
- `latest` cambia con el tiempo
- Puede romper compatibilidad
- Difícil de debuggear

### En desarrollo

```bash
# latest está bien para experimentar
docker run -d nginx:latest
```

---

## Troubleshooting

### Error: "manifest for <image>:<tag> not found"

**Causa:** El tag no existe.

**Solución:** Verifica los tags disponibles en Docker Hub o usa `docker search`.

### ¿Cómo saber qué tags están disponibles?

**Opción 1:** Visita Docker Hub y busca en la pestaña "Tags"

**Opción 2:** Usa la API de Docker Hub
```bash
curl -s https://registry.hub.docker.com/v2/repositories/library/nginx/tags | jq -r '.results[].name' | head -10
```

### Image muy grande, ¿cómo optimizar?

**Solución:** Usa variantes `alpine` o `slim`:
```bash
docker pull nginx:alpine       # ~40 MB
docker pull python:3.12-alpine # ~50 MB
docker pull node:22-alpine     # ~180 MB
```

---

## Desafío final

1. Busca una image oficial de tu lenguaje o framework favorito
2. Lee la documentación en Docker Hub
3. Ejecuta un container con esa image
4. Compara el tamaño entre la versión normal y la versión `alpine`

**Ejemplo con Python:**
```bash
docker pull python:3.12
docker pull python:3.12-alpine
docker images python
```

---

## Recursos adicionales

- [Docker Hub](https://hub.docker.com/)
- [Docker Official Images](https://hub.docker.com/search?q=&type=image&image_filter=official)
- [Best practices for tagging](https://docs.docker.com/develop/dev-best-practices/)

---

[← Volver a Clase 1](../../)
