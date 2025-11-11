# Desafío Rápido - Clase 7

---

## Objetivo

Configurar HPA para una aplicación y observar el escalado automático bajo carga.

---

## Instrucciones

### 1. Desplegar aplicación con resource requests

```bash
kubectl create deployment webapp --image=nginx:alpine --port=80
kubectl set resources deployment webapp --requests=cpu=100m --limits=cpu=200m
kubectl expose deployment webapp --port=80 --name=webapp-service
```

### 2. Crear HPA

```bash
kubectl autoscale deployment webapp --cpu-percent=50 --min=1 --max=3
```

### 3. Generar carga

```bash
kubectl run load-generator --image=busybox:1.28 --rm -it --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://webapp-service; done"
```

### 4. Observar escalado (en otra terminal)

```bash
watch kubectl get hpa webapp
watch kubectl get pods -l app=webapp
```

### 5. Verificar

Confirmar que:
- HPA muestra CPU usage aumentando
- Pods escalan de 1 a 2-3 réplicas
- Al detener carga (Ctrl+C), pods regresan a 1 después de ~5 minutos

---

## Limpieza

```bash
kubectl delete hpa webapp
kubectl delete service webapp-service
kubectl delete deployment webapp
```
