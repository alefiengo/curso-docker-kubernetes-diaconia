# Guía de Entrega de Tareas

Este documento explica cómo debes entregar las tareas del curso de Docker & Kubernetes.

## Formato de Entrega

Todas las tareas se entregan mediante un **repositorio público en GitHub o GitLab**.

### ¿Por qué usamos Git?

- Es la herramienta estándar en DevOps y desarrollo de software
- Tu repositorio servirá como portfolio profesional
- Puedes compartirlo en tu CV, LinkedIn o entrevistas
- Aprenderás buenas prácticas de documentación técnica
- El historial de commits demuestra tu progreso

## Configuración Inicial

### 1. Crear tu repositorio

Crea un repositorio público en GitHub o GitLab con el nombre:
```
curso-docker-kubernetes-tareas
```

### 2. Estructura del repositorio

Tu repositorio debe seguir esta estructura:

```
curso-docker-kubernetes-tareas/
├── README.md
├── clase1/
│   ├── README.md
│   └── screenshots/
├── clase2/
│   ├── README.md
│   └── screenshots/
├── clase3/
│   └── README.md
└── .gitignore
```

### 3. README.md principal

El README en la raíz debe incluir:

```markdown
# Tareas - Curso Docker & Kubernetes

**Estudiante:** [Tu Nombre]
**Curso:** [Docker & Kubernetes - i-Quattro](https://www.i-quattro.com/product-page/dok-kub-001)

## Sobre este repositorio

Este repositorio contiene la resolución de las tareas del curso de Docker & Kubernetes de i-Quattro.

## Índice de Tareas

- [Clase 1: Introducción a Containers y Docker](clase1/)
- [Clase 2: Título de la clase](clase2/)
- [Clase 3: Título de la clase](clase3/)
...
```

### 4. Archivo .gitignore

Incluye un archivo `.gitignore` básico:

```
# Archivos del sistema
.DS_Store
Thumbs.db

# Logs
*.log

# Variables de entorno (NUNCA subir credenciales)
.env
.env.local

# Archivos temporales
*.tmp
*.swp
```

## Documentación de Tareas

### Formato

Cada tarea debe documentarse en Markdown (`.md`) dentro de su carpeta correspondiente.

**Ejemplo:** La tarea de la clase 1 se documenta en `clase1/README.md`

### Qué incluir en cada tarea

Tu documentación debe contener:

1. **Título y descripción** - Qué se pidió hacer
2. **Comandos ejecutados** - Todos los comandos que usaste, uno por uno
3. **Explicación** - Breve descripción de qué hace cada comando importante
4. **Evidencia** - Screenshots, salidas de comandos, o resultados
5. **Conclusiones** - Qué aprendiste, dificultades encontradas (opcional)

### Ejemplo de documentación

```markdown
# Clase 1 - Introducción a Containers y Docker

## Objetivo

Desplegar un servidor web con nginx usando Docker.

## Desarrollo

### 1. Ejecutar el container

\`\`\`bash
docker run -d -p 8080:80 --name mi-servidor-web nginx
\`\`\`

**Explicación:** Este comando crea y ejecuta un container con nginx en segundo plano (-d), mapeando el puerto 8080 de mi máquina al puerto 80 del container.

**Salida:**
\`\`\`
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
\`\`\`

### 2. Verificar que está corriendo

\`\`\`bash
docker ps
\`\`\`

**Screenshot:**

![Container corriendo](screenshots/docker-ps.png)

### 3. Acceder desde el navegador

Accedí a `http://localhost:8080` y obtuve:

![Nginx funcionando](screenshots/nginx-browser.png)

[... continúa con el resto]

## Conclusiones

Aprendí a ejecutar containers en segundo plano y mapear puertos. Tuve una dificultad inicial con el puerto 8080 ocupado, lo resolví usando el puerto 8081 en su lugar.
```

## Screenshots y Archivos

### Organización

- Crea una carpeta `screenshots/` dentro de cada clase
- Nombra los archivos de forma descriptiva: `docker-ps.png`, `nginx-browser.png`
- Formatos aceptados: PNG, JPG, GIF

### Referencia en Markdown

```markdown
![Descripción de la imagen](screenshots/nombre-archivo.png)
```

## Entrega

### Cómo entregar

1. Completa tu tarea en tu repositorio de GitHub o GitLab
2. Asegúrate de que tu repositorio sea **público**
3. Verifica que todos los archivos estén subidos correctamente (`git push`)
4. Copia el enlace de tu repositorio (ej: `https://github.com/tu-usuario/curso-docker-kubernetes-tareas`)
5. **Ingresa a la plataforma Moodle del curso** y adjunta el enlace de tu repositorio en la actividad correspondiente

La revisión de tareas se realizará directamente en tu repositorio de GitHub/GitLab. El instructor accederá a través del enlace que proporcionaste en Moodle.

### Plazos de entrega

Cada tarea tiene una **fecha y hora límite específica** que será indicada por el instructor al momento de asignar la tarea.

**IMPORTANTE:**
- La fecha límite aplica tanto para la entrega del enlace en Moodle como para el último commit en tu repositorio
- **Cualquier actualización (commit) en tu repositorio posterior a la fecha límite será descalificada**
- Asegúrate de verificar que todo esté correcto ANTES de la fecha límite
- El historial de commits de Git es público y verificable

### Casos especiales

En circunstancias excepcionales, el instructor podría solicitar que subas archivos adicionales directamente a Moodle (ej: videos de demostración, archivos muy pesados). Esto será indicado explícitamente en la descripción de la tarea.

## Criterios de Evaluación

Las tareas serán evaluadas considerando:

- **Estructura del repositorio** - Organización clara y profesional
- **Documentación completa** - Todos los pasos documentados
- **Evidencia clara** - Screenshots y salidas de comandos legibles
- **Explicaciones** - Demostrar comprensión de lo que se hizo
- **Formato Markdown** - Uso correcto de sintaxis Markdown
- **Buenas prácticas Git** - Commits descriptivos, .gitignore apropiado

## Recursos de Ayuda

### Git y GitHub/GitLab

- [Guía de Git básico](https://git-scm.com/book/es/v2)
- [GitHub - Crear un repositorio](https://docs.github.com/es/get-started/quickstart/create-a-repo)
- [GitLab - Crear un proyecto](https://docs.gitlab.com/ee/user/project/working_with_projects.html)

### Markdown

- [Guía de Markdown](https://www.markdownguide.org/basic-syntax/)
- [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

### Comandos Git básicos

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Crear commit
git commit -m "Descripción del cambio"

# Subir cambios
git push origin main

# Ver estado
git status
```

## Preguntas Frecuentes

### ¿Puedo usar GitHub o GitLab indistintamente?

Sí, cualquiera de los dos es válido. Ambos son plataformas profesionales ampliamente usadas.

### ¿Qué hago si necesito incluir archivos grandes (videos, etc.)?

Sube el archivo a Google Drive o YouTube y coloca el enlace en tu README. No subas archivos muy pesados al repositorio Git.

### ¿Puedo hacer commits múltiples mientras trabajo en la tarea?

Sí, de hecho es recomendado. Hacer commits incrementales muestra tu proceso de trabajo.

### ¿Qué hago si cometí un error y subí credenciales por accidente?

1. Elimina el archivo inmediatamente
2. Cambia las credenciales comprometidas
3. Considera usar herramientas como `git-secrets` para prevenir esto

### ¿Debo incluir código o solo documentación?

Depende de la tarea. Si la tarea incluye escribir Dockerfiles, scripts, o archivos de configuración, súbelos al repositorio. La documentación en README.md explica qué hacen esos archivos.

## Notas Importantes

- **NUNCA subas credenciales, contraseñas, o tokens** al repositorio
- Si necesitas variables de entorno, crea un archivo `.env.example` con valores de ejemplo
- Usa `.gitignore` para evitar subir archivos sensibles
- Asegúrate de que tu repositorio sea público antes de enviar el enlace
- Esta forma de trabajar es una práctica profesional estándar en la industria

---

Si tienes dudas sobre cómo entregar las tareas, consulta con el instructor o en el grupo del curso.
