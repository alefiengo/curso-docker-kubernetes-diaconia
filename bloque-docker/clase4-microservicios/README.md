# Clase 4: Microservicios y Seguridad

## Objetivos de Aprendizaje

- Construir aplicaciones multi-servicio con bases de datos
- Implementar cache (caché) con Redis para mejorar rendimiento
- Configurar un API Gateway con Nginx para centralizar requests
- Comprender patrones de arquitectura de microservicios
- Escanear imágenes Docker con Trivy en busca de vulnerabilidades
- Aplicar técnicas de optimización y hardening de imágenes

## Conceptos Clave

### Microservicios y Arquitectura

- **Microservicios**: Arquitectura donde la aplicación se divide en servicios independientes que se comunican entre sí
- **Cache (Caché)**: Almacenamiento temporal de datos frecuentemente accedidos para mejorar rendimiento
- **API Gateway**: Punto de entrada único que distribuye requests a diferentes servicios backend
- **Service Discovery**: Resolución de nombres de servicios mediante DNS interno de Docker
- **Data Persistence**: Estrategias para persistir datos en aplicaciones distribuidas

### Seguridad y Optimización

- **Trivy**: Herramienta de escaneo de vulnerabilidades para imágenes Docker
- **CVE (Common Vulnerabilities and Exposures)**: Base de datos de vulnerabilidades conocidas
- **Niveles de severidad**: CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN
- **Multi-stage builds**: Técnica para reducir tamaño y superficie de ataque
- **Alpine Linux**: Distribución mínima para containers con menor superficie de ataque
- **Non-root users**: Ejecución de containers con usuarios sin privilegios
- **Attack surface**: Superficie de ataque, minimizada al reducir paquetes instalados

## Buenas Prácticas Aplicadas

**Todos los labs de esta clase aplican las buenas prácticas aprendidas en Clase 2:**

- **Multi-stage builds**: Separación de etapas build y production para imágenes más livianas
- **Non-root users**: Todos los contenedores ejecutan con usuario `nodejs` (UID 1001) por seguridad
- **npm ci**: Uso de `npm ci --only=production` para instalaciones determinísticas
- **Cache cleaning**: `npm cache clean --force` para reducir tamaño de imágenes
- **HEALTHCHECK**: Checks automáticos de salud en todos los servicios
- **Variables de entorno**: ENV explícitas para mejor documentación
- **Ownership correcto**: `chown` para permisos apropiados del usuario no-root

Estas prácticas se consolidarán en los labs de seguridad y optimización de esta clase.

---

## Parte 1: Microservicios y Cache

### [Lab 01: Node.js + MongoDB](labs/01-nodejs-mongodb/)
Aplicación full-stack con API REST y base de datos MongoDB.

### [Lab 02: Redis como Cache](labs/02-redis-cache/)
Implementar cache con Redis para optimizar consultas a base de datos.

### [Lab 03: Nginx como API Gateway](labs/03-nginx-gateway/)
Configurar Nginx como gateway para distribuir tráfico entre servicios frontend y backend.

---

## Parte 2: Seguridad y Optimización

### [Lab 04: Escaneo de Vulnerabilidades con Trivy](labs/04-trivy-scan/)
Instalar y usar Trivy para escanear las imágenes construidas en los labs anteriores, identificar vulnerabilidades y aplicar remediación.

### [Lab 05: Optimización de Imágenes](labs/05-optimizacion/)
Aplicar técnicas de optimización (Alpine, multi-stage builds, non-root users) para reducir el tamaño de imágenes Docker y mejorar seguridad.

---

## Tareas

- [Desafío Rápido](tareas/desafio-rapido.md)
- [Tarea para Casa](tareas/tarea-casa.md)

## Cheatsheet

- [Comandos y Conceptos - Clase 4](cheatsheet.md)

## Recursos

- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Redis Official Image](https://hub.docker.com/_/redis)
- [Nginx Official Image](https://hub.docker.com/_/nginx)
- [MongoDB Official Image](https://hub.docker.com/_/mongo)
- [Best Practices for Microservices with Docker](https://docs.docker.com/get-started/microservices/)
