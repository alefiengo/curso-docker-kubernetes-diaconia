# Docker & Kubernetes: Containers (Contenedores) y Orquestación en la Práctica

Repositorio oficial del curso de **i-Quattro** enfocado en el uso profesional de containers (contenedores) con Docker y su orquestación con Kubernetes.

**[Información del curso](https://www.i-quattro.com/product-page/dok-kub-001)**

---

## Información General

**Duración:** 20 horas
**Modalidad:** 100% práctico con laboratorios en cada sesión

### Objetivos

Formar a los participantes en el uso de containers (contenedores) con Docker y su orquestación con Kubernetes, aplicando buenas prácticas de deployment (despliegue), escalabilidad y observabilidad en entornos productivos.

### Valor Diferencial

- Curso 100% práctico con laboratorios en cada sesión
- Preparación base para certificaciones CKAD/CKA
- Ejemplos orientados a casos reales (banca, retail, telecomunicaciones)
- Instructores con experiencia en proyectos cloud-native y DevOps

---

## Dirigido a

- **Desarrolladores** que deseen empaquetar y desplegar sus aplicaciones
- **Administradores de sistemas y DevOps** que necesiten gestionar infraestructura con contenedores
- **Estudiantes avanzados** de informática/ingeniería interesados en cloud-native

---

## Contenido del Curso

### Temario (10 puntos)

1. Introducción a containers (contenedores) y Docker
2. Manejo de images (imágenes), containers (contenedores) y networks (redes)
3. Docker avanzado y Docker Compose
4. Seguridad en imágenes y escaneo de vulnerabilidades
5. Arquitectura de Kubernetes
6. Pods, Deployments y Services
7. ConfigMaps, Secrets y Probes
8. Escalado automático (HPA) e Ingress
9. Observabilidad (logs, métricas, Prometheus/Grafana)
10. Proyecto final integrador

---

## Clases (8 sesiones de 2.5 horas)

### Bloque 1: Docker (Clases 1-5)

- **[Clase 1: Introducción a Containers y Docker](bloque-docker/clase1-introduccion/)**
  - Instalación y configuración
  - Primeros containers: hello-world, nginx, ubuntu
  - Docker Hub y exploración de images oficiales

- **[Clase 2: Dockerfiles y Construcción de Imágenes](bloque-docker/clase2-dockerfiles/)**
  - Anatomía de un Dockerfile
  - Multi-stage builds para optimización
  - Publicar imágenes en Docker Hub

- **[Clase 3: Docker Compose - Redes y Volúmenes](bloque-docker/clase3-compose/)**
  - Orquestación multi-contenedor con Docker Compose
  - Redes personalizadas y segmentación de servicios
  - Volúmenes para persistencia de datos

- **[Clase 4: Microservicios, Cache y Gateway](bloque-docker/clase4-microservicios/)**
  - Aplicación multi-contenedor con cache (Redis)
  - API Gateway con Kong
  - Comunicación entre servicios y frontend

- **[Clase 5: Seguridad y Optimización](bloque-docker/clase5-seguridad/)**
  - Escaneo de vulnerabilidades con Trivy
  - Técnicas de optimización de imágenes
  - Multi-stage builds avanzados y Alpine

### Bloque 2: Kubernetes (Clases 6-8)

- **[Clase 6: Introducción a Kubernetes](bloque-kubernetes/clase6-introduccion/)**
  - Arquitectura de Kubernetes (Control Plane y Worker Nodes)
  - Pods: Unidad mínima de despliegue
  - Deployments: Gestión declarativa de aplicaciones
  - Services: Exposición de aplicaciones (ClusterIP, NodePort, LoadBalancer)

- **[Clase 7: Namespaces, Configuración y Persistencia](bloque-kubernetes/clase7-configuracion-persistencia/)**
  - Namespaces para organización de recursos
  - ConfigMaps y Secrets para externalización de configuración
  - StatefulSets para aplicaciones con estado
  - PersistentVolumeClaims para persistencia de datos

- **[Clase 8: Ingress, Health Probes y Escalado Automático](bloque-kubernetes/clase8-ingress-escalado/)**
  - Ingress para routing HTTP avanzado
  - Health Probes (Liveness, Readiness)
  - HPA (Horizontal Pod Autoscaler)
  - Observabilidad con Prometheus + Grafana + Loki (demo)

**[Ver bloques completos →](bloque-docker/)**

---

## Prerrequisitos

### Instalaciones necesarias

**Bloque 1 (Docker):**
- **Docker Desktop** (Windows/macOS) o **Docker Engine** (Linux) - [Guía de instalación](INSTALL_DOCKER.md)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/downloads)
- [Google Chrome](https://www.google.com/chrome/)
- [Postman](https://www.postman.com/downloads/)

**Bloque 2 (Kubernetes):**
- **minikube** - Cluster local de Kubernetes
- **kubectl** - CLI de Kubernetes
- [Guía de instalación Kubernetes](INSTALL_KUBERNETES.md)

### Instalaciones opcionales

- **WSL2 + Ubuntu 24.04.1 LTS** (recomendado para Windows) - [Guía de instalación](INSTALL_WSL.md)
- [Terminal Warp](https://www.warp.dev/)
- [k9s](https://k9scli.io/) - Terminal UI para Kubernetes
- [Lens](https://k8slens.dev/) - Kubernetes IDE

---

## Cómo usar este repositorio

Cada clase contiene:
- **README.md** con objetivos y referencias a laboratorios
- **labs/** con ejercicios prácticos paso a paso
- **scripts/** con herramientas de utilidad
- **cheatsheet.md** con comandos de referencia rápida

Recomendamos clonar el repositorio y seguir las clases en orden:

```bash
git clone https://github.com/alefiengo/curso-docker-kubernetes.git
cd curso-docker-kubernetes/bloque-docker/clase1-introduccion
```

---

## Proyecto Integrador

El curso incluye un **proyecto integrador full-stack** que evoluciona progresivamente clase a clase.

**Repositorio:** [proyecto-integrador-docker-k8s](https://github.com/alefiengo/proyecto-integrador-docker-k8s)

### Stack Completo (Clase 8)
- Spring Boot + Angular
- PostgreSQL + Redis
- Kong (Docker) / NGINX Ingress (Kubernetes)
- Prometheus + Grafana + Loki
- HPA (Autoscaling)

**[Ver más detalles →](PROYECTO_INTEGRADOR.md)**

---

## Proyecto Final

Al finalizar el curso, los estudiantes desarrollarán un **proyecto final individual** basado en el Proyecto Integrador v2.0.

**Objetivo:** Aprender el workflow profesional de versionamiento, publicación de imágenes en Docker Hub y gestión de rollouts en Kubernetes.

**Entorno:** VirtualBox + Ubuntu 24.04 Desktop + microk8s + Docker

**Entregables:**
- Repositorio público en GitHub/GitLab
- Imágenes públicas en Docker Hub
- README con screenshots y documentación completa

**[Ver instrucciones completas →](PROYECTO_FINAL.md)**

---

## Notas

- Este repositorio es **público** y forma parte del curso oficial de i-Quattro
- El material está diseñado para estudiantes matriculados, pero es de libre acceso para la comunidad
- Si te resulta útil, considera dejar una estrella en GitHub

---

## Uso del Material

Este repositorio es **público** y de libre acceso para la comunidad. Siéntete libre de usarlo para aprender, practicar y compartir conocimiento.

---

**[i-Quattro](https://www.i-quattro.com/)** | Formación en Cloud-Native y DevOps
