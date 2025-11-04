# 01: Tipos de Volúmenes

**Objetivo:** Entender los 3 tipos de volúmenes en Docker y sus diferencias

---

## Contexto

En Docker existen 3 tipos de volumes (volúmenes) para manejar datos:

1. **Named volumes** (volúmenes nombrados) - Gestionados por Docker
2. **Bind mounts** (montajes enlazados) - Rutas específicas del host
3. **Anonymous volumes** (volúmenes anónimos) - Temporales, sin nombre

---

## Exploración Práctica

### 1. Named Volume (Volumen Nombrado)

**Concepto:** Docker gestiona dónde se almacenan los datos. Es el método recomendado para producción.

```bash
# Crear un named volume
docker volume create mi-volumen

# Ver detalles
docker volume inspect mi-volumen

# Usar el volumen en un contenedor
docker run -d \
  --name contenedor-named \
  -v mi-volumen:/data \
  alpine sleep 3600

# Escribir datos
docker exec contenedor-named sh -c "echo 'Datos persistentes' > /data/archivo.txt"

# Eliminar contenedor
docker rm -f contenedor-named

# Crear nuevo contenedor con el mismo volumen
docker run -d \
  --name contenedor-named-2 \
  -v mi-volumen:/data \
  alpine sleep 3600

# Los datos siguen ahí
docker exec contenedor-named-2 cat /data/archivo.txt
```

**Salida esperada:**
```
Datos persistentes
```

**Características:**
- Docker gestiona la ubicación física
- Portables entre sistemas
- Mejor rendimiento
- Pueden compartirse entre contenedores
- Recomendado para producción

---

### 2. Bind Mount (Montaje Enlazado)

**Concepto:** Montas un directorio específico de tu máquina host en el contenedor.

```bash
# Crear directorio en el host
mkdir -p /tmp/mi-bind-mount
echo "Archivo desde el host" > /tmp/mi-bind-mount/host.txt

# Montar directorio del host
docker run -d \
  --name contenedor-bind \
  -v /tmp/mi-bind-mount:/app \
  alpine sleep 3600

# Ver archivo desde el contenedor
docker exec contenedor-bind ls -la /app
docker exec contenedor-bind cat /app/host.txt

# Crear archivo desde el contenedor
docker exec contenedor-bind sh -c "echo 'Desde el contenedor' > /app/contenedor.txt"

# Ver archivo en el host
cat /tmp/mi-bind-mount/contenedor.txt
```

**Salida esperada:**
```
Desde el contenedor
```

**Características:**
- Control total de la ruta
- Cambios en tiempo real (ideal para desarrollo)
- Fácil acceso desde el host
- ADVERTENCIA: Dependiente de la estructura del host
- ADVERTENCIA: Pueden haber problemas de permisos

---

### 3. Anonymous Volume (Volumen Anónimo)

**Concepto:** Docker crea un volumen sin nombre. Se elimina con el contenedor (con `-v`).

```bash
# Crear contenedor con volumen anónimo
docker run -d \
  --name contenedor-anonymous \
  -v /data \
  alpine sleep 3600

# Ver volúmenes (habrá uno con nombre aleatorio)
docker volume ls

# Escribir datos
docker exec contenedor-anonymous sh -c "echo 'Temporal' > /data/temp.txt"

# Eliminar contenedor sin -v (volumen persiste)
docker rm -f contenedor-anonymous

# El volumen anónimo sigue existiendo
docker volume ls

# Limpiar volúmenes huérfanos
docker volume prune -f
```

**Características:**
- ADVERTENCIA: Nombre aleatorio generado por Docker
- ADVERTENCIA: Se elimina con `docker rm -v` o `docker volume prune`
- ADVERTENCIA: Difícil de reutilizar
- Útil para datos verdaderamente temporales

---

## Comparación Rápida

| Tipo | Comando | Ubicación | Persistencia | Uso Común |
|------|---------|-----------|--------------|-----------|
| **Named** | `-v nombre:/path` | Docker gestiona | Alta | Producción, bases de datos |
| **Bind** | `-v /host/path:/path` | Ruta específica del host | Alta | Desarrollo, código fuente |
| **Anonymous** | `-v /path` | Docker gestiona | Baja | Datos temporales |

---

## Inspección de Volúmenes

```bash
# Listar todos los volúmenes
docker volume ls

# Detalles de un volumen específico
docker volume inspect mi-volumen

# Ver qué contenedores usan un volumen
docker ps -a --filter volume=mi-volumen

# Ubicación física (Linux)
docker volume inspect mi-volumen --format '{{ .Mountpoint }}'
```

---

## Limpieza

```bash
# Detener y eliminar contenedores
docker rm -f contenedor-named-2 contenedor-bind

# Eliminar volumen nombrado
docker volume rm mi-volumen

# Limpiar bind mount
rm -rf /tmp/mi-bind-mount

# Eliminar volúmenes no usados
docker volume prune -f
```

---

## Pregunta Clave para Estudiantes

**¿Cuál tipo de volumen usarías en cada caso?**

1. Base de datos PostgreSQL en producción → **Named volume**
2. Código fuente durante desarrollo → **Bind mount**
3. Caché de compilación temporal → **Anonymous volume**
4. Logs de aplicación que necesitas revisar → **Bind mount** o **Named volume**

---

## Conceptos Aprendidos

- Named volumes son gestionados por Docker y recomendados para producción
- Bind mounts dan control total de la ubicación, ideales para desarrollo
- Anonymous volumes son temporales y se eliminan fácilmente
- Los volúmenes persisten más allá del ciclo de vida del contenedor
- `docker volume inspect` muestra detalles y ubicación física

---

## Siguiente

[02: Tipos de Redes →](../02-tipos-redes/)

---

[← Volver a Fundamentos](../README.md)
