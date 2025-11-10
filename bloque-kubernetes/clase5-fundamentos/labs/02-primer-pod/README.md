# Lab 02: Primer Pod en Kubernetes

## Objetivo

Crear y gestionar tu primer pod en Kubernetes usando tanto comandos imperativos como archivos YAML declarativos, entendiendo la diferencia entre ambos enfoques.

---

## Comandos a Ejecutar

### Parte 1: Pods Imperativos (Línea de Comandos)

```bash
# 1. Crear un pod simple con nginx
kubectl run nginx-pod --image=nginx:alpine

# 2. Ver el pod creado
kubectl get pods

# 3. Ver detalles del pod
kubectl get pod nginx-pod -o wide

# 4. Describir el pod (información completa)
kubectl describe pod nginx-pod

# 5. Ver logs del pod
kubectl logs nginx-pod

# 6. Ejecutar comando dentro del pod
kubectl exec nginx-pod -- nginx -v

# 7. Acceder al shell del pod
kubectl exec -it nginx-pod -- sh
# Dentro del container:
ls /usr/share/nginx/html
exit

# 8. Port-forward para acceder localmente
kubectl port-forward nginx-pod 8080:80
# Abrir navegador: http://localhost:8080
# Ctrl+C para detener

# 9. Eliminar el pod
kubectl delete pod nginx-pod
```

### Parte 2: Pods Declarativos (YAML)

```bash
# 1. Crear archivo pod-redis.yaml
cat > pod-redis.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: redis-pod
  labels:
    app: redis
    tier: cache
spec:
  containers:
  - name: redis
    image: redis:alpine
    ports:
    - containerPort: 6379
      name: redis-port
EOF

# 2. Aplicar el archivo
kubectl apply -f pod-redis.yaml

# 3. Ver el pod
kubectl get pods

# 4. Ver con labels
kubectl get pods --show-labels

# 5. Filtrar por label
kubectl get pods -l app=redis

# 6. Probar conexión a Redis
kubectl exec -it redis-pod -- redis-cli ping
# Salida esperada: PONG

# 7. Ver el YAML del pod en ejecución
kubectl get pod redis-pod -o yaml

# 8. Eliminar usando el archivo
kubectl delete -f pod-redis.yaml
```

### Parte 3: Pod Multi-Container

```bash
# 1. Crear pod con 2 containers
cat > pod-multi.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
  - name: redis
    image: redis:alpine
    ports:
    - containerPort: 6379
EOF

# 2. Aplicar
kubectl apply -f pod-multi.yaml

# 3. Ver pods
kubectl get pods

# 4. Ver logs del container nginx
kubectl logs multi-container-pod -c nginx

# 5. Ver logs del container redis
kubectl logs multi-container-pod -c redis

# 6. Ejecutar comando en container específico
kubectl exec multi-container-pod -c nginx -- nginx -v

# 7. Limpiar
kubectl delete -f pod-multi.yaml
```

---

## Desglose de Comandos

| Comando | Descripción |
|---------|-------------|
| `kubectl run <name> --image=<image>` | Crea un pod de forma imperativa |
| `kubectl get pods` | Lista todos los pods |
| `kubectl get pod <name> -o wide` | Muestra detalles adicionales (IP, nodo) |
| `kubectl describe pod <name>` | Muestra información completa del pod |
| `kubectl logs <pod>` | Muestra logs del container principal |
| `kubectl logs <pod> -c <container>` | Logs de un container específico |
| `kubectl exec <pod> -- <command>` | Ejecuta comando en el pod |
| `kubectl exec -it <pod> -- sh` | Shell interactivo en el pod |
| `kubectl port-forward <pod> local:remote` | Redirige puerto local al pod |
| `kubectl apply -f <file>` | Crea/actualiza recursos desde YAML |
| `kubectl delete pod <name>` | Elimina un pod |
| `kubectl delete -f <file>` | Elimina recursos definidos en archivo |
| `kubectl get pods --show-labels` | Muestra pods con sus labels |
| `kubectl get pods -l <label>` | Filtra pods por label |

---

## Explicación Detallada

### Paso 1: Creación Imperativa vs Declarativa

**Imperativo (kubectl run):**
- Rápido para pruebas
- No queda registro del estado deseado
- Difícil de versionar

**Declarativo (YAML):**
- Reproducible
- Versionable en Git
- Representa el estado deseado
- Recomendado para producción

### Paso 2: Anatomía de un Pod YAML

```yaml
apiVersion: v1           # Versión de la API de Kubernetes
kind: Pod                # Tipo de recurso
metadata:                # Metadatos del pod
  name: mi-pod           # Nombre único en el namespace
  labels:                # Etiquetas clave-valor
    app: mi-app
spec:                    # Especificación del pod
  containers:            # Lista de containers
  - name: mi-container   # Nombre del container
    image: nginx:alpine  # Imagen a usar
    ports:               # Puertos expuestos
    - containerPort: 80
```

### Paso 3: Ciclo de Vida del Pod

1. **Pending**: Pod aceptado pero containers no creados
2. **Running**: Pod asignado a nodo, containers corriendo
3. **Succeeded**: Todos los containers terminaron exitosamente
4. **Failed**: Al menos un container falló
5. **Unknown**: Estado no determinado

### Paso 4: Labels y Selectors

Los labels son pares clave-valor para organizar y seleccionar recursos:

```yaml
labels:
  app: frontend
  env: production
  version: v1.2.0
```

Uso:
```bash
kubectl get pods -l app=frontend
kubectl get pods -l env=production,version=v1.2.0
```

### Paso 5: Multi-Container Pods

Múltiples containers en un pod comparten:
- **Red**: localhost entre ellos
- **Almacenamiento**: Pueden montar los mismos volúmenes
- **Namespace**: Mismo namespace de procesos

**Patrones comunes:**
- **Sidecar**: Container auxiliar (logs, proxies)
- **Adapter**: Normaliza salidas
- **Ambassador**: Proxy para servicios externos

### Paso 6: Port Forwarding

`kubectl port-forward` crea un túnel desde tu máquina local al pod:

```bash
kubectl port-forward nginx-pod 8080:80
# localhost:8080 → pod:80
```

Útil para:
- Debugging
- Acceso temporal a servicios
- Testing sin exponer públicamente

---

## Conceptos Aprendidos

- **Pod**: Unidad mínima de despliegue en Kubernetes (uno o más containers)
- **Container**: Instancia de una imagen Docker corriendo dentro de un pod
- **YAML Manifest**: Archivo declarativo que describe recursos de Kubernetes
- **Labels**: Etiquetas clave-valor para organizar recursos
- **Selectors**: Filtros basados en labels
- **kubectl apply**: Comando declarativo para crear/actualizar recursos
- **kubectl exec**: Ejecutar comandos dentro de containers
- **Port forwarding**: Acceso local a puertos de pods
- **Multi-container pod**: Pod con múltiples containers que comparten red y storage

---

## Troubleshooting

### Pod en estado "Pending"

**Causa:** No hay recursos suficientes o imagen no encontrada

**Solución:**
```bash
kubectl describe pod <name>
# Ver sección "Events" para detalles
```

### Pod en estado "ImagePullBackOff"

**Causa:** No se puede descargar la imagen

**Solución:**
```bash
# Verificar nombre de imagen
kubectl describe pod <name>

# Verificar conectividad
minikube ssh
docker pull nginx:alpine
exit
```

### Pod en estado "CrashLoopBackOff"

**Causa:** Container se inicia y falla repetidamente

**Solución:**
```bash
# Ver logs
kubectl logs <pod>

# Ver eventos
kubectl describe pod <name>
```

### Error: "connection refused" en port-forward

**Causa:** Puerto ya en uso o pod no está listo

**Solución:**
```bash
# Verificar pod está Running
kubectl get pod <name>

# Usar otro puerto local
kubectl port-forward <pod> 8081:80
```

### Error: "no such container"

**Causa:** Nombre de container incorrecto en multi-container pod

**Solución:**
```bash
# Ver nombres de containers
kubectl describe pod <name>

# Usar nombre correcto
kubectl logs <pod> -c <container-correcto>
```

---

## Desafío Adicional

### Desafío 1: Pod con Variables de Entorno

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-pod
spec:
  containers:
  - name: alpine
    image: alpine:latest
    command: ["sh", "-c", "echo Hello $NAME! && sleep 3600"]
    env:
    - name: NAME
      value: "Kubernetes"
```

Aplica el archivo y verifica los logs:
```bash
kubectl apply -f env-pod.yaml
kubectl logs env-pod
```

### Desafío 2: Pod con Health Check Básico

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: health-pod
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
      initialDelaySeconds: 3
      periodSeconds: 5
```

Aplica y observa el health check:
```bash
kubectl apply -f health-pod.yaml
kubectl describe pod health-pod
# Ver sección "Liveness"
```

### Desafío 3: Exportar YAML de Pod Existente

```bash
# Crear pod
kubectl run test-pod --image=nginx:alpine

# Exportar a YAML
kubectl get pod test-pod -o yaml > test-pod-export.yaml

# Editar y crear nuevo pod
# (cambiar nombre y eliminar campos auto-generados)
```

---

## Recursos Adicionales

- [Pods en Kubernetes](https://kubernetes.io/docs/concepts/workloads/pods/)
- [Multi-Container Pods](https://kubernetes.io/docs/tasks/access-application-cluster/communicate-containers-same-pod-shared-volume/)
- [Labels y Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)
- [kubectl exec](https://kubernetes.io/docs/tasks/debug/debug-application/get-shell-running-container/)
- [Port Forwarding](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)
