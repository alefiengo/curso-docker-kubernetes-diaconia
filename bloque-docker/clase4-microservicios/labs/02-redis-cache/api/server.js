const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { createClient } = require('redis');

const app = express();
const PORT = 4000;
const MONGO_URL = 'mongodb://mongo:27017';
const DB_NAME = 'productsdb';
const CACHE_TTL = 60; // 60 segundos

app.use(express.json());

let db;
let redisClient;

// Conectar a MongoDB
MongoClient.connect(MONGO_URL)
  .then(client => {
    console.log('Conectado a MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(error => console.error('Error conectando a MongoDB:', error));

// Conectar a Redis
(async () => {
  redisClient = createClient({
    socket: {
      host: 'redis',
      port: 6379
    }
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));
  redisClient.on('connect', () => console.log('Conectado a Redis'));

  await redisClient.connect();
})();

// Middleware de cache
const cacheMiddleware = (keyPrefix) => {
  return async (req, res, next) => {
    const cacheKey = `${keyPrefix}:${req.params.id || 'all'}`;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json({
          source: 'cache',
          data: JSON.parse(cachedData)
        });
      }

      console.log(`Cache MISS: ${cacheKey}`);
      req.cacheKey = cacheKey;
      next();
    } catch (error) {
      console.error('Error en cache:', error);
      next();
    }
  };
};

// GET /products - Listar todos los productos (con cache)
app.get('/products', cacheMiddleware('products'), async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();

    // Guardar en cache
    await redisClient.setEx(req.cacheKey, CACHE_TTL, JSON.stringify(products));

    res.json({
      source: 'database',
      data: products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /products/:id - Obtener producto por ID (con cache)
app.get('/products/:id', cacheMiddleware('product'), async (req, res) => {
  try {
    const product = await db.collection('products').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Guardar en cache
    await redisClient.setEx(req.cacheKey, CACHE_TTL, JSON.stringify(product));

    res.json({
      source: 'database',
      data: product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /products - Crear producto (invalida cache)
app.post('/products', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const result = await db.collection('products').insertOne({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      createdAt: new Date()
    });

    // Invalidar cache de lista de productos
    await redisClient.del('products:all');

    res.status(201).json({
      _id: result.insertedId,
      name,
      price,
      stock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /products/:id - Actualizar producto (invalida cache)
app.put('/products/:id', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, price: parseFloat(price), stock: parseInt(stock), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Invalidar cache del producto y lista
    await redisClient.del(`product:${req.params.id}`);
    await redisClient.del('products:all');

    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /products/:id - Eliminar producto (invalida cache)
app.delete('/products/:id', async (req, res) => {
  try {
    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Invalidar cache del producto y lista
    await redisClient.del(`product:${req.params.id}`);
    await redisClient.del('products:all');

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /cache/stats - Estadísticas de cache
app.get('/cache/stats', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    const stats = {
      totalKeys: keys.length,
      keys: keys
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /cache/clear - Limpiar todo el cache
app.delete('/cache/clear', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: 'Cache limpiado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const redisPing = await redisClient.ping();
    res.json({
      status: 'ok',
      mongodb: db ? 'connected' : 'disconnected',
      redis: redisPing === 'PONG' ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API con cache escuchando en http://localhost:${PORT}`);
});
