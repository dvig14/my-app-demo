const request = require('supertest');
const app = require('./app'); 

describe('GET /api/status', () => {
  it('should return status message', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', '✅ App running fine!');
  });
});
