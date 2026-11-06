import request from 'supertest';
import app from '../app.js';

const registerAndGetToken = async (suffix) => {
  const uniqueEmail = `study_${suffix}_${Date.now()}_${Math.random().toString(16).slice(2)}@campushive.local`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Study User ${suffix}`,
      email: uniqueEmail,
      password: 'password123',
      department: 'CSE',
      studentId: `STUDY-${suffix}`,
      phone: '0123456789',
    });

  expect(regRes.statusCode).toBe(201);
  return regRes.body.token;
};

describe('Feature: Study Corner / Study Rooms (ID: 24141074)', () => {
  let tokenCreator = '';
  let tokenMember = '';
  let tokenOther = '';
  let roomId = '';
  let roomNumber = null;

  beforeAll(async () => {
    tokenCreator = await registerAndGetToken('CREATOR');
    tokenMember = await registerAndGetToken('MEMBER');
    tokenOther = await registerAndGetToken('OTHER');
  });

  it('lists study rooms (200)', async () => {
    const res = await request(app).get('/api/study-rooms?limit=10&page=1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('studyRooms');
    expect(Array.isArray(res.body.studyRooms)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('rejects create room without token (401)', async () => {
    const res = await request(app)
      .post('/api/study-rooms')
      .send({ topic: 'No token room', location: 'Library' });

    expect(res.statusCode).toBe(401);
  });

  it('creates a study room (201)', async () => {
    const res = await request(app)
      .post('/api/study-rooms')
      .set('Authorization', `Bearer ${tokenCreator}`)
      .send({ topic: 'CSE470 Study Group', location: 'Library' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    roomId = res.body._id;
    roomNumber = res.body.roomNumber;
  });

  it('gets a study room by id (200)', async () => {
    const res = await request(app).get(`/api/study-rooms/${roomId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body._id).toBe(roomId);
  });

  it('gets a study room by room number (200)', async () => {
    const res = await request(app).get(`/api/study-rooms/number/${roomNumber}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('roomNumber', roomNumber);
  });

  it('rejects join without token (401)', async () => {
    const res = await request(app).post(`/api/study-rooms/${roomId}/join`);
    expect(res.statusCode).toBe(401);
  });

  it('joins a study room (200)', async () => {
    const res = await request(app)
      .post(`/api/study-rooms/${roomId}/join`)
      .set('Authorization', `Bearer ${tokenMember}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('members');
  });

  it('rejects fetching messages without token (401)', async () => {
    const res = await request(app).get(`/api/study-rooms/${roomId}/messages?limit=10&page=1`);
    expect(res.statusCode).toBe(401);
  });

  it('rejects sending message by non-member (403)', async () => {
    const res = await request(app)
      .post(`/api/study-rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${tokenOther}`)
      .send({ message: 'Hello from non-member' });

    expect(res.statusCode).toBe(403);
  });

  it('sends a message (201) and then fetches messages (200)', async () => {
    const sendRes = await request(app)
      .post(`/api/study-rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${tokenMember}`)
      .send({ message: 'Hello everyone!' });

    expect(sendRes.statusCode).toBe(201);
    expect(sendRes.body).toHaveProperty('message');

    const getRes = await request(app)
      .get(`/api/study-rooms/${roomId}/messages?limit=10&page=1`)
      .set('Authorization', `Bearer ${tokenMember}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toHaveProperty('messages');
    expect(Array.isArray(getRes.body.messages)).toBe(true);
    expect(getRes.body).toHaveProperty('pagination');
  });

  it('leaves a study room (200)', async () => {
    const res = await request(app)
      .post(`/api/study-rooms/${roomId}/leave`)
      .set('Authorization', `Bearer ${tokenMember}`);

    expect(res.statusCode).toBe(200);
  });

  it('rejects disband without token (401)', async () => {
    const res = await request(app).delete(`/api/study-rooms/${roomId}`);
    expect(res.statusCode).toBe(401);
  });

  it('rejects disband by non-creator (403)', async () => {
    const res = await request(app)
      .delete(`/api/study-rooms/${roomId}`)
      .set('Authorization', `Bearer ${tokenMember}`);

    expect(res.statusCode).toBe(403);
  });

  it('disbands the study room by creator (200)', async () => {
    const res = await request(app)
      .delete(`/api/study-rooms/${roomId}`)
      .set('Authorization', `Bearer ${tokenCreator}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.message).toBe('Study room disbanded successfully');
  });
});
