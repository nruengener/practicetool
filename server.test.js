const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server'); // {{ import MongoMemoryServer }}

let mongoServer;
let client;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();

  client = new MongoClient(mongoURI, { 
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    socketTimeoutMS: 3000
  });

  await client.connect();
  db = client.db('practice_app');
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

test('should connect to MongoDB', () => {
  expect(db).toBeDefined();
});