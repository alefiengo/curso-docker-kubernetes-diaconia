# Lab 02: ConfigMaps y Secrets

## Objetivo

Aprender a externalizar la configuración de aplicaciones usando ConfigMaps (configuración no sensible) y Secrets (información sensible como credenciales), y entender las diferentes formas de consumirlos en los pods (variables de entorno y archivos montados).

**Nota importante:** Este lab usa el namespace `default` para simplicidad didáctica. En el Proyecto Integrador y en producción, todos los recursos deben desplegarse en namespaces específicos (como viste en Lab 01).

---

## Comandos a ejecutar

### Paso 1: Crear ConfigMap desde literales

```bash
kubectl create configmap app-config \
  --from-literal=APP_NAME="Mi Aplicación K8s" \
  --from-literal=APP_ENV=production \
  --from-literal=APP_VERSION=1.0.0 \
  --from-literal=LOG_LEVEL=info
```

**Ver el ConfigMap creado:**
```bash
kubectl get configmap app-config
kubectl describe configmap app-config
```

**Salida esperada:**
```
Name:         app-config
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
APP_ENV:
----
production
APP_NAME:
----
Mi Aplicación K8s
APP_VERSION:
----
1.0.0
LOG_LEVEL:
----
info
```

---

### Paso 2: Crear Secret desde literales

```bash
kubectl create secret generic app-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASSWORD=supersecret123 \
  --from-literal=API_KEY=abc123xyz789
```

**Ver el Secret creado:**
```bash
kubectl get secret app-secret
kubectl describe secret app-secret
```

**Salida esperada:**
```
Name:         app-secret
Namespace:    default
Type:         Opaque

Data
====
API_KEY:      12 bytes
DB_PASSWORD:  15 bytes
DB_USER:      5 bytes
```

**Nota:** Los valores están codificados en base64 y NO se muestran en describe.

**Ver valores (base64):**
```bash
kubectl get secret app-secret -o jsonpath='{.data}'
```

**Decodificar un valor:**
```bash
kubectl get secret app-secret -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

---

### Paso 3: Crear aplicación que usa ConfigMap y Secret

Guardar como `app-with-config.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: config-demo
  labels:
    app: config-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: config-demo
  template:
    metadata:
      labels:
        app: config-demo
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["/bin/sh"]
        args:
          - -c
          - |
            echo "==================================="
            echo "Configuración de la Aplicación"
            echo "==================================="
            echo "APP_NAME: $APP_NAME"
            echo "APP_ENV: $APP_ENV"
            echo "APP_VERSION: $APP_VERSION"
            echo "LOG_LEVEL: $LOG_LEVEL"
            echo ""
            echo "==================================="
            echo "Credenciales (desde Secret)"
            echo "==================================="
            echo "DB_USER: $DB_USER"
            echo "DB_PASSWORD: $DB_PASSWORD"
            echo "API_KEY: $API_KEY"
            echo ""
            echo "Aplicación iniciada. Presiona Ctrl+C para salir..."
            sleep infinity
        env:
        # Variables desde ConfigMap
        - name: APP_NAME
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_NAME
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_ENV
        - name: APP_VERSION
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_VERSION
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        # Variables desde Secret
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_PASSWORD
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: API_KEY
```

**Aplicar:**
```bash
kubectl apply -f app-with-config.yaml
```

**Ver logs (verificar que lee las variables):**
```bash
kubectl logs -l app=config-demo --tail=20
```

**Salida esperada:**
```
===================================
Configuración de la Aplicación
===================================
APP_NAME: Mi Aplicación K8s
APP_ENV: production
APP_VERSION: 1.0.0
LOG_LEVEL: info

===================================
Credenciales (desde Secret)
===================================
DB_USER: admin
DB_PASSWORD: supersecret123
API_KEY: abc123xyz789

Aplicación iniciada. Presiona Ctrl+C para salir...
```

---

### Paso 4: ConfigMap y Secret como archivos (volumeMounts)

Guardar como `app-with-volumes.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: config-volume-demo
  labels:
    app: config-volume-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: config-volume-demo
  template:
    metadata:
      labels:
        app: config-volume-demo
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["/bin/sh"]
        args:
          - -c
          - |
            echo "Archivos de configuración montados:"
            echo ""
            echo "=== ConfigMap (en /config) ==="
            ls -la /config/
            echo ""
            cat /config/APP_NAME
            echo ""
            cat /config/APP_ENV
            echo ""
            echo "=== Secret (en /secrets) ==="
            ls -la /secrets/
            echo ""
            cat /secrets/DB_USER
            echo ""
            cat /secrets/DB_PASSWORD
            echo ""
            sleep infinity
        volumeMounts:
        - name: config-volume
          mountPath: /config
          readOnly: true
        - name: secret-volume
          mountPath: /secrets
          readOnly: true
      volumes:
      - name: config-volume
        configMap:
          name: app-config
      - name: secret-volume
        secret:
          secretName: app-secret
```

**Aplicar:**
```bash
kubectl apply -f app-with-volumes.yaml
```

**Ver logs:**
```bash
kubectl logs -l app=config-volume-demo
```

**Salida esperada:**
```
Archivos de configuración montados:

=== ConfigMap (en /config) ===
total 0
drwxrwxrwx    3 root     root           160 Oct 14 10:30 .
drwxr-xr-x    1 root     root          4096 Oct 14 10:30 ..
drwxr-xr-x    2 root     root           140 Oct 14 10:30 ..2025_10_14_10_30_12.123456789
lrwxrwxrwx    1 root     root            31 Oct 14 10:30 ..data -> ..2025_10_14_10_30_12.123456789
lrwxrwxrwx    1 root     root            15 Oct 14 10:30 APP_ENV -> ..data/APP_ENV
lrwxrwxrwx    1 root     root            16 Oct 14 10:30 APP_NAME -> ..data/APP_NAME
lrwxrwxrwx    1 root     root            19 Oct 14 10:30 APP_VERSION -> ..data/APP_VERSION
lrwxrwxrwx    1 root     root            17 Oct 14 10:30 LOG_LEVEL -> ..data/LOG_LEVEL

Mi Aplicación K8s
production

=== Secret (en /secrets) ===
total 0
drwxrwxrwt    3 root     root           140 Oct 14 10:30 .
drwxr-xr-x    1 root     root          4096 Oct 14 10:30 ..
drwxr-xr-x    2 root     root           120 Oct 14 10:30 ..2025_10_14_10_30_12.123456789
lrwxrwxrwx    1 root     root            31 Oct 14 10:30 ..data -> ..2025_10_14_10_30_12.123456789
lrwxrwxrwx    1 root     root            15 Oct 14 10:30 API_KEY -> ..data/API_KEY
lrwxrwxrwx    1 root     root            19 Oct 14 10:30 DB_PASSWORD -> ..data/DB_PASSWORD
lrwxrwxrwx    1 root     root            15 Oct 14 10:30 DB_USER -> ..data/DB_USER

admin
supersecret123
```

---

### Paso 5: Actualizar ConfigMap y ver cambios

**Actualizar ConfigMap:**
```bash
kubectl create configmap app-config \
  --from-literal=APP_NAME="Mi Aplicación K8s" \
  --from-literal=APP_ENV=staging \
  --from-literal=APP_VERSION=1.1.0 \
  --from-literal=LOG_LEVEL=debug \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Ver cambios en archivos montados (toma ~60 segundos):**
```bash
# Esperar ~60 segundos
sleep 60

kubectl exec -it deployment/config-volume-demo -- cat /config/APP_ENV
kubectl exec -it deployment/config-volume-demo -- cat /config/APP_VERSION
```

**Salida esperada:**
```
staging
1.1.0
```

**Nota:** Los cambios en archivos se reflejan automáticamente, pero las variables de entorno NO se actualizan (requieren reinicio del pod).

**Reiniciar pods para ver nuevas variables de entorno:**
```bash
kubectl rollout restart deployment config-demo
kubectl logs -l app=config-demo --tail=10
```

---

### Paso 6: ConfigMap desde archivo

Crear archivo de configuración `app.properties`:

```bash
cat > app.properties <<EOF
database.host=postgres.default.svc.cluster.local
database.port=5432
database.name=myapp
cache.enabled=true
cache.ttl=300
max.connections=100
EOF
```

**Crear ConfigMap desde archivo:**
```bash
kubectl create configmap app-properties --from-file=app.properties
```

**Ver contenido:**
```bash
kubectl get configmap app-properties -o yaml
```

**Salida esperada:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-properties
data:
  app.properties: |
    database.host=postgres.default.svc.cluster.local
    database.port=5432
    database.name=myapp
    cache.enabled=true
    cache.ttl=300
    max.connections=100
```

---

### Paso 7: Secret desde archivo

Crear archivo con credenciales `.env`:

```bash
cat > .env <<EOF
DB_HOST=postgres.default.svc.cluster.local
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=supersecret123
EOF
```

**Crear Secret desde archivo:**
```bash
kubectl create secret generic app-env --from-env-file=.env
```

**Ver Secret:**
```bash
kubectl get secret app-env -o yaml
```

---

### Paso 8: Limpieza

```bash
kubectl delete deployment config-demo config-volume-demo
kubectl delete configmap app-config app-properties
kubectl delete secret app-secret app-env
rm app-with-config.yaml app-with-volumes.yaml app.properties .env
```

---

## Desglose de los comandos

### ConfigMap

| Comando | Descripción |
|---------|-------------|
| `kubectl create configmap <name>` | Crear ConfigMap |
| `--from-literal=KEY=VALUE` | Desde pares clave-valor |
| `--from-file=<archivo>` | Desde archivo (nombre=clave, contenido=valor) |
| `--from-file=<dir>` | Desde todos los archivos de un directorio |
| `--from-env-file=<archivo>` | Desde archivo .env (KEY=VALUE) |

### Secret

| Comando | Descripción |
|---------|-------------|
| `kubectl create secret generic <name>` | Crear Secret tipo Opaque |
| `--from-literal=KEY=VALUE` | Desde pares clave-valor |
| `--from-file=<archivo>` | Desde archivo |
| `--from-env-file=<archivo>` | Desde archivo .env |
| `kubectl create secret tls <name>` | Secret TLS (certificados) |

### Uso en Pods

| Método | ConfigMap | Secret |
|--------|-----------|--------|
| Variable de entorno | `configMapKeyRef` | `secretKeyRef` |
| Archivo montado | `volumes.configMap` | `volumes.secret` |

---

## Explicación detallada

### ¿Qué es un ConfigMap?

Un ConfigMap es un objeto de Kubernetes que almacena datos de configuración no confidenciales en formato clave-valor. Permite separar la configuración del código de la aplicación.

**Casos de uso:**
- Configuración de aplicación (nombres, URLs, flags)
- Archivos de configuración (application.properties, nginx.conf)
- Variables de entorno
- Argumentos de línea de comandos

### ¿Qué es un Secret?

Un Secret es similar a un ConfigMap, pero está diseñado para almacenar información sensible (contraseñas, tokens, claves SSH, certificados TLS).

**Diferencias con ConfigMap:**
- Los valores se codifican en base64 (NO es encriptación)
- No se muestran en `kubectl describe`
- Se pueden encriptar en etcd (configuración del cluster)
- Tienen tipos específicos (Opaque, TLS, DockerConfig, etc.)

**Importante:** base64 NO es seguro. En producción, usar:
- Kubernetes secrets encryption at rest
- External secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

### Formas de consumir ConfigMaps y Secrets

#### 1. Como variables de entorno

**Ventajas:**
- Fácil de usar en la aplicación (leer variables de entorno)
- Compatible con 12-factor apps

**Desventajas:**
- No se actualizan automáticamente (requiere reinicio del pod)
- Todas las variables están en memoria

```yaml
env:
- name: APP_NAME
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: APP_NAME
```

#### 2. Como archivos montados (volumes)

**Ventajas:**
- Se actualizan automáticamente (~60 segundos)
- Permite montar archivos de configuración completos
- Soporte para permisos específicos

**Desventajas:**
- La aplicación debe leer archivos (no variables de entorno)
- Delay en actualizaciones

```yaml
volumes:
- name: config-volume
  configMap:
    name: app-config
volumeMounts:
- name: config-volume
  mountPath: /config
```

### Tipos de Secrets

| Tipo | Uso |
|------|-----|
| `Opaque` | Genérico (default) |
| `kubernetes.io/tls` | Certificados TLS |
| `kubernetes.io/dockerconfigjson` | Credenciales de Docker registry |
| `kubernetes.io/basic-auth` | Autenticación básica |
| `kubernetes.io/ssh-auth` | Claves SSH |

### Buenas prácticas

1. **Nunca** commitear Secrets en Git
2. Usar `.gitignore` para archivos con credenciales
3. En producción, rotar Secrets regularmente
4. Usar herramientas externas (Vault, AWS Secrets Manager) para gestión avanzada
5. Limitar acceso RBAC a Secrets
6. Usar `readOnly: true` en volumeMounts
7. Nombrar ConfigMaps y Secrets con sufijos versionados para facilitar rollbacks

---

## Conceptos aprendidos

- ConfigMaps almacenan configuración no sensible
- Secrets almacenan información confidencial (codificada en base64)
- Se pueden crear desde literales, archivos o directorios
- Se consumen como variables de entorno o archivos montados
- Variables de entorno NO se actualizan automáticamente
- Archivos montados se actualizan en ~60 segundos
- base64 NO es encriptación, solo codificación
- En producción usar secrets encryption at rest
- Los Secrets no se muestran en kubectl describe

---

## Troubleshooting

### ConfigMap o Secret no encontrado

**Error en logs:**
```
Error: couldn't find key APP_NAME in ConfigMap default/app-config
```

**Soluciones:**

1. **Verificar que existe:**
```bash
kubectl get configmap app-config
kubectl get secret app-secret
```

2. **Verificar el namespace:**
```bash
kubectl get configmap app-config -n <namespace>
```

3. **Verificar la clave:**
```bash
kubectl describe configmap app-config
```

---

### Pod en CrashLoopBackOff por ConfigMap faltante

**Problema:**
```bash
kubectl get pods
# config-demo-xxx   0/1   CrashLoopBackOff
```

**Causa:**
El pod intenta iniciar pero el ConfigMap/Secret no existe.

**Solución:**
Crear el ConfigMap/Secret antes de aplicar el Deployment:
```bash
kubectl create configmap app-config --from-literal=APP_NAME=test
kubectl apply -f app-with-config.yaml
```

---

### Cambios en ConfigMap no se reflejan en la app

**Problema:**
Actualicé el ConfigMap pero la app sigue usando valores antiguos.

**Soluciones:**

1. **Si usas variables de entorno:** Reiniciar pods
```bash
kubectl rollout restart deployment config-demo
```

2. **Si usas volumeMounts:** Esperar ~60 segundos
```bash
sleep 60
kubectl exec deployment/config-volume-demo -- cat /config/APP_ENV
```

3. **Forzar recreación de pods:**
```bash
kubectl delete pod -l app=config-demo
```

---

### No puedo decodificar Secret

**Problema:**
```bash
kubectl get secret app-secret -o jsonpath='{.data.DB_PASSWORD}'
# c3VwZXJzZWNyZXQxMjM=
```

**Solución:**
Decodificar base64:
```bash
kubectl get secret app-secret -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
# supersecret123
```

---

### Error: "volume mount path already exists"

**Problema:**
```
Error: Volume mount path /config already exists in container
```

**Causa:**
Dos volumeMounts intentan montar en el mismo path.

**Solución:**
Usar paths diferentes:
```yaml
volumeMounts:
- name: config-volume
  mountPath: /config
- name: secret-volume
  mountPath: /secrets  # ← Diferente path
```

---

## Desafío final

### Desafío: Aplicación con configuración completa

Crea una aplicación que:

1. Use un ConfigMap con configuración de base de datos (host, port, database name)
2. Use un Secret con credenciales (user, password)
3. Monte el ConfigMap como archivo `/config/db.conf`
4. Monte el Secret como variables de entorno
5. Imprima toda la configuración al iniciar

**Pistas:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
data:
  db.conf: |
    host=postgres.default.svc.cluster.local
    port=5432
    database=myapp
    max_connections=50
---
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  username: admin
  password: supersecret123
---
apiVersion: apps/v1
kind: Deployment
# ... completar
```

**Verificación:**
```bash
kubectl logs -l app=<tu-app>
# Debe mostrar configuración completa
```

---

## Recursos adicionales

- [Kubernetes Docs - ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Kubernetes Docs - Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)
- [Distribute Credentials Securely Using Secrets](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)
- [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
