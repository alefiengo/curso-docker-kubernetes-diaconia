# Clase 6: Namespaces, Configuración y Persistencia

Bienvenido a la Clase 6. En esta sesión profundizaremos en la organización de recursos con Namespaces, externalización de configuración con ConfigMaps y Secrets, y gestión de aplicaciones con estado usando StatefulSets con persistencia de datos.

---

## Objetivos de Aprendizaje

Al finalizar esta clase, serás capaz de:

- Organizar recursos en Kubernetes usando Namespaces
- Cambiar contextos y namespace por defecto
- Externalizar configuración de aplicaciones usando ConfigMaps
- Gestionar credenciales de forma segura con Secrets
- Desplegar aplicaciones con estado usando StatefulSets
- Implementar persistencia de datos con PersistentVolumeClaims
- Entender la diferencia entre Deployments y StatefulSets

---

## Requisitos Previos

- Haber completado la Clase 5 (Introducción a Kubernetes)
- Tener minikube y kubectl funcionando
- Conocer conceptos de Pods, Deployments y Services

---

## Conceptos Clave

### Namespaces

- **Namespace**: División lógica del cluster para organizar recursos
- **Casos de uso**: Ambientes (dev/staging/prod), equipos, proyectos
- **DNS entre namespaces**: `service.namespace.svc.cluster.local`
- **ResourceQuotas**: Límites de recursos por namespace
- **Context switching**: Cambiar namespace por defecto

### ConfigMaps

- **ConfigMap**: Objeto que almacena configuración no sensible en formato clave-valor
- **Consumo**: Como variables de entorno o archivos montados
- **Actualización**: Cambios en archivos se reflejan automáticamente (~60s), variables requieren reinicio

### Secrets

- **Secret**: Almacena información confidencial (contraseñas, tokens, certificados)
- **Codificación**: Base64 (NO es encriptación)
- **Tipos**: Opaque (genérico), TLS, DockerConfig, SSH, BasicAuth
- **Seguridad**: En producción usar encryption at rest

### StatefulSets

- **StatefulSet**: Controlador para aplicaciones con estado
- **Identidad estable**: Nombres predecibles (app-0, app-1, app-2)
- **Orden garantizado**: Creación secuencial (0 → 1 → 2), eliminación inversa (2 → 1 → 0)
- **DNS estable**: Cada pod tiene su propio DNS con Headless Service
- **Persistencia**: Cada pod tiene su propio PersistentVolumeClaim

### PersistentVolumes

- **PVC (PersistentVolumeClaim)**: Solicitud de almacenamiento por parte de un usuario
- **PV (PersistentVolume)**: Recurso de almacenamiento en el cluster
- **StorageClass**: Clase de almacenamiento (standard, ssd, etc.)
- **Access Modes**: RWO (ReadWriteOnce), ROX (ReadOnlyMany), RWX (ReadWriteMany)

---

## Laboratorios de la clase

### [Lab 01: Namespaces - Organización y Aislamiento](labs/01-namespaces/)

Aprende a organizar recursos en Kubernetes usando namespaces. Practica tanto la forma imperativa como la declarativa, y entiende el DNS entre namespaces.

**Conceptos:** Namespaces, organización de recursos, ResourceQuotas, LimitRanges, DNS entre namespaces, context switching

---

### [Lab 02: ConfigMaps y Secrets](labs/02-configmaps-secrets/)

Aprende a externalizar configuración y gestionar credenciales de forma segura en Kubernetes. Practica diferentes métodos de creación y consumo.

**Conceptos:** ConfigMaps, Secrets, variables de entorno, volumeMounts, base64, actualización de configuración

---

### [Lab 03: StatefulSet y Persistencia con PostgreSQL](labs/03-statefulset-persistencia/)

Comprende cómo gestionar aplicaciones con estado usando StatefulSets y persistir datos con PersistentVolumeClaims. Despliega PostgreSQL con persistencia real.

**Conceptos:** StatefulSets, PersistentVolumeClaims, Headless Service, identidad estable, orden secuencial, persistencia de datos

---

## Tareas

### [Desafío Rápido](tareas/desafio-rapido.md)

Crear un ConfigMap y un Secret, y usarlos en un pod para mostrar variables de entorno.

---

### [Tarea para Casa](tareas/tarea-casa.md)

**Entrega:** Antes de la próxima clase via Moodle

Desplegar una aplicación de 2 capas (backend + base de datos) utilizando:
- ConfigMaps para configuración del backend
- Secrets para credenciales de base de datos
- StatefulSet con PVC para PostgreSQL
- Deployment con réplicas para el backend
- Services para exponer ambos componentes

**Requisitos:**
- Aplicación funcional con endpoints REST
- Persistencia de datos demostrada
- Documentación completa con capturas de pantalla
- Repositorio Git organizado

---

## Cheatsheet

### [Comandos y Conceptos - Clase 6](cheatsheet.md)

Referencia rápida con todos los comandos de:
- Services (ClusterIP, NodePort, LoadBalancer)
- ConfigMaps (crear, ver, actualizar)
- Secrets (crear, ver, decodificar)
- StatefulSets (crear, escalar, eliminar)
- PersistentVolumeClaims
- Troubleshooting común
- Buenas prácticas

---

## Arquitectura de Ejemplo - Aplicación con Estado

```
┌─────────────────────────────────────────────────┐
│           Kubernetes Cluster                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         API Backend (Deployment)         │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐     │  │
│  │  │ pod-a  │  │ pod-b  │  │ pod-c  │     │  │
│  │  └────────┘  └────────┘  └────────┘     │  │
│  │       ▲          ▲          ▲            │  │
│  │       └──────────┼──────────┘            │  │
│  │                  │                        │  │
│  │         ┌────────▼────────┐               │  │
│  │         │  api-service    │               │  │
│  │         │   (ClusterIP)   │               │  │
│  │         └─────────────────┘               │  │
│  │                  │                        │  │
│  │         Lee config y credenciales        │  │
│  │                  │                        │  │
│  │     ┌────────────┼────────────┐          │  │
│  │     ▼            ▼            ▼          │  │
│  │ ┌─────────┐  ┌────────┐  ┌─────────┐    │  │
│  │ │ConfigMap│  │ Secret │  │PostgreSQL│   │  │
│  │ │app-config│ │app-cred│  │StatefulSet│  │  │
│  │ └─────────┘  └────────┘  └─────────┘    │  │
│  │                               │          │  │
│  │                          ┌────▼────┐     │  │
│  │                          │   PVC   │     │  │
│  │                          │  (1Gi)  │     │  │
│  │                          └─────────┘     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Flujo de Trabajo Típico

### 1. Desplegar base de datos con persistencia

```bash
# Crear Headless Service
kubectl apply -f postgres-headless-service.yaml

# Crear StatefulSet con PVC
kubectl apply -f postgres-statefulset.yaml

# Esperar a que esté listo
kubectl wait --for=condition=ready pod/postgres-0 --timeout=60s

# Inicializar base de datos
kubectl exec -it postgres-0 -- psql -U admin -d mydb
```

### 2. Crear configuración externa

```bash
# ConfigMap con configuración de la app
kubectl create configmap api-config \
  --from-literal=DB_HOST=postgres-headless \
  --from-literal=DB_PORT=5432

# Secret con credenciales
kubectl create secret generic api-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASSWORD=supersecret
```

### 3. Desplegar backend

```bash
# Deployment que consume ConfigMap y Secret
kubectl apply -f api-deployment.yaml

# Exponer con Service
kubectl apply -f api-service.yaml

# Verificar
kubectl get all
kubectl logs -l app=api-backend
```

### 4. Probar la aplicación

```bash
# Obtener URL
minikube service api-service --url

# Probar endpoint
curl http://<URL>/api/users
```

---

## StatefulSet vs Deployment

| Aspecto | Deployment | StatefulSet |
|---------|------------|-------------|
| **Identidad** | Aleatoria (`web-abc123`) | Predecible (`web-0`, `web-1`) |
| **Orden de creación** | Paralelo | Secuencial (0 → 1 → 2) |
| **Orden de eliminación** | Aleatorio | Inverso (2 → 1 → 0) |
| **DNS** | No estable | Estable por pod |
| **Almacenamiento** | Compartido o efímero | PVC único por pod |
| **Casos de uso** | APIs, frontends | Bases de datos, colas |
| **Reinicio** | Cualquier pod | Respeta orden |
| **Escalado** | Inmediato | Secuencial |

---

## Preguntas Frecuentes

### ¿Cuándo usar ConfigMap vs Secret?

- **ConfigMap**: Configuración no sensible (URLs, puertos, nombres, flags)
- **Secret**: Información confidencial (contraseñas, tokens, certificados)

### ¿Cuándo usar StatefulSet vs Deployment?

- **StatefulSet**: Aplicaciones que necesitan identidad estable, orden de despliegue, o almacenamiento persistente único
- **Deployment**: Aplicaciones stateless que pueden escalar sin orden específico

### ¿Los Secrets están encriptados?

No, solo están codificados en base64. En producción usar:
- Encryption at rest de Kubernetes
- Herramientas externas (Vault, AWS Secrets Manager)

### ¿Los PVCs se eliminan con el StatefulSet?

No, los PVCs persisten incluso si eliminas el StatefulSet. Debes eliminarlos manualmente.

### ¿Cómo actualizo un ConfigMap sin downtime?

1. Actualizar el ConfigMap
2. Si usas variables de entorno: `kubectl rollout restart deployment <name>`
3. Si usas volumeMounts: Los cambios se reflejan en ~60 segundos automáticamente

---

## Troubleshooting Común

### Pod en Pending por PVC

**Problema:** StatefulSet no puede crear pod porque no hay StorageClass.

**Solución:**
```bash
minikube addons enable default-storageclass
minikube addons enable storage-provisioner
```

### ConfigMap no encontrado

**Problema:** Pod en CrashLoopBackOff porque no encuentra ConfigMap.

**Solución:** Crear el ConfigMap antes del Deployment:
```bash
kubectl create configmap app-config --from-literal=KEY=value
kubectl apply -f deployment.yaml
```

### Secret no se decodifica

**Solución:**
```bash
kubectl get secret <name> -o jsonpath='{.data.KEY}' | base64 -d
```

### Cambios en ConfigMap no se reflejan

**Si usas variables de entorno:**
```bash
kubectl rollout restart deployment <name>
```

**Si usas volumeMounts:**
Esperar ~60 segundos (se actualiza automáticamente).

---

## Recursos Adicionales

### Documentación Oficial

- [Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

### Tutoriales

- [Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)
- [Distribute Credentials Securely Using Secrets](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)
- [Run a Replicated Stateful Application](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/)

---

## Próxima Clase

### Clase 7: Ingress, Health Probes, HPA y Observabilidad

En la próxima clase veremos:

- **Ingress**: Routing HTTP avanzado con NGINX Ingress Controller
- **Health Probes**: Liveness, Readiness y Startup probes
- **HPA**: Horizontal Pod Autoscaler (escalado automático basado en métricas)
- **Observabilidad**: Prometheus, Grafana y Loki
- **Demo Proyecto Integrador v2.0**: Stack completo desplegado en Kubernetes

**Preparación recomendada:**
- Completar la tarea de esta clase
- Leer sobre Ingress Controllers
- Tener el cluster funcionando con recursos disponibles

---

**Clase 6 - Curso Docker & Kubernetes**
