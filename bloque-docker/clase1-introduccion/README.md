# Clase 1 – Introducción a Containers (Contenedores) y Docker

En esta clase nos enfocaremos en **los fundamentos de Docker**, ejecutaremos nuestros **primeros containers (contenedores)** y exploraremos el ecosistema de images (imágenes) oficiales.

---

## Objetivos de aprendizaje
- Comprender qué es Docker y en qué se diferencia de las máquinas virtuales
- Ejecutar el primer container (contenedor) (*hello-world*) y un servicio web (Nginx)
- Conocer y practicar comandos básicos de Docker
- Explorar Docker Hub para descubrir images (imágenes) oficiales

---

## Conceptos Clave

### Containers (Contenedores) vs Máquinas Virtuales
- **Container**: Proceso aislado que comparte el kernel del sistema operativo
- **VM**: Sistema operativo completo virtualizado con su propio kernel
- Containers son más ligeros, rápidos de iniciar y eficientes en recursos

### Docker Components
- **Docker Engine**: Runtime que ejecuta containers
- **Image (Imagen)**: Template read-only, blueprint de un container
- **Container (Contenedor)**: Instancia ejecutable de una imagen
- **Docker Hub**: Registry público de imágenes

### Comandos Fundamentales
- `docker run`: Crear y ejecutar un container desde una imagen
- `docker ps`: Listar containers en ejecución
- `docker logs`: Ver salida de un container
- `docker exec`: Ejecutar comandos dentro de un container corriendo
- `docker stop/rm`: Detener y eliminar containers

**Para profundizar:**
- [Docker Overview](https://docs.docker.com/get-started/overview/)
- [Containers vs VMs](https://docs.docker.com/get-started/overview/#containers-vs-virtual-machines)

---

## Laboratorios de la clase
- [01 – Hello World](labs/01-hello-world/)
- [02 – Nginx](labs/02-nginx/)
- [03 – Ubuntu interactivo](labs/03-ubuntu-interactivo/)
- [04 – Docker Hub](labs/04-docker-hub/)

---

## Recursos
- [Cheat sheet rápido](cheatsheet.md)
- [Guía de instalación de Docker](assets/links.md#docker)
- [Instalación de VS Code y Git](assets/links.md)

---

## Tareas

### Desafío Rápido (en clase)
Práctica de 5 minutos al final de la clase para aplicar lo aprendido.

[Ver instrucciones del Desafío Rápido](tareas/desafio-rapido.md)

### Tarea para Casa
Configuración de tu repositorio personal y despliegue de una aplicación simple (httpd, redis o mysql).

[Ver instrucciones de la Tarea para Casa](tareas/tarea-casa.md)

### Recursos para las tareas
- [Guía de Entrega de Tareas](../../ENTREGA_TAREAS.md)
- [Cheat Sheet de la Clase 1](cheatsheet.md)
