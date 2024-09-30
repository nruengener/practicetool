const mongoose = require('mongoose');
const Routine = require('../models/Routine');
const Entry = require('../models/Entry');

describe('Routine Model Test', () => {
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

    it('should create & save routine successfully', async () => {
        const entry = new Entry({
            name: 'Test Entry',
            description: 'This is a test entry',
            scheduledTime: 30
        });
        const savedEntry = await entry.save();

        const validRoutine = new Routine({
            name: 'Test Routine',
            entries: [savedEntry._id]
        });
        const savedRoutine = await validRoutine.save();
        
        // Object Id should be defined when successfully saved to MongoDB
        expect(savedRoutine._id).toBeDefined();
        expect(savedRoutine.name).toBe(validRoutine.name);
        expect(savedRoutine.entries[0].toString()).toBe(savedEntry._id.toString());
    });

    // Test Schema is working
    it('create routine without required field should fail', async () => {
        const routineWithoutRequiredField = new Routine({ entries: [] });
        let err;
        try {
            await routineWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.name).toBeDefined();
    });

    it('create routine with invalid entry id should fail', async () => {
        const routineWithInvalidEntry = new Routine({
            name: 'Invalid Routine',
            entries: [mongoose.Types.ObjectId()]
        });
        let err;
        try {
            await routineWithInvalidEntry.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
    });
});