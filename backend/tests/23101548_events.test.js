
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
      name: `Event User ${label}`,
      email: `event_${label}_${Date.now()}@test.com`,
      password: 'password123',
      department: 'CSE',
      studentId: `E-${Date.now()}`,
      phone: '0123456789'
    });

  expect(res.statusCode).toBe(201);
  return res.body.token;
};

describe('Event Management API', () => {
  let adminToken;
  let userToken;
  let user2Token;
  let eventId;
  let eventId2;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    userToken = await registerUser('user');
    user2Token = await registerUser('user2');
  });

  it('should list events (200)', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject creating event without token (401)', async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/events/create')
      .send({
        title: 'Tech Talk',
        description: 'Tech event',
        capacity: 100,
        venue: 'Auditorium',
        startTime,
        endTime
      });

    expect(res.statusCode).toBe(401);
  });

  it('should reject creating event without required fields (400)', async () => {
    const res = await request(app)
      .post('/api/events/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Tech event'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('required');
  });

  it('should create an event (admin) (201)', async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/events/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Tech Talk',
        description: 'Tech event',
        capacity: 100,
        venue: 'Auditorium',
        startTime,
        endTime
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Tech Talk');
    expect(res.body.capacity).toBe(100);
    eventId = res.body._id;
  });

  it('should create another event with capacity for testing (201)', async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/events/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Workshop',
        description: 'Limited capacity event',
        capacity: 2,
        venue: 'Room 101',
        startTime,
        endTime
      });

    expect(res.statusCode).toBe(201);
    eventId2 = res.body._id;
  });

  it('should reject registering for event without token (401)', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`);

    expect(res.statusCode).toBe(401);
  });

  it('should reject registering for non-existent event (404)', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/api/events/${fakeId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should allow user to register for event (200)', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.attendees.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.attendees)).toBe(true);
    expect(res.body.attendeeNames).toContain('Event User user');
  });

  it('should prevent duplicate registration', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    // Should still have only one instance of the user
    const userCount = res.body.attendees.filter(a => a.toString() === res.body.attendees[0].toString()).length;
    expect(userCount).toBe(1);
  });

  it('should allow multiple users to register for event', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.attendees.length).toBeGreaterThanOrEqual(2);
  });

  it('should reject registration when event is full (400)', async () => {
    // Fill up the event with capacity 2
    await request(app)
      .post(`/api/events/${eventId2}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    await request(app)
      .post(`/api/events/${eventId2}/register`)
      .set('Authorization', `Bearer ${user2Token}`);

    // Try to register a third user
    const res = await request(app)
      .post(`/api/events/${eventId2}/register`)
      .set('Authorization', `Bearer ${await registerUser('user3')}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Event is full');
  });

  it('should allow user to cancel registration (200)', async () => {
    // Create a new event for cancel testing
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const createRes = await request(app)
      .post('/api/events/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Cancel Test Event',
        description: 'Event for cancel testing',
        capacity: 100,
        venue: 'Test Venue',
        startTime,
        endTime
      });

    const testEventId = createRes.body._id;
    const initialAttendeeCount = createRes.body.attendees.length;

    // Register for the event
    await request(app)
      .post(`/api/events/${testEventId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    // Cancel registration
    const res = await request(app)
      .post(`/api/events/${testEventId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('attendees');
    expect(res.body.attendees.length).toBe(initialAttendeeCount);
    expect(res.body.attendeeNames).not.toContain('Event User user');
  });

  it('should reject canceling registration without token (401)', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/cancel`);

    expect(res.statusCode).toBe(401);
  });

  it('should reject deleting event by non-admin (403)', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should reject deleting event without token (401)', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}`);

    expect(res.statusCode).toBe(401);
  });

  it('should allow admin to delete event (200)', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Event deleted successfully');
  });

  it('should return 404 when deleting non-existent event', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .delete(`/api/events/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should not list deleted event', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    const eventIds = res.body.map(e => e._id.toString());
    expect(eventIds).not.toContain(eventId);
  });
});
