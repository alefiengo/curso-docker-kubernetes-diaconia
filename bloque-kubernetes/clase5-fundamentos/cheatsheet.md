# Cheatsheet - Clase 5: Introducción a Kubernetes

Referencia rápida de comandos kubectl y conceptos de Kubernetes.

---

## Comandos Básicos de kubectl

### Información del Cluster

```bash
# Ver versión de kubectl
kubectl version --client

# Ver información del cluster
kubectl cluster-info

# Ver nodos
kubectl get nodes
kubectl get nodes -o wide
kubectl describe node <node-name>
```

### Gestión de Pods

```bash
# Crear pod imperativamente
kubectl run <pod-name> --image=<image>

# Listar pods
kubectl get pods
kubectl get pods -o wide
kubectl get pods --all-namespaces
kubectl get pods -n <namespace>

# Ver detalles de un pod
kubectl describe pod <pod-name>

# Ver logs
kubectl logs <pod-name>
kubectl logs <pod-name> -f  # Follow mode
kubectl logs <pod-name> -c <container-name>  # Multi-container

# Ejecutar comandos en pod
kubectl exec <pod-name> -- <command>
kubectl exec -it <pod-name> -- sh

# Port forwarding
kubectl port-forward <pod-name> <local-port>:<pod-port>

# Eliminar pod
kubectl delete pod <pod-name>
```

### Gestión de Deployments

```bash
# Crear deployment
kubectl create deployment <name> --image=<image>
kubectl create deployment <name> --image=<image> --replicas=<n>

# Listar deployments
kubectl get deployments
kubectl get deploy  # Abreviado

# Ver detalles
kubectl describe deployment <name>

# Escalar deployment
kubectl scale deployment <name> --replicas=<n>

# Actualizar imagen
kubectl set image deployment/<name> <container>=<new-image>

# Ver estado del rollout
kubectl rollout status deployment <name>

# Ver historial
kubectl rollout history deployment <name>

# Hacer rollback
kubectl rollout undo deployment <name>
kubectl rollout undo deployment <name> --to-revision=<n>

# Pausar/Reanudar rollout
kubectl rollout pause deployment <name>
kubectl rollout resume deployment <name>

# Reiniciar deployment (recrea pods)
kubectl rollout restart deployment <name>

# Eliminar deployment
kubectl delete deployment <name>
```

### Gestión de Services

```bash
# Exponer deployment
kubectl expose deployment <name> --port=<port>
kubectl expose deployment <name> --port=<port> --type=NodePort
kubectl expose deployment <name> --port=<port> --type=LoadBalancer

# Listar services
kubectl get services
kubectl get svc  # Abreviado

# Ver detalles
kubectl describe service <name>

# Ver endpoints
kubectl get endpoints <name>

# Eliminar service
kubectl delete service <name>
```

### ReplicaSets

```bash
# Listar replica sets
kubectl get replicaset
kubectl get rs  # Abreviado

# Ver detalles
kubectl describe replicaset <name>
```

---

## Gestión de Recursos con YAML

### Aplicar Manifests

```bash
# Aplicar archivo
kubectl apply -f <file.yaml>

# Aplicar directorio
kubectl apply -f <directory>/

# Aplicar desde URL
kubectl apply -f https://example.com/manifest.yaml

# Ver diferencias antes de aplicar
kubectl diff -f <file.yaml>
```

### Obtener YAML de Recursos

```bash
# Exportar pod a YAML
kubectl get pod <name> -o yaml

# Exportar deployment a YAML
kubectl get deployment <name> -o yaml

# Exportar sin metadata gestionado
kubectl get pod <name> -o yaml --export  # Deprecated
kubectl get pod <name> -o yaml | kubectl neat  # Requiere plugin
```

### Eliminar Recursos

```bash
# Eliminar por archivo
kubectl delete -f <file.yaml>

# Eliminar por tipo y nombre
kubectl delete pod <name>
kubectl delete deployment <name>

# Eliminar todos los pods
kubectl delete pods --all

# Forzar eliminación
kubectl delete pod <name> --force --grace-period=0
```

---

## Namespaces

```bash
# Listar namespaces
kubectl get namespaces
kubectl get ns  # Abreviado

# Crear namespace
kubectl create namespace <name>

# Trabajar en namespace específico
kubectl get pods -n <namespace>
kubectl apply -f file.yaml -n <namespace>

# Cambiar namespace por defecto
kubectl config set-context --current --namespace=<namespace>

# Ver namespace actual
kubectl config view --minify | grep namespace

# Eliminar namespace
kubectl delete namespace <name>
```

---

## Labels y Selectors

```bash
# Ver labels
kubectl get pods --show-labels

# Filtrar por label
kubectl get pods -l app=nginx
kubectl get pods -l app=nginx,env=production
kubectl get pods -l 'app in (nginx,apache)'

# Agregar label
kubectl label pod <name> env=production

# Modificar label
kubectl label pod <name> env=staging --overwrite

# Eliminar label
kubectl label pod <name> env-
```

---

## Información y Debugging

```bash
# Ver todos los recursos
kubectl get all
kubectl get all -n <namespace>
kubectl get all --all-namespaces

# Describir recurso
kubectl describe <resource-type> <name>

# Ver eventos del cluster
kubectl get events
kubectl get events --sort-by=.metadata.creationTimestamp

# Ver uso de recursos (requiere metrics-server)
kubectl top nodes
kubectl top pods

# Modo verbose
kubectl get pods -v=8
```

---

## Comandos de minikube

```bash
# Iniciar cluster
minikube start

# Detener cluster
minikube stop

# Ver estado
minikube status

# Ver IP del cluster
minikube ip

# Acceder a service NodePort
minikube service <service-name>
minikube service <service-name> --url

# SSH al nodo
minikube ssh

# Dashboard
minikube dashboard

# Túnel para LoadBalancer
minikube tunnel

# Ver logs
minikube logs

# Eliminar cluster
minikube delete

# Addons
minikube addons list
minikube addons enable <addon>
minikube addons disable <addon>
```

---

## Formatos de Salida

```bash
# Formato JSON
kubectl get pods -o json

# Formato YAML
kubectl get pods -o yaml

# Wide (más columnas)
kubectl get pods -o wide

# Custom columns
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase

# JSONPath
kubectl get pods -o jsonpath='{.items[*].metadata.name}'

# Ordenar
kubectl get pods --sort-by=.metadata.creationTimestamp
```

---

## Abreviaciones Comunes

| Recurso | Abreviación |
|---------|-------------|
| pods | po |
| services | svc |
| deployments | deploy |
| replicasets | rs |
| namespaces | ns |
| nodes | no |
| persistentvolumes | pv |
| persistentvolumeclaims | pvc |
| configmaps | cm |
| secrets | secret |

Ejemplo:
```bash
kubectl get po  # En lugar de kubectl get pods
kubectl get svc # En lugar de kubectl get services
```

---

## Conceptos Clave

### Pod
Unidad mínima de despliegue. Uno o más containers que comparten red y storage.

### Deployment
Gestiona el despliegue declarativo de aplicaciones con réplicas y actualizaciones.

### ReplicaSet
Mantiene un número estable de réplicas de pod corriendo.

### Service
Abstracción para exponer pods como servicio de red.

**Tipos de Service:**
- **ClusterIP** (default): IP interna del cluster
- **NodePort**: Expone puerto en cada nodo
- **LoadBalancer**: IP externa (cloud)

### Label
Par clave-valor para organizar y seleccionar recursos.

### Selector
Filtro basado en labels para identificar recursos.

### Namespace
Espacio virtual para organizar recursos.

---

## Patrones de Uso Común

### Crear y Exponer Aplicación

```bash
# 1. Crear deployment
kubectl create deployment nginx --image=nginx:alpine --replicas=3

# 2. Exponer con service
kubectl expose deployment nginx --port=80 --type=NodePort

# 3. Acceder (minikube)
minikube service nginx
```

### Actualizar Aplicación (Rolling Update)

```bash
# 1. Actualizar imagen
kubectl set image deployment/nginx nginx=nginx:1.26-alpine

# 2. Ver progreso
kubectl rollout status deployment nginx

# 3. Si falla, rollback
kubectl rollout undo deployment nginx
```

### Debugging de Pod que Falla

```bash
# 1. Ver estado
kubectl get pods

# 2. Ver eventos
kubectl describe pod <pod-name>

# 3. Ver logs
kubectl logs <pod-name>

# 4. Si crashea inmediatamente
kubectl logs <pod-name> --previous
```

### Aplicar Múltiples Manifests

```bash
# Aplicar todos los YAML de un directorio
kubectl apply -f manifests/

# Aplicar en orden específico
kubectl apply -f namespace.yaml
kubectl apply -f deployments/
kubectl apply -f services/
```

---

## Troubleshooting Rápido

### Pod en Pending
```bash
kubectl describe pod <name>
# Buscar: "Insufficient resources" o "FailedScheduling"
```

### Pod en ImagePullBackOff
```bash
kubectl describe pod <name>
# Verificar nombre de imagen y acceso a registry
```

### Pod en CrashLoopBackOff
```bash
kubectl logs <name>
kubectl logs <name> --previous
# Ver logs para identificar error de aplicación
```

### Service no accesible
```bash
kubectl get endpoints <service-name>
# Si está vacío, verificar selector y labels
```

---

## Recursos Adicionales

- [kubectl Cheat Sheet Oficial](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [kubectl Reference](https://kubernetes.io/docs/reference/kubectl/)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
