# Lab 05: Service NodePort - Acceso Externo Simple

## Objetivo

Comprender el Service tipo NodePort, que permite acceso externo al cluster exponiendo un puerto en cada nodo. Practicar tanto la forma imperativa como la declarativa, y entender cuándo usar este tipo de Service.

---

## Comandos a ejecutar

### Paso 1: Crear Deployment de nginx

```bash
kubectl create deployment web-external --image=nginx:alpine --replicas=2
kubectl get pods -l app=web-external -o wide
```

**Salida esperada:**
```
NAME                            READY   STATUS    RESTARTS   AGE   IP
web-external-7d8f9c5b7c-abc12   1/1     Running   0          10s   10.244.0.5
web-external-7d8f9c5b7c-xyz34   1/1     Running   0          10s   10.244.0.6
```

---

### Paso 2: Exponer con NodePort (forma imperativa)

```bash
kubectl expose deployment web-external --port=80 --target-port=80 --type=NodePort --name=web-nodeport
kubectl get service web-nodeport
```

**Salida esperada:**
```
NAME           TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
web-nodeport   NodePort   10.96.234.56    <none>        80:31234/TCP   5s
```

**Nota:** El puerto 31234 es asignado automáticamente en el rango 30000-32767.

---

### Paso 3: Obtener URL de acceso

**En minikube:**
```bash
minikube service web-nodeport --url
```

**Salida esperada:**
```
http://192.168.49.2:31234
```

**Probar desde navegador o curl:**
```bash
curl $(minikube service web-nodeport --url)
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

### Paso 4: Verificar acceso externo

**Obtener IP del nodo:**
```bash
kubectl get nodes -o wide
```

**O con minikube:**
```bash
minikube ip
```

**Salida esperada:**
```
192.168.49.2
```

**Acceder directamente al NodePort:**
```bash
curl http://$(minikube ip):31234
```

---

### Paso 5: Ver detalles del Service

```bash
kubectl describe service web-nodeport
```

**Salida esperada:**
```
Name:                     web-nodeport
Namespace:                default
Labels:                   app=web-external
Annotations:              <none>
Selector:                 app=web-external
Type:                     NodePort
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.96.234.56
IPs:                      10.96.234.56
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  31234/TCP
Endpoints:                10.244.0.5:80,10.244.0.6:80
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
```

---

### Paso 6: Eliminar Service imperativo

```bash
kubectl delete service web-nodeport
```

---

### Paso 7: Crear Service con manifest YAML (forma declarativa)

Crear archivo `web-nodeport.yaml`:

```bash
cat > web-nodeport.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
  labels:
    app: web-external
spec:
  type: NodePort
  selector:
    app: web-external
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30200
    protocol: TCP
    name: http
EOF
```

**Nota:** Especificamos `nodePort: 30200` para tener un puerto predecible.

**Aplicar el manifest:**
```bash
kubectl apply -f web-nodeport.yaml
kubectl get service web-nodeport
```

**Salida esperada:**
```
NAME           TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
web-nodeport   NodePort   10.96.234.56    <none>        80:30200/TCP   5s
```

**Probar acceso:**
```bash
curl http://$(minikube ip):30200
```

---

### Paso 8: Limpieza

```bash
kubectl delete -f web-nodeport.yaml
kubectl delete deployment web-external
```

---

## Desglose de comandos

### Comando `kubectl expose` con NodePort

| Flag | Descripción |
|------|-------------|
| `deployment web-external` | Recurso a exponer |
| `--port=80` | Puerto expuesto por el Service (ClusterIP) |
| `--target-port=80` | Puerto del container |
| `--type=NodePort` | Tipo de Service |
| `--name=web-nodeport` | Nombre del Service |

### Manifest YAML

| Campo | Descripción |
|-------|-------------|
| `spec.type: NodePort` | Tipo de Service |
| `spec.selector.app: web-external` | Selecciona pods con este label |
| `spec.ports[].port` | Puerto del ClusterIP (acceso interno) |
| `spec.ports[].targetPort` | Puerto del container |
| `spec.ports[].nodePort` | Puerto en el nodo (30000-32767) |
| `spec.ports[].protocol` | TCP o UDP (default: TCP) |

**Nota:** Si omites `nodePort`, Kubernetes asigna uno automáticamente.

---

## Explicación detallada

### ¿Qué es NodePort?

NodePort es un tipo de Service que expone la aplicación en un puerto estático en cada nodo del cluster. Esto permite acceso externo usando `<NodeIP>:<NodePort>`.

### Características de NodePort

1. **Rango de puertos:** 30000-32767 (configurable en kube-apiserver)
2. **Acceso externo:** Cualquier IP de nodo + NodePort
3. **ClusterIP incluido:** NodePort también crea un ClusterIP interno
4. **Multi-nodo:** En clusters con múltiples nodos, el puerto se abre en TODOS los nodos

### ¿Cuándo usar NodePort?

- **Desarrollo y testing:** Acceso rápido sin configuración adicional
- **Clusters on-premise:** Cuando no hay LoadBalancer disponible
- **Demos y PoCs:** Exposición simple sin infraestructura compleja
- **CI/CD temporal:** Testing de integración con acceso externo

### ¿Cuándo NO usar NodePort?

- **Producción en cloud:** Usar LoadBalancer o Ingress
- **Múltiples servicios:** NodePort asigna un puerto diferente a cada servicio
- **Seguridad estricta:** Expone puertos directamente en los nodos

### Diagrama de NodePort

```
     Cliente Externo
          │
          │ http://192.168.49.2:30200
          │
          ▼
┌─────────────────────────────────┐
│         Nodo (Worker)           │
│                                 │
│    Puerto 30200 abierto         │
│                                 │
│         │                       │
│         ▼                       │
│   ┌─────────────┐               │
│   │   Service   │               │
│   │  (NodePort) │               │
│   │ ClusterIP:  │               │
│   │ 10.96.234.56│               │
│   └─────────────┘               │
│         │                       │
│   ┌─────┴─────┐                 │
│   ▼           ▼                 │
│ ┌────┐     ┌────┐               │
│ │Pod1│     │Pod2│               │
│ │web │     │web │               │
│ └────┘     └────┘               │
│                                 │
└─────────────────────────────────┘
```

### NodePort en cluster multi-nodo

```
Cliente → http://Node1-IP:30200 ────┐
                                     │
Cliente → http://Node2-IP:30200 ────┼──→ ┌─────────────┐
                                     │    │   Service   │
Cliente → http://Node3-IP:30200 ────┘    │  (NodePort) │
                                          └─────────────┘
                                                 │
                                      ┌──────────┼──────────┐
                                      ▼          ▼          ▼
                                    Pod1       Pod2       Pod3
                                  (Node1)    (Node2)    (Node3)
```

**Importante:** Puedes acceder al servicio desde cualquier nodo, incluso si el pod no está en ese nodo.

### Imperativo vs Declarativo

| Aspecto | Imperativo (`kubectl expose`) | Declarativo (YAML) |
|---------|-------------------------------|---------------------|
| NodePort | Asignado automáticamente | Puedes especificarlo |
| Control | Menos control | Control total |
| Reproducible | No | Sí |
| Versionado | No | Sí (Git) |
| Recomendación | Solo pruebas rápidas | **Siempre en producción** |

---

## Conceptos aprendidos

- NodePort expone el servicio en un puerto estático en cada nodo
- Rango de puertos: 30000-32767 (por defecto)
- Permite acceso externo con `<NodeIP>:<NodePort>`
- NodePort también crea un ClusterIP para acceso interno
- En clusters multi-nodo, el puerto se abre en TODOS los nodos
- Kubernetes enruta el tráfico al pod correcto, incluso si está en otro nodo
- Forma imperativa: Kubernetes asigna NodePort automáticamente
- Forma declarativa: Puedes especificar el NodePort exacto
- Usar principalmente para desarrollo, testing y on-premise
- Para producción, preferir LoadBalancer o Ingress

---

## Troubleshooting

### NodePort no accesible desde fuera

**Problema:**
```bash
curl http://$(minikube ip):30200
# Connection refused
```

**Soluciones:**

1. **Obtener URL correcta con minikube:**
```bash
minikube service web-nodeport --url
```

2. **Verificar puerto asignado:**
```bash
kubectl get service web-nodeport
# Buscar PORT(S): 80:XXXXX/TCP
```

3. **Verificar que los pods estén Running:**
```bash
kubectl get pods -l app=web-external
```

4. **En WSL2 o Docker Desktop, puede haber problemas de red. Usar port-forward alternativo:**
```bash
kubectl port-forward svc/web-nodeport 8080:80
# Acceder a http://localhost:8080
```

---

### Puerto fuera de rango

**Problema:**
```bash
kubectl apply -f web-nodeport.yaml
# Error: provided port is not in the valid range. The range of valid ports is 30000-32767
```

**Solución:**
Cambiar el `nodePort` en el manifest para que esté entre 30000-32767.

---

### Firewall bloqueando NodePort

**Problema:**
```bash
curl http://<node-ip>:30200
# Timeout
```

**Soluciones:**

1. **Verificar firewall del nodo:**
```bash
# En el nodo (si tienes acceso)
sudo iptables -L -n | grep 30200
```

2. **En minikube, verificar que el servicio está corriendo:**
```bash
minikube service list
```

3. **Verificar que minikube tunnel NO esté corriendo (puede interferir):**
```bash
# Si está corriendo, detenerlo: Ctrl+C
```

---

### NodePort asignado aleatoriamente

**Problema:**
Cada vez que eliminas y recreas el Service, obtienes un NodePort diferente.

**Solución:**
Especificar `nodePort` en el manifest YAML:
```yaml
spec:
  ports:
  - nodePort: 30200  # Puerto fijo
    port: 80
    targetPort: 80
```

---

## Desafío adicional

### Desafío 1: Especificar NodePort específico

Crea un Service NodePort que use exactamente el puerto 30100. Verifica que el puerto asignado sea el correcto.

---

### Desafío 2: Acceso desde múltiples nodos (solo si tienes cluster multi-nodo)

Si tienes acceso a un cluster con múltiples nodos:
1. Crear un Deployment con 3 réplicas
2. Exponerlo con NodePort
3. Acceder al servicio usando la IP de diferentes nodos
4. Verificar que todos los nodos responden, aunque los pods estén distribuidos

---

### Desafío 3: NodePort con múltiples puertos

Modifica el manifest para que el Service exponga tanto HTTP (80) como HTTPS (443) con NodePorts diferentes.

**Pistas:**
```yaml
spec:
  ports:
  - name: http
    port: 80
    targetPort: 80
    nodePort: 30200
  - name: https
    port: 443
    targetPort: 443
    nodePort: 30201
```

---

### Desafío 4: Comparar ClusterIP vs NodePort

1. Crea el mismo Deployment
2. Exponlo con ClusterIP (lab anterior)
3. Exponlo con NodePort (este lab)
4. Compara las diferencias en accesibilidad

**Preguntas:**
- ¿Puedes acceder al ClusterIP desde fuera del cluster?
- ¿Puedes acceder al NodePort desde dentro del cluster?
- ¿Qué tipo usarías para una base de datos interna?
- ¿Qué tipo usarías para una aplicación de testing?

---

## Recursos adicionales

- [Kubernetes Docs - NodePort Service](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport)
- [Kubernetes Docs - Service Types](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types)
- [NodePort vs LoadBalancer vs Ingress](https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0)
- [minikube service command](https://minikube.sigs.k8s.io/docs/commands/service/)
