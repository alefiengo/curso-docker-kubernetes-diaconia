# Tarea 2 - Dockerizar Aplicación con Multi-Stage Build

## Objetivo

Aplicar los conocimientos de Dockerfiles y multi-stage builds para containerizar una aplicación propia, optimizarla y publicarla en Docker Hub.

---

## Parte 1: Elegir o Crear una Aplicación

Elige **una de las siguientes opciones**:

### Opción 1: Aplicación Node.js

Crea o usa una aplicación Node.js/Express con:
- Al menos 2 endpoints
- Dependencias en package.json
- Puerto configurable

### Opción 2: Aplicación Python

Crea o usa una aplicación Python/Flask o FastAPI con:
- Al menos 2 endpoints
- requirements.txt
- Puerto configurable

### Opción 3: Aplicación Java

Crea o usa una aplicación Java (Spring Boot o similar) con:
- Al menos 2 endpoints
- Build con Maven o Gradle
- Puerto configurable

### Opción 4: Aplicación Go

Crea o usa una aplicación Go con:
- Al menos 2 endpoints HTTP
- go.mod para dependencias
- Compilación estática

---

## Parte 2: Crear Dockerfile con Multi-Stage Build

### Requisitos del Dockerfile

Tu Dockerfile debe incluir:

1. **Multi-stage build** (mínimo 2 stages):
   - Stage de build/compilación
   - Stage de producción/runtime

2. **Optimizaciones**:
   - Imagen base ligera (alpine cuando sea posible)
   - Solo dependencias de producción en stage final
   - Uso correcto de `.dockerignore`

3. **Seguridad**:
   - Usuario non-root
   - Variables de entorno apropiadas

4. **Buenas prácticas**:
   - EXPOSE con puerto documentado
   - HEALTHCHECK (opcional pero recomendado)
   - Labels con metadata

### Ejemplo de Estructura

```dockerfile
# Stage 1: Build
FROM <base-image> AS build
# ... instrucciones de build

# Stage 2: Production
FROM <base-image-runtime>
# ... solo runtime necesario
USER <non-root-user>
EXPOSE <port>
CMD [...]
```

---

## Parte 3: Build y Testing Local

### Tareas

1. **Crear .dockerignore**
   - Excluir archivos innecesarios
   - node_modules, .git, .env, etc.

2. **Construir la imagen**
   ```bash
   docker build -t mi-app:1.0 .
   ```

3. **Verificar tamaño**
   ```bash
   docker images mi-app
   ```

4. **Ejecutar localmente**
   ```bash
   docker run -d -p <puerto>:<puerto> --name mi-app mi-app:1.0
   ```

5. **Probar endpoints**
   - Usar curl o navegador
   - Capturar screenshots o salidas

6. **Verificar logs**
   ```bash
   docker logs mi-app
   ```

---

## Parte 4: Publicar en Docker Hub

### Pasos

1. **Hacer login en Docker Hub**
   ```bash
   docker login
   ```

2. **Tagear la imagen**
   ```bash
   docker tag mi-app:1.0 <tu-usuario>/mi-app:1.0
   ```

3. **Push a Docker Hub**
   ```bash
   docker push <tu-usuario>/mi-app:1.0
   ```

4. **Verificar en Docker Hub**
   - Acceder a https://hub.docker.com
   - Verificar que la imagen está pública

---

## Qué Debes Documentar

En tu archivo `clase2/README.md` debes incluir:

### 1. Descripción de la Aplicación

- Lenguaje y framework utilizado
- Endpoints disponibles
- Funcionalidad básica

### 2. Dockerfile

- Dockerfile completo (código fuente)
- Explicación de cada stage
- Tabla explicando instrucciones principales

### 3. Proceso de Build

- Comandos ejecutados
- Salida del build (primeras y últimas líneas)
- Tamaño final de la imagen

### 4. Testing Local

- Comandos para ejecutar el container
- Screenshots de:
  - `docker images` mostrando tu imagen
  - `docker ps` con el container corriendo
  - Navegador o curl probando endpoints
  - `docker logs` mostrando salida de la app

### 5. Publicación en Docker Hub

- Comandos de tag y push
- URL pública de tu imagen en Docker Hub
- Screenshot de la página en Docker Hub

### 6. Optimizaciones Aplicadas

- Comparación de tamaños (si hiciste build sin multi-stage)
- Qué optimizaciones aplicaste
- Capas de la imagen (`docker history`)

### 7. Conclusiones

- Dificultades encontradas
- Qué aprendiste
- Diferencias con Clase 1

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Dockerfile multi-stage funcional | 25% |
| Optimizaciones aplicadas (tamaño, seguridad) | 20% |
| Imagen publicada en Docker Hub | 15% |
| Documentación completa en README.md | 25% |
| Screenshots claros y relevantes | 10% |
| Explicaciones técnicas correctas | 5% |

---

## Ejemplo de Estructura de Documentación

```markdown
# Clase 2 - Dockerización de Mi Aplicación

## Aplicación

**Lenguaje:** Node.js
**Framework:** Express
**Descripción:** API REST para gestión de tareas

**Endpoints:**
- GET / - Página de bienvenida
- GET /api/tasks - Lista de tareas
- POST /api/tasks - Crear tarea

## Dockerfile

\`\`\`dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
...

# Stage 2: Production
FROM node:18-alpine
...
\`\`\`

**Explicación:**

| Stage | Propósito |
|-------|-----------|
| Build | Instalar todas las dependencias... |
| Production | Solo runtime... |

## Build

\`\`\`bash
docker build -t tasks-api:1.0 .
\`\`\`

**Salida:**
\`\`\`
[+] Building 32.5s ...
Successfully tagged tasks-api:1.0
\`\`\`

**Tamaño final:** 145MB

## Testing

![Docker Images](screenshots/docker-images.png)
![Container Running](screenshots/docker-ps.png)
![API Response](screenshots/curl-response.png)

## Docker Hub

**URL:** https://hub.docker.com/r/miusuario/tasks-api

![Docker Hub](screenshots/dockerhub.png)

## Optimizaciones

- Multi-stage build: redujo de 320MB a 145MB
- Usuario non-root
- .dockerignore excluye node_modules

## Conclusiones

Aprendí a optimizar imágenes...
```

---

## Recursos de Ayuda

- [Cheatsheet de la Clase 2](../cheatsheet.md)
- [Lab de Node.js Multi-Stage](../labs/nodejs-express-multistage/)
- [Guía de Entrega de Tareas](../../../ENTREGA_TAREAS.md)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Hub Quick Start](https://docs.docker.com/docker-hub/)

---

## Entrega

1. Completa tu repositorio con la estructura y documentación solicitada
2. Asegúrate de que tu imagen en Docker Hub sea **pública**
3. Verifica que todos los screenshots sean claros y legibles
4. **Adjunta el enlace de tu repositorio en Moodle**

**Fecha límite:** Antes de la Clase 3 (ver fecha específica en Moodle)

**Importante:** Cualquier commit posterior a la fecha límite será descalificado.

---

## Preguntas Frecuentes

### ¿Puedo usar una aplicación que ya tenía de antes?

Sí, siempre y cuando cumpla con los requisitos (endpoints, dependencies, etc.)

### ¿Qué pasa si no tengo cuenta en Docker Hub?

Créala gratis en https://hub.docker.com/signup - es requisito del curso.

### ¿Puedo hacer build sin multi-stage?

No, el multi-stage es obligatorio para esta tarea. Es el concepto principal de la clase.

### ¿Cuántos stages mínimo?

Mínimo 2 (build + production). Puedes tener más si lo justificas.

### Mi imagen es muy grande, ¿está mal?

Depende del lenguaje. Node.js alpine ~150MB es normal. Java puede ser ~200MB. Si tienes >500MB, revisa optimizaciones.
