# Clase 4: Microservicios, Seguridad y Puente a Kubernetes

## Objetivos de Aprendizaje

- Construir aplicaciones multi-servicio con bases de datos
- Implementar cache (caché) con Redis para mejorar rendimiento
- Configurar un API Gateway con Nginx para centralizar requests
- Comprender patrones de arquitectura de microservicios
- Escanear imágenes Docker con Trivy en busca de vulnerabilidades
- Aplicar técnicas de optimización y hardening de imágenes
- Comprender los fundamentos de Kubernetes y su arquitectura

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

### Introducción a Kubernetes

- **Kubernetes**: Sistema de orquestación de containers a nivel productivo
- **Control Plane**: Componentes que gestionan el cluster (API Server, Scheduler, etc.)
- **Worker Nodes**: Máquinas que ejecutan los containers
- **Pods**: Unidad mínima de despliegue en Kubernetes
- **Declarative vs Imperative**: Filosofía de Kubernetes (estado deseado vs comandos)

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

### Lab 04: Escaneo de Vulnerabilidades con Trivy

Instalar y usar Trivy para escanear las imágenes construidas en los labs anteriores.

**Comandos básicos:**

```bash
# Instalar Trivy (Ubuntu/Debian)
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Escanear imagen del Lab 03
trivy image nginx-gateway-backend:latest

# Escanear con nivel de severidad específico
trivy image --severity HIGH,CRITICAL nginx-gateway-backend:latest
```

**Ejercicio:** Identificar vulnerabilidades CRITICAL y documentar posibles soluciones.

### Lab 05: Optimización de Imágenes

Aplicar técnicas de optimización a las imágenes del Lab 03:

1. **Usar Alpine Linux** como base
2. **Multi-stage builds avanzados**
3. **Eliminar dependencias de desarrollo**
4. **Comparar tamaños** antes y después

**Objetivo:** Reducir tamaño de imagen de ~200MB a ~50MB

---

## Parte 3: Puente a Kubernetes

Al finalizar los labs, haremos una **introducción conceptual a Kubernetes** para preparar la transición al Bloque 2.

**Temas a cubrir:**

### ¿Por qué Kubernetes?

Docker Compose funciona excelente para desarrollo local, pero en producción necesitamos:

- **Alta disponibilidad**: Si un contenedor falla, reiniciarlo automáticamente
- **Escalado automático**: Aumentar/disminuir réplicas según demanda
- **Load balancing**: Distribuir tráfico entre múltiples réplicas
- **Rolling updates**: Actualizar sin downtime
- **Multi-host**: Desplegar en múltiples servidores

Kubernetes resuelve estos problemas y más.

### Arquitectura Básica de Kubernetes

```
┌─────────────────────────────────────────────────┐
│              KUBERNETES CLUSTER                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │         Control Plane (Master)         │    │
│  │  ┌──────────┐  ┌──────────┐           │    │
│  │  │API Server│  │Scheduler │           │    │
│  │  └──────────┘  └──────────┘           │    │
│  │  ┌──────────┐  ┌──────────┐           │    │
│  │  │   etcd   │  │Controller│           │    │
│  │  └──────────┘  └──────────┘           │    │
│  └────────────────────────────────────────┘    │
│                      │                          │
│                      ▼                          │
│  ┌────────────────────────────────────────┐    │
│  │         Worker Nodes (Minions)         │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐   │    │
│  │  │ Pod 1  │  │ Pod 2  │  │ Pod 3  │   │    │
│  │  │┌──────┐│  │┌──────┐│  │┌──────┐│   │    │
│  │  ││ ctr  ││  ││ ctr  ││  ││ ctr  ││   │    │
│  │  │└──────┘│  │└──────┘│  │└──────┘│   │    │
│  │  └────────┘  └────────┘  └────────┘   │    │
│  └────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Conceptos Clave

- **Pod**: Grupo de uno o más containers (similar a `docker run`)
- **Deployment**: Gestiona réplicas de pods (similar a `docker-compose up --scale`)
- **Service**: Expone pods como servicio de red (load balancer interno)
- **ConfigMap/Secret**: Configuración externa (similar a `.env` en Compose)

### Comparación Docker Compose vs Kubernetes

| Aspecto | Docker Compose | Kubernetes |
|---------|----------------|------------|
| **Alcance** | Single-host | Multi-host |
| **Escalado** | Manual | Automático (HPA) |
| **Healing** | No | Sí (auto-restart) |
| **Updates** | Downtime | Rolling (sin downtime) |
| **Producción** | No recomendado | Diseñado para ello |

### Preparación para la Clase 5

En la próxima clase instalaremos **minikube** (cluster local de Kubernetes) y migraremos el Lab 03 (Nginx Gateway) de Docker Compose a Kubernetes.

**Instalación previa recomendada:**

```bash
# Instalar kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Instalar minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**Guía completa:** Ver [INSTALL_KUBERNETES.md](../../INSTALL_KUBERNETES.md)

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
