const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import your Express app
const Entry = require('../models/Entry');

describe('Entries API', () => {
    beforeAll(async () => {
        // Connect to a test database before running the tests
        await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/practice-app-test', { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
    });

    afterAll(async () => {
        // Disconnect from the test database after all tests are done
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await Entry.deleteMany({});
    });

    describe('POST /entries', () => {
        it('should create a new entry', async () => {
            const res = await request(app)
                .post('/api/entries')
                .send({
                    name: 'Test Entry',
                    description: 'This is a test entry',
                    scheduledTime: 30
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toEqual('Test Entry');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/entries')
                .send({
                    name: 'Test Entry'
                });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /entries', () => {
        it('should get all entries', async () => {
            await Entry.create({ name: 'Entry 1', scheduledTime: 30 });
            await Entry.create({ name: 'Entry 2', scheduledTime: 45 });

            const res = await request(app).get('/api/entries');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(2);
        });
    });

    describe('PUT /entries/:id', () => {
        it('should update an entry', async () => {
            const entry = await Entry.create({ name: 'Old Name', scheduledTime: 30 });

            const res = await request(app)
                .put(`/api/entries/${entry._id}`)
                .send({
                    name: 'New Name',
                    scheduledTime: 45
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual('New Name');
            expect(res.body.scheduledTime).toEqual(45);
        });

        it('should return 404 if entry not found', async () => {
            const res = await request(app)
                .put(`/api/entries/${mongoose.Types.ObjectId()}`)
                .send({
                    name: 'New Name',
                    scheduledTime: 45
                });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /entries/:id', () => {
        it('should delete an entry', async () => {
            const entry = await Entry.create({ name: 'To Be Deleted', scheduledTime: 30 });

            const res = await request(app).delete(`/api/entries/${entry._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Entry deleted successfully');

            const deletedEntry = await Entry.findById(entry._id);
            expect(deletedEntry).toBeNull();
        });

        it('should return 404 if entry not found', async () => {
            const res = await request(app).delete(`/api/entries/${mongoose.Types.ObjectId()}`);

            expect(res.statusCode).toEqual(404);
        });
    });
});