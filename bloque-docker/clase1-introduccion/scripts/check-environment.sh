#!/usr/bin/env bash
# Verifica que el entorno Docker esté correctamente configurado

echo "Verificando instalación de Docker..."
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker no está instalado"
    exit 1
fi

echo "[OK] Docker instalado: $(docker --version)"

echo -e "\nVerificando que Docker esté ejecutándose..."
if ! docker info &> /dev/null; then
    echo "[ERROR] Docker no está en ejecución. Inicia Docker Desktop o el servicio Docker."
    exit 1
fi

echo "[OK] Docker está en ejecución"
echo -e "\nTu entorno está listo para los laboratorios."
