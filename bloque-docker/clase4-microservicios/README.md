# Clase 4: Microservicios y Seguridad Básica

## Objetivos de Aprendizaje

- Construir aplicaciones multi-servicio con bases de datos
- Implementar cache (caché) con Redis para mejorar rendimiento
- Configurar un API Gateway con Nginx para centralizar requests
- Comprender patrones de arquitectura de microservicios
- Gestionar comunicación entre servicios mediante redes Docker
- Introducción al escaneo de vulnerabilidades con Trivy

## Conceptos Clave

### Microservicios y Arquitectura

- **Microservicios**: Arquitectura donde la aplicación se divide en servicios independientes que se comunican entre sí
- **Cache (Caché)**: Almacenamiento temporal de datos frecuentemente accedidos para mejorar rendimiento
- **API Gateway**: Punto de entrada único que distribuye requests a diferentes servicios backend
- **Service Discovery**: Resolución de nombres de servicios mediante DNS interno de Docker
- **Data Persistence**: Estrategias para persistir datos en aplicaciones distribuidas

### Seguridad Básica

- **Trivy**: Herramienta de escaneo de vulnerabilidades para imágenes Docker
- **CVE (Common Vulnerabilities and Exposures)**: Base de datos de vulnerabilidades conocidas
- **Niveles de severidad**: CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN
- **Image scanning**: Proceso de análisis de imágenes para detectar vulnerabilidades

## Buenas Prácticas Aplicadas

**Todos los labs de esta clase aplican las buenas prácticas aprendidas en Clase 2:**

- **Multi-stage builds**: Separación de etapas build y production para imágenes más livianas
- **Non-root users**: Todos los contenedores ejecutan con usuario `nodejs` (UID 1001) por seguridad
- **npm ci**: Uso de `npm ci --only=production` para instalaciones determinísticas
- **Cache cleaning**: `npm cache clean --force` para reducir tamaño de imágenes
- **HEALTHCHECK**: Checks automáticos de salud en todos los servicios
- **Variables de entorno**: ENV explícitas para mejor documentación
- **Ownership correcto**: `chown` para permisos apropiados del usuario no-root

Estas prácticas refuerzan lo aprendido y preparan para Clase 5 (Seguridad Avanzada y Puente a Kubernetes).

---

## Introducción a Seguridad con Trivy

Al finalizar los labs de microservicios, haremos una **introducción práctica al escaneo de vulnerabilidades** usando Trivy.

**¿Por qué es importante?**

En aplicaciones multi-servicio, cada imagen Docker puede contener vulnerabilidades que comprometan la seguridad del sistema completo. Trivy nos permite:

- Detectar vulnerabilidades conocidas (CVEs) en nuestras imágenes
- Identificar paquetes desactualizados con problemas de seguridad
- Comprender niveles de severidad (CRITICAL, HIGH, MEDIUM, LOW)
- Tomar decisiones informadas sobre qué imágenes usar en producción

**Demo rápida:**

Después de completar el Lab 03, escanearemos una de las imágenes construidas:

```bash
# Instalar Trivy (Ubuntu/Debian)
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Escanear una imagen
trivy image nombre-imagen:tag
```

Esta introducción prepara para la **Clase 5**, donde profundizaremos en seguridad avanzada y técnicas de hardening.

---

## Laboratorios de la clase

### [Lab 01: Node.js + MongoDB](labs/01-nodejs-mongodb/)
Aplicación full-stack con API REST y base de datos MongoDB. Lab recuperado de la clase anterior.

### [Lab 02: Redis como Cache](labs/02-redis-cache/)
Implementar cache con Redis para optimizar consultas a base de datos.

### [Lab 03: Nginx como API Gateway](labs/03-nginx-gateway/)
Configurar Nginx como gateway para distribuir tráfico entre servicios frontend y backend.

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
