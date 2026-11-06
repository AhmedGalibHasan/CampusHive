import request from 'supertest';
import app from '../app.js';
import Teacher from '../models/Teacher.js';

describe('Feature: Teachers Directory (ID: 24141074)', () => {
  const seed = {
    teacherId: 'TEST-TEACHER-24141074',
    name: 'Test Teacher 24141074',
    designation: 'Lecturer',
    email: 'test_teacher_24141074@campushive.local',
    imagePath: '',
  };

  beforeAll(async () => {
    await Teacher.create(seed);
  });

  it('GET /api/teachers returns list (200) with expected shape', async () => {
    const res = await request(app).get('/api/teachers?limit=10&page=1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('teachers');
    expect(Array.isArray(res.body.teachers)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/teachers/:teacherId returns teacher (200)', async () => {
    const created = await Teacher.findOne({ teacherId: seed.teacherId });

    const res = await request(app).get(`/api/teachers/${created._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', seed.name);
  });

  it('GET /api/teachers/:teacherId/reviews returns reviews list (200)', async () => {
    const created = await Teacher.findOne({ teacherId: seed.teacherId });

    const res = await request(app).get(`/api/teachers/${created._id}/reviews?limit=10&page=1`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('reviews');
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/teachers/:teacherId returns 404 for unknown teacher', async () => {
    const res = await request(app).get('/api/teachers/NOT-A-REAL-TEACHER-ID');
    expect(res.statusCode).toBe(404);
  });
});
