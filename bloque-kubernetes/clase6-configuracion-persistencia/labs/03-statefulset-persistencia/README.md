# Lab 03: StatefulSet y Persistencia con PostgreSQL

## Objetivo

Comprender la diferencia entre Deployments y StatefulSets, aprender a gestionar aplicaciones con estado usando StatefulSets, y entender cómo funciona la persistencia de datos con PersistentVolumeClaims (PVC) en Kubernetes.

**Nota importante:** Este lab usa el namespace `default` para simplicidad didáctica. En el Proyecto Integrador (comenzando con v2.0) todos los recursos se desplegarán en un namespace dedicado (`proyecto-integrador`).

---

## Comandos a ejecutar

### Paso 1: Crear Headless Service para PostgreSQL

Un Headless Service (sin ClusterIP) es necesario para StatefulSets porque proporciona DNS estable para cada pod individual.

Guardar como `postgres-headless-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
  labels:
    app: postgres
spec:
  clusterIP: None  # Headless
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
    protocol: TCP
    name: postgres
```

**Aplicar:**
```bash
kubectl apply -f postgres-headless-service.yaml
```

**Verificar:**
```bash
kubectl get service postgres-headless
```

**Salida esperada:**
```
NAME                TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE
postgres-headless   ClusterIP   None         <none>        5432/TCP   5s
```

---

### Paso 2: Crear StatefulSet de PostgreSQL con PVC

Guardar como `postgres-statefulset.yaml`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  labels:
    app: postgres
spec:
  serviceName: postgres-headless
  replicas: 1
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
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: "testdb"
        - name: POSTGRES_USER
          value: "admin"
        - name: POSTGRES_PASSWORD
          value: "postgres123"
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U admin -d testdb
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U admin -d testdb
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
```

**Aplicar:**
```bash
kubectl apply -f postgres-statefulset.yaml
```

**Ver creación del StatefulSet:**
```bash
kubectl get statefulset postgres -w
```

**Salida esperada:**
```
NAME       READY   AGE
postgres   0/1     5s
postgres   1/1     30s
```

**Ver pods creados:**
```bash
kubectl get pods -l app=postgres
```

**Salida esperada:**
```
NAME         READY   STATUS    RESTARTS   AGE
postgres-0   1/1     Running   0          45s
```

**Nota:** Los pods de StatefulSet tienen nombres predecibles: `<statefulset-name>-<ordinal>`

---

### Paso 3: Verificar PersistentVolumeClaim creado

```bash
kubectl get pvc
```

**Salida esperada:**
```
NAME                         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   AGE
postgres-storage-postgres-0  Bound    pvc-abc123-def456-ghi789                   1Gi        RWO            1m
```

**Ver detalles del PVC:**
```bash
kubectl describe pvc postgres-storage-postgres-0
```

**Ver PersistentVolume asociado:**
```bash
kubectl get pv
```

---

### Paso 4: Conectarse a PostgreSQL e insertar datos

**Conectarse al pod:**
```bash
kubectl exec -it postgres-0 -- psql -U admin -d testdb
```

**Dentro de psql, crear tabla e insertar datos:**
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100)
);

INSERT INTO usuarios (nombre, email) VALUES
    ('Juan Pérez', 'juan@example.com'),
    ('María García', 'maria@example.com'),
    ('Carlos López', 'carlos@example.com');

SELECT * FROM usuarios;
```

**Salida esperada:**
```
 id |    nombre     |       email
----+---------------+---------------------
  1 | Juan Pérez    | juan@example.com
  2 | María García  | maria@example.com
  3 | Carlos López  | carlos@example.com
(3 rows)
```

**Salir de psql:**
```sql
\q
```

---

### Paso 5: Eliminar el pod y verificar persistencia

**Eliminar el pod:**
```bash
kubectl delete pod postgres-0
```

**Ver recreación automática:**
```bash
kubectl get pods -l app=postgres -w
```

**Salida esperada:**
```
NAME         READY   STATUS        RESTARTS   AGE
postgres-0   1/1     Terminating   0          5m
postgres-0   0/1     Pending       0          0s
postgres-0   0/1     ContainerCreating   0   2s
postgres-0   1/1     Running       0          15s
```

**Esperar a que esté Ready, luego conectarse nuevamente:**
```bash
kubectl exec -it postgres-0 -- psql -U admin -d testdb -c "SELECT * FROM usuarios;"
```

**Salida esperada (datos persisten):**
```
 id |    nombre     |       email
----+---------------+---------------------
  1 | Juan Pérez    | juan@example.com
  2 | María García  | maria@example.com
  3 | Carlos López  | carlos@example.com
(3 rows)
```

**Conclusión:** Los datos persisten porque el pod se vuelve a montar al mismo PVC.

---

### Paso 6: Ver DNS estable del StatefulSet

**Desde otro pod, resolver DNS del StatefulSet:**
```bash
kubectl run dns-test --image=busybox:1.36 --rm -it --restart=Never -- nslookup postgres-0.postgres-headless
```

**Salida esperada:**
```
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      postgres-0.postgres-headless
Address 1: 10.244.0.10 postgres-0.postgres-headless.default.svc.cluster.local
```

**DNS estable:** `<pod-name>.<headless-service-name>.<namespace>.svc.cluster.local`

Para este ejemplo: `postgres-0.postgres-headless.default.svc.cluster.local`

---

### Paso 7: Escalar el StatefulSet (opcional)

**Escalar a 2 réplicas:**
```bash
kubectl scale statefulset postgres --replicas=2
```

**Ver creación ordenada:**
```bash
kubectl get pods -l app=postgres -w
```

**Salida esperada:**
```
NAME         READY   STATUS    RESTARTS   AGE
postgres-0   1/1     Running   0          10m
postgres-1   0/1     Pending   0          0s
postgres-1   0/1     ContainerCreating   0   2s
postgres-1   1/1     Running   0          20s
```

**Nota:** El segundo pod (`postgres-1`) solo se crea cuando `postgres-0` está Running y Ready.

**Ver PVCs creados:**
```bash
kubectl get pvc
```

**Salida esperada:**
```
NAME                         STATUS   VOLUME                  CAPACITY   ACCESS MODES   AGE
postgres-storage-postgres-0  Bound    pvc-abc123              1Gi        RWO            12m
postgres-storage-postgres-1  Bound    pvc-def456              1Gi        RWO            2m
```

**Cada pod tiene su propio volumen persistente.**

---

### Paso 8: Reducir escala y ver comportamiento

**Reducir a 1 réplica:**
```bash
kubectl scale statefulset postgres --replicas=1
```

**Ver eliminación ordenada:**
```bash
kubectl get pods -l app=postgres -w
```

**Salida esperada:**
```
NAME         READY   STATUS        RESTARTS   AGE
postgres-0   1/1     Running       0          15m
postgres-1   1/1     Terminating   0          5m
postgres-1   0/1     Terminating   0          5m
```

**Nota:** Se elimina en orden inverso (primero postgres-1, luego postgres-0 si escalaras a 0).

**Ver PVCs (no se eliminan automáticamente):**
```bash
kubectl get pvc
```

**Salida esperada:**
```
NAME                         STATUS   VOLUME                  CAPACITY   ACCESS MODES   AGE
postgres-storage-postgres-0  Bound    pvc-abc123              1Gi        RWO            17m
postgres-storage-postgres-1  Bound    pvc-def456              1Gi        RWO            7m
```

**Importante:** Los PVCs persisten incluso si se eliminan los pods. Si vuelves a escalar a 2, `postgres-1` se reconectará al mismo PVC con los mismos datos.

---

### Paso 9: Limpieza

```bash
kubectl delete statefulset postgres
kubectl delete service postgres-headless
kubectl delete pvc postgres-storage-postgres-0 postgres-storage-postgres-1
rm postgres-statefulset.yaml postgres-headless-service.yaml
```

---

## Desglose de los comandos

### StatefulSet vs Deployment

| Característica | Deployment | StatefulSet |
|----------------|------------|-------------|
| **Identidad de pods** | Aleatoria (web-abc123-xyz) | Predecible (web-0, web-1, web-2) |
| **DNS** | No estable | Estable por pod |
| **Orden de creación** | Paralelo | Secuencial (0 → 1 → 2) |
| **Orden de eliminación** | Aleatorio | Inverso (2 → 1 → 0) |
| **Volúmenes** | Compartidos o temporales | PVC único por pod |
| **Caso de uso** | Apps stateless (API, frontend) | Apps stateful (DB, cache, queues) |

### Headless Service

| Campo | Valor | Significado |
|-------|-------|-------------|
| `clusterIP: None` | Sin ClusterIP | No hay balanceo a nivel de service |
| `serviceName` en StatefulSet | Requerido | Asocia StatefulSet al Headless Service |
| **DNS por pod** | `pod-0.service-name` | Cada pod tiene su propio DNS |

### volumeClaimTemplates

```yaml
volumeClaimTemplates:
- metadata:
    name: postgres-storage
  spec:
    accessModes: ["ReadWriteOnce"]
    resources:
      requests:
        storage: 1Gi
```

- **Template:** Se crea un PVC por cada pod del StatefulSet
- **Naming:** `<template-name>-<statefulset-name>-<ordinal>`
- **Persistencia:** Los PVCs NO se eliminan automáticamente al eliminar el StatefulSet

---

## Explicación detallada

### ¿Cuándo usar StatefulSet?

**Usar StatefulSet cuando necesitas:**
- Identidad estable de pods (nombre predecible)
- Orden específico de despliegue y escalado
- Almacenamiento persistente único por pod
- DNS estable por pod

**Ejemplos de aplicaciones:**
- Bases de datos (PostgreSQL, MySQL, MongoDB)
- Sistemas de cache distribuidos (Redis Cluster, Memcached)
- Sistemas de mensajería (Kafka, RabbitMQ)
- Sistemas de coordinación (Zookeeper, etcd)

**NO usar StatefulSet para:**
- APIs REST stateless
- Frontends (Angular, React)
- Workers que procesan colas (pueden usar Deployment)

### Garantías de orden

#### Creación (0 → 1 → 2)
1. Se crea `postgres-0`
2. Espera a que esté Running y Ready
3. Luego se crea `postgres-1`
4. Espera a que esté Running y Ready
5. Luego se crea `postgres-2`

#### Eliminación (2 → 1 → 0)
1. Se elimina `postgres-2`
2. Espera a que termine completamente
3. Luego se elimina `postgres-1`
4. Espera a que termine
5. Luego se elimina `postgres-0`

### PersistentVolumeClaims (PVC)

Un PVC es una solicitud de almacenamiento por parte de un usuario. Kubernetes busca un PersistentVolume (PV) disponible que cumpla con los requisitos.

**Access Modes:**
- `ReadWriteOnce` (RWO): Un solo nodo puede montar el volumen en modo lectura-escritura
- `ReadOnlyMany` (ROX): Múltiples nodos pueden montar en modo solo lectura
- `ReadWriteMany` (RWX): Múltiples nodos pueden montar en modo lectura-escritura

**StorageClass:**
En minikube se usa `standard` (hostPath) por defecto. En cloud providers hay opciones como:
- AWS: `gp2`, `gp3`, `io1`
- GCP: `standard`, `ssd`
- Azure: `managed-premium`, `managed-standard`

### DNS en StatefulSet

Para un StatefulSet llamado `postgres` con Headless Service `postgres-headless`:

**DNS de cada pod:**
```
postgres-0.postgres-headless.default.svc.cluster.local
postgres-1.postgres-headless.default.svc.cluster.local
postgres-2.postgres-headless.default.svc.cluster.local
```

**DNS del servicio (resuelve a todos los pods):**
```
postgres-headless.default.svc.cluster.local
```

---

## Conceptos aprendidos

- StatefulSets gestionan aplicaciones con estado
- Los pods tienen nombres predecibles e identidad estable
- Creación y eliminación es ordenada (secuencial)
- Cada pod tiene su propio PersistentVolumeClaim
- Los PVCs NO se eliminan automáticamente al eliminar el StatefulSet
- Headless Service proporciona DNS estable por pod
- Los datos persisten incluso si se elimina el pod
- StatefulSet es ideal para bases de datos y sistemas distribuidos

---

## Troubleshooting

### Pod en Pending

**Problema:**
```bash
kubectl get pods
# postgres-0   0/1   Pending   0   30s
```

**Causas comunes:**

1. **No hay PersistentVolume disponible:**
```bash
kubectl describe pod postgres-0 | grep -A 5 Events
# Warning  FailedScheduling  persistentvolumeclaim "postgres-storage-postgres-0" not found
```

**Solución (minikube):**
```bash
minikube addons enable default-storageclass
minikube addons enable storage-provisioner
```

2. **Recursos insuficientes:**
```bash
kubectl describe pod postgres-0 | grep -i insufficient
```

**Solución:**
Reducir `requests` en el StatefulSet o aumentar recursos del nodo.

---

### Pod en CrashLoopBackOff

**Problema:**
```bash
kubectl get pods
# postgres-0   0/1   CrashLoopBackOff   3   2m
```

**Ver logs:**
```bash
kubectl logs postgres-0
```

**Causas comunes:**

1. **Permisos del volumen:**
```
initdb: could not change permissions of directory "/var/lib/postgresql/data": Operation not permitted
```

**Solución:** Usar `PGDATA` subdirectorio:
```yaml
env:
- name: PGDATA
  value: /var/lib/postgresql/data/pgdata
```

2. **PVC montado con datos corruptos:**
```bash
kubectl delete pvc postgres-storage-postgres-0
kubectl delete pod postgres-0 --force
```

---

### StatefulSet no escala

**Problema:**
```bash
kubectl scale statefulset postgres --replicas=3
# Solo hay 1 pod Running, los demás Pending
```

**Causa:** El pod anterior no está Ready.

**Verificar:**
```bash
kubectl get pods -l app=postgres
# postgres-0   0/1   Running   0   5m
# postgres-1   0/1   Pending   0   3m
```

**Solución:**
Arreglar el pod que no está Ready (revisar logs, probes, etc.):
```bash
kubectl logs postgres-0
kubectl describe pod postgres-0
```

---

### No puedo conectarme a PostgreSQL desde otro pod

**Problema:**
```bash
kubectl run test --image=postgres:15-alpine --rm -it -- psql -h postgres-headless -U admin -d testdb
# could not translate host name "postgres-headless" to address
```

**Soluciones:**

1. **Usar DNS completo del pod:**
```bash
psql -h postgres-0.postgres-headless -U admin -d testdb
```

2. **Crear Service ClusterIP adicional para balanceo:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

```bash
psql -h postgres-service -U admin -d testdb
```

---

### PVC no se elimina

**Problema:**
```bash
kubectl delete statefulset postgres
kubectl get pvc
# PVC sigue presente
```

**Explicación:** Esto es intencional. Los PVCs NO se eliminan automáticamente para evitar pérdida de datos.

**Eliminar manualmente:**
```bash
kubectl delete pvc postgres-storage-postgres-0
```

**O eliminar todos:**
```bash
kubectl delete pvc -l app=postgres
```

---

## Desafío final

### Desafío 1: StatefulSet de Redis en modo cluster

Crea un StatefulSet de Redis con 3 réplicas:
- Usar imagen `redis:7-alpine`
- Cada pod debe tener su propio PVC de 500Mi
- Crear Headless Service
- Verificar que cada pod tenga DNS estable

**Pistas:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-headless
spec:
  clusterIP: None
  selector:
    app: redis
  ports:
  - port: 6379
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
# ... completar
```

---

### Desafío 2: Demostrar persistencia con múltiples escalados

1. Crear StatefulSet de PostgreSQL con 1 réplica
2. Insertar datos en la base de datos
3. Escalar a 3 réplicas
4. Insertar diferentes datos en cada pod
5. Reducir a 0 réplicas
6. Escalar nuevamente a 3 réplicas
7. Verificar que cada pod recuperó sus datos originales

---

### Desafío 3: StatefulSet con ConfigMap y Secret

Modificar el StatefulSet de PostgreSQL para:
- Usar ConfigMap para `POSTGRES_DB`
- Usar Secret para `POSTGRES_USER` y `POSTGRES_PASSWORD`
- Montar un archivo de configuración personalizado (`postgresql.conf`)

---

## Recursos adicionales

- [Kubernetes Docs - StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Kubernetes Docs - Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [Kubernetes Docs - Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)
- [Run a Replicated Stateful Application](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/)
- [PostgreSQL on Kubernetes](https://www.postgresql.org/docs/current/high-availability.html)
