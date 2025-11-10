# Lab 01: Verificación del Setup de Kubernetes

## Objetivo

Verificar que minikube y kubectl están correctamente instalados y configurados, y familiarizarse con los comandos básicos de inspección del cluster.

---

## Comandos a Ejecutar

```bash
# 1. Verificar versión de kubectl
kubectl version --client

# 2. Verificar versión de minikube
minikube version

# 3. Iniciar minikube (si no está corriendo)
minikube start

# 4. Ver estado del cluster
minikube status

# 5. Ver información del cluster
kubectl cluster-info

# 6. Ver nodos del cluster
kubectl get nodes

# 7. Ver nodos con más detalles
kubectl get nodes -o wide

# 8. Describir el nodo
kubectl describe node minikube

# 9. Ver todos los namespaces
kubectl get namespaces

# 10. Ver pods del sistema
kubectl get pods -n kube-system

# 11. Ver todos los recursos del cluster
kubectl get all --all-namespaces
```

**Salidas esperadas:**

```bash
# kubectl version --client
Client Version: v1.31.x

# minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured

# kubectl get nodes
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   5m    v1.31.x

# kubectl get namespaces
NAME              STATUS   AGE
default           Active   5m
kube-node-lease   Active   5m
kube-public       Active   5m
kube-system       Active   5m
```

---

## Desglose de Comandos

| Comando | Descripción |
|---------|-------------|
| `kubectl version --client` | Muestra la versión del cliente kubectl instalado |
| `minikube version` | Muestra la versión de minikube instalado |
| `minikube start` | Inicia el cluster local de Kubernetes |
| `minikube status` | Muestra el estado de los componentes del cluster |
| `kubectl cluster-info` | Muestra información del cluster (API server, DNS) |
| `kubectl get nodes` | Lista los nodos del cluster |
| `kubectl get nodes -o wide` | Lista nodos con información adicional (IP, OS, versión) |
| `kubectl describe node <name>` | Muestra detalles completos de un nodo específico |
| `kubectl get namespaces` | Lista todos los namespaces del cluster |
| `kubectl get pods -n <namespace>` | Lista pods en un namespace específico |
| `kubectl get all --all-namespaces` | Lista todos los recursos en todos los namespaces |

---

## Explicación Detallada

### Paso 1: Verificar Herramientas Instaladas

Primero verificamos que tanto `kubectl` como `minikube` estén instalados correctamente. Estas son las herramientas fundamentales para trabajar con Kubernetes.

### Paso 2: Iniciar el Cluster

`minikube start` crea un cluster local de Kubernetes de un solo nodo. Este nodo actúa tanto como control plane (master) y worker node.

**Componentes que se inician:**
- **API Server**: Punto de entrada para todas las operaciones
- **etcd**: Base de datos clave-valor para el estado del cluster
- **Scheduler**: Asigna pods a nodos
- **Controller Manager**: Ejecuta controladores del cluster
- **kubelet**: Agente que corre en cada nodo

### Paso 3: Verificar Estado del Cluster

`kubectl cluster-info` muestra las URLs de los componentes principales. Si todo está corriendo correctamente, verás el API server y CoreDNS activos.

### Paso 4: Inspeccionar Nodos

`kubectl get nodes` muestra los nodos disponibles. En minikube verás un solo nodo llamado "minikube" con el rol "control-plane".

**Estados posibles:**
- **Ready**: Nodo saludable y listo para recibir pods
- **NotReady**: Nodo con problemas
- **Unknown**: Sin comunicación con el nodo

### Paso 5: Explorar Namespaces

Los namespaces son espacios virtuales para organizar recursos. Kubernetes crea 4 namespaces por defecto:

- **default**: Namespace por defecto para recursos sin namespace específico
- **kube-system**: Componentes del sistema de Kubernetes
- **kube-public**: Recursos públicamente accesibles
- **kube-node-lease**: Para heartbeats de nodos

### Paso 6: Pods del Sistema

En el namespace `kube-system` corren los pods que hacen funcionar Kubernetes:
- **coredns**: DNS del cluster
- **etcd**: Base de datos del cluster
- **kube-apiserver**: API server
- **kube-controller-manager**: Controladores
- **kube-proxy**: Reglas de red
- **kube-scheduler**: Planificador

---

## Conceptos Aprendidos

- **Cluster de Kubernetes**: Conjunto de nodos que ejecutan aplicaciones containerizadas
- **Control Plane**: Componentes que gestionan el cluster (API server, scheduler, controller manager, etcd)
- **Worker Node**: Nodo que ejecuta los pods (en minikube, el único nodo es control-plane y worker)
- **kubectl**: Cliente de línea de comandos para interactuar con el cluster
- **minikube**: Herramienta para crear clusters locales de Kubernetes
- **Namespace**: Mecanismo para organizar y aislar recursos en el cluster
- **API Server**: Punto de entrada para todas las operaciones del cluster
- **kubelet**: Agente que corre en cada nodo y gestiona los pods

---

## Troubleshooting

### Error: "The connection to the server was refused"

**Causa:** minikube no está corriendo

**Solución:**
```bash
minikube start
kubectl cluster-info
```

### Error: "command not found: kubectl"

**Causa:** kubectl no está instalado o no está en el PATH

**Solución:**
```bash
# Verificar instalación
which kubectl

# Si no está, reinstalar según INSTALL_KUBERNETES.md
```

### minikube status muestra "Stopped"

**Solución:**
```bash
minikube start
minikube status
```

### Nodo aparece como "NotReady"

**Solución:**
```bash
# Ver detalles del problema
kubectl describe node minikube

# Reiniciar minikube
minikube stop
minikube start
```

### Error: "Insufficient resources"

**Solución:**
```bash
# Detener minikube
minikube stop

# Eliminar cluster
minikube delete

# Recrear con menos recursos
minikube start --cpus=2 --memory=2048
```

---

## Desafío Adicional

1. **Explorar el nodo:**
   ```bash
   # SSH al nodo minikube
   minikube ssh

   # Dentro del nodo:
   docker ps  # Ver containers corriendo
   exit
   ```

2. **Ver logs de componentes:**
   ```bash
   # Logs del API server
   kubectl logs -n kube-system kube-apiserver-minikube

   # Logs de CoreDNS
   kubectl logs -n kube-system -l k8s-app=kube-dns
   ```

3. **Acceder al Dashboard:**
   ```bash
   minikube dashboard
   # Se abre automáticamente en el navegador
   ```

4. **Ver métricas del nodo:**
   ```bash
   kubectl top node minikube
   # Si da error, habilitar metrics-server:
   minikube addons enable metrics-server
   ```

---

## Recursos Adicionales

- [Arquitectura de Kubernetes](https://kubernetes.io/docs/concepts/architecture/)
- [Componentes de Kubernetes](https://kubernetes.io/docs/concepts/overview/components/)
- [Documentación de minikube](https://minikube.sigs.k8s.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Namespaces en Kubernetes](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
