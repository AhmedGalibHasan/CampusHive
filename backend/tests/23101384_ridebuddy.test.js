import request from 'supertest';
import app from '../app.js';

const registerUser = async (label) => {
  const uniqueEmail = `ride_${label}_${Date.now()}_${Math.random().toString(16).slice(2)}@campushive.local`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Ride User ${label}`,
      email: uniqueEmail,
      password: 'password123',
      department: 'CSE',
      studentId: `RIDE-${label}`,
      phone: '0123456789',
    });

  expect(regRes.statusCode).toBe(201);
  return { token: regRes.body.token, userId: regRes.body.user.id };
};

const normalizeId = (value) => {
  if (typeof value === 'string') return value;
  if (value?._id) return value._id.toString();
  return value?.toString?.();
};

describe('Feature: RideBuddy (ID: 24141074)', () => {
  let owner = { token: '', userId: '' };
  let passenger = { token: '', userId: '' };
  let extraPassenger = { token: '', userId: '' };
  let rideId = '';

  beforeAll(async () => {
    owner = await registerUser('OWNER');
    passenger = await registerUser('PASSENGER');
    extraPassenger = await registerUser('EXTRA');
  });

  it('rejects creating a ride without token (401)', async () => {
    const res = await request(app)
      .post('/api/rides')
      .send({ vehicleType: 'car', fromLocation: 'Campus', toLocation: 'Downtown', rideDate: new Date(), rideTime: '09:00' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects invalid vehicle type (400)', async () => {
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ vehicleType: 'plane', fromLocation: 'Campus', toLocation: 'Downtown', rideDate: new Date(), rideTime: '09:00' });

    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toContain('Invalid vehicle type');
  });

  it('creates a ride (201)', async () => {
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        vehicleType: 'car',
        maxCapacity: 1,
        fromLocation: 'Campus Gate',
        toLocation: 'City Center',
        rideDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        rideTime: '10:00',
        description: 'Morning ride',
        contactInfo: '0123456789',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    rideId = res.body._id;
  });

  it('lists rides (200) with availability info', async () => {
    const res = await request(app)
      .get('/api/rides')
      .set('Authorization', `Bearer ${passenger.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ride = res.body.find((r) => r._id.toString() === rideId);
    expect(ride).toBeTruthy();
    expect(ride).toHaveProperty('acceptedCount');
    expect(ride).toHaveProperty('isFull');
    expect(ride).toHaveProperty('availableSpots');
  });

  it('rejects owner sending pair request to own ride (400)', async () => {
    const res = await request(app)
      .post(`/api/rides/${rideId}/pair-request`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toBe('You cannot request your own ride');
  });

  it('sends a pair request (200)', async () => {
    const res = await request(app)
      .post(`/api/rides/${rideId}/pair-request`)
      .set('Authorization', `Bearer ${passenger.token}`);

    expect(res.statusCode).toBe(200);
    const pending = res.body.pairRequests || [];
    const pairReq = pending.find((req) => normalizeId(req.user) === passenger.userId);
    expect(pairReq).toBeTruthy();
    expect(pairReq.status).toBe('pending');
  });

  it('owner accepts the pair request (200) and ride can become full', async () => {
    const res = await request(app)
      .put(`/api/rides/${rideId}/pair-request`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ requestUserId: passenger.userId, status: 'accepted' });

    expect(res.statusCode).toBe(200);
    const requests = res.body.pairRequests || [];
    const accepted = requests.find((req) => normalizeId(req.user) === passenger.userId);
    expect(accepted?.status).toBe('accepted');
    expect(res.body.status).toBe('full');
    const acceptedCount = requests.filter((req) => req.status === 'accepted').length;
    expect(acceptedCount).toBeGreaterThanOrEqual(res.body.maxCapacity || 1);
  });

  it('rejects additional requests when ride is full (400)', async () => {
    const res = await request(app)
      .post(`/api/rides/${rideId}/pair-request`)
      .set('Authorization', `Bearer ${extraPassenger.token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toMatch(/no longer accepting requests|full/i);
  });
});
