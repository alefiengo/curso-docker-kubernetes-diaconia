# Tarea para Casa - Clase 7

**Entrega:** Opcional (trabajo post-curso) via Moodle

---

## Objetivo

Desplegar una aplicación de 2 capas (frontend + backend) usando Ingress para routing, health probes configurados y HPA para escalado automático.

---

## Requisitos

Desplegar en Kubernetes:
- **Frontend**: Nginx simple
- **Backend**: Nginx o imagen con endpoint `/api`
- **Ingress**: Path-based routing (`/` → frontend, `/api` → backend)
- **Health Probes**: Liveness y readiness en ambos deployments
- **HPA**: Configurado en el backend (min=2, max=5)

---

## Parte 1: Desplegar Frontend (15 puntos)

### 1.1 Crear Deployment con health probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 3
```

### 1.2 Crear Service (ClusterIP)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
```

---

## Parte 2: Desplegar Backend (15 puntos)

### 2.1 Crear Deployment con health probes y resources

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 3
```

### 2.2 Crear Service (ClusterIP)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 80
```

---

## Parte 3: Configurar Ingress (20 puntos)

### 3.1 Habilitar NGINX Ingress Controller

```bash
minikube addons enable ingress
```

### 3.2 Crear Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
```

### 3.3 Probar Ingress

```bash
kubectl get ingress app-ingress
curl http://$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/
curl http://$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/api
```

---

## Parte 4: Configurar HPA (20 puntos)

### 4.1 Habilitar Metrics Server

```bash
minikube addons enable metrics-server
```

### 4.2 Crear HPA para backend

```bash
kubectl autoscale deployment backend --cpu-percent=50 --min=2 --max=5
```

O declarativo:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

### 4.3 Generar carga

```bash
kubectl run load-generator --image=busybox:1.28 --rm -it --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://backend-service; done"
```

### 4.4 Observar escalado

```bash
# Terminal 1
kubectl get hpa backend-hpa --watch

# Terminal 2
watch kubectl get pods -l app=backend
```

---

## Parte 5: Documentación (30 puntos)

### 5.1 Crear repositorio Git

Estructura sugerida:

```
tarea-clase8-k8s/
├── README.md
├── k8s/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
└── screenshots/
    ├── 01-ingress-test.png
    ├── 02-health-probes.png
    ├── 03-hpa-idle.png
    ├── 04-hpa-scaling.png
    └── 05-hpa-scaled.png
```

### 5.2 README.md debe incluir

**a) Descripción del proyecto:**
- Stack desplegado (frontend + backend)
- Conceptos aplicados (Ingress, health probes, HPA)

**b) Instrucciones de despliegue:**
1. Habilitar addons (ingress, metrics-server)
2. Aplicar manifests
3. Verificar recursos
4. Probar Ingress
5. Probar HPA con carga

**c) Comandos de verificación:**
```bash
kubectl get all
kubectl get ingress
kubectl get hpa
kubectl top pods
```

**d) Capturas de pantalla:**
1. Ingress funcionando (curl a `/` y `/api`)
2. Health probes configurados (`kubectl describe pod`)
3. HPA en reposo (TARGETS 0%/50%)
4. HPA escalando bajo carga (TARGETS >50%)
5. Pods escalados (de 2 a 4-5)

**e) Comandos de limpieza:**
```bash
kubectl delete ingress app-ingress
kubectl delete hpa backend-hpa
kubectl delete service frontend-service backend-service
kubectl delete deployment frontend backend
```

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| **Frontend Deployment** | 15 |
| - Health probes configurados | 8 |
| - Service ClusterIP | 7 |
| **Backend Deployment** | 15 |
| - Health probes configurados | 7 |
| - Resource requests/limits | 5 |
| - Service ClusterIP | 3 |
| **Ingress** | 20 |
| - Path-based routing correcto | 10 |
| - Ambas rutas funcionan | 10 |
| **HPA** | 20 |
| - HPA configurado correctamente | 10 |
| - Escalado demostrado con capturas | 10 |
| **Documentación** | 30 |
| - README completo | 10 |
| - Capturas de pantalla (5) | 15 |
| - Comandos de limpieza | 5 |
| **TOTAL** | **100 puntos** |

---

## Preguntas Frecuentes

### ¿Puedo usar otras imágenes en lugar de nginx?

Sí, pero deben tener endpoints HTTP que respondan para los health probes.

### ¿Qué hago si Ingress no obtiene ADDRESS?

Espera 1-2 minutos. Verifica que el Ingress Controller esté Running:
```bash
kubectl get pods -n ingress-nginx
```

### ¿Qué hago si HPA muestra `<unknown>`?

Verifica que Metrics Server esté funcionando:
```bash
kubectl top nodes
```

Debe mostrar métricas. Si no, espera 1-2 minutos más.

### ¿Cuánto tiempo debo generar carga?

1-2 minutos son suficientes para ver el escalado. HPA evalúa cada 15-30 segundos.

---

## Entrega

1. **Repositorio Git:** Público en GitHub o GitLab
2. **Link en Moodle:** Subir link al repositorio
3. **README completo:** Con documentación y capturas

**Formato del link:**
```
https://github.com/<tu-usuario>/tarea-clase8-k8s
```

---

## Recursos de Ayuda

- [Lab 01: Ingress](../labs/01-ingress/)
- [Lab 02: Health Probes](../labs/02-health-probes/)
- [Lab 03: HPA](../labs/03-hpa/)
- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Kubernetes Docs - Configure Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Docs - HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

---

**Nota final:** Esta tarea integra los 3 conceptos avanzados de la Clase 7. Tómate el tiempo necesario para entender cómo interactúan Ingress, health probes y HPA en una aplicación de producción.
