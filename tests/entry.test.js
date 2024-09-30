const mongoose = require('mongoose');
const Entry = require('../models/Entry');

describe('Entry Model Test', () => {
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

    it('should create & save entry successfully', async () => {
        const validEntry = new Entry({
            name: 'Test Entry',
            description: 'This is a test entry',
            scheduledTime: 30
        });
        const savedEntry = await validEntry.save();
        
        // Object Id should be defined when successfully saved to MongoDB
        expect(savedEntry._id).toBeDefined();
        expect(savedEntry.name).toBe(validEntry.name);
        expect(savedEntry.description).toBe(validEntry.description);
        expect(savedEntry.scheduledTime).toBe(validEntry.scheduledTime);
    });

    // Test Schema is working
    it('create entry without required field should fail', async () => {
        const entryWithoutRequiredField = new Entry({ name: 'Test' });
        let err;
        try {
            await entryWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.scheduledTime).toBeDefined();
    });
});