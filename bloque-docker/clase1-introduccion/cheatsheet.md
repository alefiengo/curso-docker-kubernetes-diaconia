# Docker Cheat Sheet – Clase 1

Guía de referencia rápida de comandos Docker vistos en la **Clase 1: Introducción a Containers (Contenedores) y Docker**.

---

## Verificar instalación

```bash
docker --version                    # Verificar versión de Docker instalada
docker info                         # Información detallada del sistema Docker
```

---

## Images (Imágenes)

### Descargar images (imágenes)

```bash
docker pull <image-name>            # Descargar image desde Docker Hub (última versión)
docker pull <image-name>:<tag>      # Descargar image con tag específico
docker pull nginx                   # Ejemplo: descargar Nginx
docker pull nginx:1.25              # Ejemplo: descargar Nginx versión 1.25
```

### Listar y administrar images (imágenes)

```bash
docker images                       # Listar todas las images locales
docker images -a                    # Listar todas las images (incluyendo intermedias)
docker image ls                     # Alternativa a docker images
docker rmi <image-id>               # Eliminar una image por ID
docker rmi <image-name>             # Eliminar una image por nombre
docker rmi -f <image-id>            # Forzar eliminación de image
docker image prune                  # Eliminar images sin usar (dangling)
docker image prune -a               # Eliminar todas las images no usadas
```

---

## Containers (Contenedores)

### Ejecutar containers (contenedores)

```bash
docker run <image-name>             # Crear y ejecutar un container
docker run hello-world              # Ejemplo: ejecutar hello-world (validar instalación)
```

### Flags comunes de `docker run`

| Flag | Descripción | Ejemplo |
|------|-------------|---------|
| `-d` | Detached (separado) - ejecuta en segundo plano | `docker run -d nginx` |
| `-it` | Interactive (interactivo) + TTY - abre sesión interactiva | `docker run -it ubuntu bash` |
| `-p` | Port mapping (mapeo de puertos) - publica puertos | `docker run -p 8080:80 nginx` |
| `--name` | Asignar nombre personalizado al container | `docker run --name web nginx` |
| `--rm` | Eliminar container automáticamente al salir | `docker run --rm hello-world` |
| `-e` | Environment variables (variables de entorno) | `docker run -e ENV=prod nginx` |

### Ejemplos prácticos

```bash
# Ejecutar Nginx en segundo plano y publicar en puerto 8080
docker run -d -p 8080:80 --name web nginx

# Ejecutar Ubuntu de forma interactiva
docker run -it --name ubu ubuntu bash

# Ejecutar y eliminar automáticamente al salir
docker run --rm hello-world
```

### Listar containers (contenedores)

```bash
docker ps                           # Listar containers activos (running)
docker ps -a                        # Listar todos los containers (incluyendo detenidos)
docker ps -q                        # Listar solo IDs de containers activos
docker ps -aq                       # Listar solo IDs de todos los containers
```

### Administrar ciclo de vida

```bash
docker start <container-id>         # Iniciar un container detenido
docker stop <container-id>          # Detener un container en ejecución
docker restart <container-id>       # Reiniciar un container
docker pause <container-id>         # Pausar un container
docker unpause <container-id>       # Reanudar un container pausado
docker kill <container-id>          # Forzar detención de un container (SIGKILL)
```

### Eliminar containers (contenedores)

```bash
docker rm <container-id>            # Eliminar un container detenido
docker rm -f <container-id>         # Forzar eliminación de un container activo
docker rm $(docker ps -aq)          # Eliminar todos los containers detenidos
docker container prune              # Eliminar todos los containers detenidos
```

---

## Inspección y monitoreo

### Logs

```bash
docker logs <container-id>          # Ver logs de un container
docker logs -f <container-id>       # Seguir logs en tiempo real (follow)
docker logs --tail 100 <container-id> # Ver últimas 100 líneas
docker logs --since 5m <container-id> # Ver logs de los últimos 5 minutos
```

### Información del container (contenedor)

```bash
docker inspect <container-id>       # Ver información detallada en formato JSON
docker port <container-id>          # Ver port mappings (mapeos de puertos)
docker top <container-id>           # Ver procesos ejecutándose en el container
docker stats                        # Ver estadísticas en tiempo real de todos los containers
docker stats <container-id>         # Ver estadísticas de un container específico
```

### Ejecutar comandos en containers (contenedores) activos

```bash
docker exec <container-id> <command>          # Ejecutar comando en container activo
docker exec -it <container-id> bash           # Abrir shell interactiva en container activo
docker exec -it <container-id> sh             # Alternativa con sh (para images Alpine)
docker exec web ls /usr/share/nginx/html      # Ejemplo: listar archivos en Nginx
```

---

## Docker Hub

```bash
docker search <term>                # Buscar images en Docker Hub
docker search nginx                 # Ejemplo: buscar images de Nginx
docker login                        # Iniciar sesión en Docker Hub
docker login -u <username>          # Iniciar sesión con username específico
docker logout                       # Cerrar sesión
```

**Explorar en el navegador:**
- Docker Hub: https://hub.docker.com/
- Images oficiales de Nginx: https://hub.docker.com/_/nginx
- Images oficiales de Ubuntu: https://hub.docker.com/_/ubuntu

---

## Limpieza del sistema

```bash
docker system df                    # Ver uso de disco por Docker
docker system prune                 # Limpiar containers, networks e images no usadas
docker system prune -a              # Limpiar todo (incluyendo images no usadas)
docker system prune --volumes       # Incluir volumes en la limpieza
```

---

## Flujo de trabajo básico

```bash
# 1. Descargar image
docker pull nginx

# 2. Ejecutar container
docker run -d -p 8080:80 --name web nginx

# 3. Verificar que está corriendo
docker ps

# 4. Ver logs
docker logs web

# 5. Acceder al container
docker exec -it web bash

# 6. Detener container
docker stop web

# 7. Eliminar container
docker rm web

# 8. Eliminar image
docker rmi nginx
```

---

## Tips y troubleshooting

### Error: "port is already allocated"
El puerto ya está en uso. Usa otro puerto o detén el proceso que lo está usando:
```bash
docker run -d -p 8081:80 nginx    # Usar puerto diferente
```

### Error: "container name already in use"
Ya existe un container con ese nombre. Elimínalo o usa otro nombre:
```bash
docker rm web                      # Eliminar container existente
docker run --name web2 nginx       # Usar otro nombre
```

### Ver qué puertos está usando un container
```bash
docker port <container-id>
```

### Copiar archivos entre host y container
```bash
docker cp <container-id>:/path/file ./local/path    # Del container al host
docker cp ./local/file <container-id>:/path/        # Del host al container
```

---

## Recursos adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
