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

### [Clase 2: Dockerfiles y Fundamentos de Compose](clase2-dockerfiles/)

- Anatomía de un Dockerfile, multi-stage builds y seguridad básica
- Fundamentos en runtime: volúmenes, redes y qué va (o no) en la imagen
- Anatomía de `docker-compose.yml` como antesala de la Clase 3

**[Cheat Sheet - Clase 2](clase2-dockerfiles/cheatsheet.md)**

### [Clase 3: Docker Compose, Redes y Volúmenes](clase3-compose/)

- Orquestación multi-contenedor con Docker Compose
- Redes personalizadas, segmentación de servicios y DNS interno
- Volúmenes para persistencia de datos y patrones de datos compartidos

**[Cheat Sheet - Clase 3](clase3-compose/cheatsheet.md)**

### [Clase 4: Microservicios y Seguridad Básica](clase4-microservicios/)

- Aplicaciones multi-contenedor con cache (Redis) y API Gateway
- Integración frontend/backend y comunicación entre servicios
- Introducción a Trivy y prácticas de hardening inicial

**[Cheat Sheet - Clase 4](clase4-microservicios/cheatsheet.md)**

### [Clase 5: Seguridad Avanzada y Puente a Kubernetes](clase5-seguridad/)

- Escaneo continuo con Trivy y optimización avanzada de imágenes
- Multi-stage builds, Alpine y usuarios non-root en profundidad
- Preview de Kubernetes: conceptos base y transición al siguiente bloque

**[Cheat Sheet - Clase 5](clase5-seguridad/cheatsheet.md)**


---

## Recursos adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)

---

[← Volver al curso](../README.md)
