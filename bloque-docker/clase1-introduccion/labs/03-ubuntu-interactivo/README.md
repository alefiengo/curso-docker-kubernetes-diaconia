# Lab 03 – Ubuntu Interactivo

## Objetivo

Ejecutar un container (contenedor) en modo interactivo para explorar su filesystem, instalar software y comprender el aislamiento de procesos.

---

## Comandos a ejecutar

```bash
# 1. Ejecutar Ubuntu en modo interactivo
docker run -it --name ubu ubuntu bash
```

Una vez dentro del container, ejecuta:

```bash
# 2. Actualizar repositorios e instalar curl
apt update && apt install -y curl

# 3. Ver información del sistema
uname -a
cat /etc/os-release

# 4. Probar curl
curl https://httpbin.org/ip

# 5. Salir del container
exit
```

---

## Desglose del comando principal

```bash
docker run -it --name ubu ubuntu bash
```

| Componente | Descripción |
|------------|-------------|
| `docker run` | Crear y ejecutar un container |
| `-it` | **Interactive + TTY** - Modo interactivo con terminal |
| `--name ubu` | Asigna el nombre "ubu" al container |
| `ubuntu` | Image oficial de Ubuntu (última versión) |
| `bash` | Comando a ejecutar dentro del container (shell Bash) |

---

## Explicación detallada del flag `-it`

El flag `-it` es en realidad **dos flags combinados**:

### `-i` (Interactive - interactivo)

Mantiene **STDIN** (entrada estándar) abierto, permitiéndote escribir comandos.

Sin `-i`, el container se ejecutaría pero no podrías interactuar con él.

### `-t` (TTY - terminal)

Asigna una **pseudo-terminal** (pseudo-TTY) para que la sesión se comporte como una terminal real.

Sin `-t`, no verías el prompt y la salida se vería mal formateada.

### ¿Por qué necesitamos ambos?

```bash
# Sin -it: el container se ejecuta y termina inmediatamente
docker run ubuntu bash

# Solo -i: funciona pero sin formato de terminal
docker run -i ubuntu bash

# Solo -t: asigna terminal pero no hay interacción
docker run -t ubuntu bash

# Con -it: sesión interactiva completa
docker run -it ubuntu bash
```

---

## ¿Qué sucede al ejecutar este comando?

### 1. Docker descarga la image de Ubuntu (si no existe)

```
Unable to find image 'ubuntu:latest' locally
latest: Pulling from library/ubuntu
```

La image de Ubuntu es aproximadamente 70-80 MB (mucho más pequeña que una VM completa).

### 2. Se abre una shell interactiva

Verás un prompt como:
```bash
root@a1b2c3d4e5f6:/#
```

Donde:
- `root` - Usuario dentro del container (por defecto es root)
- `a1b2c3d4e5f6` - Los primeros caracteres del Container ID
- `/` - Directorio actual (raíz del filesystem)

**Estás dentro del container.**

---

## Explorando el container

### Ver información del sistema

```bash
uname -a
```

**Salida esperada:**
```
Linux a1b2c3d4e5f6 6.6.87.2-microsoft-standard-WSL2 #1 SMP ... x86_64 GNU/Linux
```

**Nota:** El kernel es compartido con el host (Docker usa el kernel del host), pero el filesystem es aislado.

### Ver la versión de Ubuntu

```bash
cat /etc/os-release
```

**Salida esperada:**
```
NAME="Ubuntu"
VERSION="24.04 LTS (Noble Numbat)"
ID=ubuntu
...
```

### Listar el filesystem raíz

```bash
ls /
```

Verás directorios estándar de Linux:
```
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```

### Ver procesos corriendo

```bash
ps aux
```

Verás **solo los procesos del container**, no los del host. Esto demuestra el **aislamiento de procesos**.

---

## Instalar software dentro del container

### Actualizar repositorios

```bash
apt update
```

Esto descarga la lista de paquetes disponibles.

### Instalar curl

```bash
apt install -y curl
```

El flag `-y` responde "yes" automáticamente a las confirmaciones.

### Probar curl

```bash
curl https://httpbin.org/ip
```

Deberías ver tu IP pública en formato JSON:
```json
{
  "origin": "203.0.113.42"
}
```

### Verificar que curl está instalado

```bash
which curl
curl --version
```

---

## Salir del container

```bash
exit
```

O presiona `Ctrl+D`

**¿Qué sucede al salir?**

El container **se detiene automáticamente** porque el proceso principal (`bash`) terminó.

---

## Verificar el estado del container

```bash
# Ver containers activos (no aparecerá)
docker ps

# Ver todos los containers incluyendo detenidos
docker ps -a
```

Verás:
```
CONTAINER ID   IMAGE    COMMAND   CREATED         STATUS                     NAMES
a1b2c3d4e5f6   ubuntu   "bash"    2 minutes ago   Exited (0) 5 seconds ago   ubu
```

**STATUS:** `Exited (0)` - El container terminó exitosamente.

---

## Diferencia entre `docker run -it` y `docker exec -it`

### `docker run -it`

- Crea un **nuevo** container
- El comando que especificas (`bash`) es el **proceso principal**
- Cuando sales (`exit`), el container se **detiene**

### `docker exec -it`

- Se conecta a un container **ya existente y corriendo**
- Ejecuta un comando adicional (como `bash`) en el container activo
- Cuando sales, el container **sigue corriendo**

**Ejemplo práctico:**

```bash
# Ejecutar Nginx en background
docker run -d --name web nginx

# Entrar al container Nginx que ya está corriendo
docker exec -it web bash

# Explorar
ls /usr/share/nginx/html/
cat /etc/nginx/nginx.conf

# Salir
exit

# El container Nginx sigue corriendo
docker ps
```

---

## Reiniciar y volver al container

### Opción 1: Reiniciar el container existente

```bash
# Iniciar el container detenido
docker start ubu

# Conectarse al container
docker attach ubu
```

**Problema:** `attach` te conecta al proceso principal, pero como bash ya terminó, necesitas otra forma.

### Opción 2: Usar exec en el container reiniciado

```bash
# Iniciar el container
docker start ubu

# Ejecutar un nuevo bash
docker exec -it ubu bash
```

### Opción 3: Usar `docker start -ai`

```bash
docker start -ai ubu
```

Esto reinicia el container y te conecta automáticamente.

**Nota importante:** Los paquetes instalados (`curl`) **se mantienen** mientras el container exista.

---

## Persistencia de cambios

### Los cambios persisten mientras el container exista

Si instalaste `curl` y luego haces `docker start` + `docker exec`, curl seguirá instalado.

### Los cambios NO persisten si eliminas el container

```bash
docker rm ubu
docker run -it --name ubu ubuntu bash
# curl ya NO estará instalado
```

**Para persistir cambios permanentemente:** Necesitas crear una nueva image con Dockerfile (lo verás en clases siguientes).

---

## Limpieza

```bash
# Eliminar el container
docker rm ubu

# Si el container está corriendo, forzar eliminación
docker rm -f ubu

# Eliminar la image de Ubuntu (opcional)
docker rmi ubuntu
```

---

## Conceptos aprendidos

- **Modo interactivo (`-it`)** - Ejecutar containers con shell interactiva
- **Aislamiento de procesos** - Los containers solo ven sus propios procesos
- **Aislamiento de filesystem** - Cada container tiene su propio filesystem
- **Instalación de software** - Puedes instalar paquetes dentro del container
- **Persistencia** - Los cambios persisten mientras el container exista
- **`docker exec -it`** - Conectarse a containers en ejecución
- **`exit` detiene el container** - Cuando el proceso principal termina, el container se detiene

---

## Troubleshooting

### No puedo instalar paquetes: "E: Unable to locate package"

**Causa:** Los repositorios no están actualizados.

**Solución:** Ejecuta `apt update` primero:
```bash
apt update
apt install -y curl
```

### El container se detiene inmediatamente al hacer `docker start ubu`

**Causa:** El proceso principal (`bash`) necesita estar en modo interactivo.

**Solución:** Usa `docker start -ai ubu` o `docker exec -it ubu bash` después de hacer start.

### Error: "the input device is not a TTY"

**Causa:** Estás ejecutando el comando en un contexto sin terminal (ej. script, CI/CD).

**Solución:** Usa solo `-i` sin `-t`:
```bash
docker run -i ubuntu bash
```

---

## Desafío adicional

Intenta crear dos containers Ubuntu simultáneamente en terminals diferentes:

**Terminal 1:**
```bash
docker run -it --name ubu1 ubuntu bash
```

**Terminal 2:**
```bash
docker run -it --name ubu2 ubuntu bash
```

Instala diferentes paquetes en cada uno y observa que están completamente aislados.

---

## Recursos adicionales

- [Docker Docs: docker exec](https://docs.docker.com/reference/cli/docker/container/exec/)
- [Docker Docs: docker run](https://docs.docker.com/engine/reference/run/)
- [Ubuntu Official Documentation](https://ubuntu.com/server/docs)

---

[← Volver a Clase 1](../../)
