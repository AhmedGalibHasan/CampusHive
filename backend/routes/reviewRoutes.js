import express from 'express';
import {
  addReview,
  getReviews,
  getReviewById,
  flagReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { validateReview } from '../middleware/validation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create a new review (requires authentication)
router.post('/', auth, validateReview, addReview);

// Get reviews with filtering (query params: teacher, course, term, page, limit)
router.get('/', getReviews);

// Get single review by reviewId
router.get('/:reviewId', getReviewById);

// Update a review (requires authentication)
router.put('/:reviewId', auth, updateReview);

// Delete a review (requires authentication)
router.delete('/:reviewId', auth, deleteReview);

// Flag a review (requires authentication)
router.post('/:reviewId/flag', auth, flagReview);

export default router;

