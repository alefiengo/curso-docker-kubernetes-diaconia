# Proyecto Integrador

El proyecto integrador es una aplicación full-stack completa que se desarrolla **progresivamente clase a clase**, desde una API REST simple hasta un sistema completo desplegado en Kubernetes con observabilidad.

---

## Repositorio Separado

El proyecto se encuentra en un repositorio independiente para mantener el código de la aplicación separado del material del curso.

**Repositorio:** [proyecto-integrador-docker-k8s](https://github.com/alefiengo/proyecto-integrador-docker-k8s)

---

## Línea de Tiempo de Versiones

| Bloque | Tag | Stack | Qué incluye |
|--------|-----|-------|-------------|
| **Bloque Docker (Clases 2-5)** | `v1.0` | Compose stack: Spring Boot + PostgreSQL + Redis + Angular + Kong | API REST, persistencia, cache, gateway, optimización y prácticas de seguridad |
| **Bloque Kubernetes (Clases 6-8)** | `v2.0` | Kubernetes stack completo | Deployments, Services, ConfigMaps, Secrets, StatefulSet, Ingress, HPA y observabilidad (Prometheus/Grafana) |

**Notas:**
- `v1.0` se etiqueta al finalizar el Bloque Docker (clase 5) e incorpora todos los avances del primer bloque.
- `v2.0` se etiqueta al finalizar el Bloque Kubernetes (clase 8) e integra la migración completa a Kubernetes.

---

## Cómo Usar

### Clonar el Proyecto

```bash
git clone https://github.com/alefiengo/proyecto-integrador-docker-k8s.git
cd proyecto-integrador-docker-k8s
```

### Trabajar con Versión Específica

```bash
# Ver todas las versiones disponibles
git tag

# Checkout a un release del curso
git checkout v1.0       # Fin Bloque Docker
git checkout v2.0       # Fin Bloque Kubernetes

# Ver README específico de esa versión
cat README.md
```

### Durante la Clase

En cada clase, el instructor:
1. Trabaja sobre la rama principal mostrando incrementos progresivos
2. Destaca cómo evoluciona el stack con cada tema nuevo
3. Demuestra build, deploy y funcionamiento
4. Al cierre de cada bloque, genera el tag (`v1.0` o `v2.0`) para dejar un release estable

Los estudiantes pueden:
- Seguir los cambios clase a clase en la rama principal
- Revisar los releases `v1.0` y `v2.0` en GitHub
- Hacer fork para experimentar

---

## Stack Tecnológico Final (Clase 8)

### Backend
- **Spring Boot 3.5.6** (Java 17)
- **PostgreSQL 15** (base de datos)
- **Redis 7** (cache)
- **Spring Data JPA** (ORM)
- **Spring Cache** (abstraction)
- **Spring Actuator** (metrics)

### Frontend
- **Angular 17+** (SPA)
- Consume API REST del backend

### Infraestructura Docker
- **Docker Compose** (orquestación local)
- **Kong + Konga** (API Gateway)
- **Multi-stage builds** (optimización)
- **Non-root users** (seguridad)

### Infraestructura Kubernetes
- **Deployments** + **Services**
- **StatefulSet** (para PostgreSQL con persistencia)
- **ConfigMaps** + **Secrets**
- **NGINX Ingress** (routing)
- **HPA** (autoscaling horizontal)
- **Health Probes** (liveness, readiness, startup)
- **BFF Pattern** (nginx proxy en frontend)

### Conceptos Mencionados (no implementados)
- Mensajería distribuida (Kafka, RabbitMQ)
- CI/CD (Jenkins, GitHub Actions)
- Observabilidad (Prometheus, Grafana, Loki)

---

## Endpoints API

### Clase 2 (Base)
- `GET /` → Bienvenida
- `GET /api/greeting` → Saludo
- `GET /api/info` → Info de la app
- `GET /actuator/health` → Health check

### Clase 3 (+ PostgreSQL)
- `GET /api/users` → Lista de usuarios
- `POST /api/users` → Crear usuario
- `GET /api/users/{id}` → Usuario por ID
- `PUT /api/users/{id}` → Actualizar usuario
- `DELETE /api/users/{id}` → Eliminar usuario

### Clase 4 (+ Redis + Angular)
- Cache automático en endpoints GET
- Frontend consume todos los endpoints

### Clase 5-8
- Mismo API, optimizado y desplegado en K8s

---

## Arquitectura Final (v2.0)

```
                    ┌─────────────────────────────┐
                    │      NGINX Ingress          │
                    │  / → Angular                │
                    │  /api/* → Spring Boot       │
                    └─────────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
         ┌──────▼──────┐                   ┌───────▼────────┐
         │   Angular   │                   │  Spring Boot   │
         │  (frontend) │                   │   (backend)    │
         │   2 pods    │                   │  2-5 pods HPA  │
         │  nginx BFF  │                   │ Health Probes  │
         └─────────────┘                   └────────┬───────┘
                                                    │
                                    ┌───────────────┼──────────────┐
                                    │               │              │
                             ┌──────▼─────┐  ┌─────▼─────┐        │
                             │ PostgreSQL │  │   Redis   │        │
                             │(StatefulSet)│  │  (Cache)  │        │
                             │   + PVC    │  │   1 pod   │        │
                             └────────────┘  └───────────┘        │
```

---

## Para Estudiantes

### Recomendaciones

1. **Hacer fork** del proyecto para experimentar
2. **Seguir los tags** en orden cronológico
3. **Leer el README** de cada versión
4. **Comparar cambios** entre tags: `git diff v1.0 v2.0`
5. **Documentar** tu propio progreso en tu repo de tareas

### No Hacer

- No modificar directamente el repo original (hacer fork)
- No mezclar código de diferentes clases
- No saltarse clases (respetar orden progresivo)

---

## Recursos

- **Repositorio del Proyecto:** [github.com/alefiengo/proyecto-integrador-docker-k8s](https://github.com/alefiengo/proyecto-integrador-docker-k8s)
- **Repositorio del Curso:** [github.com/alefiengo/curso-docker-kubernetes](https://github.com/alefiengo/curso-docker-kubernetes)
- **Autor:** [alefiengo.dev](https://alefiengo.dev)

---

## Preguntas Frecuentes

### ¿Puedo usar el proyecto para mi portfolio?

Sí, puedes hacer fork y personalizarlo. Mantén la atribución al autor original.

### ¿Cómo veo qué cambió entre bloques?

```bash
git diff v1.0 v2.0
```

### ¿Puedo agregar features propios?

Sí, en tu fork. El repo original sigue el plan del curso.

### ¿Funcionará con versiones más nuevas de Spring Boot/Angular?

Probablemente sí, pero pueden requerirse ajustes. El curso usa versiones específicas para compatibilidad.

### ¿Dónde reporto bugs del proyecto?

Issues en: https://github.com/alefiengo/proyecto-integrador-docker-k8s/issues
