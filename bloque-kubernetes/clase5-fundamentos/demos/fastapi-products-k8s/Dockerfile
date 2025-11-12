# Dockerfile Multi-stage para FastAPI
# Optimizado para producción con imagen mínima y build reproducible (wheels)

############################
# Stage 1: Builder
############################
FROM python:3.11-slim AS builder

ENV PIP_NO_CACHE_DIR=1

WORKDIR /build

# Dependencias mínimas para compilar wheels (añade más libs si tu proyecto las exige)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Asegurar pip reciente
RUN python -m pip install --upgrade pip

# Copiar requirements y construir wheels de requirements + dependencias
COPY app/requirements.txt .
# 👉 Importante: sin --no-deps, para que queden todas las dependencias en /build/wheels
RUN pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt


############################
# Stage 2: Runtime
############################
FROM python:3.11-slim AS runtime

LABEL maintainer="alefiengo"
LABEL description="Products API - FastAPI Demo for Kubernetes"
LABEL version="1.0.0"

# Ajustes de Python y pip para producción
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Usuario no-root
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copiar wheels y requirements desde el builder
COPY --from=builder /build/wheels /wheels
COPY --from=builder /build/requirements.txt .

# Instalar dependencias desde wheels (offline/reproducible) y limpiar
RUN python -m pip install --upgrade pip && \
    pip install --no-index --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels

# Copiar código de la aplicación
COPY app/ .

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 8000

# Health check (ajusta la ruta si tu app usa otra)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Comando por defecto de arranque
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
