# Desafío Rápido - Clase 2

Tiempo estimado: 5 minutos

## Objetivo

Modificar un Dockerfile existente para personalizar el puerto y agregar variables de entorno.

## Instrucciones

Partiendo del Dockerfile de Node.js + Express del lab, realiza las siguientes modificaciones:

### Parte A: Cambiar el Puerto

1. Modifica el Dockerfile para que la aplicación escuche en el puerto **8080** en lugar de 3000
2. Actualiza la instrucción `EXPOSE`
3. Reconstruye la imagen con tag `nodejs-api:custom`
4. Ejecuta el container mapeando correctamente el puerto
5. Verifica que funciona accediendo a `http://localhost:8080`

**Pista:** Necesitarás usar la variable de entorno `PORT`

### Parte B: Agregar Variable de Entorno

1. Agrega una variable de entorno `APP_NAME` con valor `"Mi API Personalizada"`
2. Reconstruye la imagen
3. Ejecuta el container
4. Verifica que la variable está configurada

**Pista:** Usa la instrucción `ENV` en el Dockerfile

## Verificación

Deberías poder ejecutar:

```bash
# Verificar puerto
curl http://localhost:8080/

# Verificar variable de entorno
docker exec <container-id> env | grep APP_NAME
```

## Solución

<details>
<summary>Haz clic aquí solo si necesitas ver la solución</summary>

**Cambios en el Dockerfile:**

```dockerfile
# ... (código anterior sin cambios hasta ENV)

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=8080 \
    APP_NAME="Mi API Personalizada"

# Exponer puerto actualizado
EXPOSE 8080

# ... (resto del código)
```

**Comandos:**

```bash
# Rebuild
docker build -t nodejs-api:custom .

# Run con puerto correcto
docker run -d -p 8080:8080 --name api-custom nodejs-api:custom

# Verificar puerto
curl http://localhost:8080/

# Verificar variable
docker exec api-custom env | grep APP_NAME
```

**Salida esperada:**
```
APP_NAME=Mi API Personalizada
```

</details>

## Bonus (Opcional)

Si te sobra tiempo, intenta:
- Cambiar también la versión de Node.js de 18 a 20
- Agregar otra variable de entorno `API_VERSION=2.0`
- Modificar `app.js` para que use estas variables en la respuesta del endpoint `/`
