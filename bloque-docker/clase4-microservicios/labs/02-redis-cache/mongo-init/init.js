db = db.getSiblingDB('productsdb');

db.products.insertMany([
  {
    name: 'Laptop Dell XPS 15',
    price: 1299.99,
    stock: 10,
    createdAt: new Date()
  },
  {
    name: 'Mouse Logitech MX Master 3',
    price: 99.99,
    stock: 50,
    createdAt: new Date()
  },
  {
    name: 'Teclado Mecánico Keychron K2',
    price: 89.99,
    stock: 30,
    createdAt: new Date()
  },
  {
    name: 'Monitor LG UltraWide 34"',
    price: 499.99,
    stock: 15,
    createdAt: new Date()
  },
  {
    name: 'Webcam Logitech C920',
    price: 79.99,
    stock: 25,
    createdAt: new Date()
  }
]);

print('Productos de ejemplo insertados');
