const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import your Express app
const Routine = require('../models/Routine');
const Entry = require('../models/Entry');
const SelectedRoutine = require('../models/SelectedRoutine');

describe('Selected Routine API', () => {
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
        await SelectedRoutine.deleteMany({});
    });

    describe('POST /selected-routine/:id/select', () => {
        it('should select a routine', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });
            const routine = await Routine.create({ name: 'Test Routine', entries: [entry._id] });

            const res = await request(app)
                .post(`/api/selected-routine/${routine._id}/select`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Routine selected successfully');

            const selectedRoutine = await SelectedRoutine.findOne().populate('routine');
            expect(selectedRoutine.routine._id.toString()).toEqual(routine._id.toString());
        });

        it('should return 404 if routine not found', async () => {
            const res = await request(app)
                .post(`/api/selected-routine/${mongoose.Types.ObjectId()}/select`);

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('GET /selected-routine', () => {
        it('should get the selected routine', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });
            const routine = await Routine.create({ name: 'Test Routine', entries: [entry._id] });
            await SelectedRoutine.create({ routine: routine._id });

            const res = await request(app).get('/api/selected-routine');

            expect(res.statusCode).toEqual(200);
            expect(res.body.routine.name).toEqual('Test Routine');
            expect(res.body.routine.entries).toHaveLength(1);
        });

        it('should return 404 if no routine is selected', async () => {
            const res = await request(app).get('/api/selected-routine');

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /selected-routine/entry/:entryId/add-time', () => {
        it('should add time to an entry in the selected routine', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });
            const routine = await Routine.create({ name: 'Test Routine', entries: [entry._id] });
            await SelectedRoutine.create({ routine: routine._id });

            const res = await request(app)
                .post(`/api/selected-routine/entry/${entry._id}/add-time`)
                .send({ time: 15 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Time added successfully');

            // Here you would typically check if the time was actually recorded
            // This depends on how you've implemented the time tracking in your application
        });

        it('should return 404 if no routine is selected', async () => {
            const entry = await Entry.create({ name: 'Test Entry', scheduledTime: 30 });

            const res = await request(app)
                .post(`/api/selected-routine/entry/${entry._id}/add-time`)
                .send({ time: 15 });

            expect(res.statusCode).toEqual(404);
        });

        it('should return 404 if entry not found in selected routine', async () => {
            const entry1 = await Entry.create({ name: 'Test Entry 1', scheduledTime: 30 });
            const entry2 = await Entry.create({ name: 'Test Entry 2', scheduledTime: 45 });
            const routine = await Routine.create({ name: 'Test Routine', entries: [entry1._id] });
            await SelectedRoutine.create({ routine: routine._id });

            const res = await request(app)
                .post(`/api/selected-routine/entry/${entry2._id}/add-time`)
                .send({ time: 15 });

            expect(res.statusCode).toEqual(404);
        });
    });
});