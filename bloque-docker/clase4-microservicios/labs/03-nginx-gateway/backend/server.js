const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Simular base de datos en memoria
let users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, name: 'María García', email: 'maria@example.com' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com' }
];

// GET /users
app.get('/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET /users/:id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  res.json({ success: true, data: user });
});

// POST /users
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// Info del servicio
app.get('/info', (req, res) => {
  res.json({
    service: 'Backend API',
    version: '1.0.0',
    endpoints: ['/users', '/users/:id', '/health', '/info']
  });
});

app.listen(PORT, () => {
  console.log(`Backend API escuchando en puerto ${PORT}`);
});
