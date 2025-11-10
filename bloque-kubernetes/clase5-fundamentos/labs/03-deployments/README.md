# Lab 03: Deployments en Kubernetes

## Objetivo

Comprender cómo funcionan los Deployments en Kubernetes, crear réplicas de pods, realizar actualizaciones rolling y rollbacks, entendiendo la diferencia entre gestionar pods directamente vs usar Deployments.

---

## Comandos a Ejecutar

### Parte 1: Crear Deployment Imperativo

```bash
# 1. Crear deployment con 3 réplicas
kubectl create deployment nginx-deploy --image=nginx:alpine --replicas=3

# 2. Ver deployments
kubectl get deployments

# 3. Ver replica sets
kubectl get replicaset

# 4. Ver pods creados
kubectl get pods

# 5. Ver todo junto
kubectl get deployment,replicaset,pod

# 6. Escalar el deployment
kubectl scale deployment nginx-deploy --replicas=5

# 7. Verificar escalado
kubectl get pods

# 8. Ver detalles del deployment
kubectl describe deployment nginx-deploy

# 9. Eliminar deployment
kubectl delete deployment nginx-deploy
```

---

### Parte 2: Deployment Declarativo (YAML)

```bash
# 1. Crear archivo deployment.yaml
cat > deployment-webapp.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
  labels:
    app: webapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
EOF

# 2. Aplicar deployment
kubectl apply -f deployment-webapp.yaml

# 3. Ver status del deployment
kubectl rollout status deployment webapp-deployment

# 4. Ver pods con labels
kubectl get pods --show-labels

# 5. Verificar que los pods tienen el label correcto
kubectl get pods -l app=webapp

# 6. Ver detalles de un pod
kubectl describe pod -l app=webapp | head -30
```

---

### Parte 3: Actualización Rolling (Rolling Update)

```bash
# 1. Ver imagen actual
kubectl describe deployment webapp-deployment | grep Image

# 2. Actualizar imagen del deployment
kubectl set image deployment/webapp-deployment nginx=nginx:1.26-alpine

# 3. Ver el rollout en progreso
kubectl rollout status deployment webapp-deployment

# 4. Ver historial de rollouts
kubectl rollout history deployment webapp-deployment

# 5. Ver pods (algunos Terminating, otros Creating)
kubectl get pods -w
# Ctrl+C para detener

# 6. Verificar nueva imagen
kubectl describe deployment webapp-deployment | grep Image
```

---

### Parte 4: Rollback (Revertir Cambio)

```bash
# 1. Realizar una actualización con imagen incorrecta
kubectl set image deployment/webapp-deployment nginx=nginx:broken-version

# 2. Ver que falla
kubectl rollout status deployment webapp-deployment
# Ctrl+C si se queda esperando

# 3. Ver estado de pods
kubectl get pods

# 4. Hacer rollback a versión anterior
kubectl rollout undo deployment webapp-deployment

# 5. Verificar rollback
kubectl rollout status deployment webapp-deployment

# 6. Ver historial actualizado
kubectl rollout history deployment webapp-deployment

# 7. Rollback a revisión específica
kubectl rollout undo deployment webapp-deployment --to-revision=1
```

---

### Parte 5: Self-Healing (Auto-Recuperación)

```bash
# 1. Ver pods actuales
kubectl get pods -l app=webapp

# 2. Eliminar un pod manualmente
kubectl delete pod -l app=webapp --field-selector=status.phase=Running | head -1

# 3. Ver cómo se recrea automáticamente
kubectl get pods -w
# Ctrl+C para detener

# 4. Ver eventos del deployment
kubectl describe deployment webapp-deployment
```

---

### Parte 6: Deployment con Recursos y Estrategia

```bash
# 1. Crear deployment avanzado
cat > deployment-advanced.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: advanced-deployment
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: advanced
  template:
    metadata:
      labels:
        app: advanced
        version: v1
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
EOF

# 2. Aplicar
kubectl apply -f deployment-advanced.yaml

# 3. Ver recursos asignados
kubectl describe deployment advanced-deployment

# 4. Ver uso de recursos (requiere metrics-server)
minikube addons enable metrics-server
sleep 30
kubectl top pods -l app=advanced

# 5. Limpiar
kubectl delete deployment advanced-deployment
kubectl delete deployment webapp-deployment
```

---

## Desglose de Comandos

| Comando | Descripción |
|---------|-------------|
| `kubectl create deployment <name> --image=<image>` | Crea deployment imperativamente |
| `kubectl get deployments` | Lista todos los deployments |
| `kubectl get replicaset` | Lista replica sets (gestionados por deployments) |
| `kubectl scale deployment <name> --replicas=<n>` | Escala el número de réplicas |
| `kubectl rollout status deployment <name>` | Muestra estado del rollout |
| `kubectl set image deployment/<name> <container>=<image>` | Actualiza imagen del container |
| `kubectl rollout history deployment <name>` | Muestra historial de versiones |
| `kubectl rollout undo deployment <name>` | Revierte a versión anterior |
| `kubectl rollout undo deployment <name> --to-revision=<n>` | Revierte a revisión específica |
| `kubectl describe deployment <name>` | Muestra detalles completos del deployment |
| `kubectl top pods` | Muestra uso de CPU y memoria de pods |

---

## Explicación Detallada

### Paso 1: Jerarquía Deployment → ReplicaSet → Pod

```
Deployment
    ↓
ReplicaSet (versión 1)
    ↓
Pod 1, Pod 2, Pod 3
```

**Deployment** gestiona **ReplicaSets**, y cada **ReplicaSet** gestiona **Pods**.

Cuando actualizas un Deployment:
1. Se crea un nuevo ReplicaSet con la nueva versión
2. Se escala gradualmente el nuevo ReplicaSet (up)
3. Se escala gradualmente el viejo ReplicaSet (down)
4. El viejo ReplicaSet queda con 0 réplicas (guardado para rollback)

### Paso 2: Selector y Labels

El `selector` del Deployment debe coincidir con los `labels` del Pod template:

```yaml
spec:
  selector:
    matchLabels:
      app: webapp    # ← Debe coincidir
  template:
    metadata:
      labels:
        app: webapp  # ← Con esto
```

### Paso 3: Rolling Update Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Máximo 1 pod extra durante update
    maxUnavailable: 1  # Máximo 1 pod no disponible
```

**Ejemplo con 3 réplicas:**
1. Crea 1 pod nuevo (total: 4 pods)
2. Termina 1 pod viejo (total: 3 pods)
3. Repite hasta completar

**Alternativa - Recreate:**
```yaml
strategy:
  type: Recreate  # Termina todos, luego crea nuevos (downtime)
```

### Paso 4: Self-Healing (Auto-Recuperación)

Si un pod falla o se elimina, el ReplicaSet automáticamente:
1. Detecta que faltan pods (desired: 3, current: 2)
2. Crea un nuevo pod
3. Mantiene el número deseado de réplicas

### Paso 5: Recursos (Requests y Limits)

```yaml
resources:
  requests:      # Mínimo garantizado
    cpu: "100m"  # 0.1 CPU
    memory: "64Mi"
  limits:        # Máximo permitido
    cpu: "200m"  # 0.2 CPU
    memory: "128Mi"
```

**requests**: Scheduler garantiza estos recursos
**limits**: Container no puede exceder estos límites

### Paso 6: Rollback

Kubernetes guarda el historial de ReplicaSets:

```bash
# Ver historial
kubectl rollout history deployment webapp-deployment

# Salida:
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>
# 3         <none>

# Rollback a revisión específica
kubectl rollout undo deployment webapp-deployment --to-revision=1
```

---

## Conceptos Aprendidos

- **Deployment**: Recurso que gestiona el despliegue declarativo de aplicaciones
- **ReplicaSet**: Asegura que un número específico de réplicas de pod estén corriendo
- **Rolling Update**: Actualización gradual sin downtime
- **Rollback**: Revertir a una versión anterior del deployment
- **Self-Healing**: Capacidad de auto-recuperación ante fallos
- **Selector**: Identifica qué pods gestiona el deployment/replicaset
- **Escalado**: Aumentar o disminuir número de réplicas
- **Estrategia de despliegue**: RollingUpdate vs Recreate
- **Recursos**: Requests (garantizados) y Limits (máximos)
- **Historial de revisiones**: Versiones anteriores del deployment

---

## Troubleshooting

### Deployment no progresa

**Síntoma:** `kubectl rollout status` se queda esperando

**Solución:**
```bash
# Ver pods
kubectl get pods -l app=<label>

# Ver eventos
kubectl describe deployment <name>

# Posibles causas:
# - Imagen no existe
# - Recursos insuficientes
# - Pull de imagen falla
```

### Pods en estado "Pending"

**Causa:** No hay recursos suficientes en el nodo

**Solución:**
```bash
# Ver detalles
kubectl describe pod <pod-name>

# Reducir réplicas o recursos
kubectl scale deployment <name> --replicas=2
```

### Error: "ImagePullBackOff" después de update

**Causa:** Nueva imagen no existe

**Solución:**
```bash
# Rollback inmediato
kubectl rollout undo deployment <name>

# Verificar nombre de imagen correcto
```

### Rollback no funciona

**Causa:** Historial de revisiones limitado (default: 10)

**Solución:**
```bash
# Ver historial disponible
kubectl rollout history deployment <name>

# Solo puedes volver a revisiones listadas
```

### Pods no se distribuyen uniformemente

**Causa:** Puede ser normal durante rollout

**Solución:**
```bash
# Esperar a que termine el rollout
kubectl rollout status deployment <name>

# Forzar redistribución (recrear pods)
kubectl rollout restart deployment <name>
```

---

## Desafío Adicional

### Desafío 1: Zero-Downtime Update

1. Crear deployment con health check
2. Actualizar imagen
3. Verificar que siempre haya pods Ready

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zero-downtime
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # ← Cero downtime
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Desafío 2: Canary Deployment (Básico)

Crear dos deployments con diferentes versiones:

```bash
# Deployment v1 (90% tráfico)
kubectl create deployment app-v1 --image=nginx:1.25-alpine --replicas=9

# Deployment v2 (10% tráfico)
kubectl create deployment app-v2 --image=nginx:1.26-alpine --replicas=1

# Ambos con mismo label para el Service (próximo lab)
kubectl label deployment app-v1 version=v1
kubectl label deployment app-v2 version=v2
```

### Desafío 3: Pausar y Reanudar Rollout

```bash
# Pausar rollout (útil para verificar antes de continuar)
kubectl rollout pause deployment webapp-deployment

# Hacer múltiples cambios
kubectl set image deployment/webapp-deployment nginx=nginx:1.27-alpine
kubectl set resources deployment webapp-deployment -c=nginx --limits=cpu=200m

# Reanudar (aplica todos los cambios juntos)
kubectl rollout resume deployment webapp-deployment
```

---

## Recursos Adicionales

- [Deployments en Kubernetes](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Rolling Updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Estrategias de Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Rollback de Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment)
