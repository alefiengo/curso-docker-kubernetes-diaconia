# Cheatsheet - Clase 7: Ingress, Health Probes y HPA

Referencia rápida de comandos y conceptos de la Clase 7.

---

## Ingress

### Habilitar NGINX Ingress Controller (minikube)

```bash
minikube addons enable ingress
```

### Verificar Ingress Controller

```bash
kubectl get pods -n ingress-nginx
```

### Crear Ingress (imperativo - no recomendado)

```bash
# No hay comando directo, usar manifest YAML
```

### Crear Ingress (declarativo)

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

### Ver Ingress

```bash
# Listar todos
kubectl get ingress

# Ver detalles
kubectl describe ingress <name>

# Ver YAML
kubectl get ingress <name> -o yaml
```

### Obtener IP del Ingress

```bash
kubectl get ingress <name> -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### Probar Ingress

```bash
curl http://$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/
curl http://$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/api
```

### Eliminar Ingress

```bash
kubectl delete ingress <name>
```

---

## Health Probes

### Liveness Probe (HTTP GET)

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

### Readiness Probe (HTTP GET)

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 3
  failureThreshold: 3
```

### Startup Probe (HTTP GET)

```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30  # 30 * 10s = 5 minutos máximo
```

### Liveness Probe (TCP Socket)

```yaml
livenessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
```

### Liveness Probe (Exec)

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Ver probes en un pod

```bash
kubectl get pod <pod-name> -o yaml | grep -A10 "livenessProbe"
kubectl get pod <pod-name> -o yaml | grep -A10 "readinessProbe"
```

### Ver eventos de probes

```bash
kubectl describe pod <pod-name> | grep -A5 "Liveness\|Readiness"
```

---

## HPA (Horizontal Pod Autoscaler)

### Habilitar Metrics Server (minikube)

```bash
minikube addons enable metrics-server
```

### Verificar Metrics Server

```bash
kubectl get pods -n kube-system | grep metrics-server
```

### Ver métricas de nodos

```bash
kubectl top nodes
```

### Ver métricas de pods

```bash
kubectl top pods
kubectl top pods -l app=myapp
```

### Crear HPA (imperativo)

```bash
kubectl autoscale deployment <name> --cpu-percent=50 --min=1 --max=10
```

### Crear HPA (declarativo)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

### Ver HPAs

```bash
# Listar todos
kubectl get hpa

# Ver detalles
kubectl describe hpa <name>

# Watch en tiempo real
kubectl get hpa <name> --watch
```

### Ver comportamiento de escalado

```bash
# Ver eventos
kubectl describe hpa <name>

# Ver pods escalando
watch kubectl get pods -l app=myapp

# Ver métricas actuales
kubectl top pods -l app=myapp
```

### Generar carga para probar HPA

```bash
# Opción 1: Desde pod temporal
kubectl run -it load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://service-name; done"

# Opción 2: Desde fuera con hey (si está instalado)
hey -z 60s -c 50 http://service-url
```

### Eliminar HPA

```bash
kubectl delete hpa <name>
```

---

## Resource Requests y Limits

### Deployment con resources (necesario para HPA)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myimage:latest
        resources:
          requests:
            cpu: 200m      # HPA calcula sobre este valor
            memory: 256Mi
          limits:
            cpu: 500m      # Máximo permitido
            memory: 512Mi
```

### Unidades de CPU

```
1 CPU = 1000 milicores (m)
200m = 0.2 CPU = 20% de 1 core
500m = 0.5 CPU = 50% de 1 core
1000m = 1 CPU = 100% de 1 core
```

### Unidades de Memoria

```
Mi = Mebibyte (1024^2 bytes)
Gi = Gibibyte (1024^3 bytes)
256Mi = 268 MB
1Gi = 1074 MB
```

---

## Conceptos Clave

### Ingress
- **Ingress**: Define reglas de routing HTTP/HTTPS
- **Ingress Controller**: Ejecuta las reglas (NGINX, Traefik, HAProxy, etc.)
- **Path-based routing**: Enruta según URL path (`/`, `/api`)
- **Host-based routing**: Enruta según dominio (`app.com`, `api.app.com`)

### Health Probes
- **Liveness**: Verifica si contenedor está vivo → Reinicia si falla
- **Readiness**: Verifica si contenedor está listo → Quita de endpoints si falla
- **Startup**: Para apps lentas al iniciar → Deshabilita otras probes hasta pasar
- **HTTP GET**: Más común (código 200-399 = éxito)
- **TCP Socket**: Conexión exitosa = éxito
- **Exec**: Exit code 0 = éxito

### HPA
- **HPA**: Escala horizontal automática basada en métricas
- **Metrics Server**: Recolecta métricas de CPU/memoria cada 15s
- **Resource requests**: Base para cálculo de porcentajes
- **Scale-up**: Rápido (~30s)
- **Scale-down**: Lento (~5min) para evitar flapping

---

## Patrones Comunes

### Ingress + ClusterIP

```yaml
# Frontend Deployment + Service ClusterIP
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80

---
# Backend Deployment + Service ClusterIP
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 8080

---
# Ingress con path-based routing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080
```

### Deployment con Probes + HPA

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myapi:v1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 3
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Troubleshooting Rápido

### Ingress sin ADDRESS

```bash
# Verificar Ingress Controller
kubectl get pods -n ingress-nginx

# Ver logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### HPA muestra `<unknown>`

```bash
# Verificar Metrics Server
kubectl get pods -n kube-system | grep metrics

# Verificar métricas disponibles
kubectl top nodes
kubectl top pods

# Verificar resource requests
kubectl get deploy <name> -o yaml | grep -A5 resources
```

### Liveness probe falla constantemente

```bash
# Ver eventos
kubectl describe pod <pod-name>

# Aumentar initialDelaySeconds
# Verificar que endpoint existe
kubectl exec -it <pod-name> -- curl http://localhost:<port>/health
```

---

## Recursos

- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Kubernetes Docs - Configure Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Docs - HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
