# Lab 06: Service LoadBalancer con MetalLB

## Objetivo

Comprender el Service tipo LoadBalancer, el tipo más avanzado para acceso externo en producción. Instalar y configurar MetalLB en minikube para simular un balanceador de carga real sin depender de `minikube tunnel`. Practicar tanto la forma imperativa como la declarativa.

**Nota:** Este lab requiere instalar MetalLB, una implementación de LoadBalancer para clusters bare-metal y on-premise.

---

## Comandos a ejecutar

### Paso 1: Instalar MetalLB en minikube

**Habilitar el addon de MetalLB:**
```bash
minikube addons enable metallb
```

**Salida esperada:**
```
metallb was successfully enabled
```

**Verificar que MetalLB está corriendo:**
```bash
kubectl get pods -n metallb-system
```

**Salida esperada:**
```
NAME                          READY   STATUS    RESTARTS   AGE
controller-7b6d87776b-xyz12   1/1     Running   0          30s
speaker-abc34                 1/1     Running   0          30s
```

---

### Paso 2: Configurar rango de IPs para MetalLB

MetalLB necesita un rango de IPs que pueda asignar a los Services LoadBalancer.

**Obtener IP de minikube:**
```bash
minikube ip
```

**Salida esperada (ejemplo):**
```
192.168.49.2
```

**Configurar MetalLB con un rango adyacente:**

```bash
minikube addons configure metallb
```

**Cuando pregunte por el rango, usar:**
- **Start IP:** `192.168.49.100`
- **End IP:** `192.168.49.110`

**Salida esperada:**
```
-- Enter Load Balancer Start IP: 192.168.49.100
-- Enter Load Balancer End IP: 192.168.49.110
    Using image metallb/speaker:v0.13.12
    Using image metallb/controller:v0.13.12
metallb was successfully configured
```

**Verificar configuración:**
```bash
kubectl get configmap config -n metallb-system -o yaml
```

**Salida esperada:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: config
  namespace: metallb-system
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 192.168.49.100-192.168.49.110
```

---

### Paso 3: Crear Deployment de nginx

```bash
kubectl create deployment web-lb --image=nginx:alpine --replicas=3
kubectl get pods -l app=web-lb -o wide
```

**Salida esperada:**
```
NAME                      READY   STATUS    RESTARTS   AGE   IP
web-lb-7d8f9c5b7c-abc12   1/1     Running   0          10s   10.244.0.5
web-lb-7d8f9c5b7c-def34   1/1     Running   0          10s   10.244.0.6
web-lb-7d8f9c5b7c-ghi56   1/1     Running   0          10s   10.244.0.7
```

---

### Paso 4: Exponer con LoadBalancer (forma imperativa)

```bash
kubectl expose deployment web-lb --port=80 --target-port=80 --type=LoadBalancer --name=web-loadbalancer
kubectl get service web-loadbalancer
```

**Salida esperada (MetalLB asigna IP externa automáticamente):**
```
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)        AGE
web-loadbalancer   LoadBalancer   10.96.111.22    192.168.49.100   80:30123/TCP   10s
```

**Nota:** `EXTERNAL-IP` ya NO está en `<pending>`. MetalLB asignó una IP del rango configurado.

---

### Paso 5: Probar acceso externo

**Acceder con la IP externa:**
```bash
curl http://192.168.49.100
```

**Salida esperada (HTML de nginx):**
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

**Probar desde navegador:**
```
http://192.168.49.100
```

Deberías ver la página de bienvenida de nginx.

---

### Paso 6: Ver detalles del Service

```bash
kubectl describe service web-loadbalancer
```

**Salida esperada:**
```
Name:                     web-loadbalancer
Namespace:                default
Labels:                   app=web-lb
Annotations:              <none>
Selector:                 app=web-lb
Type:                     LoadBalancer
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.96.111.22
IPs:                      10.96.111.22
LoadBalancer Ingress:     192.168.49.100
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  30123/TCP
Endpoints:                10.244.0.5:80,10.244.0.6:80,10.244.0.7:80
Session Affinity:         None
External Traffic Policy:  Cluster
Events:
  Type    Reason        Age   From                Message
  ----    ------        ----  ----                -------
  Normal  IPAllocated   15s   metallb-controller  Assigned IP ["192.168.49.100"]
```

**Nota:** El evento `IPAllocated` confirma que MetalLB asignó la IP.

---

### Paso 7: Eliminar Service imperativo

```bash
kubectl delete service web-loadbalancer
```

---

### Paso 8: Crear Service con manifest YAML (forma declarativa)

Crear archivo `web-loadbalancer.yaml`:

```bash
cat > web-loadbalancer.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: web-loadbalancer
  labels:
    app: web-lb
spec:
  type: LoadBalancer
  selector:
    app: web-lb
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
EOF
```

**Aplicar el manifest:**
```bash
kubectl apply -f web-loadbalancer.yaml
kubectl get service web-loadbalancer --watch
```

**Salida esperada (observa cómo la EXTERNAL-IP se asigna):**
```
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)        AGE
web-loadbalancer   LoadBalancer   10.96.111.22    <pending>        80:30123/TCP   0s
web-loadbalancer   LoadBalancer   10.96.111.22    192.168.49.100   80:30123/TCP   5s
```

**Probar acceso:**
```bash
curl http://192.168.49.100
```

---

### Paso 9: Verificar eventos de MetalLB

```bash
kubectl get events -n metallb-system --sort-by='.lastTimestamp'
```

**Buscar eventos relacionados con asignación de IPs:**
```
LAST SEEN   TYPE     REASON                  OBJECT                                    MESSAGE
30s         Normal   AnnouncingAssignment    service/web-loadbalancer                  service has IP address 192.168.49.100
```

---

### Paso 10: Crear múltiples LoadBalancers

**Crear segundo deployment:**
```bash
kubectl create deployment api --image=nginx:alpine --replicas=2
```

**Exponerlo con LoadBalancer:**
```bash
kubectl expose deployment api --port=8080 --target-port=80 --type=LoadBalancer --name=api-loadbalancer
kubectl get services
```

**Salida esperada:**
```
NAME               TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)          AGE
web-loadbalancer   LoadBalancer   10.96.111.22     192.168.49.100   80:30123/TCP     2m
api-loadbalancer   LoadBalancer   10.96.222.33     192.168.49.101   8080:31456/TCP   10s
```

**Nota:** MetalLB asignó la siguiente IP disponible del rango (192.168.49.101).

**Probar ambos:**
```bash
curl http://192.168.49.100
curl http://192.168.49.101:8080
```

---

### Paso 11: Limpieza

```bash
kubectl delete service web-loadbalancer api-loadbalancer
kubectl delete deployment web-lb api
rm web-loadbalancer.yaml
```

---

## Desglose de comandos

### Habilitar MetalLB en minikube

| Comando | Descripción |
|---------|-------------|
| `minikube addons enable metallb` | Habilita addon de MetalLB |
| `minikube addons configure metallb` | Configura rango de IPs |
| `kubectl get pods -n metallb-system` | Verifica pods de MetalLB |

### Comando `kubectl expose` con LoadBalancer

| Flag | Descripción |
|------|-------------|
| `deployment web-lb` | Recurso a exponer |
| `--port=80` | Puerto expuesto por el Service |
| `--target-port=80` | Puerto del container |
| `--type=LoadBalancer` | Tipo de Service |
| `--name=web-loadbalancer` | Nombre del Service |

### Manifest YAML

| Campo | Descripción |
|-------|-------------|
| `spec.type: LoadBalancer` | Tipo de Service |
| `spec.selector.app: web-lb` | Selecciona pods con este label |
| `spec.ports[].port` | Puerto expuesto externamente |
| `spec.ports[].targetPort` | Puerto del container |
| `spec.ports[].protocol` | TCP o UDP (default: TCP) |

---

## Explicación detallada

### ¿Qué es LoadBalancer?

LoadBalancer es el tipo de Service más avanzado para exponer aplicaciones al exterior. En cloud providers (AWS, GCP, Azure), crea automáticamente un balanceador de carga real con IP pública.

### ¿Qué es MetalLB?

MetalLB es una implementación de LoadBalancer para clusters bare-metal y on-premise (como minikube, kind, k3s). Proporciona:

1. **Asignación de IPs externas:** De un rango configurado
2. **Protocolo Layer 2 (ARP):** Responde a peticiones ARP con la MAC del nodo
3. **Protocolo BGP:** Para entornos más avanzados
4. **Sin dependencias externas:** No requiere hardware especial

### ¿Por qué usar MetalLB en lugar de minikube tunnel?

| Aspecto | `minikube tunnel` | MetalLB |
|---------|-------------------|---------|
| Requiere terminal abierta | Sí (bloqueante) | No |
| Permisos sudo | Sí | No |
| Estabilidad | Inestable (se cae fácilmente) | Estable |
| IPs predecibles | No (usa ClusterIP) | Sí (rango configurado) |
| Múltiples servicios | Un proceso por servicio | Un addon para todos |
| Recomendación | Solo emergencias | **Usar siempre** |

### Características de LoadBalancer

1. **IP externa dedicada:** Cada Service LoadBalancer recibe su propia IP
2. **Incluye NodePort y ClusterIP:** LoadBalancer es una extensión de NodePort
3. **Balanceo de carga automático:** Distribuye tráfico entre pods
4. **Health checks:** Solo envía tráfico a pods Ready

### ¿Cuándo usar LoadBalancer?

- **Producción en cloud:** AWS ELB, GCP Load Balancer, Azure Load Balancer
- **Clusters on-premise con MetalLB:** Alternativa a Ingress para servicios específicos
- **Aplicaciones que necesitan IP pública dedicada:** No pueden compartir IP/puerto
- **Protocolos no-HTTP:** TCP/UDP genéricos que no funcionan con Ingress

### ¿Cuándo NO usar LoadBalancer?

- **Múltiples aplicaciones HTTP/HTTPS:** Usar Ingress (un LoadBalancer, múltiples rutas)
- **Sin presupuesto en cloud:** LoadBalancers en cloud cuestan dinero ($$$)
- **Desarrollo local sin MetalLB:** Usar NodePort o port-forward

### Diagrama de LoadBalancer con MetalLB

```
      Cliente Externo
           │
           │ http://192.168.49.100
           │
           ▼
┌─────────────────────────────────┐
│      MetalLB Controller         │
│  (asigna IPs del rango)         │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│         Service                 │
│      (LoadBalancer)             │
│   EXTERNAL-IP: 192.168.49.100   │
│   ClusterIP: 10.96.111.22       │
└─────────────────────────────────┘
           │
      ┌────┴────┬────────┐
      ▼         ▼        ▼
   ┌────┐   ┌────┐   ┌────┐
   │Pod1│   │Pod2│   │Pod3│
   │web │   │web │   │web │
   └────┘   └────┘   └────┘
```

### Rango de IPs en MetalLB

Cuando configuras MetalLB con el rango `192.168.49.100-192.168.49.110`, MetalLB puede asignar hasta 11 IPs externas:

```
192.168.49.100 → Primer Service LoadBalancer
192.168.49.101 → Segundo Service LoadBalancer
192.168.49.102 → Tercer Service LoadBalancer
...
192.168.49.110 → Último disponible
```

### Imperativo vs Declarativo

| Aspecto | Imperativo (`kubectl expose`) | Declarativo (YAML) |
|---------|-------------------------------|---------------------|
| Control | Básico | Total |
| Reproducible | No | Sí |
| Versionado | No | Sí (Git) |
| Anotaciones MetalLB | No | Sí (puedes especificar IP) |
| Recomendación | Solo pruebas | **Siempre en producción** |

---

## Conceptos aprendidos

- LoadBalancer es el tipo de Service para acceso externo en producción
- En cloud providers, crea un balanceador real con IP pública
- MetalLB proporciona LoadBalancer para clusters on-premise y minikube
- MetalLB asigna IPs externas de un rango configurado
- MetalLB es superior a `minikube tunnel` (estable, sin terminal bloqueada)
- Cada Service LoadBalancer recibe su propia IP externa
- LoadBalancer incluye funcionalidad de NodePort y ClusterIP
- Forma imperativa: rápida para pruebas
- Forma declarativa: recomendada para producción
- Usar LoadBalancer para servicios que necesitan IP dedicada
- Usar Ingress para múltiples aplicaciones HTTP/HTTPS (más adelante)

---

## Troubleshooting

### EXTERNAL-IP en Pending

**Problema:**
```bash
kubectl get service web-loadbalancer
# EXTERNAL-IP: <pending>
```

**Causas y soluciones:**

1. **MetalLB no instalado:**
```bash
kubectl get pods -n metallb-system
# Si no hay pods, habilitar addon
minikube addons enable metallb
```

2. **MetalLB no configurado:**
```bash
minikube addons configure metallb
# Configurar rango: 192.168.49.100-192.168.49.110
```

3. **Rango de IPs agotado:**
```bash
kubectl get services -A | grep LoadBalancer
# Si tienes más de 11 LoadBalancers, ampliar el rango
```

4. **Pods de MetalLB no Running:**
```bash
kubectl get pods -n metallb-system
# Verificar que controller y speaker estén Running
```

---

### MetalLB no asigna IP

**Problema:**
```bash
kubectl get service web-loadbalancer --watch
# EXTERNAL-IP permanece en <pending> por más de 30s
```

**Soluciones:**

1. **Ver logs del controller:**
```bash
kubectl logs -n metallb-system -l app=metallb,component=controller
```

2. **Verificar configuración de MetalLB:**
```bash
kubectl get configmap config -n metallb-system -o yaml
```

3. **Verificar eventos:**
```bash
kubectl get events -n metallb-system
kubectl describe service web-loadbalancer
```

4. **Reiniciar MetalLB:**
```bash
minikube addons disable metallb
minikube addons enable metallb
minikube addons configure metallb
```

---

### IP asignada no es accesible

**Problema:**
```bash
curl http://192.168.49.100
# Connection timeout
```

**Soluciones:**

1. **Verificar que el Service tiene Endpoints:**
```bash
kubectl get endpoints web-loadbalancer
```

2. **Verificar que los pods están Running:**
```bash
kubectl get pods -l app=web-lb
```

3. **Verificar que speaker de MetalLB está corriendo:**
```bash
kubectl get pods -n metallb-system -l component=speaker
```

4. **Verificar eventos de MetalLB:**
```bash
kubectl get events -n metallb-system | grep web-loadbalancer
```

5. **En WSL2, puede haber problemas de routing. Probar con port-forward:**
```bash
kubectl port-forward svc/web-loadbalancer 8080:80
curl http://localhost:8080
```

---

### Rango de IPs incorrecto

**Problema:**
El rango configurado no es compatible con la red de minikube.

**Solución:**
```bash
# 1. Obtener IP de minikube
minikube ip
# Ejemplo: 192.168.49.2

# 2. Reconfigurar MetalLB con rango compatible
minikube addons configure metallb
# Start IP: 192.168.49.100
# End IP: 192.168.49.110

# 3. Reiniciar servicios LoadBalancer existentes
kubectl delete service web-loadbalancer
kubectl apply -f web-loadbalancer.yaml
```

---

## Desafío adicional

### Desafío 1: Especificar IP externa específica

MetalLB permite especificar una IP específica del rango usando anotaciones. Modifica el manifest para solicitar la IP `192.168.49.105`.

**Pistas:**
```yaml
metadata:
  annotations:
    metallb.universe.tf/loadBalancerIPs: 192.168.49.105
```

---

### Desafío 2: Comparar los 3 tipos de Services

Crea el mismo Deployment y exponlo con los 3 tipos:
1. ClusterIP (Lab 04)
2. NodePort (Lab 05)
3. LoadBalancer (Lab 06)

Completa la tabla:

| Aspecto | ClusterIP | NodePort | LoadBalancer |
|---------|-----------|----------|--------------|
| Acceso interno | Sí | Sí | Sí |
| Acceso externo | No | Sí | Sí |
| IP dedicada | No | No | Sí |
| Puerto específico | Cualquiera | 30000-32767 | Cualquiera |
| Uso principal | Backend interno | Testing | Producción |

---

### Desafío 3: Agotar el rango de IPs

Si configuraste el rango `192.168.49.100-192.168.49.102` (solo 3 IPs):
1. Crea 3 Services LoadBalancer
2. Intenta crear un cuarto
3. Observa qué sucede con `kubectl describe service`
4. Amplía el rango de MetalLB
5. Verifica que el cuarto Service recibe IP

---

### Desafío 4: LoadBalancer con múltiples puertos

Crea un Service LoadBalancer que exponga tanto HTTP (80) como HTTPS (443).

**Pistas:**
```yaml
spec:
  ports:
  - name: http
    port: 80
    targetPort: 80
  - name: https
    port: 443
    targetPort: 443
```

---

## Recursos adicionales

- [Kubernetes Docs - LoadBalancer Service](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer)
- [MetalLB Official Documentation](https://metallb.universe.tf/)
- [MetalLB Installation Guide](https://metallb.universe.tf/installation/)
- [MetalLB Configuration](https://metallb.universe.tf/configuration/)
- [minikube addons - MetalLB](https://minikube.sigs.k8s.io/docs/handbook/addons/metallb/)
- [Comparison: NodePort vs LoadBalancer vs Ingress](https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0)
