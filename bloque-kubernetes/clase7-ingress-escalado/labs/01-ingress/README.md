# Lab 01: Ingress - Routing HTTP

## Objetivo

Comprender cómo Ingress proporciona un único punto de entrada HTTP para múltiples servicios en el cluster usando path-based routing.

---

## Comandos a ejecutar

### Paso 1: Habilitar NGINX Ingress Controller

```bash
minikube addons enable ingress
```

**Salida esperada:**
```
ingress was successfully enabled
```

**Verificar instalación:**
```bash
kubectl get pods -n ingress-nginx
```

**Esperar a que todos los pods estén Running** (puede tomar 1-2 minutos):
```
NAME                                        READY   STATUS    RESTARTS   AGE
ingress-nginx-admission-create-xxx         0/1     Completed   0       30s
ingress-nginx-admission-patch-xxx          0/1     Completed   0       30s
ingress-nginx-controller-xxxxxxxxx-xxxxx   1/1     Running     0       30s
```

---

### Paso 2: Desplegar aplicación Frontend

```bash
kubectl create deployment frontend --image=nginx:alpine --port=80
kubectl expose deployment frontend --port=80 --target-port=80 --name=frontend-service

# Personalizar mensaje
kubectl exec -it deployment/frontend -- sh -c 'echo "<h1>Frontend App</h1>" > /usr/share/nginx/html/index.html'
```

---

### Paso 3: Desplegar aplicación Backend (API)

```bash
kubectl create deployment backend --image=nginx:alpine --port=80
kubectl expose deployment backend --port=80 --target-port=80 --name=backend-service

# Personalizar mensaje
kubectl exec -it deployment/backend -- sh -c 'echo "<h1>Backend API</h1>" > /usr/share/nginx/html/index.html'
```

---

### Paso 4: Verificar servicios

```bash
kubectl get services
```

**Salida esperada:**
```
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
frontend-service   ClusterIP   10.96.123.45    <none>        80/TCP    30s
backend-service    ClusterIP   10.96.234.56    <none>        80/TCP    20s
```

---

### Paso 5: Crear Ingress con path-based routing

Crear archivo `ingress.yaml`:

```bash
cat <<EOF > ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
EOF
```

**Aplicar:**
```bash
kubectl apply -f ingress.yaml
```

**Verificar:**
```bash
kubectl get ingress
```

**Salida esperada:**
```
NAME          CLASS   HOSTS   ADDRESS          PORTS   AGE
app-ingress   nginx   *       192.168.49.2     80      10s
```

**Nota:** El campo ADDRESS puede tardar unos segundos en aparecer.

---

### Paso 6: Probar el Ingress

**Obtener IP del Ingress:**
```bash
kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

**Probar ruta frontend (/):**
```bash
curl http://$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/
```

**Salida esperada:**
```html
<h1>Frontend App</h1>
```

**Probar ruta backend (/api):**
```bash
curl http://$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/api
```

**Salida esperada:**
```html
<h1>Backend API</h1>
```

---

### Paso 7: Ver detalles del Ingress

```bash
kubectl describe ingress app-ingress
```

**Observar:**
- Rules configuradas
- Backends conectados
- Eventos

---

### Paso 8: Limpieza

```bash
kubectl delete ingress app-ingress
kubectl delete service frontend-service backend-service
kubectl delete deployment frontend backend
rm ingress.yaml
```

---

## Desglose de comandos

### Comando `minikube addons enable ingress`

| Componente | Descripción |
|------------|-------------|
| `minikube addons enable` | Habilita un addon de minikube |
| `ingress` | Nombre del addon (NGINX Ingress Controller) |

### Manifest Ingress

| Campo | Descripción |
|-------|-------------|
| `apiVersion: networking.k8s.io/v1` | API de recursos de red en Kubernetes |
| `kind: Ingress` | Tipo de recurso |
| `metadata.annotations` | Configuración específica del Ingress Controller |
| `nginx.ingress.kubernetes.io/rewrite-target` | Reescribe la URL antes de enviar al backend |
| `spec.rules` | Reglas de routing |
| `spec.rules[].http.paths` | Lista de rutas HTTP |
| `path: /` | Ruta a matchear |
| `pathType: Prefix` | Tipo de match (Prefix, Exact, ImplementationSpecific) |
| `backend.service.name` | Service al que enrutar |
| `backend.service.port.number` | Puerto del service |

---

## Explicación detallada

### ¿Qué es Ingress?

Ingress es un recurso de Kubernetes que gestiona el acceso HTTP/HTTPS externo a servicios dentro del cluster. Actúa como un **reverse proxy** y **load balancer** inteligente.

### ¿Por qué usar Ingress en lugar de NodePort/LoadBalancer?

**Ventajas de Ingress:**
- **Un solo punto de entrada** para múltiples servicios
- **Path-based routing**: `/` → frontend, `/api` → backend
- **Host-based routing**: `app.com` → service1, `api.app.com` → service2
- **SSL/TLS termination** (HTTPS)
- **Ahorro de IPs públicas** (1 IP para muchos servicios)

**Sin Ingress necesitarías:**
- 1 LoadBalancer por servicio (costoso en cloud)
- O 1 NodePort por servicio (difícil de gestionar)

### ¿Qué pasó en este lab?

1. **Instalamos NGINX Ingress Controller**: Un pod que escucha tráfico HTTP y ejecuta las reglas de Ingress
2. **Creamos 2 servicios ClusterIP**: Solo accesibles internamente (sin IP externa)
3. **Creamos un Ingress**: Define reglas de routing HTTP
4. **El tráfico fluye así:**
   ```
   Usuario → Ingress Controller (IP pública)
           → Evalúa path
           → Si path = "/" → frontend-service → pod frontend
           → Si path = "/api" → backend-service → pod backend
   ```

### Anotación `rewrite-target`

```yaml
nginx.ingress.kubernetes.io/rewrite-target: /
```

Esto reescribe la URL antes de enviarla al backend:
- Usuario pide: `/api/users`
- Ingress envía al backend: `/users`

Sin esta anotación, el backend recibiría `/api/users` y podría no encontrar la ruta.

---

## Conceptos aprendidos

- **Ingress**: Recurso que define reglas de routing HTTP/HTTPS
- **Ingress Controller**: Implementación que ejecuta las reglas (NGINX, Traefik, HAProxy, etc.)
- **Path-based routing**: Enrutar según la ruta URL
- **Single entry point**: Un Ingress puede enrutar a múltiples servicios
- **ClusterIP + Ingress**: Patrón común para exponer apps en producción

---

## Troubleshooting

### El Ingress no tiene ADDRESS

**Problema:**
```bash
kubectl get ingress
NAME          CLASS   HOSTS   ADDRESS   PORTS   AGE
app-ingress   nginx   *       <none>    80      2m
```

**Solución:**
Esperar 1-2 minutos. El Ingress Controller necesita tiempo para asignar la IP. Si persiste:

```bash
# Verificar que Ingress Controller está corriendo
kubectl get pods -n ingress-nginx

# Ver logs del controller
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

---

### curl devuelve 404 Not Found

**Problema:**
```bash
curl http://192.168.49.2/api
<html>
<head><title>404 Not Found</title></head>
...
```

**Soluciones:**

1. **Verificar que los servicios existen:**
```bash
kubectl get services
```

2. **Verificar que los pods están Running:**
```bash
kubectl get pods
```

3. **Verificar las reglas del Ingress:**
```bash
kubectl describe ingress app-ingress
```

4. **Verificar endpoints:**
```bash
kubectl get endpoints frontend-service backend-service
```

---

### curl devuelve "Connection refused"

**Problema:**
```bash
curl http://192.168.49.2/
curl: (7) Failed to connect to 192.168.49.2 port 80: Connection refused
```

**Solución:**

El Ingress Controller no está listo. Verificar:
```bash
kubectl get pods -n ingress-nginx
```

Todos los pods deben estar `Running` o `Completed`.

---

### curl se queda colgado (minikube + WSL2)

**Problema:**
```bash
curl http://192.168.49.2/
# Se queda colgado sin respuesta
```

**Causa:**
En WSL2, la IP del Ingress (192.168.49.2) no es accesible directamente porque está en una red interna de minikube.

**Soluciones:**

**Opción 1: Port-forward (Recomendado para desarrollo)**
```bash
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
```

Luego accede con:
```bash
curl http://localhost:8080/
curl http://localhost:8080/api
```

**Opción 2: minikube tunnel (Requiere privilegios)**
```bash
minikube tunnel
```

En otra terminal:
```bash
curl http://127.0.0.1/
curl http://127.0.0.1/api
```

**Nota:** `minikube tunnel` requiere permisos de administrador y debe mantenerse corriendo.

**Opción 3: Acceder desde dentro del cluster**
```bash
kubectl run test --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- http://192.168.49.2/
kubectl run test --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- http://192.168.49.2/api
```

**Opción 4: Usar minikube service (alternativa)**
```bash
# Obtener URL directa al Ingress Controller
minikube service -n ingress-nginx ingress-nginx-controller --url
```

Usa la URL que devuelve (generalmente `http://127.0.0.1:XXXXX`) para probar:
```bash
curl http://127.0.0.1:XXXXX/
curl http://127.0.0.1:XXXXX/api
```

---

## Desafío adicional

Agrega un tercer servicio llamado "admin" accesible en `/admin` usando el mismo Ingress.

---

## Recursos adicionales

- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Ingress Controllers Comparison](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)
