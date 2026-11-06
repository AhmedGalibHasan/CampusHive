import express from 'express';
import {
  getAllStudyRooms,
  getStudyRoomById,
  getStudyRoomByNumber,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  disbandStudyRoom,
} from '../controllers/studyRoomController.js';
import {
  sendMessage,
  getMessages,
} from '../controllers/studyRoomMessageController.js';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';

const router = express.Router();

// Get all study rooms (with optional search, page, limit) - optional auth for message counts
router.get('/', optionalAuth, getAllStudyRooms);

// Get study room by ID
router.get('/:roomId', getStudyRoomById);

// Get study room by room number
router.get('/number/:roomNumber', getStudyRoomByNumber);

// Create a new study room (requires authentication)
router.post('/', auth, createStudyRoom);

// Join a study room (requires authentication)
router.post('/:roomId/join', auth, joinStudyRoom);

// Leave a study room (requires authentication)
router.post('/:roomId/leave', auth, leaveStudyRoom);

// Disband a study room (requires authentication, only creator)
router.delete('/:roomId', auth, disbandStudyRoom);

// Get all messages for a study room (requires authentication)
router.get('/:roomId/messages', auth, getMessages);

// Send a message to a study room (requires authentication)
router.post('/:roomId/messages', auth, sendMessage);

export default router;

