# Tarea 1 - Configuración de Repositorio y Primer Desafío

## Parte 1: Configuración del Repositorio Personal

Crea tu repositorio personal donde documentarás todas las tareas del curso.

### Instrucciones

1. **Crea un repositorio público** en GitHub o GitLab
   - Nombre sugerido: `curso-docker-kubernetes-tareas`
   - Inicialízalo con un README.md

2. **Crea la estructura inicial del repositorio:**
   ```
   curso-docker-kubernetes-tareas/
   ├── README.md
   ├── clase1/
   │   ├── README.md
   │   └── screenshots/
   └── .gitignore
   ```

3. **Configura el README.md principal** con:
   - Título: "Tareas - Curso Docker & Kubernetes"
   - Tu nombre
   - Enlace al curso de i-Quattro
   - Índice con enlaces a cada clase

4. **Crea el archivo .gitignore** con contenido básico:
   ```
   # Archivos del sistema
   .DS_Store
   Thumbs.db

   # Logs
   *.log

   # Variables de entorno
   .env
   .env.local

   # Archivos temporales
   *.tmp
   *.swp
   ```

---

## Parte 2: Desafío Técnico con Docker

Explora diferentes aplicaciones desplegadas con Docker.

### Objetivo

Practicar el despliegue de diferentes tipos de aplicaciones usando `docker run` y documentar el proceso de cada una.

### Aplicaciones a Desplegar

Elige **1 de las siguientes 3 aplicaciones** y despliégala:

#### Opción 1: Apache HTTP Server (httpd)

Despliega un servidor web Apache:
- Imagen: `httpd`
- Puerto: 8081
- Nombre del container: `mi-apache`
- Verifica accediendo a `http://localhost:8081`

#### Opción 2: Redis (base de datos clave-valor)

Despliega un servidor Redis:
- Imagen: `redis`
- Puerto: 6379
- Nombre del container: `mi-redis`
- Verifica con `docker logs` que Redis inició correctamente

#### Opción 3: MySQL (base de datos relacional)

Despliega un servidor MySQL:
- Imagen: `mysql`
- Puerto: 3306
- Nombre del container: `mi-mysql`
- Variables de entorno requeridas:
  - `MYSQL_ROOT_PASSWORD=mi-password-seguro`
- Verifica con `docker logs` que MySQL inició correctamente

### Tareas a Realizar

Para la aplicación que elegiste:

1. **Ejecutar el container** en segundo plano con el puerto y nombre especificados

2. **Verificar que funciona:**
   - Lista los containers en ejecución
   - Consulta los logs del container
   - Accede al servicio (navegador para httpd, logs para redis/mysql)

3. **Limpieza:**
   - Detén el container
   - Elimínalo
   - Verifica que ya no existe

---

## Qué Debes Documentar

En tu archivo `clase1/README.md` debes incluir:

### Documentación Requerida

1. **Nombre de la aplicación** - Indica cuál elegiste (httpd, redis o mysql)

2. **Comandos ejecutados** - Todos los comandos que usaste, uno por uno:
   - Comando `docker run` completo
   - Comandos de verificación
   - Comandos de limpieza

3. **Explicación breve** - Qué hace cada flag del comando `docker run` que usaste

4. **Evidencia:**
   - Screenshot de `docker ps` mostrando el container corriendo
   - Screenshot del navegador (si es httpd) o salida de `docker logs` (si es redis/mysql)
   - Screenshot o salida mostrando que el container fue eliminado correctamente

5. **Conclusiones (opcional):**
   - Qué aprendiste
   - Dificultades encontradas y cómo las resolviste

---

## Recursos de Ayuda

- [Cheatsheet de la Clase 1](../cheatsheet.md)
- [Guía de Entrega de Tareas](../../../ENTREGA_TAREAS.md)
- [Documentación oficial de Docker](https://docs.docker.com/)
- [Guía de Markdown](https://www.markdownguide.org/basic-syntax/)

---

## Entrega

1. Completa tu repositorio con la estructura y documentación solicitada
2. Asegúrate de que sea **público**
3. Sube todos los cambios a GitHub/GitLab (`git push`)
4. **Adjunta el enlace de tu repositorio en Moodle**

**Fecha límite:** Antes de la Clase 2 (ver fecha específica en Moodle)

**Importante:** Cualquier commit posterior a la fecha límite será descalificado.
