# Tarea 3 - Aplicación Multi-Contenedor con Docker Compose

## Objetivo

Crear una aplicación multi-contenedor usando Docker Compose, aplicando los conceptos de redes, volúmenes y orquestación de servicios aprendidos en clase.

---

## Parte 1: Elegir el Stack de la Aplicación

Debes crear una aplicación con **mínimo 2 servicios**:

1. **Servicio Web**: Servidor web con contenido estático o dinámico
   - Nginx con HTML estático
   - Node.js simple con Express
   - Python con Flask/FastAPI
   - Otro servidor web que domines

2. **Base de datos**: Elige una
   - PostgreSQL
   - MySQL
   - MongoDB
   - Redis

**Nota:** La aplicación puede ser muy simple (incluso un HTML estático + base de datos). Lo importante es demostrar el uso correcto de Docker Compose, redes y volúmenes.

**Opcional (para destacar):**
- Agregar GUI de BD (Adminer, pgAdmin, mongo-express)
- API REST básica que se conecte a la BD

---

## Parte 2: Configurar Docker Compose

### 1. Docker Compose

Tu `docker-compose.yml` debe incluir:

- Al menos 2 servicios (web + db)
- Al menos 1 servicio con imagen oficial (puede ser ambos)
- Variables de entorno (si son necesarias para tu app)
- Mapeo de puertos para acceder desde el navegador
- `depends_on` (opcional pero recomendado)

### 2. Redes

- Crear 1 red custom (ejemplo: `app-network`)
- Conectar ambos servicios a la red
- Demostrar que los servicios se comunican (puede ser con `docker exec` y `ping`)

### 3. Volúmenes

- 1 **named volume** para persistencia de la base de datos
- Probar que los datos persisten después de `docker compose down` (sin `-v`)

### 4. Funcionalidad Mínima

La aplicación debe:

- Ser accesible desde el navegador (http://localhost:XXXX)
- Los 2 servicios deben estar corriendo (`docker compose ps` muestra ambos healthy/running)
- Funcionar correctamente después de `docker compose up -d`

**No es necesario** que la aplicación web se conecte realmente a la base de datos (eso es opcional). Lo importante es que ambos servicios corran y estén conectados a la red.

---

## Parte 3: Estructura del Repositorio

Estructura **mínima**:

```
tu-repo-clase3/
├── README.md                    # Documentación
├── docker-compose.yml           # Orquestación
├── .gitignore                   # Opcional
├── html/                        # Tu contenido web (si usas nginx)
│   └── index.html
└── screenshots/                 # Capturas de pantalla
```

**Nota:** Si usas solo imágenes oficiales (nginx + postgres, por ejemplo), no necesitas Dockerfile.

---

## Parte 4: Documentar en README.md

Tu README.md debe incluir:

### 1. Encabezado

```markdown
# Nombre de tu Aplicación

**Curso:** Docker & Kubernetes - Clase 3
**Estudiante:** Tu Nombre

Breve descripción (1-2 líneas) de qué hace.
```

### 2. Stack Tecnológico

```markdown
## Stack

- **App:** Node.js / Python / Go
- **Base de datos:** MongoDB / PostgreSQL / MySQL
```

### 3. Cómo Ejecutar

```markdown
## Ejecución

1. Clonar:
   ```bash
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo
   ```

2. Levantar servicios:
   ```bash
   docker compose up -d
   ```

3. Acceder:
   - API: http://localhost:3000
```

### 4. Cómo Probar

```markdown
## Verificación

1. Servicios corriendo:
   ```bash
   docker compose ps
   ```

2. Acceder a la web: http://localhost:XXXX

3. Verificar volumen persiste:
   ```bash
   docker compose down
   docker compose up -d
   docker volume ls  # debe seguir existiendo
   ```
```

### 5. Capturas de Pantalla

```markdown
## Screenshots

### Servicios corriendo
![compose ps](screenshots/services.png)

### API funcionando
![API](screenshots/api.png)
```

### 6. Conceptos Aplicados

```markdown
## Conceptos Docker

- Docker Compose con 2 servicios
- Red custom: `app-network`
- Volumen: `db-data` (persistencia)
- Variables de entorno
```

---

## Parte 5: Capturas de Pantalla

Mínimo **3 capturas**:

1. **Servicios corriendo**: `docker compose ps` mostrando ambos servicios
2. **Aplicación web funcionando**: Navegador mostrando http://localhost:XXXX
3. **Volumen persistente**: `docker volume ls` mostrando el volumen creado

**Opcional (para destacar)**:
- `docker network ls` mostrando la red custom
- `docker exec` haciendo ping entre servicios

---

## Parte 6: Entrega y Evaluación

### Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| **Docker Compose** (2 servicios bien configurados) | 30% |
| **Redes** (red custom, servicios conectados) | 20% |
| **Volúmenes** (persistencia correcta) | 20% |
| **Funcionalidad** (servicios corriendo, accesible) | 15% |
| **Documentación** (README claro con instrucciones) | 10% |
| **Screenshots** (3 capturas mínimo) | 5% |

**Total:** 100%

### Restricciones

- No copiar exactamente el lab (debe ser diferente)
- No subir `node_modules` o archivos binarios
- Repositorio público
- Debe funcionar con `git clone` + `docker compose up -d`

### Instrucciones de Entrega

1. Crear repositorio público (GitHub/GitLab)
2. Subir código con commits claros
3. Verificar que funcione desde cero
4. Entregar en Moodle: enlace + descripción breve

**Formato en Moodle**:
```
Repositorio: https://github.com/tu-usuario/tu-repo-clase3
Descripción: Nginx + PostgreSQL con Docker Compose
```

### Checklist Final

Antes de entregar, verifica:

- Repositorio público
- README.md con instrucciones claras
- `docker-compose.yml` con 2+ servicios
- Red custom declarada y usada
- Named volume declarado y usado
- 3 screenshots mínimo (compose ps, web, volume ls)
- Funciona con `docker compose up -d`
- Enlace entregado en Moodle

---

## Ayuda: Ideas de Proyectos (Muy Simples)

### Opción 1: Nginx + PostgreSQL (Más Simple)
- Nginx con HTML estático
- PostgreSQL con volumen
- **Inspirado en Lab 01 + Lab 03**
- No requiere programación

### Opción 2: Nginx + MySQL + Adminer
- Nginx con página de bienvenida
- MySQL con volumen
- Adminer (GUI para MySQL)
- 3 servicios, muy visual

### Opción 3: Node.js Simple + MongoDB
- Node.js con Express (solo "Hello World" + info de conexión)
- MongoDB con volumen
- Requiere algo de JavaScript básico

**Consejo:** La opción 1 es perfecta si quieres algo rápido. Enfócate en Docker Compose, redes y volúmenes, no en programar una aplicación compleja.

---

## Recursos Adicionales

- [Lab 01 - Compose Básico](../labs/01-compose-basico/)
- [Lab 02 - Redes](../labs/02-redes/)
- [Lab 03 - Volúmenes](../labs/03-volumenes/)
- [Cheatsheet Clase 3](../cheatsheet.md)
- [Docker Compose Docs](https://docs.docker.com/compose/)
