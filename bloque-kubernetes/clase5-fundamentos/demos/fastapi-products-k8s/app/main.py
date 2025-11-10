from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime

app = FastAPI(
    title="Products API",
    description="API de productos para demo de Kubernetes - Clase 6",
    version="1.0.0"
)

# Modelo de datos
class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    category: str

# Base de datos en memoria (simulación)
products_db = [
    Product(id=1, name="Laptop Dell XPS 13", description="Laptop ultraportátil con procesador Intel i7", price=1299.99, stock=15, category="Electronics"),
    Product(id=2, name="Mouse Logitech MX Master 3", description="Mouse ergonómico inalámbrico", price=99.99, stock=50, category="Accessories"),
    Product(id=3, name="Teclado Mecánico Keychron K2", description="Teclado mecánico compacto RGB", price=89.99, stock=30, category="Accessories"),
    Product(id=4, name="Monitor LG 27'' 4K", description="Monitor UHD 4K IPS", price=449.99, stock=20, category="Electronics"),
    Product(id=5, name="Webcam Logitech C920", description="Webcam HD 1080p", price=79.99, stock=40, category="Accessories"),
]

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Products API - Kubernetes Demo",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "products": "/api/v1/products",
            "product_by_id": "/api/v1/products/{id}",
            "products_by_category": "/api/v1/products/category/{category}"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "products-api",
        "timestamp": datetime.utcnow().isoformat()
    }

# GET all products
@app.get("/api/v1/products", response_model=List[Product])
def get_products():
    """
    Obtener todos los productos disponibles
    """
    return products_db

# GET product by ID
@app.get("/api/v1/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    """
    Obtener un producto específico por ID
    """
    product = next((p for p in products_db if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")
    return product

# GET products by category
@app.get("/api/v1/products/category/{category}", response_model=List[Product])
def get_products_by_category(category: str):
    """
    Obtener productos por categoría
    """
    filtered_products = [p for p in products_db if p.category.lower() == category.lower()]
    if not filtered_products:
        raise HTTPException(status_code=404, detail=f"No products found in category '{category}'")
    return filtered_products

# POST create new product
@app.post("/api/v1/products", response_model=Product, status_code=201)
def create_product(product: Product):
    """
    Crear un nuevo producto
    """
    # Verificar si el ID ya existe
    if any(p.id == product.id for p in products_db):
        raise HTTPException(status_code=400, detail=f"Product with id {product.id} already exists")

    products_db.append(product)
    return product

# DELETE product by ID
@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: int):
    """
    Eliminar un producto por ID
    """
    global products_db
    product = next((p for p in products_db if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")

    products_db = [p for p in products_db if p.id != product_id]
    return {"message": f"Product {product_id} deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
