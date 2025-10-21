# Instalación de WSL2 + Ubuntu 24.04 LTS en Windows

Guía rápida para configurar el entorno de desarrollo en Windows usando WSL2 (Windows Subsystem for Linux).

---

## Requisitos previos

- Windows 10 versión 2004 o superior (Build 19041 o superior) o Windows 11
- Permisos de administrador en tu equipo

---

## Paso 1: Habilitar WSL

Abre **PowerShell** o **Windows Terminal** como **Administrador** y ejecuta:

```powershell
wsl --install
```

Este comando habilita las características necesarias y instala Ubuntu como distribución predeterminada.

---

## Paso 2: Reiniciar el equipo

Después de la instalación, reinicia tu computadora para aplicar los cambios.

---

## Paso 3: Configurar Ubuntu

Al iniciar Ubuntu por primera vez, se te pedirá crear un usuario y contraseña:

```bash
Enter new UNIX username: tu_usuario
New password: ********
Retype new password: ********
```

> **Nota:** La contraseña no se mostrará mientras la escribes.

---

## Paso 4: Actualizar el sistema

Una vez dentro de Ubuntu, actualiza los paquetes:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Paso 5: Verificar la instalación

Verifica que estás usando WSL2:

```bash
wsl --list --verbose
```

Deberías ver algo como:

```
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

Si aparece VERSION 1, actualiza a WSL2:

```powershell
wsl --set-version Ubuntu-24.04 2
```

---

## Paso 6: Instalar una distribución específica (opcional)

Si necesitas instalar Ubuntu 24.04 LTS específicamente:

```powershell
wsl --install -d Ubuntu-24.04
```

Para ver todas las distribuciones disponibles:

```powershell
wsl --list --online
```

---

## Configuración adicional recomendada

### Establecer Ubuntu como distribución predeterminada

```powershell
wsl --set-default Ubuntu-24.04
```

### Integración con Windows Terminal

Windows Terminal detecta automáticamente WSL. Puedes configurarlo como perfil predeterminado en:

`Configuración → Perfil predeterminado → Ubuntu-24.04`

### Acceso a archivos de Windows desde WSL

Los archivos de Windows están disponibles en:

```bash
cd /mnt/c/Users/tu_usuario/
```

### Acceso a archivos de WSL desde Windows

Abre el Explorador de Windows y escribe en la barra de direcciones:

```
\\wsl$\Ubuntu-24.04\home\tu_usuario
```

---

## Solución de problemas comunes

### Error: "WSL 2 requires an update to its kernel component"

Descarga e instala el paquete de actualización del kernel:
https://aka.ms/wsl2kernel

### Ver logs de WSL

```powershell
wsl --status
```

### Reiniciar WSL

```powershell
wsl --shutdown
```

---

## Recursos adicionales

- [Documentación oficial de WSL](https://docs.microsoft.com/es-es/windows/wsl/)
- [Guía de instalación de Docker en WSL2](https://docs.docker.com/desktop/wsl/)

---

[← Volver al README principal](README.md)
