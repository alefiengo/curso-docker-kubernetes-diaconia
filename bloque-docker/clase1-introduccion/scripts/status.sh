#!/usr/bin/env bash
# Muestra el estado actual de contenedores, imágenes y recursos

echo "=== Estado del Sistema Docker ==="
echo

echo "CONTENEDORES"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "IMAGENES"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo

echo "USO DE DISCO"
docker system df
