# Desafío Rápido - Clase 4

Tiempo estimado: 5 minutos

## Objetivo

Levantar el Lab 01 (Node.js + MongoDB) y realizar operaciones CRUD básicas para verificar que comprendes la comunicación entre servicios.

## Instrucciones

1. Navega al directorio del Lab 01:
```bash
cd labs/01-nodejs-mongodb
```

2. Levanta el stack:
```bash
docker compose up -d
```

3. Verifica que ambos servicios estén corriendo:
```bash
docker compose ps
```

4. Realiza las siguientes operaciones usando curl:

### a) Health check
```bash
curl http://localhost:3000/health
```

### b) Listar tareas
```bash
curl http://localhost:3000/tasks
```

### c) Crear una nueva tarea
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completar desafío rápido",
    "description": "Probar CRUD de la API",
    "completed": false
  }'
```

### d) Verificar que la tarea se creó
```bash
curl http://localhost:3000/tasks
```

## Resultado Esperado

Debes poder:
- Ver el health check con status "ok" y mongodb "connected"
- Listar las tareas (incluyendo las 3 de ejemplo + la que creaste)
- Crear una nueva tarea y recibirla con su _id generado

## Limpieza

```bash
docker compose down
```

## Entrega

No es necesario entregar este desafío, es solo para practicar en clase.
