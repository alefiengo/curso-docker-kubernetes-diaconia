# Desafío Rápido - Clase 5

**Tiempo estimado:** 5 minutos
**Dificultad:** Básica

---

## Objetivo

Desplegar una aplicación REST API en Kubernetes, escalarla y comprobar el auto-healing.

---

## Contexto

Usarás una API de productos ya preparada (FastAPI) para experimentar con los conceptos de Deployment, Service, escalado y auto-healing de Kubernetes.

---

## Instrucciones

### Paso 1: Desplegar la aplicación

Desde el directorio `demos/fastapi-products-k8s/`:

```bash
# Aplicar manifiestos
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verificar que todo esté corriendo
kubectl get deployments
kubectl get pods
kubectl get services
```

### Paso 2: Probar la API

```bash
# Obtener URL (minikube)
minikube service products-api-service --url

# Probar el endpoint de productos
curl $(minikube service products-api-service --url)/api/v1/products
```

### Paso 3: Experimentar con auto-healing

```bash
# Eliminar un pod
kubectl delete pod <nombre-de-un-pod>

# Observar cómo K8s crea uno nuevo automáticamente
kubectl get pods -w
```

### Paso 4: Escalar a 5 réplicas

```bash
# Escalar
kubectl scale deployment products-api --replicas=5

# Verificar
kubectl get pods
```

---

## Criterios de Éxito

- [ ] Deployment creado con 3 réplicas iniciales
- [ ] Service expuesto en NodePort 30080
- [ ] API responde correctamente en `/api/v1/products`
- [ ] Al eliminar un pod, K8s crea uno nuevo
- [ ] Escalado a 5 réplicas exitoso

---

## Solución

<details>
<summary>Ver comandos completos</summary>

```bash
# 1. Aplicar manifiestos
cd demos/fastapi-products-k8s/
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 2. Verificar recursos
kubectl get all

# 3. Probar API
URL=$(minikube service products-api-service --url)
curl $URL/api/v1/products

# 4. Auto-healing
POD_NAME=$(kubectl get pods -l app=products-api -o jsonpath='{.items[0].metadata.name}')
kubectl delete pod $POD_NAME
kubectl get pods -w

# 5. Escalar
kubectl scale deployment products-api --replicas=5
kubectl get pods
```

</details>

---

## Limpieza

```bash
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/deployment.yaml
```

---

## Bonus

Si terminas rápido, ejecuta el script de verificación completo:

```bash
./verify.sh
```
