-- Script de inicialización para PostgreSQL
-- Este archivo se ejecuta automáticamente al crear el contenedor

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, email) VALUES
    ('Juan Pérez', 'juan@example.com'),
    ('María García', 'maria@example.com'),
    ('Carlos López', 'carlos@example.com');

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0
);

INSERT INTO productos (nombre, precio, stock) VALUES
    ('Laptop Dell', 1200.00, 15),
    ('Mouse Logitech', 25.50, 100),
    ('Teclado Mecánico', 89.99, 50);
