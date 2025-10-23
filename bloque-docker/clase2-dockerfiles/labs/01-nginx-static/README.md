# Lab 1: Nginx con Contenido Estático

## Objetivo

Aprender a crear una imagen Docker (imagen) personalizada para servir contenido HTML estático utilizando Nginx, aplicando conceptos de copia de archivos, configuración personalizada y exposición de puertos no estándar.

---

## Estructura del Proyecto

```
01-nginx-static/
├── Dockerfile                    # Definición de la imagen
├── nginx.conf                    # Configuración personalizada de Nginx
├── static-html-directory/        # Contenido estático del sitio web
│   ├── index.html
│   ├── about.html
│   └── styles.css
└── README.md                     # Este archivo
```

---

## Paso 1: Revisar el Dockerfile

**Archivo:** `Dockerfile`

```dockerfile
FROM nginx:alpine

COPY static-html-directory /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8089
```

### Desglose del Dockerfile

| Instrucción | Descripción |
|-------------|-------------|
| `FROM nginx:alpine` | Usa la imagen base de Nginx con Alpine Linux (minimalista, ~24 MB) |
| `COPY static-html-directory /usr/share/nginx/html` | Copia todo el directorio con archivos HTML al directorio raíz de Nginx |
| `COPY nginx.conf /etc/nginx/nginx.conf` | Reemplaza la configuración por defecto de Nginx con nuestra configuración personalizada |
| `EXPOSE 8089` | Documenta que el contenedor (container) escuchará en el puerto 8089 (no estándar) |

---

## Paso 2: Revisar la Configuración de Nginx

**Archivo:** `nginx.conf`

La configuración personalizada incluye:

- **Puerto personalizado**: Escucha en el puerto `8089` en lugar del puerto estándar `80`
- **Compression gzip**: Comprime respuestas para mejorar rendimiento
- **Cache de archivos estáticos**: Configura cache de 1 año para CSS, JS e imágenes
- **Logging**: Registra accesos y errores
- **Error handling**: Manejo de errores 404 y 50x

### Configuración clave del servidor:

```nginx
server {
    listen 8089;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
}
```

---

## Paso 3: Construir la Imagen

```bash
docker build -t nginx-static:1.0 .
```

### Salida esperada:

```
[+] Building 2.3s (8/8) FINISHED
 => [1/3] FROM docker.io/library/nginx:alpine
 => [2/3] COPY static-html-directory /usr/share/nginx/html
 => [3/3] COPY nginx.conf /etc/nginx/nginx.conf
 => exporting to image
 => => naming to docker.io/library/nginx-static:1.0
```

### Verificar la imagen creada:

```bash
docker images nginx-static
```

**Salida esperada:**

```
REPOSITORY      TAG       IMAGE ID       CREATED          SIZE
nginx-static    1.0       abc123def456   10 seconds ago   24.5MB
```

---

## Paso 4: Ejecutar el Container (Contenedor)

```bash
docker run -d -p 8089:8089 --name web-estático nginx-static:1.0
```

### Desglose del comando

| Componente | Descripción |
|------------|-------------|
| `docker run` | Crear y ejecutar un container |
| `-d` | **Detached mode** - Ejecutar en segundo plano |
| `-p 8089:8089` | **Port mapping** - Mapear puerto 8089 del host al puerto 8089 del container |
| `--name web-estático` | Asignar nombre al container |
| `nginx-static:1.0` | Imagen a utilizar |

### Verificar que el container este corriendo:

```bash
docker ps
```

**Salida esperada:**

```
CONTAINER ID   IMAGE              COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   nginx-static:1.0   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8089->8089/tcp   web-estático
```

---

## Paso 5: Probar el Sitio Web

### Opción 1: Navegador web

Abre tu navegador y accede a:

```
http://localhost:8089
```

Deberás ver el sitio web estático con:
- Página principal (index.html)
- Estilos CSS aplicados
- Link a la página "Acerca de"

### Opción 2: curl (línea de comandos)

```bash
curl http://localhost:8089
```

**Salida esperada:** HTML de la página principal

### Opción 3: Verificar página "Acerca de"

```
http://localhost:8089/about.html
```

---

## Paso 6: Inspeccionar el Container

### Ver logs del servidor Nginx:

```bash
docker logs web-estático
```

**Salida esperada:**

```
/docker-entrypoint.sh: Configuration complete; ready for start up
```

### Ver logs en tiempo real:

```bash
docker logs -f web-estático
```

Cada vez que accedas al sitio en el navegador, verás los logs de acceso.

### Acceder al shell del container:

```bash
docker exec -it web-estático sh
```

Dentro del container, puedes explorar:

```bash
# Ver archivos HTML copiados
ls -la /usr/share/nginx/html

# Ver configuración de Nginx
cat /etc/nginx/nginx.conf

# Verificar proceso de Nginx
ps aux | grep nginx

# Salir del container
exit
```

---

## Paso 7: Probar Modificaciones (Opcional)

### Modificar el contenido HTML:

1. Edita `static-html-directory/index.html`
2. Reconstruye la imagen:

```bash
docker build -t nginx-static:1.1 .
```

3. Detiene el container anterior:

```bash
docker stop web-estático
docker rm web-estático
```

4. Ejecuta la nueva versión:

```bash
docker run -d -p 8089:8089 --name web-estático nginx-static:1.1
```

5. Refresca el navegador para ver los cambios

---

## Limpieza

### Detener y eliminar el container:

```bash
docker stop web-estático
docker rm web-estático
```

### Eliminar la imagen:

```bash
docker rmi nginx-static:1.0
```

### Eliminar todas las versiones:

```bash
docker rmi $(docker images nginx-static -q)
```

---

## Conceptos Aprendidos

- **Imagen base Alpine**: Uso de imágenes minimalistas para reducir tamaño
- **Instrucción COPY**: Copiar archivos y directorios a la imagen
- **Configuración personalizada**: Reemplazar configuraciones por defecto de aplicaciones
- **Puerto personalizado**: Usar puertos diferentes al estándar (80)
- **Port mapping**: Mapear puertos del host a puertos del container
- **Rebuild e iteración**: Proceso de modificar, reconstruir y desplegar cambios

---

## Troubleshooting

### Error: "port is already allocated"

**Problema:** El puerto 8089 ya está en uso.

**Solución:**

```bash
# Opción 1: Usar otro puerto
docker run -d -p 9090:8089 --name web-estático nginx-static:1.0

# Opción 2: Detener el container que esta usando el puerto
docker ps
docker stop <container-id>
```

### Error: "container name already in use"

**Problema:** Ya existe un container con el nombre `web-estático`.

**Solución:**

```bash
# Eliminar el container existente
docker rm -f web-estático

# O usar otro nombre
docker run -d -p 8089:8089 --name web-estático-v2 nginx-static:1.0
```

### El sitio no se ve con estilos

**Problema:** Los estilos CSS no se cargan.

**Diagnóstico:**

1. Verifica que `styles.css` este en `static-html-directory/`
2. Inspecciona el container:

```bash
docker exec -it web-estático ls -la /usr/share/nginx/html
```

3. Revisa que nginx.conf incluya MIME types:

```bash
docker exec -it web-estático cat /etc/nginx/nginx.conf | grep mime.types
```

**Solución:** Reconstruye la imagen asegurándote de que todos los archivos esten presentes.

---

## Desafío Adicional

### Nivel 1: Agregar más páginas

- Crea una nueva página HTML (ej: `contact.html`)
- Agrega un link desde `index.html`
- Reconstruye y prueba

### Nivel 2: Agregar imágenes

- Agrega una carpeta `images/` en `static-html-directory/`
- Incluye imágenes (PNG, JPG)
- Referéncialas en el HTML
- Verifica que nginx.conf tenga cache para imágenes

### Nivel 3: Multi-stage build

- Crea un Dockerfile multi-stage que:
  1. Primera etapa: valide el HTML (puedes usar un validador)
  2. Segunda etapa: copie solo los archivos validados a Nginx

### Nivel 4: Publicar en Docker Hub

```bash
# Tag la imagen con tu usuario de Docker Hub
docker tag nginx-static:1.0 tu-usuario/nginx-static:1.0

# Login a Docker Hub
docker login

# Push la imagen
docker push tu-usuario/nginx-static:1.0
```

---

## Recursos Adicionales

- [Nginx Official Documentation](https://nginx.org/en/docs/)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)
- [Nginx Configuration Guide](https://www.nginx.com/resources/wiki/start/topics/examples/full/)
- [Alpine Linux](https://alpinelinux.org/)
- [Docker COPY vs ADD](https://docs.docker.com/engine/reference/builder/#copy)

---

## Comparación con Clase 1

En la **Clase 1** ejecutamos Nginx directamente desde Docker Hub:

```bash
docker run -d -p 8080:80 nginx
```

En este lab de **Clase 2**, creamos nuestra **propia imagen personalizada** con:
- Contenido HTML personalizado
- Configuración de Nginx modificada
- Puerto personalizado
- Control total sobre la aplicación

Esta es la esencia de los Dockerfiles: **personalizar y crear tus propias imágenes**.

---

[← Volver a Clase 2](../../README.md)
