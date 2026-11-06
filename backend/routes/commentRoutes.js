import express from 'express';
import { createComment, getComments, deleteComment, updateComment } from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/:postId', auth, createComment);
router.get('/:postId', auth, getComments);
router.put('/:commentId', auth, updateComment);
router.delete('/:commentId', auth, deleteComment);

export default router;

