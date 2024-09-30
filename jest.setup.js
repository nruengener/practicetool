const mongoose = require('mongoose');
require('dotenv').config();

beforeAll(async () => {
  const url = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/practice-app-test';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear the database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});