#!/usr/bin/env bash
# Limpia contenedores, imágenes y recursos no utilizados

echo "Limpiando recursos Docker..."

echo -e "\n[1/3] Deteniendo contenedores..."
containers=$(docker ps -q)
if [ -n "$containers" ]; then
    docker stop $containers
    echo "[OK] Contenedores detenidos"
else
    echo "No hay contenedores en ejecución"
fi

echo -e "\n[2/3] Eliminando contenedores..."
all_containers=$(docker ps -aq)
if [ -n "$all_containers" ]; then
    docker rm -f $all_containers
    echo "[OK] Contenedores eliminados"
else
    echo "No hay contenedores para eliminar"
fi

echo -e "\n[3/3] Eliminando imágenes no utilizadas..."
docker image prune -f

echo -e "\n[OK] Limpieza completa"
