# Cheatsheet - Clase 6: Services, ConfigMaps, Secrets y StatefulSets

Referencia rápida de comandos y conceptos de Kubernetes para configuración y persistencia.

---

## Services

### Tipos de Services

```bash
# ClusterIP (default) - solo interno
kubectl expose deployment web --port=80 --target-port=80

# NodePort - accesible desde fuera
kubectl expose deployment web --port=80 --type=NodePort

# LoadBalancer - balanceador externo (cloud)
kubectl expose deployment web --port=80 --type=LoadBalancer

# Obtener URL del servicio (minikube)
minikube service <service-name> --url
```

### Comandos de Services

```bash
# Listar services
kubectl get services
kubectl get svc

# Detalles de un service
kubectl describe service <service-name>

# Ver endpoints de un service
kubectl get endpoints <service-name>

# Eliminar service
kubectl delete service <service-name>
```

### Service Discovery (DNS)

```bash
# Formato DNS interno
<service-name>                                    # Mismo namespace
<service-name>.<namespace>                        # Otro namespace
<service-name>.<namespace>.svc.cluster.local      # FQDN completo

# Probar DNS
kubectl run test --image=busybox:1.36 --rm -it -- nslookup <service-name>
```

---

## ConfigMaps

### Crear ConfigMaps

```bash
# Desde literales (clave-valor)
kubectl create configmap app-config \
  --from-literal=APP_NAME="Mi App" \
  --from-literal=APP_ENV=production

# Desde archivo
kubectl create configmap app-config --from-file=config.json

# Desde directorio
kubectl create configmap app-config --from-file=configs/

# Desde archivo .env
kubectl create configmap app-config --from-env-file=.env

# Desde YAML
kubectl apply -f configmap.yaml
```

### Ver ConfigMaps

```bash
# Listar
kubectl get configmap
kubectl get cm

# Ver contenido
kubectl describe configmap <name>
kubectl get configmap <name> -o yaml

# Ver valor específico
kubectl get configmap <name> -o jsonpath='{.data.KEY}'
```

### Usar ConfigMaps en Pods

```yaml
# Como variables de entorno
env:
- name: APP_NAME
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: APP_NAME

# Todas las claves como variables
envFrom:
- configMapRef:
    name: app-config

# Como archivo montado
volumes:
- name: config-volume
  configMap:
    name: app-config
volumeMounts:
- name: config-volume
  mountPath: /config
  readOnly: true
```

### Actualizar ConfigMaps

```bash
# Actualizar desde literal
kubectl create configmap app-config \
  --from-literal=APP_ENV=staging \
  --dry-run=client -o yaml | kubectl apply -f -

# Editar directamente
kubectl edit configmap <name>

# Reiniciar pods para aplicar cambios (si usan env)
kubectl rollout restart deployment <deployment-name>
```

---

## Secrets

### Crear Secrets

```bash
# Desde literales
kubectl create secret generic app-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASSWORD=supersecret123

# Desde archivo
kubectl create secret generic app-secret --from-file=credentials.txt

# Desde .env
kubectl create secret generic app-secret --from-env-file=.env

# TLS (certificados)
kubectl create secret tls tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem

# Docker registry credentials
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<user> \
  --docker-password=<password> \
  --docker-email=<email>
```

### Ver Secrets

```bash
# Listar
kubectl get secrets

# Ver detalles (NO muestra valores)
kubectl describe secret <name>

# Ver valores en base64
kubectl get secret <name> -o yaml
kubectl get secret <name> -o jsonpath='{.data}'

# Decodificar valor
kubectl get secret <name> -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

### Usar Secrets en Pods

```yaml
# Como variables de entorno
env:
- name: DB_USER
  valueFrom:
    secretKeyRef:
      name: app-secret
      key: DB_USER

# Todas las claves como variables
envFrom:
- secretRef:
    name: app-secret

# Como archivo montado
volumes:
- name: secret-volume
  secret:
    secretName: app-secret
volumeMounts:
- name: secret-volume
  mountPath: /secrets
  readOnly: true
```

### Eliminar Secrets

```bash
kubectl delete secret <name>
```

---

## StatefulSets

### Crear StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
```

### Comandos de StatefulSet

```bash
# Listar
kubectl get statefulset
kubectl get sts

# Ver detalles
kubectl describe statefulset <name>

# Escalar
kubectl scale statefulset <name> --replicas=3

# Ver pods (nombres predecibles)
kubectl get pods -l app=<label>
# Salida: postgres-0, postgres-1, postgres-2

# Eliminar
kubectl delete statefulset <name>
```

### Headless Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None  # Headless
  selector:
    app: postgres
  ports:
  - port: 5432
```

```bash
# DNS estable por pod
<pod-name>.<headless-service>.<namespace>.svc.cluster.local

# Ejemplo:
postgres-0.postgres-headless.default.svc.cluster.local
postgres-1.postgres-headless.default.svc.cluster.local
```

---

## PersistentVolumeClaims (PVC)

### Ver PVCs

```bash
# Listar
kubectl get pvc

# Ver detalles
kubectl describe pvc <name>

# Ver PersistentVolumes
kubectl get pv
```

### Eliminar PVCs

```bash
# Eliminar PVC específico
kubectl delete pvc <name>

# Eliminar todos los PVCs de un StatefulSet
kubectl delete pvc -l app=<label>
```

### Access Modes

| Modo | Abreviación | Descripción |
|------|-------------|-------------|
| ReadWriteOnce | RWO | Un nodo, lectura-escritura |
| ReadOnlyMany | ROX | Múltiples nodos, solo lectura |
| ReadWriteMany | RWX | Múltiples nodos, lectura-escritura |

---

## StatefulSet vs Deployment

| Característica | Deployment | StatefulSet |
|----------------|------------|-------------|
| Identidad de pods | Aleatoria | Predecible (0, 1, 2...) |
| Orden de creación | Paralelo | Secuencial |
| Orden de eliminación | Aleatorio | Inverso (2, 1, 0) |
| DNS estable | No | Sí (con Headless Service) |
| Volúmenes | Compartidos o efímeros | PVC único por pod |
| Uso | Stateless apps | Stateful apps (DB, cache) |

---

## Patrones Comunes

### App con configuración externa

```bash
# 1. Crear ConfigMap y Secret
kubectl create configmap app-config --from-literal=ENV=prod
kubectl create secret generic app-secret --from-literal=API_KEY=xyz

# 2. Deployment que los usa
kubectl apply -f deployment.yaml

# 3. Verificar
kubectl logs -l app=<app-name>
```

### Base de datos con persistencia

```bash
# 1. Crear Headless Service
kubectl apply -f headless-service.yaml

# 2. Crear StatefulSet con PVC
kubectl apply -f statefulset.yaml

# 3. Esperar a que esté listo
kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s

# 4. Conectarse y usar
kubectl exec -it postgres-0 -- psql -U user -d database
```

### Actualizar configuración sin downtime

```bash
# 1. Actualizar ConfigMap
kubectl create configmap app-config \
  --from-literal=NEW_KEY=new_value \
  --dry-run=client -o yaml | kubectl apply -f -

# 2. Reiniciar pods (rolling restart)
kubectl rollout restart deployment <deployment-name>

# 3. Ver progreso
kubectl rollout status deployment <deployment-name>
```

---

## Troubleshooting

### ConfigMap no encontrado

```bash
# Error: couldn't find key X in ConfigMap
kubectl get configmap <name>
kubectl describe configmap <name>
```

### Secret no se decodifica

```bash
# Ver valor codificado
kubectl get secret <name> -o jsonpath='{.data.KEY}'

# Decodificar
kubectl get secret <name> -o jsonpath='{.data.KEY}' | base64 -d
```

### Pod en Pending (PVC)

```bash
# Verificar PVC
kubectl describe pvc <name>

# Si no hay StorageClass disponible
minikube addons enable default-storageclass
minikube addons enable storage-provisioner
```

### StatefulSet no escala

```bash
# Ver estado de pods
kubectl get pods -l app=<label>

# Ver eventos
kubectl get events --sort-by='.lastTimestamp'

# Verificar que el pod anterior esté Ready
kubectl describe pod <pod-name>
```

### Cambios en ConfigMap no se reflejan

```bash
# Si usas variables de entorno: Reiniciar
kubectl rollout restart deployment <name>

# Si usas volumeMounts: Esperar ~60 segundos
# Los cambios se reflejan automáticamente
```

---

## Buenas Prácticas

### ConfigMaps y Secrets

- NO commitear Secrets en Git
- Usar `.gitignore` para archivos con credenciales
- En producción, rotar Secrets regularmente
- Usar `readOnly: true` en volumeMounts
- Nombrar con sufijos versionados: `app-config-v1`, `app-config-v2`

### StatefulSets

- Siempre usar Headless Service
- Definir resource requests y limits
- Configurar liveness y readiness probes
- NO eliminar PVCs sin backup
- Escalar con cuidado (orden secuencial)
- Usar `PGDATA` subdirectorio para PostgreSQL

### Services

- Usar ClusterIP para comunicación interna
- Usar NodePort solo para desarrollo/testing
- Usar LoadBalancer en producción cloud
- Nombrar Services con sufijos: `-service`, `-svc`

---

## Comandos de Verificación

```bash
# Ver todos los recursos
kubectl get all

# Ver ConfigMaps y Secrets
kubectl get cm,secret

# Ver PVCs y PVs
kubectl get pvc,pv

# Ver logs de múltiples pods
kubectl logs -l app=<label> --tail=20

# Ver eventos recientes
kubectl get events --sort-by='.lastTimestamp' | tail -20

# Verificar conectividad entre pods
kubectl run test --image=busybox:1.36 --rm -it -- wget -qO- http://<service-name>
```

---

## Recursos Oficiales

- [Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
