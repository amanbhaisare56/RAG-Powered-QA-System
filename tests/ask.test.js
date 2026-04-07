const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

let token;

beforeAll(async () => {
  // Register and login to get token
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@test.com', password: 'password123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@test.com', password: 'password123' });

  token = res.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: 'test@test.com' });
  await mongoose.connection.close();
});

describe('POST /api/ask', () => {
  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'What is the refund policy?' });
    expect(res.statusCode).toBe(401);
  });

  it('should return structured answer with valid token', async () => {
    const res = await request(app)
      .post('/api/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What is the refund policy?' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body).toHaveProperty('sources');
    expect(res.body).toHaveProperty('confidence');
    expect(['high', 'medium', 'low']).toContain(res.body.confidence);
  });

  it('should return 400 for empty question', async () => {
    const res = await request(app)
      .post('/api/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: '' });
    expect(res.statusCode).toBe(400);
  });
});