# 02: Tipos de Redes

**Objetivo:** Entender los tipos de redes en Docker y operaciones de attach/detach

---

## Contexto

Docker tiene diferentes drivers de red para distintos escenarios:

1. **bridge** - Red aislada por defecto (más común)
2. **host** - Usa la red del host directamente
3. **none** - Sin red (contenedor aislado)
4. **custom bridge** - Redes personalizadas con DNS interno

---

## Exploración Práctica

### 1. Red Bridge (Por Defecto)

**Concepto:** Cada contenedor tiene su propia IP en una red privada. Docker hace NAT hacia el host.

```bash
# Crear contenedor sin especificar red (usa bridge por defecto)
docker run -d --name web1 nginx:alpine

# Ver la red que está usando
docker inspect web1 --format '{{ .NetworkSettings.Networks }}'

# Ver IP del contenedor
docker inspect web1 --format '{{ .NetworkSettings.IPAddress }}'

# Intentar ping desde el host (funciona)
ping -c 2 $(docker inspect web1 --format '{{ .NetworkSettings.IPAddress }}')

# Crear segundo contenedor
docker run -d --name web2 nginx:alpine

# Desde web1, intentar hacer ping a web2 por nombre (NO funciona en bridge default)
docker exec web1 ping -c 2 web2
```

**Resultado esperado:** Error - `ping: bad address 'web2'`

**Por qué:** La red `bridge` por defecto **NO tiene DNS interno**.

---

### 2. Custom Bridge Network (Con DNS)

**Concepto:** Redes personalizadas tienen DNS automático. Los contenedores se comunican por nombre.

```bash
# Crear red custom
docker network create mi-red

# Crear contenedores en la red custom
docker run -d --name app1 --network mi-red nginx:alpine
docker run -d --name app2 --network mi-red nginx:alpine

# Ahora SÍ funciona el ping por nombre (DNS interno)
docker exec app1 ping -c 2 app2
docker exec app2 ping -c 2 app1

# Ver detalles de la red
docker network inspect mi-red
```

**Salida esperada:**
```
PING app2 (172.18.0.3): 56 data bytes
64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.123 ms
```

**Características:**
- DNS automático (comunicación por nombre)
- Aislamiento entre redes
- Control de qué contenedores se comunican
- Mejor seguridad

---

### 3. Red Host

**Concepto:** El contenedor usa directamente la red del host. No hay aislamiento de red.

```bash
# Crear contenedor con red host
docker run -d --name web-host --network host nginx:alpine

# El contenedor usa directamente el puerto 80 del host
# NO necesita -p porque ya está en la red del host

# Ver que NO tiene IP propia
docker inspect web-host --format '{{ .NetworkSettings.IPAddress }}'

# Acceder directamente desde el host
curl http://localhost
```

**Salida esperada:** HTML de nginx

**Características:**
- Mejor rendimiento (sin NAT)
- ADVERTENCIA: Sin aislamiento de red
- ADVERTENCIA: No portable (funciona diferente en Mac/Windows)
- ADVERTENCIA: Conflictos de puerto si el host ya usa ese puerto

**Uso común:** Aplicaciones que necesitan máximo rendimiento de red.

---

### 4. Red None (Sin Red)

**Concepto:** El contenedor no tiene red. Completamente aislado.

```bash
# Crear contenedor sin red
docker run -d --name aislado --network none alpine sleep 3600

# Ver que NO tiene IP
docker inspect aislado --format '{{ .NetworkSettings.IPAddress }}'

# Intentar ping (falla)
docker exec aislado ping -c 2 8.8.8.8

# Solo tiene interfaz loopback
docker exec aislado ip addr show
```

**Salida esperada:** Solo `lo` (loopback)

**Uso común:**
- Procesamiento local sin acceso a red
- Máxima seguridad
- Testing de aplicaciones offline

---

## Conectar Contenedores a Redes

Hay 3 formas de conectar contenedores a una red:

### Forma 1: Al Crear el Contenedor (Recomendado)

```bash
# Crear red
docker network create red1

# Crear contenedores YA conectados a red1
docker run -d --name nginx1 --network red1 nginx:alpine
docker run -d --name nginx2 --network red1 nginx:alpine

# Verificar comunicación por nombre
docker exec nginx1 ping -c 2 nginx2
```

**Resultado:** Funciona inmediatamente

---

### Forma 2: Conectar Contenedor Existente

```bash
# Ya tenemos red1 creada

# Crear contenedores SIN especificar red
docker run -d --name nginx3 nginx:alpine
docker run -d --name nginx4 nginx:alpine

# Intentar ping (FALLA - están en redes diferentes)
docker exec nginx1 ping -c 2 nginx3
# Error: ping: bad address 'nginx3'

# Conectar nginx3 y nginx4 a red1
docker network connect red1 nginx3
docker network connect red1 nginx4

# Ahora SÍ funciona
docker exec nginx1 ping -c 2 nginx3
docker exec nginx3 ping -c 2 nginx4
```

**Importante:** nginx3 y nginx4 ahora están en **DOS redes** (bridge + red1)

---

### Forma 3: Cambiar de Red (Desconectar + Conectar)

```bash
# Crear contenedor en bridge default
docker run -d --name nginx5 nginx:alpine

# Desconectar de bridge
docker network disconnect bridge nginx5

# Conectar a red1
docker network connect red1 nginx5

# Ahora SOLO está en red1
docker exec nginx5 ping -c 2 nginx1
```

---

### Comandos Útiles

```bash
# Ver en qué redes está un contenedor
docker inspect nginx1 --format '{{ range $k, $v := .NetworkSettings.Networks }}{{ $k }} {{ end }}'

# Ver qué contenedores están en una red
docker network inspect red1 --format '{{ range .Containers }}{{ .Name }} {{ end }}'

# Desconectar de una red
docker network disconnect red1 nginx5
```

---

## Inspección de Redes

```bash
# Listar todas las redes
docker network ls

# Detalles de una red
docker network inspect mi-red

# Ver qué contenedores están en una red
docker network inspect mi-red --format '{{ range .Containers }}{{ .Name }} {{ end }}'

# Ver redes de un contenedor específico
docker inspect app1 --format '{{ json .NetworkSettings.Networks }}' | jq
```

---

## Caso Práctico: ¿Pueden Comunicarse nginx1 y nginx2?

**Pregunta frecuente:** Si creo dos contenedores nginx, ¿pueden hacer ping entre ellos?

**Respuesta:** Depende de la red.

### Escenario A: Sin Especificar Red (NO funciona)

```bash
docker run -d --name nginx1 nginx:alpine
docker run -d --name nginx2 nginx:alpine

# Intentar ping por nombre
docker exec nginx1 ping -c 2 nginx2
# Error: ping: bad address 'nginx2'
```

**Por qué:** Están en red `bridge` default que NO tiene DNS.

**Solución:**
```bash
# Crear red custom
docker network create red1

# Conectar ambos contenedores
docker network connect red1 nginx1
docker network connect red1 nginx2

# Ahora funciona
docker exec nginx1 ping -c 2 nginx2
```

---

### Escenario B: Con Red Custom (SÍ funciona)

```bash
docker network create red1
docker run -d --name nginx1 --network red1 nginx:alpine
docker run -d --name nginx2 --network red1 nginx:alpine

# Funciona inmediatamente
docker exec nginx1 ping -c 2 nginx2
```

**Lección:** Siempre usa redes custom cuando necesites comunicación entre contenedores.

---

## Comparación Rápida

| Tipo | DNS Interno | Aislamiento | Performance | Uso Común |
|------|-------------|-------------|-------------|-----------|
| **bridge (default)** | No | Sí | Normal | Contenedores simples |
| **custom bridge** | Sí | Sí | Normal | **Producción (recomendado)** |
| **host** | N/A | No | Alto | Apps de alto rendimiento |
| **none** | N/A | Total | N/A | Procesamiento offline |

---

## Limpieza

```bash
# Detener todos los contenedores
docker rm -f web1 web2 app1 app2 web-host aislado nginx1 nginx2 nginx3 nginx4 nginx5

# Eliminar redes custom
docker network rm mi-red red1

# Ver redes restantes (solo default: bridge, host, none)
docker network ls
```

---

## Pregunta Clave para Estudiantes

**¿Qué red usarías en cada escenario?**

1. App web + API + Base de datos que deben comunicarse → **custom bridge**
2. Proxy nginx que necesita máximo rendimiento → **host**
3. Procesador de archivos sin internet → **none**
4. Contenedor de prueba rápido → **bridge (default)**

**Respuesta correcta más común:** Custom bridge (con DNS interno)

---

## Conceptos Aprendidos

- La red `bridge` por defecto NO tiene DNS interno
- Redes custom tienen DNS automático (comunicación por nombre de servicio)
- Red `host` usa directamente la red del anfitrión (sin aislamiento)
- Red `none` aísla completamente el contenedor
- Puedes conectar/desconectar contenedores de redes dinámicamente
- `docker network inspect` muestra detalles y contenedores conectados

---

## Relación con Docker Compose

En los labs verás que Docker Compose:
- Crea automáticamente una red custom para cada proyecto
- Por eso los servicios se comunican por nombre (ej: `db`, `app`)
- Puedes definir múltiples redes para segmentar servicios

---

## Siguiente

Los fundamentos conceptuales sobre volúmenes/redes (contenedores vs imágenes) y la anatomía de docker-compose.yml se cubrieron en la [Clase 2 - Demos](../../clase2-dockerfiles/demos/).

---

[← Volver a Fundamentos](../README.md)
