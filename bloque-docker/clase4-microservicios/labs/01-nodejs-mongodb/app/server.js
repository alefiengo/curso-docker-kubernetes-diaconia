const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;
const MONGO_URL = 'mongodb://mongo:27017';
const DB_NAME = 'tasksdb';

app.use(express.json());

let db;

// Conectar a MongoDB
MongoClient.connect(MONGO_URL)
  .then(client => {
    console.log('Conectado a MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(error => console.error('Error conectando a MongoDB:', error));

// GET /tasks - Listar todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await db.collection('tasks').find().toArray();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/:id - Obtener una tarea por ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(req.params.id)
    });
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks - Crear nueva tarea
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const result = await db.collection('tasks').insertOne({
      title,
      description: description || '',
      completed: completed || false,
      createdAt: new Date()
    });
    res.status(201).json({
      _id: result.insertedId,
      title,
      description,
      completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /tasks/:id - Actualizar tarea
app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, description, completed, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /tasks/:id - Eliminar tarea
app.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: db ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
