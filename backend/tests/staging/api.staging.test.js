const request = require('supertest');
const API_URL = process.env.API_BASE_URL; // staging VM

describe('Staging API Tests', () => {
  it('GET /api/status returns 200', async () => {
    const response = await request(API_URL).get('/api/status');
    expect(response.statusCode).toBe(200);
  });
});
