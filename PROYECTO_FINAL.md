# Proyecto Final - Curso Docker & Kubernetes

**Curso:** Docker & Kubernetes - Contenedores y Orquestación en la Práctica
**Instructor:** Alejandro Fiengo
**Institución:** i-Quattro

---

## Objetivo

Aprender el workflow profesional de actualización y gestión de versiones de aplicaciones en Kubernetes, utilizando microk8s como entorno de desarrollo local que simula un cluster cloud.

Al finalizar este proyecto, serás capaz de:
- Gestionar versiones de imágenes Docker
- Publicar imágenes en Docker Hub
- Actualizar aplicaciones en Kubernetes sin re-desplegar todo el cluster
- Utilizar `kubectl apply` y `kubectl rollout` efectivamente
- Trabajar con Ingress y MetalLB para acceso externo

---

## Prerequisitos

### Entorno de Trabajo

**Opciones de Ambiente:**

Puedes elegir entre:

**Opción A (Recomendada): Máquina Virtual Local**
- **Hypervisor:** VirtualBox o VMware Workstation/Fusion
- **SO:** Ubuntu 24.04 Desktop LTS
- **Herramientas:** microk8s, Docker, Git, navegador web
- **Ventajas:** Sin costo, entorno controlado

**Opción B: Cloud Provider (Si tienes acceso)**
- **Proveedores permitidos:** AWS, GCP, Azure, DigitalOcean
- **Cluster:** Kubernetes gestionado (EKS, GKE, AKS, DOKS) o microk8s en VM
- **Importante:** Debes gestionar costos. El instructor no cubre gastos de cloud.

**Workflow (independiente del ambiente):**
- Construir imágenes con Docker → Publicar en Docker Hub → Desplegar en Kubernetes

**Todo debe ser público:**
- Repositorio GitHub/GitLab: Público
- Imágenes Docker Hub: Públicas

**IMPORTANTE - Identificación:**
- Configura el nombre de tu VM o instancia con tu nombre completo
- Esto permite validar autenticidad en screenshots y evita copias

### Hardware Mínimo (Para Opción A - VM Local)
- **RAM:** 8GB (host), asignar 4GB a la VM
- **CPU:** 4 cores (host), asignar 2 cores a la VM
- **Disco:** 25GB libres para la VM

### Software Requerido
- **Hypervisor:** VirtualBox o VMware Workstation (Windows/Linux) / VMware Fusion (macOS)
- Cuenta en Docker Hub (gratuita, crear en https://hub.docker.com)
- Cuenta en GitHub o GitLab (gratuita)
- Todo lo demás se instala dentro de la VM o instancia cloud (Git, Docker, microk8s)

---

## Parte 1: Setup del Ambiente (15%)

### Tareas

#### 1.1 Crear Máquina Virtual (Opción A) o Instancia Cloud (Opción B)

**Si usas VirtualBox o VMware:**
- Descargar Ubuntu 24.04 Desktop LTS
- Crear VM en tu hypervisor:
  - **Nombre:** TU-NOMBRE-COMPLETO-k8s (ej: juan-perez-k8s)
  - Tipo: Linux Ubuntu (64-bit)
  - RAM: 4096 MB
  - CPU: 2 cores
  - Disco: 25 GB (dinámico)
  - Red: NAT o Bridged

**Si usas Cloud Provider:**
- Crea una instancia Ubuntu 24.04 LTS
- **Nombre de la instancia:** TU-NOMBRE-COMPLETO-k8s
- Tamaño mínimo: 2 vCPUs, 4GB RAM
- Asegúrate de poder instalar microk8s o usar un cluster gestionado

**IMPORTANTE:** El nombre con tu nombre completo es OBLIGATORIO para validación.

#### 1.2 Instalar microk8s

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar microk8s
sudo snap install microk8s --classic

# Agregar usuario al grupo
sudo usermod -a -G microk8s $USER
sudo chown -f -R $USER ~/.kube
newgrp microk8s

# Verificar instalación
microk8s status --wait-ready

# Crear alias (opcional pero recomendado)
echo "alias kubectl='microk8s kubectl'" >> ~/.bashrc
source ~/.bashrc
```

#### 1.3 Habilitar Addons

```bash
# Habilitar addons necesarios
microk8s enable dns
microk8s enable storage
microk8s enable ingress
microk8s enable metrics-server

# Habilitar MetalLB (reemplaza el rango con IPs de tu red local)
microk8s enable metallb:10.0.0.100-10.0.0.110

# Verificar que todos estén activos
microk8s status
```

**Nota sobre MetalLB:** El rango de IPs debe estar en tu red local y NO estar en uso por DHCP.

Para identificar tu red, ejecuta:
```bash
ip a show eth0
# o si usas otra interfaz de red:
ip a show
```

Busca la línea con `inet`, por ejemplo: `inet 192.168.1.50/24`
- Si tu IP es `192.168.1.50/24`, tu red es `192.168.1.0/24`
- Usa un rango fuera del DHCP, ejemplo: `192.168.1.200-192.168.1.210`

Otros ejemplos:
- Red `10.0.0.0/24` → Rango: `10.0.0.100-10.0.0.110`
- Red `172.16.0.0/24` → Rango: `172.16.0.200-172.16.0.210`

#### 1.4 Instalar Git y Docker

**IMPORTANTE:** Necesitarás Docker para construir las imágenes localmente antes de subirlas a Docker Hub.

```bash
# Git
sudo apt install git -y

# Docker
sudo apt install docker.io -y
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación de Docker
docker --version
docker run hello-world

# Login en Docker Hub (necesario para push)
docker login
# Ingresa tu usuario y password de Docker Hub
```

#### 1.5 Obtener y Desplegar Proyecto Integrador v2.0

El instructor te compartirá el proyecto v2.0 en formato .zip vía Moodle.

```bash
# Descargar el archivo .zip desde Moodle y extraerlo
unzip proyecto-integrador-v2.0.zip
cd proyecto-integrador-docker-k8s

# Inicializar repositorio Git local (para tus cambios v2.1 y v2.2)
git init
git add .
git commit -m "add: proyecto integrador v2.0 base"

# Seguir la guía de despliegue
# Leer: k8s/DEPLOYMENT_GUIDE_MICROK8S.md
```

#### 1.6 Desplegar y Verificar Funcionamiento del Proyecto v2.0 Base

**IMPORTANTE:** Antes de realizar cualquier modificación, debes desplegar el proyecto v2.0 tal como está y verificar que funciona correctamente.

```bash
# 1. Seguir la guía de despliegue completa
#    Leer y ejecutar TODOS los pasos en: k8s/DEPLOYMENT_GUIDE_MICROK8S.md
#    Esta guía incluye la creación del namespace, secrets, configmaps, deployments, services e ingress

# 2. Verificar todos los recursos desplegados
kubectl get all -n proyecto-integrador

# Debes ver:
# - 2 pods del backend (api) en estado Running
# - 2 pods del frontend en estado Running
# - 1 pod de PostgreSQL en estado Running
# - 1 pod de Redis en estado Running
# - Services: api-service, frontend-service, postgres-service, redis-service
# - Deployments y ReplicaSets correspondientes

# 3. Verificar Ingress (anotar la IP externa asignada por MetalLB)
kubectl get ingress -n proyecto-integrador

# Debes ver el Ingress con una IP externa (ejemplo: 192.168.1.200)

# 4. Probar los endpoints desde el navegador
# Acceder desde navegador usando la IP del Ingress:
# http://<IP-METALLB>/                    → Debe mostrar el frontend Angular
# http://<IP-METALLB>/api/greeting        → Debe retornar JSON con el saludo
# http://<IP-METALLB>/api/users           → Debe retornar lista de usuarios (puede estar vacía)
# http://<IP-METALLB>/actuator/health     → Debe retornar {"status":"UP"}

# 5. Probar funcionalidad completa desde el navegador
# - Registrar un usuario desde el formulario
# - Verificar que aparece en la lista
# - Verificar que los datos persisten (se guardan en PostgreSQL)
```

**Resultado esperado:** Todo debe funcionar exactamente como se mostró en la Clase 8. Si hay errores, revisa logs con `kubectl logs <pod-name> -n proyecto-integrador`.

**ACCIÓN REQUERIDA:** Una vez que todo funcione correctamente, captura los screenshots solicitados en los Entregables Parte 1. Estas capturas servirán como evidencia en tu documentación final.

### Entregables Parte 1
- Screenshot de `microk8s status` mostrando todos los addons habilitados (debe verse el hostname con tu nombre)
- Screenshot de `kubectl get all -n proyecto-integrador` mostrando todos los pods Running (terminal con hostname visible)
- Screenshot del navegador accediendo al frontend via IP de MetalLB
- Screenshot de la configuración de la VM (VirtualBox/VMware) o instancia (Cloud) mostrando el nombre con tu nombre completo

---

## Parte 2: Iteración v2.1 - Modificar Backend (25%)

### Objetivo
Agregar un nuevo endpoint en el backend, versionar la imagen como v2.1, publicarla en tu Docker Hub y actualizar el deployment.

### Tareas

#### 2.1 Agregar Nuevo Endpoint

Editar el archivo: `src/main/java/dev/alefiengo/api/controller/GreetingController.java`

Agregar el siguiente método:

```java
@GetMapping("/api/info")
public ResponseEntity<Map<String, Object>> getInfo() {
    Map<String, Object> info = new HashMap<>();
    info.put("alumno", "TU NOMBRE COMPLETO");
    info.put("version", "v2.1");
    info.put("curso", "Docker & Kubernetes - i-Quattro");
    info.put("timestamp", LocalDateTime.now().toString());
    info.put("hostname", System.getenv("HOSTNAME"));
    return ResponseEntity.ok(info);
}
```

**Importante:** Reemplazar "TU NOMBRE COMPLETO" con tu nombre real.

#### 2.2 Build Imagen Docker v2.1

```bash
# Build imagen (reemplaza 'tu-usuario' con tu username de Docker Hub)
docker build -t tu-usuario/springboot-api:v2.1 .

# Verificar imagen
docker images | grep springboot-api
```

**Nota:** Ya debes estar logueado en Docker Hub desde el Paso 1.4.

#### 2.3 Push a Docker Hub

```bash
# Push
docker push tu-usuario/springboot-api:v2.1

# Verificar en https://hub.docker.com/r/tu-usuario/springboot-api/tags
```

#### 2.4 Actualizar Deployment de Kubernetes

Editar: `k8s/05-backend/api-deployment.yaml`

Buscar y cambiar la imagen del contenedor `api`:
```yaml
# Antes:
image: alefiengo/springboot-api:v2.0

# Después:
image: tu-usuario/springboot-api:v2.1
```

#### 2.5 Aplicar Cambios

```bash
# Aplicar el deployment actualizado
kubectl apply -f k8s/05-backend/api-deployment.yaml

# Ver el estado del rollout
kubectl rollout status deployment/api -n proyecto-integrador

# Ver los pods actualizándose
kubectl get pods -n proyecto-integrador -w
```

**Observación:** Kubernetes hará un rolling update automático. Verás pods nuevos con v2.1 creándose y los viejos terminándose gradualmente.

**Nota:** Como usaste un tag nuevo (v2.1 en lugar de v2.0), Kubernetes detecta el cambio automáticamente y descarga la nueva imagen. No necesitas limpiar caché manualmente.

**¿Y si la imagen no se actualiza?** Ver la sección del FAQ: "¿Por qué Kubernetes no actualiza mi imagen después de hacer push a Docker Hub?"

#### 2.6 Verificar Funcionamiento

```bash
# Opción 1: Port-forward
kubectl port-forward -n proyecto-integrador svc/api-service 8080:8080

# En otra terminal
curl http://localhost:8080/api/info

# Opción 2: Via Ingress
curl http://<IP-METALLB>/api/info
```

**Salida esperada:**
```json
{
  "alumno": "Tu Nombre",
  "version": "v2.1",
  "curso": "Docker & Kubernetes - i-Quattro",
  "timestamp": "2025-01-17T10:30:00",
  "hostname": "api-xxxx-yyyy"
}
```

#### 2.7 Crear Tag en Git

```bash
git add .
git commit -m "feat: add info endpoint for v2.1"
git tag -a v2.1 -m "Backend v2.1 con endpoint /api/info"
```

**ACCIÓN REQUERIDA:** Una vez que hayas verificado que el endpoint `/api/info` funciona correctamente, captura los screenshots solicitados en los Entregables Parte 2.

### Entregables Parte 2
- Código del endpoint agregado (screenshot o archivo .java)
- Screenshot de `docker images` mostrando la imagen v2.1
- Link a tu imagen en Docker Hub: `https://hub.docker.com/r/tu-usuario/springboot-api/tags`
- Screenshot de `kubectl rollout status` durante la actualización
- Screenshot de `kubectl get pods` mostrando los pods con la nueva versión
- Screenshot o output de `curl http://<IP-METALLB>/api/info` mostrando la respuesta JSON

---

## Parte 3: Iteración v2.2 - Modificar Frontend (25%)

### Objetivo
Agregar funcionalidad en el frontend para consumir el nuevo endpoint `/api/info`, versionar como v2.2 y desplegar.

### Tareas

#### 3.1 Modificar Frontend Angular

Editar: `frontend/src/app/app.component.html`

Agregar después del botón "Registrar Usuario" (alrededor de la línea 30):

```html
<div class="form-group">
  <button (click)="getSystemInfo()" class="btn-primary">
    Ver Info del Sistema
  </button>
</div>

<div *ngIf="systemInfo" class="card info-section">
  <h3>Información del Sistema</h3>
  <p><strong>Alumno:</strong> {{ systemInfo.alumno }}</p>
  <p><strong>Versión:</strong> {{ systemInfo.version }}</p>
  <p><strong>Curso:</strong> {{ systemInfo.curso }}</p>
  <p><strong>Timestamp:</strong> {{ systemInfo.timestamp }}</p>
  <p><strong>Pod:</strong> {{ systemInfo.hostname }}</p>
</div>
```

Editar: `frontend/src/app/app.component.ts`

Agregar la propiedad y método:

```typescript
export class AppComponent implements OnInit {
  // ... propiedades existentes ...
  systemInfo: any = null;

  // ... métodos existentes ...

  getSystemInfo(): void {
    this.http.get('/api/info').subscribe({
      next: (data) => {
        this.systemInfo = data;
        this.success = 'Información del sistema cargada';
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Error al obtener información del sistema';
        console.error('Error:', err);
      }
    });
  }
}
```

#### 3.2 Build Imagen Frontend v2.2

```bash
cd frontend

# Build imagen
docker build -t tu-usuario/angular-frontend:v2.2 .

# Push
docker push tu-usuario/angular-frontend:v2.2
```

#### 3.3 Actualizar Deployment

Editar: `k8s/06-frontend/frontend-deployment.yaml`

Buscar y cambiar la imagen del contenedor `frontend`:
```yaml
# Antes:
image: alefiengo/angular-frontend:v2.0

# Después:
image: tu-usuario/angular-frontend:v2.2
```

#### 3.4 Aplicar Cambios

```bash
# Aplicar el deployment actualizado
kubectl apply -f k8s/06-frontend/frontend-deployment.yaml

# Ver el estado del rollout
kubectl rollout status deployment/frontend -n proyecto-integrador

# Ver rolling update en acción
kubectl get pods -n proyecto-integrador -l app=frontend -w
```

**Observación:** Al igual que con el backend, Kubernetes detecta el cambio de tag (v2.0 → v2.2) y actualiza automáticamente.

#### 3.5 Verificar Funcionamiento

Acceder desde el navegador a: `http://<IP-METALLB>/`

- Hacer clic en "Ver Info del Sistema"
- Verificar que se muestre la información correctamente
- Refrescar varias veces y observar que el `hostname` puede cambiar (load balancing entre pods)

**ACCIÓN REQUERIDA:** Una vez que hayas verificado que el frontend v2.2 muestra correctamente la información del sistema, captura los screenshots solicitados en los Entregables Parte 3.

### Entregables Parte 3
- Código modificado de Angular (screenshots de .html y .ts)
- Link a tu imagen en Docker Hub: `https://hub.docker.com/r/tu-usuario/angular-frontend/tags`
- Screenshot de `kubectl get pods -w` durante el rolling update del frontend
- Screenshot del navegador mostrando el botón "Ver Info del Sistema"
- Screenshot del navegador mostrando la información del sistema cargada

---

## Parte 4: Gestión de Versiones con Rollout (20%)

### Objetivo
Aprender a gestionar versiones de deployments usando comandos de rollout (rollback, rollforward, historial).

### Tareas

#### 4.1 Ver Historial de Rollouts

```bash
# Ver historial del backend
kubectl rollout history deployment/api -n proyecto-integrador

# Ver historial del frontend
kubectl rollout history deployment/frontend -n proyecto-integrador
```

**Salida esperada:**
```
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

#### 4.2 Hacer Rollback a Versión Anterior

```bash
# Rollback del backend a v2.0
kubectl rollout undo deployment/api -n proyecto-integrador

# Ver el proceso
kubectl rollout status deployment/api -n proyecto-integrador

# Verificar que el endpoint /api/info ya NO existe
curl http://<IP-METALLB>/api/info
# Debería dar error 404
```

#### 4.3 Volver a la Versión v2.1 (Rollforward)

```bash
# Ver historial actualizado
kubectl rollout history deployment/api -n proyecto-integrador

# Rollback a la revisión 2 (que es v2.1)
kubectl rollout undo deployment/api --to-revision=2 -n proyecto-integrador

# Verificar
curl http://<IP-METALLB>/api/info
# Debería funcionar nuevamente
```

#### 4.4 Forzar Recreación de Pods

```bash
# Reiniciar deployment sin cambiar imagen (útil para debugging)
kubectl rollout restart deployment/api -n proyecto-integrador

# Ver los pods recreándose
kubectl get pods -n proyecto-integrador -w
```

**ACCIÓN REQUERIDA:** Captura los screenshots de todos los pasos de rollout (history, rollback, rollforward) solicitados en los Entregables Parte 4.

### Entregables Parte 4
- Screenshot de `kubectl rollout history` del backend
- Screenshot de `kubectl rollout history` del frontend
- Screenshot del proceso de rollback (undo)
- Screenshot verificando que `/api/info` dejó de funcionar después del rollback
- Screenshot del rollforward (undo --to-revision=2)
- Screenshot verificando que `/api/info` volvió a funcionar
- Explicación en tus propias palabras: ¿Qué hace `kubectl rollout undo`?

---

## Parte 5: Acceso Externo via Ingress + MetalLB (15%)

### Objetivo
Verificar que el acceso externo funciona correctamente sin necesidad de port-forward, simulando un entorno cloud real.

### Tareas

#### 5.1 Verificar Configuración de Ingress

```bash
# Ver configuración del Ingress
kubectl get ingress -n proyecto-integrador

# Ver detalles
kubectl describe ingress app-ingress -n proyecto-integrador
```

**Salida esperada:**
```
NAME          CLASS   HOSTS   ADDRESS       PORTS   AGE
app-ingress   nginx   *       10.0.0.100    80      2d
```

#### 5.2 Verificar MetalLB

```bash
# Ver servicios de MetalLB
kubectl get svc -n ingress

# Ver configuración de MetalLB
kubectl get ipaddresspool -n metallb-system
```

#### 5.3 Probar TODOS los Endpoints via IP Externa

Desde el navegador o curl, probar:

```bash
# Frontend
curl http://<IP-METALLB>/

# API Users
curl http://<IP-METALLB>/api/users

# API Greeting
curl http://<IP-METALLB>/api/greeting

# API Info (nuevo)
curl http://<IP-METALLB>/api/info

# Actuator Health
curl http://<IP-METALLB>/actuator/health
```

#### 5.4 Probar desde Otra Máquina en la Red (Opcional)

Si tienes otra computadora en la misma red, intenta acceder a `http://<IP-METALLB>/` para verificar que el acceso externo funciona.

**ACCIÓN REQUERIDA:** Una vez que hayas verificado que todos los endpoints son accesibles vía Ingress con MetalLB, captura los screenshots solicitados en los Entregables Parte 5.

### Entregables Parte 5
- Screenshot de `kubectl get ingress` mostrando la IP asignada
- Screenshot de `kubectl describe ingress` mostrando las rutas configuradas
- Screenshot del navegador accediendo a `http://<IP-METALLB>/` (frontend)
- Screenshot de curl a `/api/info` desde la IP de MetalLB
- Screenshot de curl a `/actuator/health` mostrando status UP
- IP del Ingress (anotar)

---

## Formato de Entrega

### Repositorio Público en GitHub o GitLab

**IMPORTANTE:** Todo el proyecto debe ser público (repositorio y Docker Hub). No se aceptan PDFs.

#### Estructura del Repositorio

1. **Publicar tu repositorio en GitHub o GitLab**
   ```bash
   # Ya debes tener Git inicializado desde el Paso 1.5
   cd proyecto-integrador-docker-k8s

   # Crear repositorio en GitHub/GitLab (vía UI) y conectarlo
   git remote add origin https://github.com/TU-USUARIO/proyecto-integrador-docker-k8s.git
   git branch -M main
   git push -u origin main
   ```

2. **README.md principal** (en la raíz) con las siguientes secciones:

   ```markdown
   # Proyecto Final - Docker & Kubernetes

   **Alumno:** [Tu Nombre Completo]
   **Fecha:** [Fecha de Entrega]
   **Curso:** Docker & Kubernetes - i-Quattro

   ## Links de Docker Hub
   - Backend v2.1: https://hub.docker.com/r/tu-usuario/springboot-api/tags
   - Frontend v2.2: https://hub.docker.com/r/tu-usuario/angular-frontend/tags

   ## Parte 1: Setup del Ambiente

   **Ambiente utilizado:**
   - [VirtualBox / VMware / AWS / GCP / Azure / DigitalOcean]
   - Nombre de VM/Instancia: [tu-nombre-completo-k8s]
   - Sistema operativo: Ubuntu 24.04 LTS
   - Recursos: 4GB RAM, 2 CPU cores
   - Red configurada: [NAT/Bridged o tipo de red en cloud]
   - Rango MetalLB: [Tu rango de IPs]

   ### Screenshots
   ![microk8s status](screenshots/parte1-microk8s-status.png)
   ![Pods running](screenshots/parte1-pods-running.png)
   ![Frontend via MetalLB](screenshots/parte1-frontend-browser.png)

   ## Parte 2: Backend v2.1
   [Descripción de cambios realizados]

   ### Código Agregado
   [Snippet del endpoint /api/info]

   ### Screenshots
   ![Docker build](screenshots/parte2-docker-build.png)
   ![Rollout](screenshots/parte2-rollout.png)
   ![API Info](screenshots/parte2-api-info.png)

   ## Parte 3: Frontend v2.2
   [Descripción de cambios en Angular]

   ### Screenshots
   ![Frontend build](screenshots/parte3-frontend-build.png)
   ![Frontend UI](screenshots/parte3-frontend-ui.png)
   ![System info display](screenshots/parte3-system-info.png)

   ## Parte 4: Gestión de Versiones

   ### ¿Qué hace kubectl rollout undo?
   [Tu explicación]

   ### Screenshots
   ![Rollback](screenshots/parte4-rollback.png)
   ![Rollforward](screenshots/parte4-rollforward.png)

   ## Parte 5: Ingress + MetalLB

   **IP del Ingress:** [Tu IP de MetalLB]

   ### Screenshots
   ![Ingress config](screenshots/parte5-ingress.png)
   ![Acceso externo](screenshots/parte5-external-access.png)

   ## Conclusiones

   ### Aprendizajes principales
   - [Punto 1]
   - [Punto 2]
   - [Punto 3]

   ### Dificultades encontradas
   - [Dificultad 1 y cómo la resolviste]
   - [Dificultad 2 y cómo la resolviste]

   ### Reflexión
   [¿Cómo aplicarías esto en un proyecto real?]
   ```

3. **Directorio screenshots/**
   - Crear directorio `screenshots/` en la raíz
   - Guardar TODOS los screenshots ahí
   - Nombrarlos siguiendo el patrón: `parteX-descripcion.png`

4. **Tags de Git**
   ```bash
   git tag -a v2.1 -m "Backend v2.1 con endpoint /api/info"
   git tag -a v2.2 -m "Frontend v2.2 con integración de /api/info"
   git push origin main --tags
   ```

5. **Docker Hub Público**
   - Tus imágenes deben ser públicas (no privadas)
   - El instructor debe poder hacer `docker pull tu-usuario/springboot-api:v2.1`

#### Qué Debe Incluir tu Repositorio

- Código fuente modificado (Java, Angular)
- Manifiestos de Kubernetes actualizados
- Screenshots de todos los pasos
- README.md completo y bien documentado
- Tags v2.1 y v2.2
- NO incluir PDFs, DOCs o archivos binarios innecesarios

---

## Criterios de Evaluación

| Criterio | Peso | Aspectos Evaluados |
|----------|------|-------------------|
| **Setup Ambiente** | 15% | - Instalación correcta de microk8s<br/>- Addons habilitados<br/>- v2.0 funcional<br/>- MetalLB configurado |
| **Backend v2.1** | 25% | - Endpoint correcto y funcional<br/>- Imagen en Docker Hub<br/>- Deployment actualizado correctamente<br/>- Rolling update evidenciado |
| **Frontend v2.2** | 25% | - UI funcional y bien integrada<br/>- Imagen en Docker Hub<br/>- Rolling update del frontend<br/>- Integración con /api/info correcta |
| **Gestión Versiones** | 20% | - Rollback ejecutado correctamente<br/>- Rollforward funcional<br/>- Comprensión de comandos rollout<br/>- Explicación clara del proceso |
| **Ingress + MetalLB** | 15% | - Acceso externo funcional<br/>- Configuración correcta de MetalLB<br/>- Todos los endpoints accesibles via IP<br/>- Documentación de configuración de red |

### Puntos Extra (Opcional, hasta +10%)

- **Validar HPA (Horizontal Pod Autoscaler)** (+5%)
  - Generar carga desde un pod busybox: `kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -n proyecto-integrador -- /bin/sh -c "while true; do wget -q -O- http://api-service:8080/api/users; done"`
  - En otra terminal, observar: `kubectl get hpa -n proyecto-integrador -w`
  - Screenshot de HPA mostrando el incremento de CPU y replicas
  - Screenshot de `kubectl get pods -n proyecto-integrador` mostrando los pods adicionales creados
  - Documentar el proceso: estado inicial → generar carga → observar escalado → detener carga (Ctrl+C) → observar scale down

- **Validar Health Probes** (+3%)
  - Forzar fallo del backend (kill process dentro del pod)
  - Screenshot de Kubernetes reiniciando el pod automáticamente
  - Explicar cómo liveness probe detectó el fallo

- **Persistencia de Datos** (+2%)
  - Eliminar el pod de PostgreSQL
  - Verificar que los datos persisten cuando se recrea
  - Screenshot del proceso

---

## Recursos de Apoyo

### Documentación Oficial
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [kubectl rollout](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources)
- [MetalLB](https://metallb.universe.tf/)
- [microk8s Documentation](https://microk8s.io/docs)

### Guías del Proyecto
- `k8s/DEPLOYMENT_GUIDE_MICROK8S.md` - Guía de despliegue completa
- `ARCHITECTURE.md` - Arquitectura del proyecto
- `README.md` - Documentación general

### Comandos Útiles

```bash
# Ver logs de un pod
kubectl logs <pod-name> -n proyecto-integrador

# Ver logs en tiempo real
kubectl logs -f <pod-name> -n proyecto-integrador

# Ver eventos del cluster
kubectl get events -n proyecto-integrador --sort-by='.lastTimestamp'

# Describir un recurso
kubectl describe deployment api -n proyecto-integrador

# Ejecutar shell dentro de un pod
kubectl exec -it <pod-name> -n proyecto-integrador -- /bin/sh

# Ver uso de recursos
kubectl top nodes
kubectl top pods -n proyecto-integrador
```

---

## Preguntas Frecuentes

### ¿Qué hago si microk8s no inicia?

```bash
# Ver logs
sudo journalctl -u snap.microk8s.daemon-kubelite

# Reiniciar
microk8s stop
microk8s start
```

### ¿Cómo reinicio todo si algo se rompe?

```bash
# Eliminar namespace completo
kubectl delete namespace proyecto-integrador

# Volver a desplegar siguiendo la guía
```

### ¿Qué rango de IPs uso para MetalLB?

Depende de tu red local. Ejecuta:
```bash
ip a show eth0
# o para ver todas las interfaces:
ip a show
```

Busca la línea con `inet` en tu interfaz de red principal (eth0, enp0s3, etc.):
```
inet 192.168.1.50/24 brd 192.168.1.255 scope global eth0
```

De este ejemplo:
- Tu IP es: `192.168.1.50`
- La máscara `/24` indica red clase C
- Tu red es: `192.168.1.0/24`
- Usa un rango alto (fuera del DHCP): `192.168.1.200-192.168.1.210`

**Importante:** El rango debe estar en la misma red pero NO en uso por DHCP del router.

### ¿Puedo usar otro editor en lugar de vi/nano?

Sí, instala tu editor favorito:
```bash
sudo apt install code  # VS Code
sudo apt install vim   # Vim
```

### ¿Cómo se verifica que el trabajo es mío?

El instructor verificará:
1. **Nombre de VM/instancia** en screenshots (debe contener tu nombre completo)
2. **Usuario del sistema** en terminal (hostname)
3. **Commits en Git** (tu nombre en el autor)
4. **Docker Hub** (tu username único)
5. **Endpoint /api/info** (debe incluir tu nombre)

Por eso es fundamental usar tu nombre real en todos lados.

### ¿Puedo usar AWS/GCP/Azure en lugar de VirtualBox/VMware?

Sí, está permitido siempre y cumpliendo:
- Tú gestionas y pagas los costos del cloud provider
- Configuras el nombre de la instancia con tu nombre completo
- Documentas claramente qué proveedor/hypervisor usaste en tu README
- Los screenshots muestren evidencia del ambiente (nombre de VM/instancia, región si es cloud, etc.)

### ¿Por qué Kubernetes no actualiza mi imagen después de hacer push a Docker Hub?

**Problema común:** Hiciste cambios en el código, reconstruiste la imagen, la publicaste en Docker Hub con el mismo tag, pero Kubernetes sigue mostrando la versión antigua.

**Causa:** Kubernetes y microk8s cachean las imágenes localmente por performance. Cuando el tag no cambia (ej: siempre v2.1), Kubernetes asume que la imagen no cambió y usa la versión cacheada.

**Soluciones:**

**Opción 1: Limpiar caché manualmente (si usas el mismo tag)**
```bash
# Ver imágenes cacheadas
sudo microk8s ctr images ls | grep tu-usuario

# Eliminar por tag
sudo microk8s ctr images rm docker.io/tu-usuario/springboot-api:v2.1

# O por digest SHA256 (si solo aparece el hash)
sudo microk8s ctr images rm docker.io/tu-usuario/springboot-api@sha256:abc123...

# Forzar rollout restart
kubectl rollout restart deployment/api -n proyecto-integrador
```

**Opción 2: Usar tags únicos (mejor práctica)**
```bash
# En lugar de reusar v2.1, usa v2.1.1, v2.1.2, etc.
docker build -t tu-usuario/springboot-api:v2.1.1 .
docker push tu-usuario/springboot-api:v2.1.1

# Actualizar deployment.yaml con el nuevo tag
kubectl set image deployment/api api=tu-usuario/springboot-api:v2.1.1 -n proyecto-integrador
```

**Verificar que la imagen se descargó:**
```bash
# Ver eventos de pull
kubectl get events -n proyecto-integrador --sort-by='.lastTimestamp' | grep -i pull

# Describir pod para ver la imagen actual
kubectl describe pod -l app=api -n proyecto-integrador | grep Image:
```

---

## Fecha de Entrega

**Fecha límite:** A definir por el instructor

**Formato:** Link al repositorio público de GitHub o GitLab

**Envío:** Vía Moodle (enlace al repositorio + enlace a Docker Hub)

---

**Instructor:** Alejandro Fiengo
**Contacto:** [alefiengo.dev](https://alefiengo.dev)
**Curso:** Docker & Kubernetes - i-Quattro

---

¡Éxito en el proyecto final!
