# Lab 02 – Nginx

## Objetivo

Ejecutar un servidor web Nginx en un container (contenedor) en modo background (segundo plano) y aprender a mapear puertos para acceder a servicios desde el host.

---

## Comandos a ejecutar

```bash
# 1. Ejecutar Nginx en background
docker run -d -p 8080:80 --name web nginx

# 2. Verificar que el container está corriendo
docker ps

# 3. Probar el servidor web
curl localhost:8080
```

---

## Desglose del comando principal

```bash
docker run -d -p 8080:80 --name web nginx
```

| Componente | Descripción |
|------------|-------------|
| `docker run` | Crear y ejecutar un container |
| `-d` | **Detached mode (modo separado)** - Ejecuta el container en segundo plano |
| `-p 8080:80` | **Port mapping (mapeo de puertos)** - Mapea puerto 8080 del host al puerto 80 del container |
| `--name web` | Asigna el nombre "web" al container (en lugar de un nombre aleatorio) |
| `nginx` | Image oficial de Nginx desde Docker Hub |

---

## Explicación detallada de flags

### `-d` (Detached mode)

Sin este flag, el container se ejecutaría en **foreground** (primer plano), ocupando tu terminal y mostrando los logs en tiempo real.

Con `-d`, el container se ejecuta en **background** (segundo plano):
- Docker retorna el Container ID y libera tu terminal
- El container sigue corriendo aunque cierres la terminal
- Puedes ver los logs con `docker logs web`

**Ejemplo de salida:**
```
a1b2c3d4e5f6789012345678901234567890123456789012345678901234
```
Este es el Container ID completo (64 caracteres).

### `-p 8080:80` (Port mapping)

**Formato:** `-p <puerto-host>:<puerto-container>`

- **8080** - Puerto en tu máquina (host)
- **80** - Puerto dentro del container donde Nginx escucha por defecto

Sin este mapeo, Nginx estaría corriendo dentro del container pero **no sería accesible** desde tu navegador.

**Network diagram:**
```
Tu navegador → localhost:8080 → Docker → Container puerto 80 (Nginx)
```

### `--name web`

Asigna un nombre amigable al container. Sin esto, Docker genera nombres aleatorios como `quirky_einstein` o `eager_turing`.

**Ventajas:**
- Más fácil de recordar
- Puedes usar el nombre en otros comandos: `docker logs web`, `docker stop web`

---

## Verificar que está funcionando

### 1. Ver containers activos

```bash
docker ps
```

**Salida esperada:**
```
CONTAINER ID   IMAGE   COMMAND                  CREATED         STATUS         PORTS                  NAMES
a1b2c3d4e5f6   nginx   "/docker-entrypoint.…"   10 seconds ago  Up 9 seconds   0.0.0.0:8080->80/tcp   web
```

**Puntos importantes:**
- **STATUS:** `Up` significa que está corriendo
- **PORTS:** `0.0.0.0:8080->80/tcp` confirma el port mapping
- **NAMES:** `web` es el nombre que asignamos

### 2. Probar con curl

```bash
curl localhost:8080
```

**Salida esperada:**
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

### 3. Probar en el navegador

Abre tu navegador y visita:
```
http://localhost:8080
```

Deberías ver la página de bienvenida de Nginx:
> **Welcome to nginx!**

---

## Explorar el container

### Ver logs en tiempo real

```bash
docker logs -f web
```

Cada vez que accedas a `localhost:8080` desde el navegador, verás logs como:
```
172.17.0.1 - - [03/Oct/2025:12:00:00 +0000] "GET / HTTP/1.1" 200 615
```

**Tip:** Presiona `Ctrl+C` para salir del modo follow.

### Ver solo las últimas líneas

```bash
docker logs --tail 10 web
```

### Inspeccionar el container

```bash
docker inspect web
```

Esto muestra toda la configuración del container en formato JSON (IP address, volumes, network settings, etc.).

### Ver estadísticas en tiempo real

```bash
docker stats web
```

Muestra uso de CPU, memoria, red y disco.

---

## Detener y reiniciar el container

```bash
# Detener el container
docker stop web

# Verificar que ya no está corriendo
docker ps

# Ver todos los containers (incluyendo detenidos)
docker ps -a

# Reiniciar el container
docker start web

# Verificar que volvió a estar activo
docker ps
```

---

## Limpieza

```bash
# Detener el container
docker stop web

# Eliminar el container
docker rm web

# Eliminar la image (opcional)
docker rmi nginx
```

---

## Conceptos aprendidos

- **Detached mode (`-d`)** - Ejecutar containers en background
- **Port mapping (`-p`)** - Exponer servicios del container al host
- **Named containers (`--name`)** - Asignar nombres personalizados
- **`docker ps`** - Ver containers activos
- **`docker logs`** - Ver logs de containers
- **Ciclo start/stop** - Detener y reiniciar containers sin perder datos

---

## Troubleshooting

### Error: "port is already allocated"

**Causa:** El puerto 8080 ya está siendo usado por otro proceso.

**Solución 1:** Usa otro puerto
```bash
docker run -d -p 8081:80 --name web nginx
curl localhost:8081
```

**Solución 2:** Detén el proceso que está usando el puerto 8080
```bash
# Ver qué proceso usa el puerto 8080
lsof -i :8080        # macOS/Linux
netstat -ano | findstr :8080    # Windows
```

### Error: "the container name '/web' is already in use"

**Causa:** Ya existe un container (activo o detenido) con ese nombre.

**Solución:** Elimina el container anterior
```bash
docker rm -f web
```

### No veo la página de Nginx en el navegador

**Verificaciones:**
1. ¿El container está corriendo? → `docker ps`
2. ¿El port mapping está correcto? → Revisa la columna PORTS en `docker ps`
3. ¿Hay errores? → `docker logs web`

---

## Desafío adicional

Intenta ejecutar **dos** servidores Nginx en puertos diferentes:

```bash
docker run -d -p 8080:80 --name web1 nginx
docker run -d -p 8081:80 --name web2 nginx
```

Accede a ambos:
- http://localhost:8080
- http://localhost:8081

---

## Recursos adicionales

- [Nginx Official Image](https://hub.docker.com/_/nginx)
- [Docker Docs: Container Networking](https://docs.docker.com/network/)
- [Docker Docs: docker logs](https://docs.docker.com/reference/cli/docker/container/logs/)

---

[← Volver a Clase 1](../../)
