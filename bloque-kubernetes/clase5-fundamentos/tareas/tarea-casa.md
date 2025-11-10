# Tarea 5 - Deployment y Service en Kubernetes

## Objetivo

Practicar la creación de Deployments y Services desplegando una aplicación web en Kubernetes, aplicando los conceptos de réplicas, labels, selectors y exposición de servicios aprendidos en clase.

---

## Parte 1: Elegir la Aplicación

Debes desplegar **una aplicación web** con las siguientes características:

**Opción 1: Nginx (Más Simple)**
- Imagen: `nginx:alpine`
- Puedes usar HTML personalizado (opcional)
- No requiere programación

**Opción 2: Aplicación Web Custom**
- Node.js, Python, Go, o tu lenguaje preferido
- Debe exponer un puerto HTTP
- Requiere crear tu propio Dockerfile

**Nota:** La opción 1 es perfecta si quieres enfocarte en Kubernetes. Lo importante es demostrar el uso correcto de Deployments y Services, no programar una aplicación compleja.

---

## Parte 2: Requisitos del Deployment

Tu `deployment.yaml` debe incluir:

- **Nombre:** `webapp-deployment`
- **Réplicas:** 3 (mínimo)
- **Labels:** `app: webapp`, `env: homework`
- **Container:**
  - Nombre: `webapp`
  - Puerto: 80 (o el puerto que uses)
  - Imagen: La que elijas

---

## Parte 3: Requisitos del Service

Tu `service.yaml` debe incluir:

- **Tipo:** NodePort
- **Selector:** `app: webapp`
- **Puerto del service:** 80
- **NodePort:** 30200
- La aplicación debe ser accesible desde el navegador

---

## Parte 4: Estructura del Repositorio

Estructura **mínima**:

```
tu-repo-clase5/
├── README.md                    # Documentación
├── deployment.yaml              # Deployment de Kubernetes
├── service.yaml                 # Service de Kubernetes
├── html/                        # Opcional: contenido web custom
│   └── index.html
└── screenshots/                 # Capturas de pantalla
```

**Nota:** Si usas imagen oficial de nginx sin personalizar, no necesitas otros archivos.

---

## Parte 5: Desplegar y Probar

### Paso 1: Crear el Deployment

Crea `deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
  labels:
    app: webapp
    env: homework
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
        env: homework
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### Paso 2: Crear el Service

Crea `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
  labels:
    app: webapp
spec:
  type: NodePort
  selector:
    app: webapp
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30200
```

### Paso 3: Desplegar en Kubernetes

```bash
# 1. Aplicar el deployment
kubectl apply -f deployment.yaml

# 2. Aplicar el service
kubectl apply -f service.yaml

# 3. Verificar que todo esté corriendo
kubectl get deployments
kubectl get pods
kubectl get services

# 4. Acceder a la aplicación
minikube service webapp-service --url
# O abrir en navegador:
minikube service webapp-service
```

### Paso 4: Experimentar con Kubernetes

Ejecuta estos comandos y captura los resultados:

```bash
# 1. Ver todos los recursos
kubectl get all

# 2. Ver detalles del deployment
kubectl describe deployment webapp-deployment

# 3. Ver logs de uno de los pods
kubectl logs <nombre-del-pod>

# 4. Escalar a 5 réplicas
kubectl scale deployment webapp-deployment --replicas=5
kubectl get pods

# 5. Eliminar un pod y observar auto-healing
kubectl delete pod <nombre-de-un-pod>
kubectl get pods -w
```

---

## Parte 6: Documentar en README.md

Tu README.md debe incluir:

### 1. Encabezado

```markdown
# Nombre de tu Aplicación

**Curso:** Docker & Kubernetes - Clase 5
**Estudiante:** Tu Nombre

Breve descripción (1-2 líneas) de qué hace.
```

### 2. Tecnología

```markdown
## Stack

- **Aplicación:** Nginx / Node.js / Python / etc.
- **Kubernetes:** minikube
- **Réplicas:** 3
```

### 3. Cómo Ejecutar

```markdown
## Ejecución

1. Clonar:
   ```bash
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo
   ```

2. Desplegar:
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   ```

3. Acceder:
   - URL: http://<MINIKUBE-IP>:30200
   - O usar: `minikube service webapp-service`
```

### 4. Cómo Probar

```markdown
## Verificación

1. Ver recursos:
   ```bash
   kubectl get all
   ```

2. Acceder a la web: http://<IP>:30200

3. Escalar:
   ```bash
   kubectl scale deployment webapp-deployment --replicas=5
   kubectl get pods
   ```
```

### 5. Capturas de Pantalla

```markdown
## Screenshots

### Recursos desplegados
![kubectl get all](screenshots/resources.png)

### Aplicación funcionando
![webapp](screenshots/webapp.png)

### Escalado a 5 réplicas
![scaling](screenshots/scaling.png)
```

### 6. Conceptos Aplicados

```markdown
## Conceptos Kubernetes

- Deployment con 3 réplicas
- Service tipo NodePort
- Labels y selectors
- Auto-healing
- Escalado horizontal
```

---

## Parte 7: Capturas de Pantalla

Mínimo **4 capturas**:

1. **Recursos desplegados:** `kubectl get all` mostrando deployment, pods y service
2. **Pods detallados:** `kubectl get pods -o wide` con las 3 réplicas running
3. **Aplicación funcionando:** Navegador accediendo a http://IP:30200
4. **Escalado:** `kubectl get pods` después de escalar a 5 réplicas

**Opcional (para destacar):**
- `kubectl describe deployment webapp-deployment`
- Auto-healing después de eliminar un pod
- Logs de uno de los pods

---

## Parte 8: Entrega y Evaluación

### Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| **Deployment** (YAML correcto, 3 réplicas, labels) | 30% |
| **Service** (YAML correcto, NodePort, accesible) | 25% |
| **Funcionalidad** (aplicación corriendo, accesible) | 20% |
| **Documentación** (README claro con instrucciones) | 15% |
| **Screenshots** (4 capturas mínimo) | 10% |

**Total:** 100%

### Restricciones

- No copiar exactamente el lab o la demo (debe ser tu propia implementación)
- Repositorio público en GitHub o GitLab
- Debe funcionar con `git clone` + `kubectl apply`

### Instrucciones de Entrega

1. Crear repositorio público (GitHub/GitLab)
2. Subir código con commits claros
3. Verificar que funcione desde cero
4. Entregar en Moodle: enlace + descripción breve

**Formato en Moodle:**
```
Repositorio: https://github.com/tu-usuario/tu-repo-clase6
Descripción: Deployment de Nginx con 3 réplicas y Service NodePort
```

### Checklist Final

Antes de entregar, verifica:

- [ ] Repositorio público o acceso concedido
- [ ] README.md con instrucciones claras
- [ ] `deployment.yaml` con 3 réplicas
- [ ] `service.yaml` tipo NodePort en puerto 30200
- [ ] Labels correctos (`app: webapp`, `env: homework`)
- [ ] 4 screenshots mínimo
- [ ] Funciona con `kubectl apply -f deployment.yaml` y `kubectl apply -f service.yaml`
- [ ] Aplicación accesible desde navegador
- [ ] Enlace entregado en Moodle

---

## Desafíos Opcionales (Puntos Extra)

### Bonus 1: Labels adicionales (5 puntos)

Agrega más labels útiles al deployment:
```yaml
labels:
  app: webapp
  env: homework
  version: v1.0
  tier: frontend
```

### Bonus 2: Rolling Update (10 puntos)

Actualiza la imagen a `nginx:1.26-alpine` y documenta:
```bash
kubectl set image deployment/webapp-deployment nginx=nginx:1.26-alpine
kubectl rollout status deployment webapp-deployment
kubectl rollout history deployment webapp-deployment
```

### Bonus 3: Usar tu propia imagen (15 puntos)

En lugar de nginx, despliega tu propia aplicación:
- Crea un Dockerfile
- Construye y push a Docker Hub
- Actualiza el deployment para usar tu imagen

---

## Ayuda: Ideas de Proyectos (Muy Simples)

### Opción 1: Nginx Simple (Más Fácil)
- Solo nginx:alpine con página por defecto
- **Inspirado en Lab 02 + Lab 03**
- No requiere programación
- Perfecto si quieres enfocarte en K8s

### Opción 2: Nginx con HTML Custom
- Nginx con tu propia página HTML
- Puedes usar ConfigMap para el HTML (Lab 02)
- Un poco más personalizado

### Opción 3: Aplicación Web Simple
- Node.js con Express (solo "Hello World")
- Python con Flask/FastAPI
- Requiere Dockerfile y push a Docker Hub

**Consejo:** La opción 1 es perfecta si quieres algo rápido. Enfócate en crear correctamente el Deployment y Service, no en la aplicación en sí.

---

## Recursos Adicionales

- [Lab 02 - Primer Pod](../labs/02-primer-pod/)
- [Lab 03 - Deployments](../labs/03-deployments/)
- [Lab 04 - Services](../labs/04-services/)
- [Demo - FastAPI Products](../demos/fastapi-products-k8s/)
- [Cheatsheet Clase 5](../cheatsheet.md)
- [Kubernetes Docs - Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Docs - Services](https://kubernetes.io/docs/concepts/services-networking/service/)

---

## Preguntas Frecuentes

**P: ¿Puedo usar otra imagen en lugar de nginx?**
R: Sí, pero asegúrate de que exponga un puerto HTTP y documenta tu elección en el README.

**P: ¿Qué hago si un pod no inicia?**
R: Usa estos comandos para investigar:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl get events
```

**P: ¿Cómo accedo a la aplicación?**
R: Con minikube:
```bash
minikube service webapp-service --url
# Copia la URL en tu navegador
```

**P: ¿Debo usar namespace?**
R: No es necesario. Usa el namespace `default`.

**P: ¿Puedo cambiar el puerto NodePort?**
R: Sí, pero debe estar en el rango 30000-32767. Documenta el cambio en tu README.

**P: ¿Los manifests YAML deben ser exactos?**
R: No. Puedes personalizarlos (otros nombres, labels, puertos), pero deben cumplir los requisitos mínimos.

---

## Limpieza

Al terminar de trabajar en la tarea:

```bash
# Eliminar recursos
kubectl delete -f deployment.yaml
kubectl delete -f service.yaml

# Verificar que se eliminaron
kubectl get all
```

---

## Fecha de Entrega

**Antes de la Clase 6**

Enviar por Moodle:
- Link al repositorio público en GitHub o GitLab
- Descripción breve de tu implementación

---

**¡Éxito en tu tarea!**
