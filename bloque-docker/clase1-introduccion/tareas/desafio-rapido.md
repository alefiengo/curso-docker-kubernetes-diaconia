# Desafío Rápido - Clase 1

Tiempo estimado: 5 minutos

## Objetivo

Aplicar lo aprendido sobre containers (contenedores) ejecutando un servidor web con contenido personalizado.

## Instrucciones

1. Ejecuta un container (contenedor) con **nginx** que:
   - Se ejecute en segundo plano
   - Esté disponible en el puerto **3000** de tu máquina
   - Tenga el nombre **mi-servidor**

2. Verifica que el container está corriendo correctamente

3. Accede desde tu navegador a `http://localhost:3000`

4. Detén y elimina el container cuando termines

## Comandos de ayuda

Si necesitas ayuda, recuerda que puedes consultar:

```bash
docker run --help
docker ps
docker stop --help
docker rm --help
```

## Verificación

Deberías poder:
- Ver tu container en la lista de containers corriendo
- Abrir `http://localhost:3000` en el navegador y ver la página de bienvenida de nginx
- Detener y eliminar el container sin errores

## Solución

<details>
<summary>Haz clic aquí solo si necesitas ver la solución</summary>

```bash
# 1. Ejecutar el container
docker run -d -p 3000:80 --name mi-servidor nginx

# 2. Verificar que está corriendo
docker ps

# 3. Acceder desde el navegador
# http://localhost:3000

# 4. Detener y eliminar
docker stop mi-servidor
docker rm mi-servidor
```

</details>
