# Instalación de Docker

Guía de instalación de Docker para Windows, macOS y Linux (Ubuntu).

---

## Windows

### Requisitos previos

- Windows 10 64-bit: Pro, Enterprise o Education (Build 19041 o superior)
- Windows 11 64-bit
- WSL2 habilitado ([Ver guía](INSTALL_WSL.md))
- Virtualización habilitada en BIOS

### Instalación de Docker Desktop

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop/

2. Ejecuta el instalador `Docker Desktop Installer.exe`

3. Durante la instalación, asegúrate de marcar la opción:
   - **Use WSL 2 instead of Hyper-V** (recomendado)

4. Completa la instalación y reinicia tu computadora si es necesario

5. Inicia Docker Desktop desde el menú de inicio

6. Verifica la instalación abriendo PowerShell o Terminal:

```powershell
docker --version
docker compose version
```

### Configuración recomendada para WSL2

1. Abre Docker Desktop
2. Ve a **Settings → Resources → WSL Integration**
3. Activa la integración con tu distribución de Ubuntu
4. Aplica y reinicia

---

## macOS

### Requisitos previos

- macOS 11 o superior
- Al menos 4GB de RAM
- Procesador Intel o Apple Silicon (M1/M2/M3)

### Instalación de Docker Desktop

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop/

   - **Para Mac con Intel**: Docker Desktop for Mac (Intel chip)
   - **Para Mac con Apple Silicon**: Docker Desktop for Mac (Apple chip)

2. Abre el archivo `.dmg` descargado

3. Arrastra el ícono de Docker a la carpeta **Applications**

4. Abre Docker desde **Applications**

5. Acepta los permisos necesarios cuando se soliciten

6. Verifica la instalación abriendo la Terminal:

```bash
docker --version
docker compose version
```

### Nota para Apple Silicon (M1/M2/M3)

Docker Desktop para Apple Silicon incluye emulación Rosetta 2 para ejecutar images (imágenes) x86_64. Para mejor rendimiento, usa images (imágenes) nativas ARM64 cuando estén disponibles.

---

## Linux (Ubuntu)

**Recomendación:** En Linux se recomienda instalar **Docker Engine** en lugar de Docker Desktop, ya que es más ligero y nativo del sistema.

### Opción 1: Docker Engine (Recomendado)

#### Requisitos previos

- Ubuntu 22.04 LTS, 23.04, 23.10, o 24.04 LTS
- Arquitectura: x86_64 / amd64, arm64, armhf

#### Instalación

1. Actualiza los paquetes existentes:

```bash
sudo apt update
sudo apt upgrade -y
```

2. Instala los paquetes necesarios:

```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
```

3. Agrega la clave GPG oficial de Docker:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

4. Configura el repositorio:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

5. Instala Docker Engine:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

6. Verifica la instalación:

```bash
sudo docker --version
sudo docker compose version
```

7. Prueba que Docker funciona correctamente:

```bash
sudo docker run hello-world
```

#### Configuración post-instalación (opcional pero recomendado)

Permite ejecutar Docker sin `sudo`:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

Cierra sesión y vuelve a iniciar, luego verifica:

```bash
docker run hello-world
```

#### Habilitar Docker al inicio del sistema:

```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

### Opción 2: Docker Desktop para Linux (Alternativa)

Si prefieres la interfaz gráfica de Docker Desktop:

1. Descarga el paquete `.deb` desde: https://docs.docker.com/desktop/install/ubuntu/

2. Instala el paquete:

```bash
sudo apt install ./docker-desktop-<version>-<arch>.deb
```

3. Inicia Docker Desktop:

```bash
systemctl --user start docker-desktop
```

**Nota:** Docker Desktop en Linux requiere más recursos y no es necesario para el curso. Docker Engine es suficiente.

---

## Verificación de la instalación

En cualquier sistema operativo, verifica que Docker está correctamente instalado:

```bash
docker --version
docker compose version
docker run hello-world
```

Si ves el mensaje de bienvenida de `hello-world`, ¡Docker está funcionando correctamente!

---

## Solución de problemas comunes

### Windows: "WSL 2 installation is incomplete"

- Asegúrate de tener WSL2 instalado: [Ver guía](INSTALL_WSL.md)
- Instala el kernel de actualización: https://aka.ms/wsl2kernel

### macOS: "Docker Desktop requires macOS 11 or newer"

- Actualiza tu sistema operativo a macOS Big Sur (11) o superior

### Linux: "Permission denied" al ejecutar docker

- Ejecuta los comandos de post-instalación para agregar tu usuario al grupo docker
- Cierra sesión y vuelve a iniciar

### Docker daemon no inicia

**Windows/macOS:**
```bash
# Reinicia Docker Desktop desde la aplicación
```

**Linux:**
```bash
sudo systemctl restart docker
sudo systemctl status docker
```

---

## Recursos adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Desktop para Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Docker Desktop para macOS](https://docs.docker.com/desktop/install/mac-install/)
- [Docker Engine para Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

---

[← Volver al README principal](README.md)
