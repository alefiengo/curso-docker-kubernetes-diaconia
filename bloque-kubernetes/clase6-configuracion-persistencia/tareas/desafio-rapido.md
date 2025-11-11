# Desafío Rápido - Clase 6

**Tiempo estimado:** 5 minutos

---

## Objetivo

Crear un ConfigMap y un Secret, y usarlos en un pod de nginx para mostrar variables de entorno.

---

## Instrucciones

### 1. Crear ConfigMap

Crea un ConfigMap llamado `web-config` con las siguientes claves:

- `SITE_NAME`: "Mi Sitio Web"
- `ENVIRONMENT`: "development"
- `VERSION`: "2.0"

### 2. Crear Secret

Crea un Secret llamado `web-credentials` con:

- `ADMIN_USER`: "admin"
- `ADMIN_PASSWORD`: "secret123"

### 3. Crear Deployment

Crea un Deployment de nginx que:
- Use la imagen `nginx:alpine`
- Tenga 1 réplica
- Monte las variables del ConfigMap y Secret como variables de entorno
- Use un comando personalizado para mostrar las variables

### 4. Verificar

Ver los logs del pod y confirmar que muestra todas las variables correctamente.

---

## Comandos sugeridos

```bash
# Crear ConfigMap
kubectl create configmap web-config \
  --from-literal=SITE_NAME="Mi Sitio Web" \
  --from-literal=ENVIRONMENT=development \
  --from-literal=VERSION=2.0

# Crear Secret
kubectl create secret generic web-credentials \
  --from-literal=ADMIN_USER=admin \
  --from-literal=ADMIN_PASSWORD=secret123

# Crear deployment (adaptar según necesites)
# Pista: Usar busybox con comando que imprima las variables
kubectl apply -f deployment.yaml

# Ver logs
kubectl logs -l app=<tu-app>
```

---

## Salida esperada

Los logs deben mostrar algo similar a:

```
SITE_NAME: Mi Sitio Web
ENVIRONMENT: development
VERSION: 2.0
ADMIN_USER: admin
ADMIN_PASSWORD: secret123
```

---

## Verificación

Confirmar que:

1. Los recursos fueron creados correctamente
2. Los logs del pod muestran las variables

---

## Limpieza

```bash
kubectl delete deployment <deployment-name>
kubectl delete configmap web-config
kubectl delete secret web-credentials
```
