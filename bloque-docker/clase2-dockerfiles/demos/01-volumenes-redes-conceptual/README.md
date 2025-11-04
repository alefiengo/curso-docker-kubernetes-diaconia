# 01: Volúmenes y Redes - Contenedores vs Imágenes

**Objetivo:** Aclarar qué se configura en imágenes vs contenedores

---

## La Pregunta Clave

**"¿Puedo agregar volúmenes y redes en un Dockerfile?"**

**Respuesta corta:** ADVERTENCIA: **Solo parcialmente**

---

## Conceptos Fundamentales

### Imagen vs Contenedor

```
┌─────────────────────────────────────────────────────────┐
│  IMAGEN (Dockerfile)                                    │
│  - Build time (tiempo de construcción)                 │
│  - Plantilla inmutable                                  │
│  - Se construye UNA VEZ                                 │
│  - Instrucciones: FROM, RUN, COPY, WORKDIR, EXPOSE     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ docker run
                          ▼
┌─────────────────────────────────────────────────────────┐
│  CONTENEDOR                                             │
│  - Runtime (tiempo de ejecución)                        │
│  - Instancia en ejecución                               │
│  - Se puede crear MÚLTIPLES veces desde una imagen     │
│  - Configuración: -v, --network, -p, -e                │
└─────────────────────────────────────────────────────────┘
```

---

## Volúmenes: Imagen vs Contenedor

### En Dockerfile (Imagen)

**Puedes usar `VOLUME`** pero con limitaciones:

```dockerfile
FROM nginx:alpine

# Define un mount point (punto de montaje)
VOLUME /data

# Esto NO crea un volumen nombrado
# Solo dice: "este directorio debería ser un volumen"
```

**Lo que hace `VOLUME` en Dockerfile:**
- Marca un directorio como punto de montaje
- Docker creará un volumen anónimo si no especificas uno
- NO puedes especificar un nombre
- NO puedes especificar una ruta del host
- NO puedes usar bind mounts

### En Contenedor (Runtime)

**Aquí es donde realmente configuras volúmenes:**

```bash
# Named volume
docker run -v mi-volumen:/data nginx

# Bind mount
docker run -v /host/path:/data nginx

# Anonymous volume (si no especificas nada y hay VOLUME en Dockerfile)
docker run nginx
```

---

## Redes: Imagen vs Contenedor

### En Dockerfile (Imagen)

**NO puedes configurar redes directamente:**

```dockerfile
FROM nginx:alpine

# NO existe instrucción NETWORK en Dockerfile
# NO puedes especificar a qué red se conectará

# Solo puedes EXPONER puertos (documentación)
EXPOSE 80
```

**`EXPOSE` es solo documentación:**
- Indica qué puerto escucha la aplicación
- NO publica el puerto automáticamente
- NO configura redes

### En Contenedor (Runtime)

**Aquí configuras la red:**

```bash
# Especificar red
docker run --network mi-red nginx

# Publicar puerto
docker run -p 8080:80 nginx

# Asignar IP estática (en redes custom)
docker run --network mi-red --ip 172.18.0.10 nginx
```

---

## Ejemplo Práctico

### Ejemplo: Volúmenes en Dockerfile

```bash
# Crear Dockerfile con VOLUME
cat > Dockerfile.volume <<EOF
FROM alpine
VOLUME /app
CMD ["sleep", "3600"]
EOF

# Construir imagen
docker build -f Dockerfile.volume -t test-volume .

# Ejecutar sin especificar volumen
docker run -d --name test1 test-volume

# Docker creó un volumen anónimo automáticamente
docker inspect test1 --format '{{ .Mounts }}'

# Ver volumen anónimo
docker volume ls
```

**Salida esperada:** Verás un volumen con nombre aleatorio (ej: `a3f2b8c9d...`)

### Comparación con Volumen Nombrado

```bash
# Ejecutar con volumen nombrado
docker run -d --name test2 -v mi-volumen:/app test-volume

# Ahora usa volumen nombrado
docker inspect test2 --format '{{ .Mounts }}'
```

**Conclusión:** `VOLUME` en Dockerfile crea volumen anónimo, pero puedes sobreescribirlo en `docker run`.

---

## Tabla Comparativa

| Aspecto | Dockerfile (Imagen) | docker run / Compose (Contenedor) |
|---------|---------------------|-----------------------------------|
| **Volúmenes nombrados** | No soportado | `-v nombre:/path` |
| **Bind mounts** | No soportado | `-v /host:/path` |
| **VOLUME** | ADVERTENCIA: Solo anonymous | Puede sobreescribirse |
| **Redes** | No soportado | `--network` |
| **Publicar puertos** | Solo `EXPOSE` (doc) | `-p host:container` |
| **Variables de entorno** | `ENV` (default) | `-e` (override) |

---

## Por Qué Esta Separación

**Razones de diseño:**

1. **Imágenes son portables:**
   - No dependen de rutas específicas del host
   - Funcionan en cualquier máquina

2. **Contenedores son específicos del entorno:**
   - Dev usa bind mounts (`./src:/app`)
   - Prod usa named volumes (`db-data:/var/lib/postgresql`)

3. **Seguridad:**
   - No quieres que una imagen pueda montar `/etc` del host
   - El usuario decide qué exponer

---

## Pregunta para Estudiantes

**Escenario:** Tienes un Dockerfile con `VOLUME /data`. ¿Qué pasa cuando...?

1. **Ejecutas:** `docker run mi-imagen`
   - **Respuesta:** Docker crea volumen anónimo para `/data`

2. **Ejecutas:** `docker run -v mi-vol:/data mi-imagen`
   - **Respuesta:** Usa volumen nombrado `mi-vol`, ignora el anónimo

3. **Ejecutas:** `docker run -v /host/data:/data mi-imagen`
   - **Respuesta:** Usa bind mount, ignora el `VOLUME` del Dockerfile

**Conclusión:** `docker run` tiene prioridad sobre `VOLUME` del Dockerfile.

---

## Regla Mnemotécnica

```
BUILD TIME (Dockerfile)
├── Define QUÉ es la aplicación
├── Instala dependencias
├── Configura la app internamente
└── Sugiere volúmenes con VOLUME

RUN TIME (docker run / Compose)
├── Define CÓMO ejecutar la aplicación
├── Conecta con el mundo exterior
├── Configura volúmenes específicos
└── Configura redes y puertos
```

---

## Conceptos Aprendidos

- Volúmenes y redes se configuran en **runtime** (contenedores), NO en build time (imágenes)
- `VOLUME` en Dockerfile solo crea volúmenes anónimos (puede sobreescribirse)
- `EXPOSE` en Dockerfile es documentación, NO publica puertos
- Imágenes son portables, contenedores son específicos del entorno
- `docker run` y Docker Compose tienen control total sobre volúmenes y redes

---

## En Docker Compose

En los labs verás que Docker Compose maneja todo esto de forma declarativa:

```yaml
services:
  app:
    image: mi-imagen
    volumes:          # Runtime: volúmenes
      - mi-vol:/data
    networks:         # Runtime: redes
      - mi-red
    ports:            # Runtime: puertos
      - "8080:80"
```

---

## Siguiente

[02: Anatomía docker-compose.yml →](../02-anatomia-compose/)

---

[← Volver a Fundamentos](../README.md)
