# Lab 01: Namespaces - Organización y Aislamiento

## Objetivo

Comprender los namespaces en Kubernetes como mecanismo de organización y aislamiento lógico de recursos. Aprender a crear namespaces, desplegar recursos en ellos, y gestionar contextos. Practicar tanto la forma imperativa como la declarativa. Este lab sienta las bases para trabajar con namespaces en todos los labs siguientes.

---

## Comandos a ejecutar

### Paso 1: Ver namespaces existentes

```bash
kubectl get namespaces
```

**Salida esperada:**
```
NAME              STATUS   AGE
default           Active   5d
kube-node-lease   Active   5d
kube-public       Active   5d
kube-system       Active   5d
```

**Descripción de namespaces del sistema:**
- **default**: Namespace por defecto para recursos sin namespace especificado
- **kube-system**: Componentes del sistema de Kubernetes (CoreDNS, kube-proxy, etc.)
- **kube-public**: Recursos públicos accesibles por todos los usuarios
- **kube-node-lease**: Información de heartbeat de nodos (interno)

---

### Paso 2: Ver recursos en diferentes namespaces

**Ver pods en el namespace default:**
```bash
kubectl get pods
```

**Ver pods en el namespace kube-system:**
```bash
kubectl get pods -n kube-system
```

**Salida esperada (kube-system):**
```
NAME                               READY   STATUS    RESTARTS   AGE
coredns-5d78c9869d-abc12           1/1     Running   0          5d
etcd-minikube                      1/1     Running   0          5d
kube-apiserver-minikube            1/1     Running   0          5d
kube-controller-manager-minikube   1/1     Running   0          5d
kube-proxy-xyz34                   1/1     Running   0          5d
kube-scheduler-minikube            1/1     Running   0          5d
storage-provisioner                1/1     Running   0          5d
```

**Ver todos los pods de todos los namespaces:**
```bash
kubectl get pods --all-namespaces
# O abreviado:
kubectl get pods -A
```

---

### Paso 3: Crear namespaces (forma imperativa)

**Crear namespace para desarrollo:**
```bash
kubectl create namespace dev
kubectl get namespaces
```

**Salida esperada:**
```
NAME              STATUS   AGE
default           Active   5d
dev               Active   5s
kube-node-lease   Active   5d
kube-public       Active   5d
kube-system       Active   5d
```

**Crear namespaces adicionales:**
```bash
kubectl create namespace staging
kubectl create namespace prod
kubectl get namespaces
```

---

### Paso 4: Desplegar recursos en un namespace específico

**Crear deployment en namespace dev:**
```bash
kubectl create deployment nginx --image=nginx:alpine --replicas=2 -n dev
kubectl get pods -n dev
```

**Salida esperada:**
```
NAME                     READY   STATUS    RESTARTS   AGE
nginx-7d8f9c5b7c-abc12   1/1     Running   0          10s
nginx-7d8f9c5b7c-xyz34   1/1     Running   0          10s
```

**Crear deployment en namespace staging:**
```bash
kubectl create deployment nginx --image=nginx:alpine --replicas=3 -n staging
kubectl get pods -n staging
```

**Verificar que están aislados:**
```bash
kubectl get pods -n dev
kubectl get pods -n staging
kubectl get pods  # namespace default (vacío)
```

---

### Paso 5: Crear Service en un namespace

**Exponer deployment en dev:**
```bash
kubectl expose deployment nginx --port=80 -n dev --name=nginx-service
kubectl get services -n dev
```

**Salida esperada:**
```
NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
nginx-service   ClusterIP   10.96.123.45    <none>        80/TCP    5s
```

**Probar acceso con DNS completo:**
```bash
kubectl run test-pod --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- http://nginx-service.dev.svc.cluster.local
```

**Salida esperada (HTML de nginx):**
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

---

### Paso 6: Context switching (cambiar namespace por defecto)

**Ver contexto actual:**
```bash
kubectl config get-contexts
```

**Salida esperada:**
```
CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE
*         minikube   minikube   minikube
```

**Cambiar namespace por defecto del contexto a dev:**
```bash
kubectl config set-context --current --namespace=dev
kubectl config get-contexts
```

**Salida esperada:**
```
CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE
*         minikube   minikube   minikube   dev
```

**Ahora kubectl usa dev por defecto:**
```bash
kubectl get pods  # Sin -n, muestra pods de dev
```

**Volver al namespace default:**
```bash
kubectl config set-context --current --namespace=default
```

---

### Paso 7: Eliminar namespaces imperativos

**Eliminar namespace dev (elimina TODOS los recursos dentro):**
```bash
kubectl delete namespace dev
kubectl get namespaces
```

**Nota:** Al eliminar un namespace, se eliminan todos los recursos que contiene (pods, services, deployments, etc.).

---

### Paso 8: Crear namespaces con manifests YAML (forma declarativa)

Crear archivo `namespaces.yaml`:

```bash
cat > namespaces.yaml <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: desarrollo
  labels:
    env: development
    team: backend
---
apiVersion: v1
kind: Namespace
metadata:
  name: qa
  labels:
    env: testing
    team: qa
---
apiVersion: v1
kind: Namespace
metadata:
  name: produccion
  labels:
    env: production
    team: ops
EOF
```

**Aplicar el manifest:**
```bash
kubectl apply -f namespaces.yaml
kubectl get namespaces --show-labels
```

**Salida esperada:**
```
NAME              STATUS   AGE   LABELS
default           Active   5d    <none>
desarrollo        Active   5s    env=development,team=backend
kube-node-lease   Active   5d    <none>
kube-public       Active   5d    <none>
kube-system       Active   5d    <none>
produccion        Active   5s    env=production,team=ops
qa                Active   5s    env=testing,team=qa
staging           Active   10m   <none>
```

---

### Paso 9: Desplegar aplicación completa en un namespace

Crear archivo `app-desarrollo.yaml`:

```bash
cat > app-desarrollo.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: desarrollo
  labels:
    app: api
    env: development
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        env: development
    spec:
      containers:
      - name: api
        image: nginx:alpine
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: desarrollo
  labels:
    app: api
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 80
    name: http
EOF
```

**Aplicar el manifest:**
```bash
kubectl apply -f app-desarrollo.yaml
kubectl get all -n desarrollo
```

**Salida esperada:**
```
NAME                       READY   STATUS    RESTARTS   AGE
pod/api-7d8f9c5b7c-abc12   1/1     Running   0          10s
pod/api-7d8f9c5b7c-xyz34   1/1     Running   0          10s

NAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/api-service   ClusterIP   10.96.234.56    <none>        80/TCP    10s

NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/api   2/2     2            2           10s

NAME                             DESIRED   CURRENT   READY   AGE
replicaset.apps/api-7d8f9c5b7c   2         2         2       10s
```

---

### Paso 10: Acceso entre namespaces (DNS)

**Crear pod de prueba en namespace qa:**
```bash
kubectl run test-pod -n qa --image=busybox:1.36 --rm -it --restart=Never -- sh
```

**Dentro del pod, probar acceso con DNS:**
```sh
# DNS corto (NO funciona entre namespaces)
wget -qO- http://api-service
# Error: Could not resolve host

# DNS con namespace (funciona)
wget -qO- http://api-service.desarrollo
# Funciona

# FQDN completo (funciona)
wget -qO- http://api-service.desarrollo.svc.cluster.local
# Funciona

exit
```

---

### Paso 11: ResourceQuotas (límites de recursos por namespace)

Crear archivo `quota-desarrollo.yaml`:

```bash
cat > quota-desarrollo.yaml <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: desarrollo
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
    pods: "10"
EOF
```

**Aplicar ResourceQuota:**
```bash
kubectl apply -f quota-desarrollo.yaml
kubectl describe resourcequota compute-quota -n desarrollo
```

**Salida esperada:**
```
Name:            compute-quota
Namespace:       desarrollo
Resource         Used  Hard
--------         ----  ----
limits.cpu       0     4
limits.memory    0     4Gi
pods             2     10
requests.cpu     0     2
requests.memory  0     2Gi
```

---

### Paso 12: Limpieza

```bash
kubectl delete -f app-desarrollo.yaml
kubectl delete -f quota-desarrollo.yaml
kubectl delete -f namespaces.yaml
kubectl delete namespace staging prod
rm namespaces.yaml app-desarrollo.yaml quota-desarrollo.yaml
```

---

## Desglose de comandos

### Comandos de namespaces

| Comando | Descripción |
|---------|-------------|
| `kubectl get namespaces` | Lista todos los namespaces |
| `kubectl create namespace dev` | Crea namespace (imperativo) |
| `kubectl delete namespace dev` | Elimina namespace y todos sus recursos |
| `kubectl get pods -n dev` | Lista pods en namespace específico |
| `kubectl get pods -A` | Lista pods de todos los namespaces |
| `kubectl config set-context --current --namespace=dev` | Cambia namespace por defecto |

### Manifest YAML de Namespace

| Campo | Descripción |
|-------|-------------|
| `metadata.name` | Nombre del namespace |
| `metadata.labels` | Labels opcionales para organización |

### DNS entre namespaces

| Formato DNS | Alcance |
|-------------|---------|
| `service-name` | Solo mismo namespace |
| `service-name.namespace` | Otro namespace |
| `service-name.namespace.svc.cluster.local` | FQDN completo |

---

## Explicación detallada

### ¿Qué es un Namespace?

Un namespace es una división lógica dentro de un cluster de Kubernetes que permite:

1. **Organización:** Agrupar recursos por ambiente, equipo, proyecto
2. **Aislamiento:** Separación lógica (no de seguridad completa)
3. **Cuotas:** Límites de recursos por namespace
4. **Permisos:** RBAC por namespace

### ¿Cuándo usar Namespaces?

**Casos de uso comunes:**
- **Ambientes:** dev, staging, prod en un mismo cluster
- **Equipos:** frontend, backend, data en un mismo cluster
- **Proyectos:** proyecto-a, proyecto-b en un mismo cluster
- **Clientes:** Multi-tenancy (con precaución)

**Cuándo NO usar Namespaces:**
- Para separar versiones de una misma app (usar labels)
- Para aislamiento de seguridad estricto (usar clusters separados)
- Para proyectos muy pequeños con pocos recursos

### Namespaces del Sistema

```
┌─────────────────────────────────────────┐
│          Kubernetes Cluster             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │   kube-system (Sistema)          │   │
│  │   - CoreDNS                      │   │
│  │   - kube-proxy                   │   │
│  │   - metrics-server               │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │   default (Tus apps)             │   │
│  │   - Recursos sin namespace       │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │   desarrollo (Custom)            │   │
│  │   - api (Deployment)             │   │
│  │   - api-service (Service)        │   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Aislamiento en Namespaces

**Lo que SÍ aísla:**
- Nombres de recursos (puedes tener "api" en dev y prod)
- ResourceQuotas (límites de CPU/memoria por namespace)
- NetworkPolicies (tráfico de red entre namespaces)
- RBAC (permisos por namespace)

**Lo que NO aísla:**
- Nodos (todos los namespaces comparten los mismos nodos)
- Red (pods pueden comunicarse entre namespaces por defecto)
- Seguridad completa (no es multi-tenancy seguro)

### DNS entre Namespaces

**Formato completo:**
```
<service-name>.<namespace>.svc.cluster.local
```

**Ejemplo:**
```
api-service.desarrollo.svc.cluster.local
│           │           │   │
│           │           │   └─ Dominio del cluster
│           │           └───── Tipo (service)
│           └───────────────── Namespace
└───────────────────────────── Nombre del service
```

### ResourceQuotas

Limitan recursos consumidos por un namespace:

```yaml
spec:
  hard:
    requests.cpu: "2"        # Total de CPU solicitada
    requests.memory: 2Gi     # Total de RAM solicitada
    limits.cpu: "4"          # Total de CPU límite
    limits.memory: 4Gi       # Total de RAM límite
    pods: "10"               # Máximo 10 pods
    services: "5"            # Máximo 5 services
    persistentvolumeclaims: "3"  # Máximo 3 PVCs
```

### Imperativo vs Declarativo

| Aspecto | Imperativo (`kubectl create`) | Declarativo (YAML) |
|---------|-------------------------------|---------------------|
| Uso | Rápido para pruebas | Producción |
| Labels | No (requiere edit posterior) | Sí |
| Versionado | No | Sí (Git) |
| Reproducible | No | Sí |
| Recomendación | Solo pruebas rápidas | **Siempre en producción** |

---

## Conceptos aprendidos

- Los namespaces organizan y aíslan lógicamente recursos en Kubernetes
- Kubernetes tiene 4 namespaces del sistema (default, kube-system, kube-public, kube-node-lease)
- Puedes crear namespaces personalizados para ambientes, equipos o proyectos
- Los recursos se despliegan en un namespace específico con `-n <namespace>`
- DNS entre namespaces requiere formato: `service.namespace.svc.cluster.local`
- Context switching permite cambiar el namespace por defecto
- Eliminar un namespace elimina todos los recursos que contiene
- ResourceQuotas limitan recursos consumidos por un namespace
- Forma imperativa: rápida con `kubectl create namespace`
- Forma declarativa: recomendada con manifests YAML
- Namespaces NO proporcionan aislamiento de seguridad completo

---

## Troubleshooting

### No se puede crear recurso sin namespace

**Problema:**
```bash
kubectl apply -f deployment.yaml
# Error: namespaces "desarrollo" not found
```

**Solución:**
Crear el namespace primero:
```bash
kubectl create namespace desarrollo
kubectl apply -f deployment.yaml
```

O especificar namespace en el manifest:
```yaml
metadata:
  namespace: desarrollo
```

---

### DNS entre namespaces no funciona

**Problema:**
```bash
kubectl run test -n qa --rm -it --image=busybox -- wget http://api-service
# Could not resolve host: api-service
```

**Solución:**
Usar DNS con namespace:
```bash
wget http://api-service.desarrollo
# O FQDN completo:
wget http://api-service.desarrollo.svc.cluster.local
```

---

### ResourceQuota impide crear pods

**Problema:**
```bash
kubectl apply -f deployment.yaml -n desarrollo
# Error: exceeded quota: compute-quota, requested: pods=3, used: pods=10, limited: pods=10
```

**Solución:**

1. **Ver uso actual:**
```bash
kubectl describe resourcequota -n desarrollo
```

2. **Eliminar pods no necesarios:**
```bash
kubectl delete deployment <nombre> -n desarrollo
```

3. **O aumentar quota:**
```bash
kubectl edit resourcequota compute-quota -n desarrollo
# Cambiar hard.pods: "10" → "20"
```

---

### Namespace en Terminating permanente

**Problema:**
```bash
kubectl delete namespace desarrollo
kubectl get namespaces
# NAME         STATUS        AGE
# desarrollo   Terminating   5m
```

**Causa:** Hay recursos finalizadores que no terminan.

**Solución:**
```bash
# Ver qué recursos quedan
kubectl api-resources --verbs=list --namespaced -o name | xargs -n 1 kubectl get --show-kind --ignore-not-found -n desarrollo

# Forzar eliminación (usar con precaución)
kubectl get namespace desarrollo -o json | jq '.spec.finalizers = []' | kubectl replace --raw /api/v1/namespaces/desarrollo/finalize -f -
```

---

## Desafío adicional

### Desafío 1: Multi-ambiente completo

Crea una estructura completa de namespaces para una aplicación:
1. Crear namespaces: `dev`, `staging`, `prod`
2. Desplegar la misma aplicación (nginx) en los 3 namespaces con diferentes réplicas:
   - dev: 1 réplica
   - staging: 2 réplicas
   - prod: 3 réplicas
3. Exponer cada uno con un Service
4. Probar acceso entre namespaces con DNS

---

### Desafío 2: ResourceQuotas diferenciadas

Configura ResourceQuotas diferentes para cada ambiente:
- **dev**: 1 CPU, 1Gi RAM, 5 pods
- **staging**: 2 CPU, 2Gi RAM, 10 pods
- **prod**: 4 CPU, 4Gi RAM, 20 pods

Verifica que no puedas crear más pods de los permitidos.

---

### Desafío 3: LimitRanges por namespace

Crea un LimitRange en el namespace `desarrollo` que establezca límites por defecto para pods que no especifican resources:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: desarrollo
spec:
  limits:
  - default:
      cpu: 200m
      memory: 256Mi
    defaultRequest:
      cpu: 100m
      memory: 128Mi
    type: Container
```

Crea un pod sin resources y verifica que obtenga los límites por defecto.

---

### Desafío 4: Organización con labels

Aplica labels a tus namespaces y úsalos para filtrar:
```bash
kubectl get namespaces -l env=production
kubectl get namespaces -l team=backend
```

---

## Recursos adicionales

- [Kubernetes Docs - Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Kubernetes Docs - ResourceQuotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
- [Kubernetes Docs - LimitRanges](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [Kubernetes Docs - DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [Managing Resources for Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Configure Default Memory Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/memory-default-namespace/)
