# Clase 2 - Dockerfiles y Construcción de Imágenes

En esta clase aprenderemos a crear nuestras propias images (imágenes) Docker mediante Dockerfiles, aplicando técnicas de optimización como multi-stage builds.

---

## Objetivos de aprendizaje

- Comprender la anatomía de un Dockerfile y sus instrucciones principales
- Construir imágenes Docker personalizadas
- Aplicar multi-stage builds para optimizar tamaños de imagen
- Implementar buenas prácticas de seguridad (non-root users)
- Publicar imágenes en Docker Hub
- Entender el concepto de capas y cache en Docker

---

## Conceptos Clave

### Imágenes y Contenedores
- **Imagen (Image)**: Plantilla read-only con el sistema de archivos y configuración para ejecutar una aplicación
- **Contenedor (Container)**: Instancia en ejecución de una imagen
- Una imagen puede generar múltiples contenedores
- Imágenes se componen de capas apiladas (layered filesystem)
- Relación análoga: Clase (imagen) vs Objeto (contenedor) en POO

### Dockerfile
Archivo de texto con instrucciones para construir una imagen Docker de forma automatizada y reproducible.

### Image Layers (Capas)
- Cada instrucción en un Dockerfile crea una nueva capa
- Docker cachea capas para acelerar builds subsecuentes
- Orden de instrucciones afecta eficiencia del cache
- Capas son read-only, inmutables

### Multi-Stage Builds
- Técnica que permite usar múltiples `FROM` en un Dockerfile
- Separa etapas de build de etapas de runtime
- Reduce tamaño final de imagen (sin herramientas de compilación)
- Mejora seguridad (menos superficie de ataque)

### Build Context
- Conjunto de archivos que Docker puede acceder durante build
- Se envía al Docker daemon antes de construir
- Controlado con `.dockerignore` (similar a `.gitignore`)

### Docker Hub
- Registry público de imágenes Docker
- Permite compartir y distribuir imágenes
- Versionado con tags (ej: `usuario/imagen:1.0`)

**Para profundizar:**
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Build Cache](https://docs.docker.com/build/cache/)

---

## Laboratorios de la clase

- [Lab 1: Nginx con Contenido Estatico](labs/01-nginx-static/)
- [Lab 2: Node.js + Express con Multi-Stage Build](labs/02-nodejs-express-multistage/)

---

## Tareas

### Desafío Rápido (en clase)
Práctica de 5 minutos al final de la clase para aplicar lo aprendido.

[Ver instrucciones del Desafío Rápido](tareas/desafio-rapido.md)

### Tarea para Casa
Dockerizar una aplicación propia con multi-stage build y publicarla en Docker Hub.

[Ver instrucciones de la Tarea para Casa](tareas/tarea-casa.md)

### Recursos para las tareas
- [Guía de Entrega de Tareas](../../ENTREGA_TAREAS.md)
- [Cheat Sheet de la Clase 2](cheatsheet.md)

---

## Recursos

- [Cheat sheet rápido](cheatsheet.md)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
