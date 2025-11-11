# Lab 03: HPA - Horizontal Pod Autoscaler

## Objetivo

Comprender cómo Kubernetes escala automáticamente el número de pods basándose en métricas de uso de CPU, manteniendo el rendimiento bajo carga variable.

---

## Comandos a ejecutar

### Paso 1: Habilitar Metrics Server

```bash
minikube addons enable metrics-server
```

**Salida esperada:**
```
metrics-server was successfully enabled
```

**Verificar instalación:**
```bash
kubectl get pods -n kube-system | grep metrics-server
```

**Esperar a que esté Running:**
```
metrics-server-xxxxxxxxx-xxxxx   1/1     Running   0          30s
```

**Esperar ~1 minuto para que métricas estén disponibles, luego verificar:**
```bash
kubectl top nodes
```

**Salida esperada:**
```
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
minikube   250m         12%    1200Mi          30%
```

---

### Paso 2: Desplegar aplicación con resource requests

Crear archivo `app-with-resources.yaml`:

```bash
cat <<EOF > app-with-resources.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  replicas: 1
  selector:
    matchLabels:
      app: php-apache
  template:
    metadata:
      labels:
        app: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 200m
          limits:
            cpu: 500m
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
spec:
  selector:
    app: php-apache
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
EOF
```

**Aplicar:**
```bash
kubectl apply -f app-with-resources.yaml
```

**Verificar:**
```bash
kubectl get pods -l app=php-apache
```

**Salida esperada:**
```
NAME                          READY   STATUS    RESTARTS   AGE
php-apache-xxxxxxxxxx-xxxxx   1/1     Running   0          20s
```

---

### Paso 3: Crear HPA

```bash
kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=5
```

**Salida esperada:**
```
horizontalpodautoscaler.autoscaling/php-apache autoscaled
```

**Verificar HPA:**
```bash
kubectl get hpa
```

**Salida esperada:**
```
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    1         5         1          10s
```

**Nota:** TARGETS muestra `0%/50%` (uso actual / target). Al inicio es 0% porque no hay carga.

---

### Paso 4: Ver HPA en detalle

```bash
kubectl describe hpa php-apache
```

**Observar:**
```
Name:                                                  php-apache
Namespace:                                             default
Labels:                                                <none>
Annotations:                                           <none>
CreationTimestamp:                                     ...
Reference:                                             Deployment/php-apache
Metrics:                                               ( current / target )
  resource cpu on pods  (as a percentage of request):  0% (0) / 50%
Min replicas:                                          1
Max replicas:                                          5
Deployment pods:                                       1 current / 1 desired
Conditions:
  Type            Status  Reason              Message
  ----            ------  ------              -------
  AbleToScale     True    ReadyForNewScale    recommended size matches current size
  ScalingActive   True    ValidMetricFound    the HPA was able to successfully calculate a replica count
  ScalingLimited  False   DesiredWithinRange  the desired count is within the acceptable range
Events:           <none>
```

---

### Paso 5: Generar carga

**Abrir una NUEVA terminal** y ejecutar:

```bash
kubectl run -it load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://php-apache; done"
```

Este comando:
- Crea un pod temporal `load-generator`
- Hace requests continuos a `php-apache`
- Se eliminará automáticamente al salir (--rm)

**Dejar corriendo en esa terminal.**

---

### Paso 6: Observar el escalado

**En tu terminal original**, ejecutar:

```bash
kubectl get hpa php-apache --watch
```

**Salida esperada (cambia cada 15-30 segundos):**
```
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    1         5         1          1m
php-apache   Deployment/php-apache   250%/50%  1         5         1          2m
php-apache   Deployment/php-apache   250%/50%  1         5         5          2m30s
php-apache   Deployment/php-apache   55%/50%   1         5         5          3m
```

**Observa:**
1. CPU sube a 250% (más del 50% target)
2. HPA decide escalar
3. REPLICAS cambia de 1 a 5
4. Tras distribuir la carga, CPU baja a ~55%

**En otra terminal, ver pods:**
```bash
watch kubectl get pods -l app=php-apache
```

**Verás pods creándose:**
```
NAME                          READY   STATUS    RESTARTS   AGE
php-apache-xxxxxxxxxx-xxxxx   1/1     Running   0          5m
php-apache-xxxxxxxxxx-yyyyy   1/1     Running   0          30s
php-apache-xxxxxxxxxx-zzzzz   1/1     Running   0          30s
php-apache-xxxxxxxxxx-aaaaa   1/1     Running   0          30s
php-apache-xxxxxxxxxx-bbbbb   1/1     Running   0          30s
```

---

### Paso 7: Ver métricas de CPU

```bash
kubectl top pods -l app=php-apache
```

**Salida esperada:**
```
NAME                          CPU(cores)   MEMORY(bytes)
php-apache-xxxxxxxxxx-xxxxx   110m         10Mi
php-apache-xxxxxxxxxx-yyyyy   105m         10Mi
php-apache-xxxxxxxxxx-zzzzz   108m         10Mi
php-apache-xxxxxxxxxx-aaaaa   112m         10Mi
php-apache-xxxxxxxxxx-bbbbb   107m         10Mi
```

CPU distribuida entre 5 pods (~100-110m cada uno, cerca del 50% de 200m request).

---

### Paso 8: Detener la carga y observar scale-down

**En la terminal del load-generator**, presionar **Ctrl+C** para detener la carga.

**En la terminal con watch HPA:**
```bash
kubectl get hpa php-apache --watch
```

**Verás (después de ~5 minutos):**
```
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   55%/50%   1         5         5          8m
php-apache   Deployment/php-apache   0%/50%    1         5         5          10m
php-apache   Deployment/php-apache   0%/50%    1         5         1          15m
```

**Observa:**
1. CPU baja a 0% al detener la carga
2. HPA espera ~5 minutos antes de scale-down (comportamiento por defecto)
3. REPLICAS vuelve a 1 (el mínimo)

**Nota:** Scale-down es más lento que scale-up para evitar oscilaciones (flapping).

---

### Paso 9: Limpieza

```bash
kubectl delete hpa php-apache
kubectl delete -f app-with-resources.yaml
rm app-with-resources.yaml
```

---

## Desglose de comandos

### Comando `kubectl autoscale`

```bash
kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=5
```

| Parámetro | Descripción |
|-----------|-------------|
| `deployment php-apache` | Deployment a escalar |
| `--cpu-percent=50` | Target de CPU (50% del request) |
| `--min=1` | Mínimo de réplicas |
| `--max=5` | Máximo de réplicas |

### Manifest HPA (alternativa declarativa)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

### Resource Requests y Limits

```yaml
resources:
  requests:
    cpu: 200m     # HPA calcula porcentaje sobre este valor
  limits:
    cpu: 500m     # Máximo que puede usar el pod
```

| Campo | Descripción |
|-------|-------------|
| `requests.cpu` | CPU garantizada, base para HPA |
| `limits.cpu` | CPU máxima permitida |
| `200m` | 200 milicores = 0.2 cores = 20% de 1 CPU |

---

## Explicación detallada

### ¿Qué es HPA?

HPA (Horizontal Pod Autoscaler) ajusta automáticamente el número de pods en un Deployment/ReplicaSet basándose en métricas observadas (CPU, memoria, métricas custom).

### ¿Cómo funciona?

```
1. Metrics Server recolecta métricas de pods cada 15s
2. HPA consulta métricas cada 15s
3. HPA calcula: replicas_necesarias = ceil[replicas_actuales * (metrica_actual / metrica_target)]
4. Si replicas_necesarias != replicas_actuales → Escala
5. Espera cooldown antes de volver a escalar
```

**Ejemplo de cálculo:**
- Réplicas actuales: 1
- CPU actual: 250% (del request)
- CPU target: 50%
- Cálculo: ceil[1 * (250/50)] = ceil[5] = **5 réplicas**

### Scale-up vs Scale-down

**Scale-up (aumentar pods):**
- Rápido: ~30 segundos desde detección hasta nuevos pods
- Sin delay especial

**Scale-down (disminuir pods):**
- Lento: ~5 minutos de espera (configurable)
- Razón: Evitar flapping (subir/bajar constantemente)

### Requisitos para HPA

1. **Metrics Server instalado** (recolecta métricas)
2. **Resource requests definidos** (HPA calcula % sobre requests)
3. **Deployment/ReplicaSet** (no funciona con pods individuales)

### ¿Por qué usar HPA?

**Sin HPA:**
```
Alto tráfico → Pods sobrecargados → Timeouts, errores 503
Bajo tráfico → Muchos pods → Desperdicio de recursos
```

**Con HPA:**
```
Alto tráfico → HPA detecta → Escala automáticamente → Performance estable
Bajo tráfico → HPA detecta → Reduce pods → Ahorro de recursos
```

### Flujo de este Lab

1. **Instalamos Metrics Server** → Recolecta métricas
2. **Desplegamos app con requests** → HPA necesita saber el baseline
3. **Creamos HPA** → min=1, max=5, target=50% CPU
4. **Generamos carga** → CPU sube a 250%
5. **HPA escala** → De 1 a 5 pods en ~30s
6. **Carga distribuida** → CPU baja a ~55% en cada pod
7. **Detenemos carga** → CPU baja a 0%
8. **HPA reduce** → De 5 a 1 pod en ~5 min

---

## Conceptos aprendidos

- **HPA**: Escala horizontal automática basada en métricas
- **Metrics Server**: Recolector de métricas de pods y nodos
- **Resource requests**: Base para cálculo de porcentajes
- **Scale-up rápido**: Respuesta rápida a aumento de carga
- **Scale-down lento**: Evita oscilaciones, estabilidad

---

## Troubleshooting

### HPA muestra `<unknown>` en TARGETS

**Problema:**
```bash
kubectl get hpa
NAME         REFERENCE               TARGETS         MINPODS   MAXPODS   REPLICAS
php-apache   Deployment/php-apache   <unknown>/50%   1         5         0
```

**Causa:** Metrics Server no está listo o no hay resource requests definidos.

**Solución:**

1. **Verificar Metrics Server:**
```bash
kubectl get pods -n kube-system | grep metrics-server
```

Debe estar Running.

2. **Esperar 1-2 minutos** para que métricas estén disponibles:
```bash
kubectl top pods
```

3. **Verificar que Deployment tiene requests:**
```bash
kubectl get deployment php-apache -o yaml | grep -A5 "resources"
```

Debe mostrar `requests.cpu`.

---

### HPA no escala aunque CPU está alta

**Problema:**
CPU al 200% pero HPA no crea más pods.

**Solución:**

1. **Verificar events del HPA:**
```bash
kubectl describe hpa php-apache
```

Buscar mensajes de error en Events.

2. **Verificar que no alcanzó max replicas:**
```bash
kubectl get hpa
```

Si REPLICAS = MAXPODS, ya llegó al límite.

3. **Verificar que hay recursos en el nodo:**
```bash
kubectl describe nodes
```

Si el nodo está lleno, HPA no puede crear más pods.

---

### Pods demoran en escalar

**Problema:**
HPA decidió escalar pero los pods están Pending.

**Solución:**

1. **Ver estado de pods:**
```bash
kubectl get pods -l app=php-apache
```

2. **Ver por qué están Pending:**
```bash
kubectl describe pod <pod-name>
```

Buscar en Events: "Insufficient cpu" o "Insufficient memory" → Nodo sin recursos.

---

## Desafío adicional

Configura HPA con múltiples métricas (CPU y memoria) usando un manifest YAML declarativo.

---

## Recursos adicionales

- [Kubernetes Docs - Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [HPA Walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
- [Metrics Server](https://github.com/kubernetes-sigs/metrics-server)
