import express from 'express';
import { 
  sendMessage, 
  getAllUsers, 
  getChatList,
  getChat, 
  markAsRead,
  deleteMessage,
  addReaction,
  removeReaction,
  startTyping,
  stopTyping,
  getTypingStatus
} from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/send', auth, sendMessage);
router.get('/list', auth, getChatList); // New chat list endpoint
router.get('/users', auth, getAllUsers); // Legacy endpoint
router.get('/:userId', auth, getChat);
router.put('/:userId/read', auth, markAsRead);
router.delete('/message/:messageId', auth, deleteMessage);
router.post('/message/:messageId/reaction', auth, addReaction);
router.delete('/message/:messageId/reaction', auth, removeReaction);
router.post('/typing/start', auth, startTyping);
router.post('/typing/stop', auth, stopTyping);
router.get('/typing/:userId', auth, getTypingStatus);

export default router;