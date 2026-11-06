import express from 'express';
import { 
  createPost, 
  getPosts, 
  upvotePost, 
  downvotePost,
  updatePost,
  deletePost,
  toggleSavePost,
  getSavedPosts
} from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createPost);
router.get('/', auth, getPosts);
router.get('/saved', auth, getSavedPosts);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/upvote', auth, upvotePost);
router.put('/:id/downvote', auth, downvotePost);
router.put('/:id/save', auth, toggleSavePost);

export default router;