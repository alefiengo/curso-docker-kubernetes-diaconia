# Contenido Bonus

Este documento lista herramientas y recursos complementarios que pueden ser útiles para gestionar y visualizar entornos Docker y Kubernetes.

---

## Portainer - Gestión Visual de Containers

**Portainer** es una plataforma de gestión ligera con interfaz web que permite administrar entornos Docker y Kubernetes de forma visual, sin necesidad de usar únicamente la línea de comandos.

### ¿Qué es Portainer?

Portainer es una herramienta open-source que proporciona una interfaz gráfica intuitiva para:
- Gestionar containers, imágenes, volúmenes y redes
- Visualizar logs y estadísticas en tiempo real
- Desplegar aplicaciones mediante templates
- Administrar múltiples entornos desde una sola interfaz
- Controlar accesos mediante roles y equipos

### Versiones

- **Portainer Community Edition (CE)**: Versión gratuita para uso personal y comercial
- **Portainer Business Edition (BE)**: Versión empresarial con características avanzadas

### Casos de Uso

- Visualizar el estado de containers y recursos durante el desarrollo
- Facilitar el troubleshooting con acceso rápido a logs y consolas
- Realizar demos y capacitaciones de forma visual
- Gestionar entornos de testing y staging
- Administrar clusters de Kubernetes sin kubectl

### Portainer para Docker

Permite gestionar:
- Containers (start, stop, restart, logs, stats, console)
- Imágenes (pull, build, push)
- Volúmenes (create, browse, manage)
- Redes (create, connect containers)
- Stacks (Docker Compose deployments)

**Instalación rápida:**
```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Acceso: http://localhost:9000

### Portainer para Kubernetes

Permite gestionar:
- Namespaces
- Deployments, StatefulSets, DaemonSets
- Pods (logs, console, stats)
- Services, Ingress
- ConfigMaps, Secrets
- PersistentVolumes y PersistentVolumeClaims
- Helm charts

**Instalación rápida:**
```bash
kubectl create namespace portainer
kubectl apply -n portainer -f https://downloads.portainer.io/ce2-21/portainer.yaml
```

Acceso via port-forward:
```bash
kubectl port-forward -n portainer svc/portainer 9443:9443
```

Luego abrir: https://localhost:9443

### Recursos Oficiales

- **Sitio web**: https://www.portainer.io/
- **Documentación**: https://docs.portainer.io/
- **GitHub**: https://github.com/portainer/portainer
- **Community Forums**: https://community.portainer.io/

### Alternativas

Otras herramientas similares que puedes explorar:
- **Rancher**: Gestión de clusters Kubernetes multi-cloud
- **Lens**: IDE de Kubernetes para desarrolladores
- **k9s**: Terminal UI para Kubernetes
- **Kubernetes Dashboard**: Dashboard oficial de Kubernetes
- **Docker Desktop**: Interfaz integrada para Docker en Windows/macOS

---

**Nota**: El uso de Portainer es completamente opcional. Todas las funcionalidades del curso se pueden realizar mediante línea de comandos con `docker`, `docker compose` y `kubectl`.
