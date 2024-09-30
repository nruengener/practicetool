const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('Security and Error Handling', () => {
    describe('CORS', () => {
        it('should have CORS enabled', async () => {
            const res = await request(app).get('/');
            expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });

    describe('Helmet', () => {
        it('should have security headers set by Helmet', async () => {
            const res = await request(app).get('/');
            expect(res.headers['x-xss-protection']).toBeDefined();
            expect(res.headers['x-frame-options']).toBeDefined();
            expect(res.headers['x-content-type-options']).toBeDefined();
        });
    });

    describe('Rate Limiting', () => {
        it('should limit repeated requests', async () => {
            for (let i = 0; i < 100; i++) {
                await request(app).get('/');
            }
            const res = await request(app).get('/');
            expect(res.status).toBe(429); // Too Many Requests
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 errors', async () => {
            const res = await request(app).get('/non-existent-route');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
        });

        it('should handle validation errors', async () => {
            const res = await request(app)
                .post('/api/entries')
                .send({ name: 'Test' }); // Missing required field 'scheduledTime'
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should handle internal server errors', async () => {
            // This test assumes you have a route that intentionally throws an error for testing purposes
            // If you don't have such a route, you might need to create one or mock an internal error
            const res = await request(app).get('/api/test-error');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });
});