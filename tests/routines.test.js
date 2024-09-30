const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import your Express app
const Routine = require('../models/Routine');
const Entry = require('../models/Entry');

describe('Routines API', () => {
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
        await Routine.deleteMany({});
        await Entry.deleteMany({});
    });

    describe('POST /routines', () => {
        it('should create a new routine', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });

            const res = await request(app)
                .post('/api/routines')
                .send({
                    name: 'Test Routine',
                    entries: [entry._id]
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toEqual('Test Routine');
            expect(res.body.entries).toHaveLength(1);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/routines')
                .send({
                    entries: []
                });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /routines', () => {
        it('should get all routines', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });
            await Routine.create({ name: 'Routine 1', entries: [entry._id] });
            await Routine.create({ name: 'Routine 2', entries: [entry._id] });

            const res = await request(app).get('/api/routines');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(2);
        });
    });

    describe('PUT /routines/:id', () => {
        it('should update a routine', async () => {
            const entry1 = await Entry.create({ name: 'Entry 1', scheduledTime: 30 });
            const entry2 = await Entry.create({ name: 'Entry 2', scheduledTime: 45 });
            const routine = await Routine.create({ name: 'Old Name', entries: [entry1._id] });

            const res = await request(app)
                .put(`/api/routines/${routine._id}`)
                .send({
                    name: 'New Name',
                    entries: [entry1._id, entry2._id]
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual('New Name');
            expect(res.body.entries).toHaveLength(2);
        });

        it('should return 404 if routine not found', async () => {
            const res = await request(app)
                .put(`/api/routines/${mongoose.Types.ObjectId()}`)
                .send({
                    name: 'New Name',
                    entries: []
                });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /routines/:id', () => {
        it('should delete a routine', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });
            const routine = await Routine.create({ name: 'To Be Deleted', entries: [entry._id] });

            const res = await request(app).delete(`/api/routines/${routine._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Routine deleted successfully');

            const deletedRoutine = await Routine.findById(routine._id);
            expect(deletedRoutine).toBeNull();
        });

        it('should return 404 if routine not found', async () => {
            const res = await request(app).delete(`/api/routines/${mongoose.Types.ObjectId()}`);

            expect(res.statusCode).toEqual(404);
        });
    });
});