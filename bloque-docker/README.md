# Bloque 1: Docker

Este bloque cubre los fundamentos y uso avanzado de Docker, desde la creación y administración de containers (contenedores) hasta la orquestación con Docker Compose y buenas prácticas de seguridad.

---

## Objetivos del bloque

Al finalizar este bloque, serás capaz de:

- Comprender la arquitectura de Docker y containers (contenedores)
- Crear, administrar y debuggear containers (contenedores)
- Trabajar con images (imágenes), Dockerfile y registries
- Configurar networks (redes) y volumes (volúmenes)
- Usar Docker Compose para aplicaciones multi-container
- Aplicar buenas prácticas de seguridad y escaneo de vulnerabilidades

---

## Contenido

### [Clase 1: Introducción a Containers (Contenedores) y Docker](clase1-introduccion/)

- ¿Qué es Docker y en qué se diferencia de las VMs?
- Instalación y configuración
- Primeros containers: hello-world, nginx, ubuntu
- Comandos básicos de Docker
- Docker Hub y exploración de images oficiales

**[Cheat Sheet - Clase 1](clase1-introduccion/cheatsheet.md)**

### [Clase 2: Dockerfiles y Construcción de Imágenes](clase2-dockerfiles/)

- Anatomía de un Dockerfile
- Construir imágenes personalizadas
- Multi-stage builds para optimización
- Buenas prácticas de seguridad (non-root users)
- Publicar imágenes en Docker Hub
- Concepto de capas y cache

**[Cheat Sheet - Clase 2](clase2-dockerfiles/cheatsheet.md)**

### [Clase 3: Docker Compose, Redes y Volúmenes](clase3-compose/)

- Orquestación multi-contenedor con Docker Compose
- Redes personalizadas y segmentación de servicios
- Volúmenes para persistencia de datos
- Comunicación entre servicios con DNS interno
- Aplicación full-stack: Node.js + MongoDB

**[Cheat Sheet - Clase 3](clase3-compose/cheatsheet.md)**

### [Clase 4: Microservicios, Cache y Gateway](clase4-microservicios/)

- Aplicaciones multi-contenedor con cache (Redis)
- API Gateway con Kong
- Frontend con Angular y nginx
- Comunicación entre servicios
- Patrones de microservicios

**[Cheat Sheet - Clase 4](clase4-microservicios/cheatsheet.md)**

### [Clase 5: Seguridad y Optimización](clase5-seguridad/)

- Escaneo de vulnerabilidades con Trivy
- Técnicas de optimización de imágenes
- Multi-stage builds avanzados
- Imagen base Alpine
- Buenas prácticas de seguridad
- Health checks y labels de metadata

**[Cheat Sheet - Clase 5](clase5-seguridad/cheatsheet.md)**

---

## Recursos adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)

---

[← Volver al curso](../README.md)
