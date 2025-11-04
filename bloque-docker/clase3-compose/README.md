# Clase 3 - Docker Compose: Redes y Volúmenes

En esta clase aprenderemos a orquestar aplicaciones multi-contenedor usando Docker Compose, y profundizaremos en redes y volúmenes para construir aplicaciones robustas y escalables.

---

## Objetivos de Aprendizaje

- Orquestar múltiples containers (contenedores) con Docker Compose
- Crear y gestionar redes personalizadas para segmentar servicios
- Implementar persistencia de datos con volúmenes
- Configurar comunicación entre servicios usando DNS interno

---

## Conceptos Clave

### Docker Compose

Docker Compose es una herramienta para definir y ejecutar aplicaciones Docker multi-container (multi-contenedor). Con un solo archivo YAML (`docker-compose.yml`) defines toda tu aplicación y con un solo comando la levantas completa.

**Ventajas**:
- Configuración declarativa y versionable
- Un solo comando para levantar toda la aplicación
- Gestión simplificada de múltiples contenedores
- Ideal para desarrollo y pruebas locales

**Documentación oficial**: [Docker Compose Overview](https://docs.docker.com/compose/)

### Redes (Networks)

Las redes en Docker permiten la comunicación entre contenedores. Docker crea un servidor DNS interno que permite que los contenedores se comuniquen usando **nombres de servicio** en lugar de IPs.

**Tipos de redes**:
- **bridge**: Red aislada por defecto (más común)
- **host**: Usa la red del host directamente
- **overlay**: Para clusters multi-host (Docker Swarm)

**Beneficio clave**: Segmentación de servicios para mejorar seguridad.

**Documentación oficial**: [Networking in Compose](https://docs.docker.com/compose/networking/)

### Volúmenes (Volumes)

Los volúmenes permiten persistir datos más allá del ciclo de vida de un contenedor. Sin volúmenes, los datos se pierden cuando eliminas un contenedor.

**Tipos**:
- **Named volumes**: Gestionados por Docker, recomendado para producción
- **Bind mounts**: Monta directorio del host, ideal para desarrollo
- **Anonymous volumes**: Temporales, se eliminan con el contenedor

**Documentación oficial**: [Use Volumes](https://docs.docker.com/storage/volumes/)

### Comandos y Archivo Compose

**Comando moderno (sin guión)**:
Desde Docker Compose v2 (integrado en Docker Desktop), el comando es `docker compose` (sin guión):

```bash
docker compose up -d    # Correcto (v2)
docker-compose up -d    # ADVERTENCIA: Antiguo (v1, standalone)
```

**Nombres de archivo válidos**:
Docker Compose busca automáticamente estos archivos en orden de prioridad:

1. `compose.yaml` (recomendado, formato moderno)
2. `compose.yml`
3. `docker-compose.yaml`
4. `docker-compose.yml` (más común actualmente)

**Archivo personalizado**:
```bash
docker compose -f mi-archivo.yaml up
docker compose -f produccion.yml up
```

**Campo `version`**:
Desde Compose v2, el campo `version` en el archivo YAML es **opcional y ya no se recomienda**. Docker Compose usa automáticamente la última especificación disponible.

```yaml
# Recomendado (sin version)
services:
  web:
    image: nginx

# ADVERTENCIA: Antiguo (con version)
version: '3.8'
services:
  web:
    image: nginx
```

---

## Fundamentos

Ejercicios conceptuales para entender volúmenes y redes en Docker Compose:

- [01: Tipos de Volúmenes](demos/01-tipos-volumenes/) - Named, bind, anonymous
- [02: Tipos de Redes](demos/02-tipos-redes/) - Bridge, host, none + attach/detach

**Nota**: Los fundamentos conceptuales de volúmenes/redes y la anatomía de docker-compose.yml se cubrieron en la Clase 2.

**[Ver todos los fundamentos](demos/)**

---

## Laboratorios

Práctica guiada con aplicaciones completas usando Docker Compose:

- [Lab 01: Docker Compose Básico](labs/01-compose-basico/)
- [Lab 02: Redes (Networks)](labs/02-redes/)
- [Lab 03: Volúmenes (Volumes)](labs/03-volumenes/)

---

## Tareas

### Desafío Rápido

Práctica rápida para aplicar lo aprendido.

[Ver instrucciones del Desafío Rápido](tareas/desafio-rapido.md)

### Tarea para Casa

Crear una aplicación multi-contenedor con Docker Compose y documentarla en tu repositorio personal.

[Ver instrucciones de la Tarea para Casa](tareas/tarea-casa.md)

### Recursos para las Tareas

- [Guía de Entrega de Tareas](../../ENTREGA_TAREAS.md)
- [Cheat Sheet de la Clase 3](cheatsheet.md)

---

## Recursos

- [Cheat Sheet Rápido](cheatsheet.md)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Networking](https://docs.docker.com/network/)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
