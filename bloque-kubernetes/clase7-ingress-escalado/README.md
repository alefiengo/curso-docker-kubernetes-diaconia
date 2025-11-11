# Clase 7: Ingress, Health Probes y Escalado Automático

Bienvenido a la Clase 7, la última del curso. En esta sesión aprenderás conceptos avanzados para aplicaciones en producción: routing HTTP inteligente, health checks automáticos y escalado dinámico basado en carga.

---

## Objetivos de Aprendizaje

Al finalizar esta clase, serás capaz de:

- Configurar Ingress para routing HTTP avanzado (path-based)
- Implementar health probes para detectar y recuperar pods enfermos
- Configurar escalado automático con HPA basado en métricas de CPU
- Desplegar una aplicación completa en Kubernetes con todos los componentes integrados

---

## Requisitos Previos

- Haber completado las Clases 5 y 6
- Tener minikube y kubectl funcionando
- Conocer Deployments, Services, ConfigMaps, Secrets, StatefulSets

---

## Conceptos Clave

### Ingress

- **Ingress**: Recurso que define reglas de routing HTTP/HTTPS
- **Ingress Controller**: Implementación que ejecuta las reglas (NGINX, Traefik, etc.)
- **Path-based routing**: Enrutar según la ruta URL (`/` vs `/api`)
- **Host-based routing**: Enrutar según el dominio (`app.com` vs `api.app.com`)
- **Single entry point**: Un Ingress puede enrutar a múltiples servicios

### Health Probes

- **Liveness Probe**: Verifica si el contenedor está vivo, reinicia si falla
- **Readiness Probe**: Verifica si el contenedor está listo para tráfico
- **Startup Probe**: Para aplicaciones que tardan en iniciar
- **HTTP GET, TCP, Exec**: Métodos de verificación disponibles

### HPA (Horizontal Pod Autoscaler)

- **Autoscaling horizontal**: Aumenta/disminuye el número de pods automáticamente
- **Metrics Server**: Recolector de métricas de CPU y memoria
- **Resource requests**: Base para cálculo de porcentajes de uso
- **Scale-up/Scale-down**: Políticas de escalado inteligentes

---

## Laboratorios de la clase

### [Lab 01: Ingress - Routing HTTP](labs/01-ingress/)

Configura NGINX Ingress Controller para enrutar tráfico a múltiples servicios usando path-based routing. Aprende cómo un único punto de entrada puede servir frontend en `/` y API en `/api`.

**Conceptos:** Ingress, Ingress Controller, path-based routing, single entry point, ClusterIP + Ingress

---

### [Lab 02: Health Probes](labs/02-health-probes/)

Implementa liveness y readiness probes para mantener la disponibilidad de aplicaciones. Simula fallos para ver cómo Kubernetes reinicia pods enfermos y quita del balanceo pods no listos.

**Conceptos:** Liveness probe, readiness probe, HTTP GET probe, auto-healing, service discovery

---

### [Lab 03: HPA - Horizontal Pod Autoscaler](labs/03-hpa/)

Configura escalado automático basado en CPU. Genera carga para ver cómo Kubernetes escala de 1 a 5 pods automáticamente, y luego reduce al detener la carga.

**Conceptos:** HPA, Metrics Server, resource requests, autoscaling, scale-up/scale-down

---

## Proyecto Integrador v2.0

**Stack completo en Kubernetes:**
- Frontend (Angular) + Backend (Spring Boot) con Ingress
- Health probes en todos los pods
- HPA escalando el backend bajo carga
- ConfigMaps, Secrets, StatefulSet (PostgreSQL)
- Patrón BFF (Backend-for-Frontend) para comunicación DNS

Esta demo consolida todos los conceptos del bloque Kubernetes, mostrando cómo se integran en una aplicación real.

---

## Tareas

### [Desafío Rápido](tareas/desafio-rapido.md)

Configura HPA para una aplicación simple y genera carga para observar el escalado automático en acción.

---

### [Tarea para Casa](tareas/tarea-casa.md)

Desplegar aplicación completa con Ingress para routing, health probes configurados y HPA para escalado automático. Documentar el comportamiento bajo carga.

---

## Cheatsheet

- [Comandos y Conceptos - Clase 7](cheatsheet.md)

---

## Recursos Adicionales

- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Kubernetes Docs - Configure Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Docs - Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Metrics Server](https://github.com/kubernetes-sigs/metrics-server)

---

## Notas Importantes

### Sobre Ingress
- En producción, Ingress es el método preferido para exponer aplicaciones HTTP/HTTPS
- Soporta TLS/SSL, pero eso está fuera del alcance de este curso básico
- Cada cloud provider tiene su propio Ingress Controller (AWS ALB, GCP, Azure)

### Sobre Health Probes
- Son fundamentales en producción para alta disponibilidad
- Siempre configura al menos liveness y readiness probes
- Ajusta `initialDelaySeconds` según el tiempo de inicio de tu app

### Sobre HPA
- Requiere resource requests definidos
- Scale-up es rápido (~30s), scale-down es lento (~5min) por diseño
- Puedes escalar con métricas custom (no solo CPU/memoria)

### Sobre Monitoreo
- Kubernetes expone métricas via Metrics Server
- `kubectl top pods` y `kubectl top nodes` muestran uso de recursos
- Para producción, considera stacks como Prometheus + Grafana (fuera del alcance de este curso)

---

**Clase 7 - Curso Docker & Kubernetes**
