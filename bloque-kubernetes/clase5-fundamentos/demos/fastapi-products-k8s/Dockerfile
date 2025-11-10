# Dockerfile Multi-stage para FastAPI
# Optimizado para producción con imagen mínima

# Stage 1: Build
FROM python:3.11-slim as builder

WORKDIR /build

# Instalar dependencias de sistema necesarias para compilar
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copiar requirements y crear wheel packages
COPY app/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

LABEL maintainer="alefiengo"
LABEL description="Products API - FastAPI Demo for Kubernetes"
LABEL version="1.0.0"

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copiar wheels desde build stage
COPY --from=builder /build/wheels /wheels
COPY --from=builder /build/requirements.txt .

# Instalar dependencias desde wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels

# Copiar código de la aplicación
COPY app/ .

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Comando para ejecutar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
