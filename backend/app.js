import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import clubRoutes from './routes/clubs.js';
import eventRoutes from './routes/events.js';
import studyRoomRoutes from './routes/studyRoomRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from file only for non-test runs.
// In tests we set env programmatically (e.g., mongodb-memory-server).
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

const assertRequiredEnv = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }
};

const app = express();

let dbPromise;
const initDb = () => {
  if (!dbPromise) {
    assertRequiredEnv();
    dbPromise = connectDB();
  }
  return dbPromise;
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from backend/public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'CampusHive API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export { initDb };
export default app;
