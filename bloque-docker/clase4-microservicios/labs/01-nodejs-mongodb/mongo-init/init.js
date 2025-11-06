db = db.getSiblingDB('tasksdb');

db.tasks.insertMany([
  {
    title: 'Aprender Docker Compose',
    description: 'Completar los labs de la clase 4',
    completed: false,
    createdAt: new Date()
  },
  {
    title: 'Configurar MongoDB',
    description: 'Entender volúmenes y persistencia',
    completed: true,
    createdAt: new Date()
  },
  {
    title: 'Crear API REST',
    description: 'Implementar CRUD completo con Node.js',
    completed: false,
    createdAt: new Date()
  }
]);

print('Base de datos inicializada con datos de ejemplo');
