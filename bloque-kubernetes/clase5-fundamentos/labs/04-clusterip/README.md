# Lab 04: Service ClusterIP - Comunicación Interna

## Objetivo

Comprender el Service tipo ClusterIP, el tipo por defecto en Kubernetes para comunicación interna entre pods dentro del cluster. Practicar tanto la forma imperativa (comandos kubectl) como la declarativa (manifests YAML).

---

## Comandos a ejecutar

### Paso 1: Crear Deployment de nginx

```bash
kubectl create deployment web --image=nginx:alpine --replicas=3
kubectl get pods -l app=web -o wide
```

**Salida esperada:**
```
NAME                   READY   STATUS    RESTARTS   AGE   IP            NODE
web-6d8f9c5b7c-4mx9l   1/1     Running   0          10s   10.244.0.5    minikube
web-6d8f9c5b7c-7kqx2   1/1     Running   0          10s   10.244.0.6    minikube
web-6d8f9c5b7c-hmz5p   1/1     Running   0          10s   10.244.0.7    minikube
```

---

### Paso 2: Exponer con ClusterIP (forma imperativa)

```bash
kubectl expose deployment web --port=80 --target-port=80 --name=web-clusterip
kubectl get service web-clusterip
```

**Salida esperada:**
```
NAME             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
web-clusterip    ClusterIP   10.96.123.45    <none>        80/TCP    5s
```

---

### Paso 3: Probar acceso interno

```bash
kubectl run test-pod --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- http://web-clusterip
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

### Paso 4: Ver Endpoints del Service

Los Endpoints son las IPs de los pods seleccionados por el Service.

```bash
kubectl get endpoints web-clusterip
```

**Salida esperada:**
```
NAME            ENDPOINTS                                         AGE
web-clusterip   10.244.0.5:80,10.244.0.6:80,10.244.0.7:80        2m
```

**Comparar con IPs de los pods:**
```bash
kubectl get pods -l app=web -o wide
```

**Observación:** Las IPs de los Endpoints coinciden exactamente con las IPs de los pods.

---

### Paso 5: Service Discovery con DNS

Kubernetes provee DNS interno automático. Cada Service tiene un nombre DNS: `<service-name>.<namespace>.svc.cluster.local`

**Probar DNS interno:**
```bash
kubectl run dns-test --image=busybox:1.36 --rm -it --restart=Never -- nslookup web-clusterip
```

**Salida esperada:**
```
Server:         10.96.0.10
Address:        10.96.0.10:53

** server can't find web-clusterip.cluster.local: NXDOMAIN
** server can't find web-clusterip.svc.cluster.local: NXDOMAIN

Name:   web-clusterip.default.svc.cluster.local
Address: 10.105.29.251

pod "dns-test" deleted
pod default/dns-test terminated (Error)
```

**Nota importante:** Los mensajes `NXDOMAIN` son normales. `nslookup` intenta resolver varias variantes del nombre antes de encontrar la correcta. Lo importante es la **última línea exitosa** que muestra la resolución correcta del FQDN completo. El mensaje `terminated (Error)` es un artefacto del exit code de `nslookup` y no indica un problema real.

**Probar acceso por DNS corto (dentro del mismo namespace):**
```bash
kubectl run dns-test --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- http://web-clusterip
```

**Salida esperada (HTML de nginx):**
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
pod "dns-test" deleted
```

---

### Paso 6: Eliminar Service imperativo

```bash
kubectl delete service web-clusterip
```

---

### Paso 7: Crear Service con manifest YAML (forma declarativa)

Crear archivo `web-clusterip.yaml`:

```bash
cat > web-clusterip.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: web-clusterip
  labels:
    app: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
EOF
```

**Aplicar el manifest:**
```bash
kubectl apply -f web-clusterip.yaml
kubectl get service web-clusterip
```

**Salida esperada:**
```
NAME             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
web-clusterip    ClusterIP   10.96.123.45    <none>        80/TCP    5s
```

**Probar nuevamente:**
```bash
kubectl run test-pod --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- http://web-clusterip
```

---

### Paso 8: Limpieza

```bash
kubectl delete -f web-clusterip.yaml
kubectl delete deployment web
```

---

## Desglose de comandos

### Comando `kubectl expose`

| Flag | Descripción |
|------|-------------|
| `deployment web` | Recurso a exponer (Deployment llamado "web") |
| `--port=80` | Puerto expuesto por el Service |
| `--target-port=80` | Puerto del container (donde escucha la app) |
| `--name=web-clusterip` | Nombre del Service |
| `--type=ClusterIP` | Tipo de Service (opcional, es el default) |

### Manifest YAML

| Campo | Descripción |
|-------|-------------|
| `spec.type: ClusterIP` | Tipo de Service (puede omitirse, es default) |
| `spec.selector.app: web` | Selecciona pods con label `app=web` |
| `spec.ports[].port` | Puerto expuesto por el Service |
| `spec.ports[].targetPort` | Puerto del container |
| `spec.ports[].protocol` | TCP o UDP (default: TCP) |
| `spec.ports[].name` | Nombre del puerto (útil para múltiples puertos) |

---

## Explicación detallada

### ¿Qué es ClusterIP?

ClusterIP es el tipo de Service por defecto en Kubernetes. Proporciona:

1. **IP virtual interna:** Una IP estable dentro del cluster
2. **DNS automático:** Nombre resolvible por todos los pods
3. **Balanceo de carga:** Distribuye tráfico entre pods seleccionados
4. **Alcance interno:** Solo accesible dentro del cluster

### ¿Cuándo usar ClusterIP?

- Comunicación entre microservicios (frontend → backend)
- Acceso a bases de datos desde aplicaciones
- APIs internas que no deben exponerse al exterior
- Servicios de infraestructura (Redis, RabbitMQ, etc.)

### Diagrama de ClusterIP

```
┌─────────────────────────────────────────────┐
│          Kubernetes Cluster                 │
│                                             │
│  ┌─────────┐                                │
│  │   Pod   │ (frontend)                     │
│  │         │                                │
│  └────┬────┘                                │
│       │                                     │
│       │ curl http://web-clusterip           │
│       │                                     │
│       ▼                                     │
│  ┌─────────────┐                            │
│  │   Service   │ (ClusterIP)                │
│  │ web-clusterip│                            │
│  │ 10.96.123.45│                            │
│  └─────────────┘                            │
│       │                                     │
│       │ Balancea entre pods                 │
│       │                                     │
│   ┌───┼───┬───────┐                         │
│   ▼       ▼       ▼                         │
│ ┌────┐ ┌────┐ ┌────┐                        │
│ │Pod1│ │Pod2│ │Pod3│                        │
│ │web │ │web │ │web │                        │
│ └────┘ └────┘ └────┘                        │
│                                             │
│ [No accesible desde fuera del cluster]     │
└─────────────────────────────────────────────┘
```

### Service Discovery con DNS

Kubernetes incluye CoreDNS que resuelve nombres automáticamente:

**DNS corto (mismo namespace):**
```bash
curl http://web-clusterip
```

**DNS con namespace (otro namespace):**
```bash
curl http://web-clusterip.default
```

**FQDN completo:**
```bash
curl http://web-clusterip.default.svc.cluster.local
```

### Endpoints

Los Endpoints son la lista de IPs de pods que el Service balancea. Kubernetes actualiza esta lista automáticamente cuando:
- Se crean nuevos pods
- Se eliminan pods
- Un pod falla su readinessProbe

**Ver Endpoints:**
```bash
kubectl get endpoints web-clusterip -o yaml
```

### Imperativo vs Declarativo

| Aspecto | Imperativo (`kubectl expose`) | Declarativo (YAML) |
|---------|-------------------------------|---------------------|
| Uso | Rápido para testing | Recomendado para producción |
| Versionado | No | Sí (Git) |
| Reproducible | No | Sí |
| Configuración | Limitada (flags) | Completa (YAML) |
| Recomendación | Solo demos y pruebas | **Siempre en producción** |

---

## Conceptos aprendidos

- ClusterIP es el tipo de Service por defecto en Kubernetes
- Proporciona una IP virtual interna estable para balancear tráfico
- Solo es accesible dentro del cluster (no desde el exterior)
- Service Discovery con DNS permite acceder por nombre en lugar de IP
- Los Endpoints son las IPs reales de los pods seleccionados
- Los selectors (labels) determinan qué pods reciben tráfico
- Kubernetes actualiza los Endpoints automáticamente
- Forma imperativa: rápida para pruebas con `kubectl expose`
- Forma declarativa: recomendada para producción con manifests YAML

---

## Troubleshooting

### Service no responde

**Problema:**
```bash
kubectl run test --image=busybox --rm -it -- wget -qO- http://web-clusterip
# Timeout o connection refused
```

**Soluciones:**

1. **Verificar que los pods estén Running:**
```bash
kubectl get pods -l app=web
```

2. **Verificar que el Service tenga Endpoints:**
```bash
kubectl get endpoints web-clusterip
```

Si no hay endpoints, revisar que los labels del Deployment coincidan con el selector del Service:
```bash
kubectl describe service web-clusterip | grep Selector
kubectl get pods --show-labels
```

3. **Verificar puerto del container:**
```bash
kubectl describe pod <pod-name> | grep Port
```

---

### DNS no resuelve nombres

**Problema:**
```bash
kubectl run test --image=busybox --rm -it -- nslookup web-clusterip
# Server can't find web-clusterip
```

**Importante:** Si ves mensajes `NXDOMAIN` pero al final aparece la resolución correcta (ej: `web-clusterip.default.svc.cluster.local Address: 10.x.x.x`), entonces **el DNS está funcionando correctamente**. Los NXDOMAIN son intentos fallidos de resolución en otros search domains antes de encontrar el correcto.

**Soluciones si realmente falla:**

1. **Verificar CoreDNS está corriendo:**
```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

2. **Usar FQDN completo:**
```bash
nslookup web-clusterip.default.svc.cluster.local
```

3. **Verificar que el Service existe:**
```bash
kubectl get service web-clusterip
```

4. **Probar con wget en lugar de nslookup (más simple):**
```bash
kubectl run test --image=busybox --rm -it -- wget -qO- http://web-clusterip
```

---

### Endpoints vacíos

**Problema:**
```bash
kubectl get endpoints web-clusterip
# NAME            ENDPOINTS   AGE
# web-clusterip   <none>      30s
```

**Causa:** Los labels del selector no coinciden con los labels de los pods.

**Solución:**
```bash
# Ver selector del Service
kubectl get service web-clusterip -o yaml | grep -A2 selector

# Ver labels de los pods
kubectl get pods --show-labels

# Si no coinciden, eliminar y recrear el Service con el selector correcto
```

---

## Desafío adicional

### Desafío 1: Service con múltiples puertos

Modifica el manifest YAML para que el Service exponga tanto HTTP (80) como HTTPS (443).

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

### Desafío 2: Service sin selector (endpoints manuales)

Crea un Service que apunte a un servidor externo (por ejemplo, una base de datos fuera del cluster).

**Pasos:**
1. Crear Service sin selector
2. Crear Endpoints manualmente con la IP externa

**Pistas:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  ports:
  - port: 5432
---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-db
subsets:
- addresses:
  - ip: 192.168.1.100
  ports:
  - port: 5432
```

---

### Desafío 3: Verificar balanceo de carga

Modifica el Deployment para que cada pod de nginx devuelva un mensaje diferente (usando ConfigMap o variables de entorno). Luego, haz múltiples requests al Service y verifica que el tráfico se distribuye entre los pods.

---

## Recursos adicionales

- [Kubernetes Docs - Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Kubernetes Docs - DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [Kubernetes Docs - Connecting Applications with Services](https://kubernetes.io/docs/tutorials/services/connect-applications-service/)
- [CoreDNS in Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/coredns/)
