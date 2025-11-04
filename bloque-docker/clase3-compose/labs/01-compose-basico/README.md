# Lab 01: Docker Compose Básico

## Objetivo

Aprender los fundamentos de Docker Compose, creando tu primer archivo `docker-compose.yml` para levantar un servicio web simple con Nginx.

---

## Conceptos Clave

### ¿Qué es Docker Compose?

Docker Compose es una herramienta para definir y ejecutar aplicaciones Docker multi-contenedor. Con Compose:

- Defines tu aplicación en un archivo YAML (`docker-compose.yml`)
- Levantas toda tu aplicación con un solo comando (`docker compose up`)
- Gestionas múltiples contenedores como una unidad

### Ventajas sobre docker run

**Sin Compose** (comando largo y complejo):
```bash
docker run -d --name mi-nginx -p 8080:80 -v $(pwd)/html:/usr/share/nginx/html nginx:alpine
```

**Con Compose** (simple y declarativo):
```bash
docker compose up -d
```

---

## Estructura del Proyecto

```
01-compose-basico/
├── docker-compose.yml    # Definición de servicios
├── html/                 # Contenido web (bind mount)
│   └── index.html
└── README.md            # Este archivo
```

---

## Paso 1: Revisar el docker-compose.yml

**Archivo:** `docker-compose.yml`

```yaml
services:
  web:
    image: nginx:alpine
    container_name: mi-nginx
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
```

### Desglose del archivo

| Campo | Descripción |
|-------|-------------|
| `services:` | Define los contenedores que formarán parte de la aplicación |
| `web:` | Nombre del servicio (puedes usar cualquier nombre) |
| `image:` | Imagen de Docker a utilizar |
| `container_name:` | Nombre específico del contenedor (opcional) |
| `ports:` | Mapeo de puertos (host:contenedor) |
| `volumes:` | Bind mount para servir archivos del host |

---

## Paso 2: Levantar el Servicio

### Comando principal:

```bash
docker compose up
```

**Salida esperada:**
```
Creating network "01-compose-basico_default" with the default driver
Creating mi-nginx ... done
Attaching to mi-nginx
mi-nginx | /docker-entrypoint.sh: Configuration complete; ready for start up
```

### Modo detached (segundo plano):

```bash
docker compose up -d
```

**Salida esperada:**
```
Creating mi-nginx ... done
```

---

## Paso 3: Verificar el Servicio

### Ver servicios corriendo:

```bash
docker compose ps
```

**Salida esperada:**
```
   Name                 Command              State          Ports
-------------------------------------------------------------------------
mi-nginx   /docker-entrypoint.sh ngin ...   Up      0.0.0.0:8080->80/tcp
```

### Acceder desde el navegador:

```
http://localhost:8080
```

Deberías ver la página HTML personalizada.

### Ver logs:

```bash
docker compose logs
```

**Ver logs en tiempo real:**
```bash
docker compose logs -f
```

---

## Paso 4: Modificar el Contenido

### Edita el archivo HTML:

```bash
# Editar html/index.html
nano html/index.html
```

Cambia el título o el contenido.

### Recargar el navegador:

Los cambios se reflejan **inmediatamente** gracias al bind mount. No necesitas reconstruir ni reiniciar el contenedor.

---

## Paso 5: Gestionar el Servicio

### Detener servicios (sin eliminar):

```bash
docker compose stop
```

### Iniciar servicios detenidos:

```bash
docker compose start
```

### Reiniciar servicios:

```bash
docker compose restart
```

### Detener y eliminar contenedores:

```bash
docker compose down
```

**Salida esperada:**
```
Stopping mi-nginx ... done
Removing mi-nginx ... done
Removing network 01-compose-basico_default
```

---

## Paso 6: Comandos Adicionales

### Ejecutar comando dentro del contenedor:

```bash
docker compose exec web sh
```

Dentro del contenedor:
```bash
ls /usr/share/nginx/html
cat /etc/nginx/nginx.conf
exit
```

### Ver configuración procesada:

```bash
docker compose config
```

Muestra el archivo `docker-compose.yml` procesado y validado.

---

## Conceptos Aprendidos

- **docker-compose.yml**: Archivo declarativo para definir servicios
- **services**: Cada servicio es un contenedor
- **image**: Imagen base del contenedor
- **ports**: Publicar puertos al host
- **volumes**: Montar directorios del host (bind mount)
- **docker compose up/down**: Levantar y destruir servicios
- **docker compose ps/logs**: Inspeccionar servicios

---

## Troubleshooting

### Error: "port is already allocated"

**Problema:** El puerto 8080 ya está en uso.

**Solución:** Cambiar el puerto en `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Usar puerto 8081 en lugar de 8080
```

### Error: "Cannot start service web: driver failed"

**Problema:** Docker daemon no está corriendo.

**Solución:**
```bash
# Linux
sudo systemctl start docker

# Windows/Mac
# Abrir Docker Desktop
```

### Los cambios en HTML no se reflejan

**Problema:** Ruta incorrecta del bind mount.

**Diagnóstico:**
```bash
docker compose exec web ls /usr/share/nginx/html
```

**Solución:** Verificar que `./html` existe y tiene el `index.html`.

---

## Desafío Adicional

### Nivel 1: Agregar otra página

1. Crear `html/about.html`
2. Agregar un link desde `index.html`
3. Acceder a `http://localhost:8080/about.html`

### Nivel 2: Cambiar el puerto interno

1. Modificar el `docker-compose.yml`:
```yaml
ports:
  - "8080:8080"  # Ahora ambos son 8080
```

2. Necesitarás configurar Nginx para escuchar en 8080
3. **Pista:** Necesitas un `nginx.conf` personalizado

### Nivel 3: Agregar variables de entorno

1. Agregar variables de entorno al servicio:
```yaml
environment:
  - NGINX_HOST=localhost
  - NGINX_PORT=80
```

2. Investigar cómo usar estas variables en Nginx

---

## Comparación: docker run vs docker-compose

### Con docker run:
```bash
docker run -d \
  --name mi-nginx \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine
```

### Con docker-compose:
```bash
docker compose up -d
```

**Ventajas de Compose**:
- Más legible y mantenible
- Versionable en Git
- Escalable a múltiples servicios
- Comandos más simples

---

## Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

---

[← Volver a Clase 3](../../README.md)
