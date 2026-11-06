import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initDb } from '../app.js';

let mongoServer;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_24141074';
process.env.PORT = '0';

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongoServer.getUri();

	await initDb();
	await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongoServer) {
		await mongoServer.stop();
	}
});
