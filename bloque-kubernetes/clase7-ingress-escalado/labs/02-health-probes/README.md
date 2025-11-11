# Lab 02: Health Probes - Liveness y Readiness

## Objetivo

Comprender cómo Kubernetes usa health probes para detectar pods enfermos (liveness) y pods no listos para recibir tráfico (readiness), manteniendo la disponibilidad de las aplicaciones.

---

## Comandos a ejecutar

### Paso 1: Crear aplicación con health probes

Crear archivo `app-with-probes.yaml`:

```bash
cat <<EOF > app-with-probes.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 2
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
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  selector:
    app: webapp
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
EOF
```

**Aplicar:**
```bash
kubectl apply -f app-with-probes.yaml
```

**Salida esperada:**
```
deployment.apps/webapp created
service/webapp-service created
```

---

### Paso 2: Verificar pods y endpoints

```bash
kubectl get pods -l app=webapp
```

**Salida esperada:**
```
NAME                      READY   STATUS    RESTARTS   AGE
webapp-5f7d8c9b4d-abc12   1/1     Running   0          20s
webapp-5f7d8c9b4d-def34   1/1     Running   0          20s
```

**Verificar endpoints:**
```bash
kubectl get endpoints webapp-service
```

**Salida esperada:**
```
NAME             ENDPOINTS                     AGE
webapp-service   10.244.0.10:80,10.244.0.11:80   30s
```

Ambos pods están en los endpoints porque pasaron el readiness probe.

---

### Paso 3: Simular fallo de liveness probe

**Elegir un pod:**
```bash
POD_NAME=$(kubectl get pods -l app=webapp -o jsonpath='{.items[0].metadata.name}')
echo "Pod seleccionado: $POD_NAME"
```

**Romper el servidor web (hacer que liveness falle):**
```bash
kubectl exec -it $POD_NAME -- sh -c "rm /usr/share/nginx/html/index.html"
```

**Observar eventos en otra terminal:**
```bash
kubectl get pods -l app=webapp --watch
```

O ver eventos del pod:
```bash
kubectl describe pod $POD_NAME
```

**Qué observar:**
Después de ~25 segundos (initialDelay 5s + 4 fallos * 5s), verás:

```
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Warning  Unhealthy  10s   kubelet            Liveness probe failed: HTTP probe failed with statuscode: 404
  Normal   Killing    5s    kubelet            Container nginx failed liveness probe, will be restarted
```

El pod se reiniciará automáticamente:
```
NAME                      READY   STATUS    RESTARTS   AGE
webapp-5f7d8c9b4d-abc12   1/1     Running   1          2m
```

**Nota:** `RESTARTS` incrementó a 1.

---

### Paso 4: Simular fallo de readiness probe

**Elegir el otro pod:**
```bash
POD_NAME2=$(kubectl get pods -l app=webapp -o jsonpath='{.items[1].metadata.name}')
echo "Pod seleccionado: $POD_NAME2"
```

**Romper readiness (mismo comando):**
```bash
kubectl exec -it $POD_NAME2 -- sh -c "rm /usr/share/nginx/html/index.html"
```

**Ver estado del pod:**
```bash
kubectl get pods -l app=webapp
```

**Salida esperada:**
```
NAME                      READY   STATUS    RESTARTS   AGE
webapp-5f7d8c9b4d-abc12   1/1     Running   1          3m
webapp-5f7d8c9b4d-def34   0/1     Running   0          3m
```

**Nota:** El segundo pod muestra `0/1` en READY (no está listo).

**Ver endpoints:**
```bash
kubectl get endpoints webapp-service
```

**Salida esperada:**
```
NAME             ENDPOINTS         AGE
webapp-service   10.244.0.10:80    5m
```

**Solo 1 endpoint** - Kubernetes quitó el pod del balanceo porque falló readiness.

**Ver eventos:**
```bash
kubectl describe pod $POD_NAME2 | grep -A5 "Readiness"
```

```
  Warning  Unhealthy  30s   kubelet  Readiness probe failed: HTTP probe failed with statuscode: 404
```

**Diferencia clave:**
- **Liveness falló** → Pod se reinicia
- **Readiness falló** → Pod sigue corriendo pero NO recibe tráfico

---

### Paso 5: Observar recuperación

Después de ~25 segundos, el liveness probe también fallará y Kubernetes reiniciará el pod.

```bash
kubectl get pods -l app=webapp --watch
```

Verás:
```
webapp-5f7d8c9b4d-def34   0/1     Running   1          4m
```

Tras reiniciar, el pod tendrá el `index.html` de nuevo y ambos probes pasarán:
```
webapp-5f7d8c9b4d-def34   1/1     Running   1          5m
```

---

### Paso 6: Limpieza

```bash
kubectl delete -f app-with-probes.yaml
rm app-with-probes.yaml
```

---

## Desglose de comandos

### Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

| Campo | Descripción |
|-------|-------------|
| `livenessProbe` | Verifica si el contenedor está vivo |
| `httpGet.path` | Ruta HTTP a verificar |
| `httpGet.port` | Puerto donde hacer la petición |
| `initialDelaySeconds` | Esperar X segundos antes del primer chequeo |
| `periodSeconds` | Ejecutar cada X segundos |

### Readiness Probe

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 3
  periodSeconds: 3
```

| Campo | Descripción |
|-------|-------------|
| `readinessProbe` | Verifica si el contenedor está listo para tráfico |
| Otros campos | Mismos que liveness probe |

---

## Explicación detallada

### ¿Qué son los Health Probes?

Los health probes son chequeos que Kubernetes ejecuta periódicamente para determinar el estado de salud de los contenedores.

### Tipos de Probes

**1. Liveness Probe (Vivacidad)**
- **Pregunta:** ¿Está el contenedor vivo y funcionando?
- **Si falla:** Kubernetes reinicia el contenedor
- **Uso:** Detectar deadlocks, procesos colgados, crashes silenciosos

**2. Readiness Probe (Preparado)**
- **Pregunta:** ¿Está el contenedor listo para recibir tráfico?
- **Si falla:** Kubernetes lo quita de los endpoints del Service (no recibe tráfico)
- **Uso:** Aplicación iniciando, conectando a BD, cargando datos

**3. Startup Probe (Inicio)** - No usado en este lab
- **Pregunta:** ¿Ya terminó de iniciar?
- **Uso:** Aplicaciones que tardan mucho en iniciar

### Métodos de Chequeo

**HTTP GET** (usado en este lab):
```yaml
httpGet:
  path: /health
  port: 8080
```
Kubernetes hace GET request. Códigos 200-399 = éxito.

**TCP Socket**:
```yaml
tcpSocket:
  port: 8080
```
Kubernetes intenta conectarse al puerto. Conexión exitosa = éxito.

**Exec**:
```yaml
exec:
  command:
  - cat
  - /tmp/healthy
```
Kubernetes ejecuta comando en el contenedor. Exit code 0 = éxito.

### Flujo de este Lab

1. **Desplegamos app** con liveness y readiness probes
2. **Ambos pods pasan** los probes → Están en endpoints
3. **Rompemos liveness** en pod1 → Kubernetes lo reinicia
4. **Rompemos readiness** en pod2 → Kubernetes lo quita de endpoints (pero no lo reinicia aún)
5. **Después de más tiempo**, liveness también falla en pod2 → Kubernetes lo reinicia
6. **Tras reiniciar**, los pods recuperan el index.html → Probes pasan de nuevo

### ¿Por qué usar ambos probes?

**Escenario real:**

**Liveness:** Detecta si tu app está en un estado irrecuperable
```java
// App en deadlock
while(true) {
  // Proceso colgado pero contenedor "vive"
}
```

**Readiness:** Detecta si tu app está temporalmente no disponible
```java
// Conectando a base de datos al inicio
if (!database.isConnected()) {
  return HTTP 503; // Readiness falla
}
```

---

## Conceptos aprendidos

- **Liveness Probe**: Verifica si el contenedor está vivo, reinicia si falla
- **Readiness Probe**: Verifica si el contenedor puede recibir tráfico, lo quita de endpoints si falla
- **HTTP GET probe**: Método común para chequear endpoints HTTP
- **initialDelaySeconds**: Tiempo de espera antes del primer chequeo
- **periodSeconds**: Frecuencia de ejecución del probe

---

## Troubleshooting

### Pods en CrashLoopBackOff

**Problema:**
```bash
kubectl get pods
NAME                      READY   STATUS             RESTARTS   AGE
webapp-5f7d8c9b4d-abc12   0/1     CrashLoopBackOff   5          3m
```

**Causa:** Liveness probe falla inmediatamente al iniciar porque `initialDelaySeconds` es muy corto.

**Solución:**
Aumentar `initialDelaySeconds` para dar tiempo a la app de iniciar:
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 30  # Aumentar
  periodSeconds: 10
```

---

### Pods nunca llegan a Ready (0/1)

**Problema:**
```bash
kubectl get pods
NAME                      READY   STATUS    RESTARTS   AGE
webapp-5f7d8c9b4d-abc12   0/1     Running   0          2m
```

**Causa:** Readiness probe está fallando.

**Solución:**

1. **Ver eventos:**
```bash
kubectl describe pod <pod-name> | grep -A5 "Readiness"
```

2. **Verificar que el path existe:**
```bash
kubectl exec -it <pod-name> -- wget -O- http://localhost:80/
```

3. **Revisar configuración del probe:**
```bash
kubectl get pod <pod-name> -o yaml | grep -A10 "readinessProbe"
```

---

## Desafío adicional

Configura un tercer tipo de probe (TCP o Exec) en un nuevo deployment.

---

## Recursos adicionales

- [Kubernetes Docs - Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Best Practices - Health Checks](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes)
