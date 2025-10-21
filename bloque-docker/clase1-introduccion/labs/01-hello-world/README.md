# Lab 01 – Hello World

## Objetivo

Validar la instalación de Docker ejecutando tu primer container (contenedor) y comprender el flujo básico de ejecución.

---

## Comando a ejecutar

```bash
docker run hello-world
```

---

## Desglose del comando

| Componente | Descripción |
|------------|-------------|
| `docker run` | Comando para crear y ejecutar un container desde una image |
| `hello-world` | Nombre de la image oficial de Docker para validar instalación |

---

## ¿Qué sucede cuando ejecutas este comando?

Docker realiza automáticamente los siguientes pasos:

### 1. Busca la image localmente
```
Unable to find image 'hello-world:latest' locally
```
Docker busca la image `hello-world` en tu máquina local.

### 2. Descarga la image (Pull)
```
latest: Pulling from library/hello-world
```
Como no existe localmente, Docker la descarga desde Docker Hub (registro público).

### 3. Crea el container
Docker crea un container a partir de la image descargada.

### 4. Ejecuta el container
El container ejecuta el comando predefinido en la image, que imprime un mensaje de bienvenida.

### 5. El container finaliza
Una vez que el comando termina, el container se detiene automáticamente.

---

## Salida esperada

Deberías ver un mensaje similar a:

```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.
```

---

## Verificar que funcionó

### Ver la image descargada

```bash
docker images
```

Deberías ver:
```
REPOSITORY     TAG       IMAGE ID       CREATED        SIZE
hello-world    latest    feb5d9fea6a5   2 years ago    13.3kB
```

### Ver el container ejecutado

```bash
docker ps -a
```

Deberías ver el container con estado `Exited`:
```
CONTAINER ID   IMAGE         COMMAND    CREATED          STATUS                      PORTS     NAMES
abc123def456   hello-world   "/hello"   10 seconds ago   Exited (0) 9 seconds ago              eager_euler
```

**Nota:** El nombre del container (ej. `eager_euler`) es generado aleatoriamente por Docker si no especificas uno.

---

## Conceptos aprendidos

- **`docker run`** - Comando principal para ejecutar containers
- **Image (Imagen)** - Plantilla de solo lectura con el software y dependencias
- **Container (Contenedor)** - Instancia ejecutable de una image
- **Docker Hub** - Registro público de images de Docker
- **Pull automático** - Docker descarga images automáticamente si no existen localmente
- **Ciclo de vida** - Los containers pueden tener estados: creado, ejecutando, detenido, eliminado

---

## Limpieza (opcional)

Si quieres eliminar el container y la image:

```bash
# Eliminar el container
docker rm <container-id>

# Eliminar la image
docker rmi hello-world
```

---

## Troubleshooting

### Error: "Cannot connect to the Docker daemon"
**Solución:** Asegúrate de que Docker Desktop esté corriendo (Windows/macOS) o que el servicio Docker esté activo (Linux):
```bash
sudo systemctl start docker    # Linux
```

### Error: "permission denied"
**Solución (Linux):** Agrega tu usuario al grupo docker:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Desafío adicional

Repite el lab creando un container con nombre personalizado y vuelve a ejecutarlo verificando los logs:

1. Ejecuta `docker run --name hello-custom hello-world`.
2. Observa el resultado con `docker logs hello-custom`.
3. Elimina el container y lanza nuevamente la imagen, esta vez usando la flag `--rm` para que se elimine automáticamente al finalizar.

### Preguntas para reflexionar
- ¿Qué ventajas obtienes al nombrar explícitamente tus containers?
- ¿Qué escenarios justifican usar `--rm` y cuándo prefieres conservar el container detenido?

---

## Recursos adicionales

- [Docker Docs: hello-world](https://hub.docker.com/_/hello-world)
- [Docker Docs: docker run](https://docs.docker.com/engine/reference/run/)
- [Docker CLI Reference](https://docs.docker.com/reference/cli/docker/)

---

[← Volver a Clase 1](../../)
