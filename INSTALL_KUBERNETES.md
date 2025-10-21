# Instalación de Kubernetes (minikube + kubectl)

Este documento guía la instalación de las herramientas necesarias para trabajar con Kubernetes en el curso.

**IMPORTANTE:** Completa esta instalación **ANTES de la Clase 6**. Verifica que todo funcione correctamente siguiendo el checklist al final.

---

## Herramientas a Instalar

1. **kubectl** - Cliente de línea de comandos para Kubernetes
2. **minikube** - Cluster local de Kubernetes para desarrollo

---

## Instalación en Windows (WSL2 + Ubuntu)

### Opción A: Instalación en WSL2 (Recomendado)

#### 1. Instalar kubectl

```bash
# Descargar kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Dar permisos de ejecución
chmod +x kubectl

# Mover a PATH
sudo mv kubectl /usr/local/bin/

# Verificar instalación
kubectl version --client
```

**Salida esperada:**
```
Client Version: v1.31.x
```

#### 2. Instalar minikube

```bash
# Descargar minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Instalar
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Limpiar archivo descargado
rm minikube-linux-amd64

# Verificar instalación
minikube version
```

**Salida esperada:**
```
minikube version: v1.34.x
```

#### 3. Iniciar minikube

```bash
# Iniciar cluster (primera vez tarda 3-5 minutos)
minikube start --driver=docker

# Verificar estado
minikube status
```

**Salida esperada:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

### Opción B: Instalación en Windows Nativo

#### 1. Instalar kubectl con Chocolatey

```powershell
# Abrir PowerShell como Administrador
choco install kubernetes-cli

# Verificar
kubectl version --client
```

#### 2. Instalar minikube con Chocolatey

```powershell
# Instalar
choco install minikube

# Verificar
minikube version

# Iniciar cluster
minikube start --driver=hyperv
# O si prefieres Docker Desktop:
minikube start --driver=docker
```

---

## Instalación en macOS

### 1. Instalar kubectl

```bash
# Con Homebrew
brew install kubectl

# Verificar
kubectl version --client
```

### 2. Instalar minikube

```bash
# Con Homebrew
brew install minikube

# Verificar
minikube version

# Iniciar cluster
minikube start --driver=docker
# O con hyperkit:
minikube start --driver=hyperkit
```

---

## Instalación en Linux (Ubuntu/Debian)

### 1. Instalar kubectl

```bash
# Actualizar repositorios
sudo apt-get update

# Instalar dependencias
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Agregar clave GPG de Kubernetes
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Agregar repositorio
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Instalar kubectl
sudo apt-get update
sudo apt-get install -y kubectl

# Verificar
kubectl version --client
```

### 2. Instalar minikube

```bash
# Descargar e instalar
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

# Verificar
minikube version

# Iniciar cluster
minikube start --driver=docker
```

---

## Verificación de Instalación

### Checklist Completo

Ejecuta estos comandos para verificar que todo está funcionando:

```bash
# 1. Verificar kubectl
kubectl version --client

# 2. Verificar minikube
minikube version

# 3. Verificar cluster iniciado
minikube status

# 4. Ver información del cluster
kubectl cluster-info

# 5. Ver nodos
kubectl get nodes

# 6. Crear pod de prueba
kubectl run nginx --image=nginx

# 7. Verificar pod
kubectl get pods

# 8. Eliminar pod de prueba
kubectl delete pod nginx

# 9. Verificar dashboard (opcional)
minikube dashboard
```

### Salida Esperada de Verificación

**kubectl cluster-info:**
```
Kubernetes control plane is running at https://127.0.0.1:xxxxx
CoreDNS is running at https://127.0.0.1:xxxxx/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

**kubectl get nodes:**
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   5m    v1.31.x
```

**kubectl get pods (después de crear nginx):**
```
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          10s
```

---

## Configuración Adicional (Opcional pero Recomendado)

### 1. Habilitar autocompletado de kubectl

#### Bash (WSL2/Linux)
```bash
echo 'source <(kubectl completion bash)' >> ~/.bashrc
echo 'alias k=kubectl' >> ~/.bashrc
echo 'complete -o default -F __start_kubectl k' >> ~/.bashrc
source ~/.bashrc
```

#### Zsh (macOS)
```bash
echo 'source <(kubectl completion zsh)' >> ~/.zshrc
echo 'alias k=kubectl' >> ~/.zshrc
echo 'complete -o default -F __start_kubectl k' >> ~/.zshrc
source ~/.zshrc
```

### 2. Configurar recursos de minikube (opcional)

Si tienes problemas de recursos:

```bash
# Detener minikube
minikube stop

# Eliminar cluster actual
minikube delete

# Recrear con más recursos
minikube start --cpus=2 --memory=4096 --driver=docker
```

---

## Comandos Útiles de minikube

```bash
# Iniciar cluster
minikube start

# Detener cluster (mantiene datos)
minikube stop

# Ver estado
minikube status

# Ver IP del cluster
minikube ip

# Acceder al dashboard
minikube dashboard

# SSH al nodo
minikube ssh

# Ver logs
minikube logs

# Eliminar cluster completamente
minikube delete
```

---

## Troubleshooting

### Error: "Exiting due to GUEST_MISSING_CONNTRACK"

**Solución (WSL2):**
```bash
sudo apt-get update
sudo apt-get install -y conntrack
minikube start --driver=docker
```

### Error: "Docker driver not found"

**Solución:**
- Verifica que Docker esté instalado: `docker --version`
- Verifica que Docker esté corriendo: `docker ps`
- Reinicia Docker Desktop (Windows/Mac)
- En WSL2: `sudo service docker start`

### Error: "Insufficient memory"

**Solución:**
```bash
minikube delete
minikube start --memory=2048 --cpus=2
```

### Error: "Unable to connect to the server"

**Solución:**
```bash
# Verificar que minikube esté corriendo
minikube status

# Si está parado, iniciarlo
minikube start

# Verificar conexión
kubectl cluster-info
```

### minikube start muy lento

**Causa:** Primera descarga de imágenes (puede tardar 5-10 min según conexión)

**Solución:**
- Esperar pacientemente
- Verificar espacio en disco: `df -h`
- Verificar conexión a internet

---

## Alternativas a minikube

Si minikube no funciona en tu sistema, puedes usar:

### Docker Desktop Kubernetes (Windows/Mac)

1. Abrir Docker Desktop
2. Settings > Kubernetes
3. Activar "Enable Kubernetes"
4. Apply & Restart

**Verificar:**
```bash
kubectl config get-contexts
kubectl config use-context docker-desktop
kubectl get nodes
```

### kind (Kubernetes in Docker)

```bash
# Instalar kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Crear cluster
kind create cluster --name curso-k8s

# Verificar
kubectl cluster-info --context kind-curso-k8s
```

---

## Recursos Adicionales

- [Documentación oficial de kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [Documentación oficial de minikube](https://minikube.sigs.k8s.io/docs/)
- [Kubernetes Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---

## Checklist Final - ANTES DE CLASE 6

Marca cada item:

- [ ] kubectl instalado y funciona (`kubectl version --client`)
- [ ] minikube instalado y funciona (`minikube version`)
- [ ] Cluster iniciado exitosamente (`minikube start`)
- [ ] kubectl puede conectarse al cluster (`kubectl cluster-info`)
- [ ] Puedo ver el nodo (`kubectl get nodes`)
- [ ] Puedo crear y eliminar un pod de prueba
- [ ] (Opcional) Autocompletado configurado
- [ ] (Opcional) Dashboard funciona (`minikube dashboard`)

---

**Si todos los items están marcados, estás listo para la Clase 6.**

Si tienes problemas, contacta al instructor **ANTES** de la clase con capturas de pantalla de los errores.
