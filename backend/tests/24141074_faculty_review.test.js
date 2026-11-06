import request from 'supertest';
import app from '../app.js';
import Teacher from '../models/Teacher.js';

const registerAndGetToken = async () => {
  const uniqueEmail = `test_${Date.now()}_${Math.random().toString(16).slice(2)}@campushive.local`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: uniqueEmail,
      password: 'password123',
      department: 'CSE',
      studentId: 'TEST24141074',
      phone: '0123456789',
    });

  expect(regRes.statusCode).toBe(201);
  expect(regRes.body).toHaveProperty('token');
  return regRes.body.token;
};

describe('Feature: Faculty Review (ID: 24141074)', () => {
  let token = '';
  let teacherId = '';
  let createdReviewId = '';

  beforeAll(async () => {
    const teacher = await Teacher.create({
      teacherId: `T-${Date.now()}-REV`,
      name: 'Review Test Teacher',
      designation: 'Lecturer',
      email: `review_teacher_${Date.now()}@campushive.local`,
      imagePath: '',
    });

    teacherId = teacher._id.toString();
    token = await registerAndGetToken();
  });

  it('creates a review (201)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        teacher: teacherId,
        course: 'CSE470',
        term: 'Fall 2025',
        rating: 5,
        textContent: 'Great course structure.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('reviewId');
    createdReviewId = res.body.reviewId;
  });

  it('rejects missing course (400)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        teacher: teacherId,
        term: 'Fall 2025',
        rating: 5,
        textContent: 'Missing course.',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toBe('Course is required');
  });

  it('rejects create review without token (401)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        teacher: teacherId,
        course: 'CSE470',
        term: 'Fall 2025',
        rating: 5,
        textContent: 'No token.',
      });

    expect(res.statusCode).toBe(401);
  });

  it('gets reviews list (200)', async () => {
    const res = await request(app).get('/api/reviews?limit=10&page=1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('reviews');
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('gets a single review by reviewId (200)', async () => {
    const res = await request(app).get(`/api/reviews/${createdReviewId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.reviewId).toBe(createdReviewId);
  });

  it('returns 404 for a non-existing reviewId', async () => {
    const res = await request(app).get('/api/reviews/REV-NOT-EXISTS');

    expect(res.statusCode).toBe(404);
    expect(res.body?.message).toBe('Review not found');
  });

  it('rejects flag review without token (401)', async () => {
    const res = await request(app)
      .post(`/api/reviews/${createdReviewId}/flag`)
      .send({ flagType: 'positive' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects flag review with invalid flagType (400)', async () => {
    const res = await request(app)
      .post(`/api/reviews/${createdReviewId}/flag`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flagType: 'invalid' });

    expect(res.statusCode).toBe(400);
  });

  it('flags a review successfully (200)', async () => {
    const res = await request(app)
      .post(`/api/reviews/${createdReviewId}/flag`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flagType: 'positive' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('review');
    expect(res.body.review).toHaveProperty('reviewId', createdReviewId);
    expect(res.body.review).toHaveProperty('userFlag', 'positive');
  });

  it('updates a review (200) and sets editedAt', async () => {
    const res = await request(app)
      .put(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 4,
        textContent: 'Updated review text.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.rating).toBe(4);
    expect(res.body.textContent).toBe('Updated review text.');
    expect(res.body).toHaveProperty('editedAt');
    expect(res.body.editedAt).toBeTruthy();
  });

  it('deletes a review (200) and it disappears from read endpoints', async () => {
    const delRes = await request(app)
      .delete(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body?.message).toBe('Review deleted successfully');

    const getRes = await request(app).get(`/api/reviews/${createdReviewId}`);
    expect(getRes.statusCode).toBe(404);

    const listRes = await request(app).get('/api/reviews?limit=50&page=1');
    expect(listRes.statusCode).toBe(200);
    const ids = (listRes.body.reviews || []).map((r) => r.reviewId);
    expect(ids).not.toContain(createdReviewId);
  });
});
