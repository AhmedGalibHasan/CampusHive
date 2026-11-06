import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  getTeacherReviews,
} from '../controllers/teacherController.js';

const router = express.Router();

// Get all teachers (with optional search, page, limit)
router.get('/', getAllTeachers);

// Get teacher by ID
router.get('/:teacherId', getTeacherById);

// Get all reviews for a specific teacher
router.get('/:teacherId/reviews', getTeacherReviews);

export default router;

