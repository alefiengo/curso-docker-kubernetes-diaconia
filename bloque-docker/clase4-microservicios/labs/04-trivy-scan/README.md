# Lab 01: Escaneo de Vulnerabilidades con Trivy

## Objetivo

Aprender a escanear imágenes Docker en busca de vulnerabilidades de seguridad utilizando Trivy, aplicándolo directamente al Proyecto Integrador.

---

## Comandos a ejecutar

### 1. Instalar Trivy

**Opción A: Instalación local (tradicional)**

```bash
# Ubuntu/Debian
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# macOS
brew install trivy

# Verificar instalación
trivy --version
```

**Opción B: Usar Trivy como container (recomendado)**

```bash
# Escanear imagen sin instalar Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image nginx:alpine

# Crear alias para uso más fácil
alias trivy="docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest"

# Ahora puedes usar como si estuviera instalado
trivy image nginx:alpine
```

**¿Cuál elegir?**
- **Opción A** si prefieres tener el binario instalado
- **Opción B** (recomendado) si quieres el "Docker way" sin instalación, siempre última versión

**Nota:** En los siguientes comandos usaremos Trivy directamente. Si elegiste Opción B, usa el alias o el comando docker run completo.

### 2. Escanear imagen oficial

```bash
# Escanear nginx (imagen base que usamos)
trivy image nginx:alpine

# Ver solo vulnerabilidades CRITICAL y HIGH
trivy image --severity CRITICAL,HIGH nginx:alpine
```

**Salida esperada:**
```
Total: X (CRITICAL: Y, HIGH: Z)
```

### 3. Escanear Proyecto Integrador

```bash
# Clonar proyecto integrador (si no lo tienes)
git clone https://github.com/alefiengo/proyecto-integrador-docker-k8s.git
cd proyecto-integrador-docker-k8s

# Checkout v1.0 (release Bloque Docker)
git checkout v1.0

# Build de la imagen
docker build -t springboot-api:v1.0 .

# Escanear imagen del proyecto
trivy image springboot-api:v1.0

# Escanear solo CRITICAL
trivy image --severity CRITICAL springboot-api:v1.0

# Generar reporte en JSON
trivy image -f json -o scan-results.json springboot-api:v1.0

# Generar reporte en tabla
trivy image -f table -o scan-results.txt springboot-api:v1.0
```

### 4. Escanear Dockerfile

```bash
# Escanear el Dockerfile directamente
trivy config Dockerfile
```

### 5. Remediación de Vulnerabilidades (Resolver problemas)

Una vez identificadas las vulnerabilidades, es momento de resolverlas. Aquí aprenderás el workflow completo.

#### Paso 1: Identificar vulnerabilidades con fix disponible

```bash
# Escanear mostrando solo vulnerabilidades que tienen fix
trivy image --severity CRITICAL,HIGH --ignore-unfixed=false nginx:1.24-alpine

# Analizar el reporte:
# - Package: Paquete vulnerable
# - Installed Version: Versión actual
# - Fixed Version: Versión que resuelve el problema
# - Vulnerability: CVE ID
```

**Salida esperada (ejemplo):**
```
nginx:1.24-alpine (alpine 3.18.0)

Total: 2 (CRITICAL: 1, HIGH: 1)

┌────────────┬────────────────┬──────────┬────────┬───────────────────┬───────────────┐
│  Library   │ Vulnerability  │ Severity │ Status │ Installed Version │ Fixed Version │
├────────────┼────────────────┼──────────┼────────┼───────────────────┼───────────────┤
│ libssl3    │ CVE-2024-XXXXX │ CRITICAL │ fixed  │ 3.1.4-r0          │ 3.1.4-r5      │
│ libcrypto3 │ CVE-2024-YYYYY │ HIGH     │ fixed  │ 3.1.4-r0          │ 3.1.4-r5      │
└────────────┴────────────────┴──────────┴────────┴───────────────────┴───────────────┘
```

**Análisis:**
- libssl3 y libcrypto3 tienen vulnerabilidades
- Están en versión 3.1.4-r0
- Se resuelven actualizando a 3.1.4-r5
- Fixed Version indica que hay solución disponible

#### Paso 2: Resolver actualizando la imagen base

La forma más efectiva de resolver vulnerabilidades es usar una versión más reciente de la imagen base:

```bash
# Verificar versiones disponibles en Docker Hub
# Visita: https://hub.docker.com/_/nginx/tags

# Probar con una versión más reciente
docker pull nginx:1.25-alpine
trivy image --severity CRITICAL,HIGH nginx:1.25-alpine

# Comparar resultados
echo "=== nginx:1.24-alpine ==="
trivy image --severity CRITICAL,HIGH nginx:1.24-alpine | grep "Total:"

echo "=== nginx:1.25-alpine ==="
trivy image --severity CRITICAL,HIGH nginx:1.25-alpine | grep "Total:"
```

#### Paso 3: Actualizar Dockerfile

```dockerfile
# ANTES (vulnerable)
FROM nginx:1.24-alpine

# DESPUÉS (actualizado)
FROM nginx:1.25-alpine
```

#### Paso 4: Rebuild y re-escanear

```bash
# Rebuild de la imagen
docker build -t mi-app:fixed .

# Re-escanear para verificar
trivy image --severity CRITICAL,HIGH mi-app:fixed

# Comparar con versión anterior
trivy image --severity CRITICAL,HIGH mi-app:vulnerable
trivy image --severity CRITICAL,HIGH mi-app:fixed
```

#### Ejemplo Completo: Proyecto Integrador

```bash
# 1. Escanear versión actual
trivy image --severity CRITICAL,HIGH springboot-api:v1.0

# Resultado ejemplo:
# Total: 5 (CRITICAL: 2, HIGH: 3)

# 2. Identificar imagen base en Dockerfile
grep "^FROM" Dockerfile
# FROM eclipse-temurin:17-jre-alpine

# 3. Verificar versiones más recientes
# Visita: https://hub.docker.com/_/eclipse-temurin/tags

# 4. Actualizar Dockerfile
# FROM eclipse-temurin:17-jre-alpine  (versión antigua)
# FROM eclipse-temurin:17.0.10_7-jre-alpine  (específica y reciente)

# 5. Rebuild
docker build -t springboot-api:v1.0-fixed .

# 6. Re-escanear
trivy image --severity CRITICAL,HIGH springboot-api:v1.0-fixed

# Resultado esperado:
# Total: 0-1 (CRITICAL: 0, HIGH: 0-1)  Mejorado significativamente
```

#### Paso 5: Verificar funcionalidad

```bash
# Asegurarse que la aplicación sigue funcionando
docker run -d -p 8080:8080 --name test-fixed springboot-api:v1.0-fixed

# Probar endpoint
curl http://localhost:8080/actuator/health

# Limpiar
docker stop test-fixed && docker rm test-fixed
```

#### ¿Qué hacer cuando NO hay fix disponible?

```bash
# Filtrar solo vulnerabilidades sin fix
trivy image --severity CRITICAL,HIGH nginx:alpine | grep "fixed: false"
```

**Opciones:**

1. **Evaluar el riesgo:**
   - ¿La vulnerabilidad afecta tu caso de uso específico?
   - ¿Hay mitigaciones alternativas (firewall, permisos)?

2. **Buscar imagen base alternativa:**
   ```bash
   # Probar otras bases
   trivy image --severity CRITICAL,HIGH node:18-alpine
   trivy image --severity CRITICAL,HIGH node:18-slim
   trivy image --severity CRITICAL,HIGH node:18-bookworm-slim
   ```

3. **Usar .trivyignore temporal:**
   ```bash
   # Crear archivo .trivyignore
   echo "CVE-2024-XXXXX" > .trivyignore

   # Escanear ignorando ese CVE
   trivy image --severity CRITICAL,HIGH mi-app
   ```

   **IMPORTANTE:** Documenta por qué ignoras el CVE y revisa periódicamente.

4. **Monitorear y actualizar:**
   - Configura alertas cuando haya fix disponible
   - Re-escanea periódicamente (semanal/mensual)

---

## Desglose del comando

| Flag | Descripción |
|------|-------------|
| `trivy image` | Escanea una imagen Docker |
| `--severity CRITICAL,HIGH` | Filtra por severidad |
| `-f json` | Formato de salida (json, table, sarif) |
| `-o archivo` | Guardar resultado en archivo |
| `trivy config` | Escanea archivos de configuración |

---

## Explicación detallada

### ¿Qué hace Trivy?

1. **Descarga la base de datos** de vulnerabilidades (CVE)
2. **Analiza las capas** de la imagen Docker
3. **Detecta paquetes** instalados (OS y dependencias de aplicación)
4. **Compara** con base de datos de vulnerabilidades conocidas
5. **Genera reporte** con severidad de cada vulnerabilidad

### Niveles de severidad

- **CRITICAL**: Requiere acción inmediata
- **HIGH**: Requiere atención prioritaria
- **MEDIUM**: Debe corregirse en próximo release
- **LOW**: Puede esperar
- **UNKNOWN**: Sin clasificación

### ¿Qué escanea Trivy?

- Dependencias de OS (apt, apk, yum, etc.)
- Librerías de lenguajes (npm, pip, gem, Maven, etc.)
- Archivos de configuración (Dockerfile, Kubernetes manifests)
- Licencias de software

---

## Conceptos aprendidos

- Escaneo de vulnerabilidades en imágenes Docker
- Uso de Trivy para detectar CVEs
- Interpretación de reportes de seguridad
- Niveles de severidad en vulnerabilidades
- Generación de reportes en diferentes formatos
- Escaneo de configuración (Dockerfile)

---

## Troubleshooting

### Error: "database download failed"

```bash
# Actualizar base de datos manualmente
trivy image --download-db-only

# Limpiar cache
trivy image --clear-cache
```

### Error: "permission denied" en Linux

```bash
# Usar Docker sin sudo (agregar usuario a grupo docker)
sudo usermod -aG docker $USER
newgrp docker

# O usar sudo con trivy
sudo trivy image nginx:alpine
```

### Demasiadas vulnerabilidades LOW/MEDIUM

```bash
# Filtrar solo las importantes
trivy image --severity CRITICAL,HIGH nginx:alpine

# Ignorar vulnerabilidades sin fix disponible
trivy image --ignore-unfixed nginx:alpine
```

---

## Desafío adicional

1. **Comparar imágenes base:**
   ```bash
   # Escanear diferentes bases
   trivy image --severity CRITICAL,HIGH node:18-alpine
   trivy image --severity CRITICAL,HIGH node:18-slim
   trivy image --severity CRITICAL,HIGH node:18

   # ¿Cuál tiene menos vulnerabilidades?
   ```

2. **Crear CI/CD check:**
   - ¿Cómo integrarías Trivy en un pipeline?
   - ¿Qué severidad debería bloquear el deploy?

3. **Investigar CVE específico:**
   - Busca un CVE CRITICAL en el reporte
   - Investiga en https://nvd.nist.gov/
   - ¿Cuál es el riesgo real para tu aplicación?

---

## Alternativas a Trivy (Opcional)

Existen otras herramientas de escaneo de vulnerabilidades en el mercado. Aquí un resumen de las principales:

### Docker Scout

**Descripción:** Herramienta oficial de Docker integrada en Docker Desktop.

**Limitaciones:**
- Plan gratuito: 1 repositorio con análisis continuo
- Requiere cuenta de Docker Hub
- Menos flexible para CI/CD que Trivy

**Uso básico:**

```bash
# Habilitar Docker Scout (si está disponible en tu Docker Desktop)
docker scout quickview nginx:alpine

# Escaneo completo con vulnerabilidades
docker scout cves nginx:alpine

# Ver solo CRITICAL y HIGH
docker scout cves --only-severity critical,high nginx:alpine

# Comparar dos imágenes
docker scout compare --to nginx:alpine nginx:latest
```

**Salida esperada:**
```
✓ Image stored for indexing
✓ Indexed 123 packages

  Target    │  nginx:alpine  │  0C    3H    5M    12L
    digest  │  abc123        │
```

**Ventajas:**
- Integrado en Docker Desktop (interfaz gráfica)
- Recomendaciones de actualización automáticas
- Comparación visual entre versiones

**Desventajas:**
- Limitado a 1 repositorio en plan gratuito
- Requiere estar logueado en Docker Hub
- Menos opciones de automatización que Trivy

### Otras Alternativas

| Herramienta | Tipo | Costo | Uso recomendado |
|-------------|------|-------|-----------------|
| **Trivy** | Open Source | Gratis ilimitado | Uso general, CI/CD, educación |
| **Docker Scout** | Propietario | 1 repo gratis | Uso casual integrado con Docker Desktop |
| **Snyk** | SaaS | Plan gratuito limitado | Análisis de dependencias de aplicación |
| **Grype** | Open Source | Gratis ilimitado | Alternativa a Trivy (Anchore) |
| **Clair** | Open Source | Gratis | Integración con registries privados |

### ¿Por qué este curso usa Trivy?

1. **Gratuito e ilimitado**: Sin restricciones de repositorios
2. **Open Source**: Transparente y auditable
3. **Sin fricción**: No requiere cuentas ni login
4. **Estándar de la industria**: Ampliamente adoptado en Kubernetes, CI/CD
5. **Múltiples formatos**: JSON, SARIF, table para integración
6. **Ejecutable como container**: Portable y aislado
7. **Activamente mantenido**: Actualizaciones frecuentes de CVE database

**Recomendación:** Aprende Trivy primero. Una vez domines los conceptos, puedes explorar otras herramientas según tus necesidades específicas.

---

## Recursos adicionales

- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [CVE Database (NIST)](https://nvd.nist.gov/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OWASP Container Security](https://owasp.org/www-project-docker-top-10/)
