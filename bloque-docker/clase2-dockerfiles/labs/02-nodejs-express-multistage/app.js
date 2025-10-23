const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Endpoint raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Node.js + Express!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de usuarios (dummy data)
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
      { id: 2, name: 'María García', email: 'maria@example.com' },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com' }
    ]
  });
});

// Endpoint para obtener un usuario por ID
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const users = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
    { id: 2, name: 'María García', email: 'maria@example.com' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com' }
  ];

  const user = users.find(u => u.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
