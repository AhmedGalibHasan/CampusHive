import request from 'supertest';
import app from '../app.js';

const registerUser = async (label) => {
  const uniqueEmail = `chat_${label}_${Date.now()}_${Math.random().toString(16).slice(2)}@campushive.local`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Chat User ${label}`,
      email: uniqueEmail,
      password: 'password123',
      department: 'CSE',
      studentId: `CHAT-${label}`,
      phone: '0123456789',
    });

  expect(regRes.statusCode).toBe(201);
  return { token: regRes.body.token, userId: regRes.body.user.id };
};

describe('Feature: Chat (ID: 24141074)', () => {
  let userA = { token: '', userId: '' };
  let userB = { token: '', userId: '' };
  let messageId = '';

  beforeAll(async () => {
    userA = await registerUser('A');
    userB = await registerUser('B');
  });

  it('rejects chat list without token (401)', async () => {
    const res = await request(app).get('/api/chat/list');
    expect(res.statusCode).toBe(401);
  });

  it('sends a message (201)', async () => {
    const res = await request(app)
      .post('/api/chat/send')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ receiverId: userB.userId, message: 'Hello from A' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    messageId = res.body._id;
  });

  it('lists chats with last message (200)', async () => {
    const res = await request(app)
      .get('/api/chat/list')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const entry = res.body.find((u) => u._id.toString() === userA.userId);
    expect(entry).toBeTruthy();
    expect(entry.lastMessage).toBeTruthy();
    expect(entry.lastMessage.senderId.toString()).toBe(userA.userId);
  });

  it('fetches chat thread (200)', async () => {
    const res = await request(app)
      .get(`/api/chat/${userA.userId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map((m) => m._id.toString());
    expect(ids).toContain(messageId);
  });

  it('marks messages as read (200)', async () => {
    const res = await request(app)
      .put(`/api/chat/${userA.userId}/read`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.message).toBe('Messages marked as read');
  });

  it('adds and removes a reaction (200)', async () => {
    const addRes = await request(app)
      .post(`/api/chat/message/${messageId}/reaction`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ emoji: 'ok' });

    expect(addRes.statusCode).toBe(200);
    const reactions = addRes.body.reactions || [];
    const normalizeId = (userField) => {
      if (typeof userField === 'string') return userField;
      if (userField?._id) return userField._id.toString();
      return userField?.toString?.();
    };
    const reaction = reactions.find((r) => normalizeId(r.user) === userB.userId);
    expect(reaction).toBeTruthy();
    expect(reaction.emoji).toBe('ok');

    const removeRes = await request(app)
      .delete(`/api/chat/message/${messageId}/reaction`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(removeRes.statusCode).toBe(200);
    const remaining = removeRes.body.reactions || [];
    const stillThere = remaining.find((r) => r.user.toString() === userB.userId);
    expect(stillThere).toBeUndefined();
  });

  it('handles typing indicator (start -> true -> stop -> false)', async () => {
    const startRes = await request(app)
      .post('/api/chat/typing/start')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ receiverId: userB.userId });

    expect(startRes.statusCode).toBe(200);

    const statusRes = await request(app)
      .get(`/api/chat/typing/${userA.userId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.body.typing).toBe(true);

    const stopRes = await request(app)
      .post('/api/chat/typing/stop')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ receiverId: userB.userId });

    expect(stopRes.statusCode).toBe(200);

    const statusAfterStop = await request(app)
      .get(`/api/chat/typing/${userA.userId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(statusAfterStop.statusCode).toBe(200);
    expect(statusAfterStop.body.typing).toBe(false);
  });

  it('deletes a message (200) and removes it from chat', async () => {
    const delRes = await request(app)
      .delete(`/api/chat/message/${messageId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body?.message).toBe('Message deleted successfully');

    const threadRes = await request(app)
      .get(`/api/chat/${userB.userId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(threadRes.statusCode).toBe(200);
    const ids = threadRes.body.map((m) => m._id.toString());
    expect(ids).not.toContain(messageId);
  });
});
