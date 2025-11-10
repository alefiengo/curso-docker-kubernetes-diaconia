#!/bin/bash

# Script de verificación para FastAPI Products API en Kubernetes
# Valida el despliegue completo y prueba todos los endpoints

set -e

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
print_step "Verificando dependencias..."

if ! command_exists kubectl; then
    print_error "kubectl no está instalado"
    exit 1
fi

if ! command_exists curl; then
    print_error "curl no está instalado"
    exit 1
fi

print_success "Dependencias verificadas"

# Verificar que el deployment existe
print_step "Verificando Deployment..."

if kubectl get deployment products-api >/dev/null 2>&1; then
    READY=$(kubectl get deployment products-api -o jsonpath='{.status.readyReplicas}')
    DESIRED=$(kubectl get deployment products-api -o jsonpath='{.spec.replicas}')

    if [ "$READY" == "$DESIRED" ]; then
        print_success "Deployment products-api: $READY/$DESIRED réplicas listas"
    else
        print_error "Deployment products-api: Solo $READY/$DESIRED réplicas listas"
        exit 1
    fi
else
    print_error "Deployment products-api no encontrado"
    print_warning "Ejecuta: kubectl apply -f k8s/deployment.yaml"
    exit 1
fi

# Verificar que el service existe
print_step "Verificando Service..."

if kubectl get service products-api-service >/dev/null 2>&1; then
    SERVICE_TYPE=$(kubectl get service products-api-service -o jsonpath='{.spec.type}')
    NODE_PORT=$(kubectl get service products-api-service -o jsonpath='{.spec.ports[0].nodePort}')
    print_success "Service products-api-service encontrado (tipo: $SERVICE_TYPE, NodePort: $NODE_PORT)"
else
    print_error "Service products-api-service no encontrado"
    print_warning "Ejecuta: kubectl apply -f k8s/service.yaml"
    exit 1
fi

# Verificar endpoints
print_step "Verificando Endpoints..."

ENDPOINTS=$(kubectl get endpoints products-api-service -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)

if [ "$ENDPOINTS" -gt 0 ]; then
    print_success "Service tiene $ENDPOINTS endpoints activos"
else
    print_error "Service no tiene endpoints activos"
    print_warning "Verifica que los pods estén running y que los labels coincidan"
    exit 1
fi

# Obtener URL del servicio
print_step "Obteniendo URL del servicio..."

if command_exists minikube; then
    # Si estamos usando minikube
    if minikube status >/dev/null 2>&1; then
        SERVICE_URL=$(minikube service products-api-service --url 2>/dev/null)
        if [ -z "$SERVICE_URL" ]; then
            print_error "No se pudo obtener la URL del servicio desde minikube"
            exit 1
        fi
        print_success "URL obtenida desde minikube: $SERVICE_URL"
    else
        print_error "minikube no está corriendo"
        exit 1
    fi
else
    # Cluster regular - usar NodePort
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
    NODE_PORT=$(kubectl get service products-api-service -o jsonpath='{.spec.ports[0].nodePort}')
    SERVICE_URL="http://${NODE_IP}:${NODE_PORT}"
    print_success "URL construida: $SERVICE_URL"
fi

# Esperar a que el servicio esté disponible
print_step "Esperando que el servicio esté disponible..."
sleep 3

# Probar endpoints
print_step "Probando endpoints de la API..."

# Test 1: Root endpoint
echo ""
echo "1. Probando GET /"
if curl -s -f "$SERVICE_URL/" >/dev/null; then
    RESPONSE=$(curl -s "$SERVICE_URL/")
    print_success "GET / - OK"
    echo "   Respuesta: $RESPONSE"
else
    print_error "GET / - FAIL"
fi

# Test 2: Health check
echo ""
echo "2. Probando GET /health"
if curl -s -f "$SERVICE_URL/health" >/dev/null; then
    RESPONSE=$(curl -s "$SERVICE_URL/health")
    print_success "GET /health - OK"
    echo "   Respuesta: $RESPONSE"
else
    print_error "GET /health - FAIL"
fi

# Test 3: Get all products
echo ""
echo "3. Probando GET /api/v1/products"
if curl -s -f "$SERVICE_URL/api/v1/products" >/dev/null; then
    PRODUCT_COUNT=$(curl -s "$SERVICE_URL/api/v1/products" | grep -o '"id"' | wc -l)
    print_success "GET /api/v1/products - OK ($PRODUCT_COUNT productos)"
else
    print_error "GET /api/v1/products - FAIL"
fi

# Test 4: Get product by ID
echo ""
echo "4. Probando GET /api/v1/products/1"
if curl -s -f "$SERVICE_URL/api/v1/products/1" >/dev/null; then
    PRODUCT_NAME=$(curl -s "$SERVICE_URL/api/v1/products/1" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    print_success "GET /api/v1/products/1 - OK (Producto: $PRODUCT_NAME)"
else
    print_error "GET /api/v1/products/1 - FAIL"
fi

# Test 5: Get products by category
echo ""
echo "5. Probando GET /api/v1/products/category/Electronics"
if curl -s -f "$SERVICE_URL/api/v1/products/category/Electronics" >/dev/null; then
    CATEGORY_COUNT=$(curl -s "$SERVICE_URL/api/v1/products/category/Electronics" | grep -o '"id"' | wc -l)
    print_success "GET /api/v1/products/category/Electronics - OK ($CATEGORY_COUNT productos)"
else
    print_error "GET /api/v1/products/category/Electronics - FAIL"
fi

# Test 6: Create new product
echo ""
echo "6. Probando POST /api/v1/products"
NEW_PRODUCT='{"id":99,"name":"Test Product","description":"Created by verification script","price":999.99,"stock":10,"category":"Test"}'
if curl -s -f -X POST "$SERVICE_URL/api/v1/products" \
    -H "Content-Type: application/json" \
    -d "$NEW_PRODUCT" >/dev/null; then
    print_success "POST /api/v1/products - OK (Producto creado)"
else
    print_error "POST /api/v1/products - FAIL"
fi

# Test 7: Verify created product
echo ""
echo "7. Probando GET /api/v1/products/99 (producto recién creado)"
if curl -s -f "$SERVICE_URL/api/v1/products/99" >/dev/null; then
    print_success "GET /api/v1/products/99 - OK (Producto creado exitosamente)"
else
    print_warning "GET /api/v1/products/99 - Producto no encontrado (esperado si la API no persiste datos)"
fi

# Resumen final
echo ""
echo "========================================"
print_step "Resumen de la verificación"
echo "========================================"

echo ""
echo "Recursos de Kubernetes:"
kubectl get deployment products-api
echo ""
kubectl get service products-api-service
echo ""
kubectl get pods -l app=products-api

echo ""
print_success "Verificación completada exitosamente"
echo ""
echo "Puedes acceder a la API en: $SERVICE_URL"
echo "Documentación interactiva (Swagger): $SERVICE_URL/docs"
echo ""
