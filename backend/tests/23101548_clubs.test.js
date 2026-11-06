
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin@1';
  
  // Check if admin already exists
  let admin = await User.findOne({ email: adminEmail });
  
  if (!admin) {
    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    admin = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      studentId: '',
      phone: ''
    });
    
    await admin.save();
  } else if (admin.role !== 'admin') {
    // Update existing user to admin
    admin.role = 'admin';
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(adminPassword, salt);
    await admin.save();
  } else {
    // Update password to ensure it's correct
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(adminPassword, salt);
    await admin.save();
  }
};

const loginAdmin = async () => {
  // Create admin user first
  await createAdminUser();
  
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@gmail.com',
      password: 'admin@1'
    });

  expect(res.statusCode).toBe(200);
  return res.body.token;
};


const registerUser = async (label) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Club User ${label}`,
      email: `club_${label}_${Date.now()}@test.com`,
      password: 'password123',
      department: 'CSE',
      studentId: `C-${Date.now()}`,
      phone: '0123456789'
    });

  expect(res.statusCode).toBe(201);
  return res.body.token;
};

describe('Club Management API', () => {
  let adminToken;
  let userToken;
  let user2Token;
  let clubId;
  let clubId2;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    userToken = await registerUser('user');
    user2Token = await registerUser('user2');
  });

  it('should list clubs (200)', async () => {
    const res = await request(app).get('/api/clubs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject creating club without token (401)', async () => {
    const res = await request(app)
      .post('/api/clubs/request')
      .field('name', 'Test Club')
      .field('category', 'academic');

    expect(res.statusCode).toBe(401);
  });

  it('should reject creating club without name (400)', async () => {
    const res = await request(app)
      .post('/api/clubs/request')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('category', 'academic');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('required');
  });

  it('should reject creating club with invalid category (400)', async () => {
    const res = await request(app)
      .post('/api/clubs/request')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Invalid Club')
      .field('category', 'invalid_category');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('category');
  });

  it('should create a club (admin) (201)', async () => {
    const res = await request(app)
      .post('/api/clubs/request')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Programming Club')
      .field('description', 'Club for programmers')
      .field('category', 'academic')
      .attach('logo', Buffer.from('logo'), 'logo.png');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Programming Club');
    expect(res.body.category).toBe('academic');
    expect(res.body.members.length).toBe(1); // Creator is automatically added
    clubId = res.body._id;
  });

  it('should create another club for testing (201)', async () => {
    const res = await request(app)
      .post('/api/clubs/request')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Sports Club')
      .field('description', 'Club for sports enthusiasts')
      .field('category', 'sports');

    expect(res.statusCode).toBe(201);
    clubId2 = res.body._id;
  });

  it('should list clubs with search filter', async () => {
    const res = await request(app).get('/api/clubs?search=Programming');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toContain('Programming');
  });

  it('should list clubs with category filter', async () => {
    const res = await request(app).get('/api/clubs?category=sports');
    expect(res.statusCode).toBe(200);
    res.body.forEach(club => {
      expect(club.category).toBe('sports');
    });
  });

  it('should reject joining club without token (401)', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/join`);

    expect(res.statusCode).toBe(401);
  });

  it('should reject joining non-existent club (404)', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/api/clubs/${fakeId}/join`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should allow user to join club (200)', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/join`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.members.length).toBeGreaterThan(1);
    expect(res.body.memberNames).toContain('Club User user');
  });

  it('should prevent duplicate join', async () => {
    // Create a new club for this test
    const createRes = await request(app)
      .post('/api/clubs/request')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Duplicate Join Test Club')
      .field('category', 'academic');
    
    const testClubId = createRes.body._id;
    const memberCountBefore = createRes.body.members.length;

    // Join first time
    const firstJoin = await request(app)
      .post(`/api/clubs/${testClubId}/join`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(firstJoin.statusCode).toBe(200);
    expect(firstJoin.body.members.length).toBe(memberCountBefore + 1);

    // Try to join again (duplicate)
    const secondJoin = await request(app)
      .post(`/api/clubs/${testClubId}/join`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(secondJoin.statusCode).toBe(200);
    expect(secondJoin.body.members.length).toBe(memberCountBefore + 1); // Should not increase
  });

  it('should allow multiple users to join club', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId2}/join`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.members.length).toBeGreaterThan(1);
  });

  it('should allow user to leave club (200)', async () => {
    // Join first
    await request(app)
      .post(`/api/clubs/${clubId2}/join`)
      .set('Authorization', `Bearer ${userToken}`);

    // Then leave
    const res = await request(app)
      .post(`/api/clubs/${clubId2}/leave`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.memberNames).not.toContain('Club User user');
  });

  it('should reject leaving club without token (401)', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/leave`);

    expect(res.statusCode).toBe(401);
  });

  it('should allow member to add announcement (201)', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/announcements`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'New announcement for the club!' });

    expect(res.statusCode).toBe(200);
    expect(res.body.announcements.length).toBeGreaterThan(0);
    const lastAnnouncement = res.body.announcements[res.body.announcements.length - 1];
    expect(lastAnnouncement.content).toBe('New announcement for the club!');
    expect(lastAnnouncement.status).toBe('pending');
  });

  it('should reject adding announcement without content (400)', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/announcements`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: '' });

    expect(res.statusCode).toBe(400);
  });

  it('should reject adding announcement without token (401)', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/announcements`)
      .send({ content: 'Test announcement' });

    expect(res.statusCode).toBe(401);
  });

  it('should allow admin to approve announcement (200)', async () => {
    // Add an announcement first
    const addRes = await request(app)
      .post(`/api/clubs/${clubId}/announcements`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Announcement to approve' });
    
    const announcementIndex = addRes.body.announcements.length - 1;

    const res = await request(app)
      .post(`/api/clubs/${clubId}/announcements/${announcementIndex}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.announcements[announcementIndex].status).toBe('approved');
  });

  it('should allow admin to reject announcement (200)', async () => {
    // Add another announcement
    const addRes = await request(app)
      .post(`/api/clubs/${clubId}/announcements`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Another announcement to reject' });

    const announcementIndex = addRes.body.announcements.length - 1;

    const res = await request(app)
      .post(`/api/clubs/${clubId}/announcements/${announcementIndex}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.announcements[announcementIndex].status).toBe('rejected');
  });

  it('should reject approving announcement by non-admin (403)', async () => {
    // Add an announcement first
    const addRes = await request(app)
      .post(`/api/clubs/${clubId}/announcements`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Announcement for non-admin test' });

    const announcementIndex = addRes.body.announcements.length - 1;

    const res = await request(app)
      .post(`/api/clubs/${clubId}/announcements/${announcementIndex}/approve`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should reject deleting club by non-admin (403)', async () => {
    const res = await request(app)
      .delete(`/api/clubs/${clubId2}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should reject deleting club without token (401)', async () => {
    const res = await request(app)
      .delete(`/api/clubs/${clubId2}`);

    expect(res.statusCode).toBe(401);
  });

  it('should allow admin to delete club (200)', async () => {
    const res = await request(app)
      .delete(`/api/clubs/${clubId2}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Club deleted successfully');
  });

  it('should return 404 when deleting non-existent club', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .delete(`/api/clubs/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should not list deleted club', async () => {
    const res = await request(app).get('/api/clubs');
    expect(res.statusCode).toBe(200);
    const clubIds = res.body.map(c => c._id.toString());
    expect(clubIds).not.toContain(clubId2);
  });
});
