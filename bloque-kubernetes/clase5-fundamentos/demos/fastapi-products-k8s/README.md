# Demo: FastAPI Products API en Kubernetes

Demo completa de despliegue de una aplicación FastAPI en Kubernetes, integrando todos los conceptos de la Clase 6.

## Contenido

- **Aplicación FastAPI** con endpoints REST para gestión de productos
- **Dockerfile multi-stage** optimizado
- **Manifiestos de Kubernetes**: Deployment + Service
- **Labels y Selectors** para service discovery
- **Health checks** con Liveness y Readiness probes
- **3 réplicas** con auto-healing

## Estructura del Proyecto

```
fastapi-products-k8s/
├── app/
│   ├── main.py              # Aplicación FastAPI
│   └── requirements.txt     # Dependencias Python
├── k8s/
│   ├── deployment.yaml      # Deployment de Kubernetes
│   └── service.yaml         # Service de Kubernetes
├── Dockerfile               # Dockerfile multi-stage
├── verify.sh                # Script de verificación automatizada
└── README.md               # Este archivo
```

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información de la API |
| GET | `/health` | Health check |
| GET | `/api/v1/products` | Obtener todos los productos |
| GET | `/api/v1/products/{id}` | Obtener producto por ID |
| GET | `/api/v1/products/category/{category}` | Filtrar por categoría |
| POST | `/api/v1/products` | Crear nuevo producto |
| DELETE | `/api/v1/products/{id}` | Eliminar producto |

## Paso 1: Construir la imagen Docker

```bash
# Desde el directorio fastapi-products-k8s/
docker build -t alefiengo/products-api:1.0.0 .
```

### Probar localmente (opcional)

```bash
# Ejecutar container localmente
docker run -d -p 8000:8000 --name products-api alefiengo/products-api:1.0.0

# Probar endpoints
curl http://localhost:8000
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/products

# Detener container
docker stop products-api
docker rm products-api
```

## Paso 2: Push a Docker Hub

```bash
# Login a Docker Hub
docker login

# Push de la imagen
docker push alefiengo/products-api:1.0.0
```

**Nota:** Reemplaza `alefiengo` con tu usuario de Docker Hub en:
- `Dockerfile`
- `k8s/deployment.yaml` (línea `image:`)
- Comandos de este README

## Paso 3: Desplegar en Kubernetes

### 3.1 Aplicar el Deployment

```bash
# Aplicar deployment
kubectl apply -f k8s/deployment.yaml

# Verificar deployment
kubectl get deployments
kubectl get pods

# Ver detalles del deployment
kubectl describe deployment products-api
```

**Salida esperada:**
```
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
products-api   3/3     3            3           30s
```

### 3.2 Aplicar el Service

```bash
# Aplicar service
kubectl apply -f k8s/service.yaml

# Verificar service
kubectl get services
kubectl describe service products-api-service
```

**Salida esperada:**
```
NAME                   TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
products-api-service   NodePort   10.96.123.45    <none>        80:30080/TCP   20s
```

## Paso 4: Verificar el despliegue (Script automatizado)

### Opción 1: Usar el script de verificación

```bash
# Ejecutar script de verificación automatizada
./verify.sh
```

**El script verificará:**
- Deployment con todas las réplicas listas
- Service configurado correctamente
- Endpoints activos
- Todos los endpoints de la API funcionando
- Creación de productos (POST)

**Salida esperada:**
```
==> Verificando dependencias...
[OK] Dependencias verificadas
==> Verificando Deployment...
[OK] Deployment products-api: 3/3 réplicas listas
==> Verificando Service...
[OK] Service products-api-service encontrado (tipo: NodePort, NodePort: 30080)
==> Probando endpoints de la API...
[OK] GET / - OK
[OK] GET /health - OK
[OK] GET /api/v1/products - OK (5 productos)
...
[OK] Verificación completada exitosamente
```

### Opción 2: Verificación manual

#### Obtener la URL de acceso

Con **minikube**:
```bash
# Obtener URL del service
minikube service products-api-service --url

# Abrir en navegador
minikube service products-api-service
```

Con **cluster regular** (NodePort):
```bash
# Obtener IP del nodo
kubectl get nodes -o wide

# Acceder via NodePort
# http://<NODE_IP>:30080
```

### Probar endpoints con curl

```bash
# Reemplazar <URL> con la URL obtenida arriba
URL="http://192.168.49.2:30080"

# Health check
curl $URL/health

# Obtener todos los productos
curl $URL/api/v1/products

# Obtener producto por ID
curl $URL/api/v1/products/1

# Filtrar por categoría
curl $URL/api/v1/products/category/Electronics

# Crear nuevo producto (POST)
curl -X POST $URL/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": 6,
    "name": "iPad Pro 12.9",
    "description": "Tablet profesional con M2",
    "price": 1099.99,
    "stock": 25,
    "category": "Electronics"
  }'
```

## Paso 5: Verificar conceptos de Kubernetes

### Labels y Selectors

```bash
# Ver labels de los pods
kubectl get pods --show-labels

# Filtrar pods por label
kubectl get pods -l app=products-api
kubectl get pods -l tier=backend

# Ver endpoints del service (pods seleccionados)
kubectl get endpoints products-api-service
```

### ReplicaSet y Auto-healing

```bash
# Ver ReplicaSets
kubectl get replicasets

# Simular falla de un pod (eliminar)
kubectl get pods
kubectl delete pod <nombre-de-un-pod>

# Ver cómo K8s crea uno nuevo automáticamente
kubectl get pods -w
```

### Escalado

```bash
# Escalar a 5 réplicas
kubectl scale deployment products-api --replicas=5

# Verificar
kubectl get pods
kubectl get deployment products-api
```

### Logs

```bash
# Ver logs de un pod específico
kubectl logs <nombre-pod>

# Ver logs de todos los pods del deployment
kubectl logs -l app=products-api

# Seguir logs en tiempo real
kubectl logs -f <nombre-pod>
```

## Paso 6: Limpieza

```bash
# Eliminar service
kubectl delete -f k8s/service.yaml

# Eliminar deployment (esto también elimina los pods)
kubectl delete -f k8s/deployment.yaml

# Verificar que todo fue eliminado
kubectl get all
```

## Conceptos de Kubernetes Aplicados

### 1. Deployment
- Define el **estado deseado**: 3 réplicas de la API
- Gestiona automáticamente el **ReplicaSet**
- Estrategia de actualización: **RollingUpdate** (por defecto)

### 2. ReplicaSet
- Garantiza que **siempre haya 3 pods** corriendo
- **Auto-healing**: si un pod falla, crea uno nuevo
- Gestiona el ciclo de vida de los pods

### 3. Service (NodePort)
- Expone la aplicación **fuera del cluster**
- Usa **selector** `app: products-api` para encontrar pods
- Balancea tráfico entre las 3 réplicas
- Puerto **30080** accesible desde el nodo

### 4. Labels y Selectors
```yaml
# Pods tienen labels
labels:
  app: products-api
  tier: backend
  version: v1

# Service usa selector
selector:
  app: products-api
```

### 5. Health Checks
- **Liveness Probe**: K8s reinicia el pod si falla `/health`
- **Readiness Probe**: K8s envía tráfico solo a pods listos
- Configurado en `deployment.yaml`

### 6. Resources
- **Requests**: CPU/memoria mínima garantizada
- **Limits**: CPU/memoria máxima permitida
- Ayuda al **Scheduler** a ubicar pods en nodos

## Troubleshooting

### Pods no inician
```bash
# Ver eventos del deployment
kubectl describe deployment products-api

# Ver logs del pod
kubectl logs <nombre-pod>

# Ver detalles del pod
kubectl describe pod <nombre-pod>
```

### Service no accesible
```bash
# Verificar que el service tiene endpoints
kubectl get endpoints products-api-service

# Verificar selector y labels
kubectl describe service products-api-service
kubectl get pods --show-labels
```

### Imagen no se descarga
```bash
# Verificar si la imagen existe en Docker Hub
# O cambiar a imagePullPolicy: IfNotPresent en deployment.yaml
```

## Ejercicio Adicional

1. **Modificar réplicas**: Cambiar a 5 réplicas en `deployment.yaml`
2. **Cambiar Service a ClusterIP**: Modificar `service.yaml` y acceder desde otro pod
3. **Agregar nuevo label**: Añadir `environment: demo` a los pods
4. **Probar auto-healing**: Eliminar un pod y observar la recreación automática
5. **Ver documentación interactiva**: Acceder a `/docs` (Swagger UI de FastAPI)

## Recursos Adicionales

- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Labels y Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)

---

**Autor:** alefiengo
**Curso:** Docker & Kubernetes - i-Quattro
**Clase 6:** Introducción a Kubernetes
