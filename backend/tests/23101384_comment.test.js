import request from 'supertest';
import app from '../app.js';

const registerUser = async (label) => {
  const uniqueEmail = `comment_${label}_${Date.now()}_${Math.random().toString(16).slice(2)}@campushive.local`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Comment User ${label}`,
      email: uniqueEmail,
      password: 'password123',
      department: 'CSE',
      studentId: `COMMENT-${label}`,
      phone: '0123456789',
    });

  expect(regRes.statusCode).toBe(201);
  return { token: regRes.body.token, userId: regRes.body.user.id };
};

describe('Feature: Comments (ID: 24141074)', () => {
  let postAuthor = { token: '', userId: '' };
  let commenter = { token: '', userId: '' };
  let postId = '';
  let commentId = '';

  beforeAll(async () => {
    postAuthor = await registerUser('AUTHOR');
    commenter = await registerUser('COMMENTER');

    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${postAuthor.token}`)
      .send({ content: 'Post for comments', tags: ['comments'] });

    expect(postRes.statusCode).toBe(201);
    postId = postRes.body._id;
  });

  it('rejects fetching comments without token (401)', async () => {
    const res = await request(app).get(`/api/comments/${postId}`);
    expect(res.statusCode).toBe(401);
  });

  it('returns 404 when commenting on missing post', async () => {
    const res = await request(app)
      .post('/api/comments/000000000000000000000000')
      .set('Authorization', `Bearer ${commenter.token}`)
      .send({ content: 'This post does not exist' });

    expect(res.statusCode).toBe(404);
    expect(res.body?.message).toBe('Post not found');
  });

  it('creates a comment (201)', async () => {
    const res = await request(app)
      .post(`/api/comments/${postId}`)
      .set('Authorization', `Bearer ${commenter.token}`)
      .send({ content: 'First comment content' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    commentId = res.body._id;
  });

  it('gets comments list (200)', async () => {
    const res = await request(app)
      .get(`/api/comments/${postId}`)
      .set('Authorization', `Bearer ${commenter.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map((c) => c._id.toString());
    expect(ids).toContain(commentId);
  });

  it('rejects updating comment by non-owner (403)', async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${postAuthor.token}`)
      .send({ content: 'Not my comment' });

    expect(res.statusCode).toBe(403);
    expect(res.body?.message).toBe('Not authorized to edit this comment');
  });

  it('updates comment by owner (200)', async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${commenter.token}`)
      .send({ content: 'Edited comment text' });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Edited comment text');
  });

  it('rejects deleting comment by non-owner (403)', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${postAuthor.token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.message).toBe('Not authorized to delete this comment');
  });

  it('deletes comment by owner (200) and removes it from list', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${commenter.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.message).toBe('Comment deleted successfully');

    const listRes = await request(app)
      .get(`/api/comments/${postId}`)
      .set('Authorization', `Bearer ${commenter.token}`);

    expect(listRes.statusCode).toBe(200);
    const ids = listRes.body.map((c) => c._id.toString());
    expect(ids).not.toContain(commentId);
  });
});
