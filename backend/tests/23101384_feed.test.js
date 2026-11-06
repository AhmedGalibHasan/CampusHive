import request from 'supertest';
import app from '../app.js';

const registerUser = async (label) => {
  const uniqueEmail = `feed_${label}_${Date.now()}_${Math.random().toString(16).slice(2)}@campushive.local`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Feed User ${label}`,
      email: uniqueEmail,
      password: 'password123',
      department: 'CSE',
      studentId: `FEED-${label}`,
      phone: '0123456789',
    });

  expect(regRes.statusCode).toBe(201);
  return { token: regRes.body.token, userId: regRes.body.user.id };
};

describe('Feature: Feed / Posts (ID: 24141074)', () => {
  let author = { token: '', userId: '' };
  let reactor = { token: '', userId: '' };
  let postId = '';

  beforeAll(async () => {
    author = await registerUser('AUTHOR');
    reactor = await registerUser('REACTOR');
  });

  it('rejects listing posts without token (401)', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(401);
  });

  it('creates a post (201)', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${author.token}`)
      .send({ content: 'Hello CampusHive feed!', tags: ['intro', 'news'] });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    postId = res.body._id;
  });

  it('lists posts (200)', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${author.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map((p) => p._id.toString());
    expect(ids).toContain(postId);
  });

  it('rejects update by non-owner (403)', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${reactor.token}`)
      .send({ content: 'Trying to edit', tags: ['forbidden'] });

    expect(res.statusCode).toBe(403);
    expect(res.body?.message).toBe('Not authorized to edit this post');
  });

  it('updates the post by owner (200) and marks edited', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${author.token}`)
      .send({ content: 'Updated feed content', tags: ['updated'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Updated feed content');
    expect(res.body.edited).toBe(true);
    expect(res.body.editedAt).toBeTruthy();
  });

  it('upvotes then downvotes a post by another user (200)', async () => {
    const upvoteRes = await request(app)
      .put(`/api/posts/${postId}/upvote`)
      .set('Authorization', `Bearer ${reactor.token}`);

    expect(upvoteRes.statusCode).toBe(200);
    const upvoteIds = (upvoteRes.body.upvotes || []).map((id) => id.toString());
    expect(upvoteIds).toContain(reactor.userId);

    const downvoteRes = await request(app)
      .put(`/api/posts/${postId}/downvote`)
      .set('Authorization', `Bearer ${reactor.token}`);

    expect(downvoteRes.statusCode).toBe(200);
    const downvoteIds = (downvoteRes.body.downvotes || []).map((id) => id.toString());
    expect(downvoteIds).toContain(reactor.userId);
    const remainingUpvotes = (downvoteRes.body.upvotes || []).map((id) => id.toString());
    expect(remainingUpvotes).not.toContain(reactor.userId);
  });

  it('saves and unsaves a post (200)', async () => {
    const saveRes = await request(app)
      .put(`/api/posts/${postId}/save`)
      .set('Authorization', `Bearer ${reactor.token}`);

    expect(saveRes.statusCode).toBe(200);
    const savedBy = (saveRes.body.savedBy || []).map((id) => id.toString());
    expect(savedBy).toContain(reactor.userId);

    const savedList = await request(app)
      .get('/api/posts/saved')
      .set('Authorization', `Bearer ${reactor.token}`);

    expect(savedList.statusCode).toBe(200);
    const savedIds = savedList.body.map((p) => p._id.toString());
    expect(savedIds).toContain(postId);

    const unsaveRes = await request(app)
      .put(`/api/posts/${postId}/save`)
      .set('Authorization', `Bearer ${reactor.token}`);

    expect(unsaveRes.statusCode).toBe(200);
    const unsavedBy = (unsaveRes.body.savedBy || []).map((id) => id.toString());
    expect(unsavedBy).not.toContain(reactor.userId);
  });

  it('deletes the post by owner (200) and removes it from listings', async () => {
    const delRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${author.token}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body?.message).toBe('Post deleted successfully');

    const listRes = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${author.token}`);

    expect(listRes.statusCode).toBe(200);
    const ids = listRes.body.map((p) => p._id.toString());
    expect(ids).not.toContain(postId);
  });
});
