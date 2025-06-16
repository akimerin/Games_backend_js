// server.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 8001;


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');           
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);  
  next();
});

app.use(express.json());
app.use(express.static('public'));

async function getDbCollection(dbAdress, dbName, dbCollectionName) {
  const client = new MongoClient(dbAdress);
  await client.connect();
  const db = client.db(dbName);
  return db.collection(dbCollectionName);
}

app.get('/tasks', async (req, res) => {
  const col = await getDbCollection('mongodb://localhost', 'todoapp', 'tasks');
  const data = await col.find({}).toArray();
  res.json(data);
});

app.get('/tasks/:id', async (req, res) => {
  const col = await getDbCollection('mongodb://localhost', 'todoapp', 'tasks');
  const item = await col.findOne({ _id: new ObjectId(req.params.id) });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/tasks', async (req, res) => {
  const task = { ...req.body, done: false };
  const col = await getDbCollection('mongodb://localhost', 'todoapp', 'tasks');
  await col.insertOne(task);
  res.json(task);
});

app.patch('/tasks/:id', async (req, res) => {
  const { _id, ...toUpdate } = req.body;
  const col = await getDbCollection('mongodb://localhost', 'todoapp', 'tasks');
  const result = await col.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: toUpdate }
  );
  if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
  const updated = await col.findOne({ _id: new ObjectId(req.params.id) });
  res.json(updated);
});

app.delete('/tasks/:id', async (req, res) => {
  const col = await getDbCollection('mongodb://localhost', 'todoapp', 'tasks');
  const result = await col.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
