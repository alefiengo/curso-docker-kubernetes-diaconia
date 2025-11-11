# Tarea para Casa - Clase 6

**Entrega:** Antes de la próxima clase via Moodle

---

## Objetivo

Aplicar los conceptos de Namespaces, ConfigMaps, Secrets y StatefulSets desplegando PostgreSQL con persistencia en Kubernetes.

**Nota importante:** Esta tarea se enfoca en los conceptos de Kubernetes, NO en desarrollo de aplicaciones. Usarás imágenes pre-construidas.

---

## Requisitos

Desplegar PostgreSQL en Kubernetes usando:
- **Namespace** dedicado
- **ConfigMap** para configuración no sensible
- **Secret** para credenciales
- **StatefulSet** con persistencia (PVC)
- **Headless Service** para acceso interno

**Tiempo estimado:** 2-3 horas

---

## Parte 1: Preparación del Namespace (5 puntos)

### 1.1 Crear namespace

**Imperativo:**
```bash
kubectl create namespace tarea-clase7
```

**O declarativo (namespace.yaml):**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: tarea-clase7
  labels:
    proyecto: tarea
    clase: clase7
```

### 1.2 Configurar contexto

```bash
kubectl config set-context --current --namespace=tarea-clase7
```

**Verificar:**
```bash
kubectl config view --minify | grep namespace:
```

---

## Parte 2: ConfigMap para PostgreSQL (10 puntos)

### 2.1 Crear ConfigMap

**Imperativo:**
```bash
kubectl create configmap postgres-config \
  --namespace=tarea-clase7 \
  --from-literal=POSTGRES_DB=mibasedatos \
  --from-literal=PGDATA=/var/lib/postgresql/data/pgdata
```

**O declarativo (configmap.yaml):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: tarea-clase7
data:
  POSTGRES_DB: mibasedatos
  PGDATA: /var/lib/postgresql/data/pgdata
```

### 2.2 Verificar

```bash
kubectl get configmap postgres-config -o yaml
```

---

## Parte 3: Secret para Credenciales (10 puntos)

### 3.1 Crear Secret

**Imperativo:**
```bash
kubectl create secret generic postgres-secret \
  --namespace=tarea-clase7 \
  --from-literal=POSTGRES_USER=admin \
  --from-literal=POSTGRES_PASSWORD=mipassword123
```

**O declarativo (secret.yaml):**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: tarea-clase7
type: Opaque
stringData:
  POSTGRES_USER: admin
  POSTGRES_PASSWORD: mipassword123
```

**IMPORTANTE:** Si subes esto a GitHub, NO incluyas credenciales reales. Usa un archivo `secret.yaml.example` con valores de ejemplo.

### 3.2 Verificar

```bash
kubectl get secret postgres-secret
kubectl describe secret postgres-secret
```

---

## Parte 4: Headless Service (10 puntos)

### 4.1 Crear headless service (postgres-headless.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
  namespace: tarea-clase7
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
    name: postgres
```

### 4.2 Aplicar

```bash
kubectl apply -f postgres-headless.yaml
kubectl get service postgres-headless
```

---

## Parte 5: StatefulSet con Persistencia (25 puntos)

### 5.1 Crear StatefulSet (postgres-statefulset.yaml)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: tarea-clase7
spec:
  serviceName: postgres-headless
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        envFrom:
        - configMapRef:
            name: postgres-config
        - secretRef:
            name: postgres-secret
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
```

### 5.2 Aplicar

```bash
kubectl apply -f postgres-statefulset.yaml
```

### 5.3 Verificar

```bash
kubectl get statefulset postgres
kubectl get pods -l app=postgres
kubectl get pvc
```

---

## Parte 6: Probar PostgreSQL (15 puntos)

### 6.1 Conectarse al pod

```bash
kubectl exec -it postgres-0 -- psql -U admin -d mibasedatos
```

### 6.2 Crear tabla e insertar datos

Dentro de psql:
```sql
CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    carrera VARCHAR(100)
);

INSERT INTO estudiantes (nombre, carrera) VALUES
    ('Juan Perez', 'Ingeniería de Sistemas'),
    ('Maria Lopez', 'Ingeniería de Sistemas'),
    ('Carlos Gomez', 'Ingeniería de Sistemas');

SELECT * FROM estudiantes;
```

Salir: `\q`

### 6.3 Demostrar persistencia

**Eliminar el pod:**
```bash
kubectl delete pod postgres-0
```

**Esperar que se recree:**
```bash
kubectl get pods -w
# Ctrl+C cuando veas Running
```

**Reconectar y verificar datos persisten:**
```bash
kubectl exec -it postgres-0 -- psql -U admin -d mibasedatos -c "SELECT * FROM estudiantes;"
```

**Los datos deben seguir ahí.**

---

## Parte 7: Documentación (20 puntos)

### 7.1 Crear repositorio Git

Crea un repositorio en GitHub o GitLab con esta estructura:

```
tarea-clase7-k8s/
├── README.md
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml.example
│   ├── postgres-headless.yaml
│   └── postgres-statefulset.yaml
└── screenshots/
    ├── 01-namespace.png
    ├── 02-recursos.png
    ├── 03-pvc.png
    ├── 04-datos.png
    └── 05-persistencia.png
```

### 7.2 README.md debe incluir

**a) Descripción:**
- Objetivo de la tarea
- Conceptos aplicados (namespace, configmap, secret, statefulset, pvc)

**b) Instrucciones paso a paso:**
1. Crear namespace
2. Aplicar ConfigMap
3. Aplicar Secret
4. Aplicar Headless Service
5. Aplicar StatefulSet
6. Verificar que todo está corriendo
7. Probar PostgreSQL
8. Demostrar persistencia

**c) Comandos de verificación:**
```bash
kubectl get all -n tarea-clase7
kubectl get pvc -n tarea-clase7
kubectl get configmap,secret -n tarea-clase7
```

**d) Capturas de pantalla:**
1. `kubectl get all` mostrando todos los recursos
2. `kubectl get pvc` mostrando el volumen BOUND
3. Datos en PostgreSQL (SELECT)
4. Prueba de persistencia (después de eliminar pod)

**e) Comandos de limpieza:**
```bash
kubectl delete namespace tarea-clase7
# Esto elimina todo: pods, services, configmaps, secrets, pvcs
```

---

## Parte 8: Limpieza (5 puntos)

### 8.1 Eliminar todos los recursos

```bash
kubectl delete namespace tarea-clase7
```

### 8.2 Verificar

```bash
kubectl get namespaces | grep tarea-clase7
kubectl get pvc --all-namespaces | grep tarea-clase7
```

No debe aparecer nada.

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| **Namespace** | 5 |
| - Namespace creado correctamente | 3 |
| - Contexto configurado | 2 |
| **ConfigMap** | 10 |
| - ConfigMap con variables correctas | 7 |
| - Verificación documentada | 3 |
| **Secret** | 10 |
| - Secret con credenciales | 7 |
| - Buenas prácticas (no subir credenciales reales) | 3 |
| **Headless Service** | 10 |
| - Service configurado correctamente | 7 |
| - clusterIP: None | 3 |
| **StatefulSet** | 25 |
| - StatefulSet funcional | 10 |
| - PVC configurado y BOUND | 8 |
| - envFrom usado correctamente | 7 |
| **Pruebas** | 15 |
| - PostgreSQL funcional | 8 |
| - Persistencia demostrada | 7 |
| **Documentación** | 20 |
| - README completo y claro | 10 |
| - Capturas de pantalla | 10 |
| **Limpieza** | 5 |
| - Comandos de limpieza correctos | 5 |
| **TOTAL** | **100 puntos** |

---

## Preguntas Frecuentes

### ¿Puedo usar otro namespace?
Sí, pero documenta claramente el nombre que usaste.

### ¿Puedo usar MySQL en lugar de PostgreSQL?
Sí, pero debe ser con StatefulSet y PVC.

### ¿Qué hago si mi PVC queda en Pending?
Verifica que minikube tenga storage habilitado:
```bash
minikube addons list | grep storage
minikube addons enable storage-provisioner
```

### ¿Debo crear la app backend?
**NO.** Esta tarea se enfoca solo en PostgreSQL con persistencia. El backend es para el Proyecto Integrador.

### ¿Puedo usar comandos imperativos en vez de YAMLs?
Sí, pero documenta todos los comandos en tu README.

---

## Entrega

1. **Repositorio Git:** Crear repositorio público en GitHub o GitLab
2. **Link en Moodle:** Subir link al repositorio antes de la fecha límite
3. **README completo:** Con documentación y capturas

**Formato del link:**
```
https://github.com/<tu-usuario>/tarea-clase7-k8s
```

---

## Recursos de Ayuda

- [Lab 01: Namespaces](../labs/01-namespaces/)
- [Lab 02: ConfigMaps y Secrets](../labs/02-configmaps-secrets/)
- [Lab 03: StatefulSet y Persistencia](../labs/03-statefulset-persistencia/)
- [Kubernetes Docs - StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Kubernetes Docs - ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)

---

**Nota final:** Esta tarea consolida los conceptos fundamentales de la Clase 6. Enfócate en comprender cada componente y cómo interactúan entre sí.
