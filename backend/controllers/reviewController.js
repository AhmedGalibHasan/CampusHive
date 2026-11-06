import Review from '../models/Review.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { notifyReviewHelpful } from '../utils/notificationHelper.js';

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { teacher, course, term, rating, textContent } = req.body;

    // Use authenticated user from req.userId (set by auth middleware)
    const reviewerId = req.userId || req.body.reviewerId;
    
    if (!reviewerId) {
      return res.status(401).json({ message: 'Authentication required. Please login to post a review.' });
    }

    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate teacher exists
    const teacherDoc = await Teacher.findById(teacher);
    if (!teacherDoc) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Generate unique reviewId
    const reviewId = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const review = new Review({
      reviewId,
      reviewer: reviewer._id,
      teacher: teacherDoc._id,
      course: course.trim(),
      term: term.trim(),
      rating: parseInt(rating),
      textContent: textContent.trim(),
      positiveFlags: 0,
      negativeFlags: 0,
    });

    const savedReview = await review.save();
    
    // Populate teacher and reviewer for response
    await savedReview.populate('teacher', 'name designation email');
    await savedReview.populate('reviewer', 'name email');

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews with filtering
export const getReviews = async (req, res) => {
  try {
    const { teacher, course, term, page = 1, limit = 10, sortBy = 'date', sortOrder = 'newest' } = req.query;
    
    const query = {
      deleted: { $ne: true },
    };
    
    if (teacher) {
      // Support both ObjectId and teacherId string
      if (mongoose.Types.ObjectId.isValid(teacher)) {
        query.teacher = teacher;
      } else {
        const teacherDoc = await Teacher.findOne({ teacherId: teacher });
        if (teacherDoc) {
          query.teacher = teacherDoc._id;
        } else {
          return res.status(404).json({ message: 'Teacher not found' });
        }
      }
    }
    
    if (course) {
      query.course = { $regex: course, $options: 'i' };
    }
    
    if (term) {
      query.term = { $regex: term, $options: 'i' };
    }

    // Determine sort field and order
    let sortField = 'createdAt'; // default to date
    let sortDirection = -1; // default to newest first
    
    if (sortBy === 'date') {
      sortField = 'createdAt';
      // sortOrder: 'newest' = -1, 'oldest' = 1
      sortDirection = sortOrder === 'oldest' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortField = 'rating';
      // sortOrder: 'high' = -1, 'low' = 1
      sortDirection = sortOrder === 'low' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find(query)
      .populate('teacher', 'name designation email teacherId')
      .populate('reviewer', 'name email')
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single review by ID (May get used in future but not used currently)
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findOne({ reviewId, deleted: { $ne: true } })
      .populate('teacher', 'name designation email teacherId')
      .populate('reviewer', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Flag a review (positive or negative) - one flag per user
export const flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { flagType } = req.body; // 'positive' or 'negative'

    if (!flagType || !['positive', 'negative'].includes(flagType)) {
      return res.status(400).json({ 
        message: 'flagType must be either "positive" or "negative"' 
      });
    }

    // Use authenticated user from req.userId (set by auth middleware)
    const userObjectId = req.userId;
    
    if (!userObjectId) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login to flag a review.' 
      });
    }

    // Verify user exists
    const user = await User.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const review = await Review.findOne({ reviewId, deleted: { $ne: true } }).populate('reviewer', 'name email');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Initialize userFlags array if it doesn't exist
    if (!review.userFlags) {
      review.userFlags = [];
    }

    // Check if user has already flagged this review - now using ObjectId
    const existingFlagIndex = review.userFlags.findIndex(
      flag => flag.userId.toString() === userObjectId.toString()
    );

    if (existingFlagIndex !== -1) {
      // User has already flagged - update their flag
      const existingFlag = review.userFlags[existingFlagIndex];
      
      // If changing flag type, decrement old type and increment new type
      if (existingFlag.flagType !== flagType) {
        if (existingFlag.flagType === 'positive') {
          review.positiveFlags = Math.max(0, (review.positiveFlags || 0) - 1);
          review.negativeFlags = (review.negativeFlags || 0) + 1;
        } else {
          review.negativeFlags = Math.max(0, (review.negativeFlags || 0) - 1);
          review.positiveFlags = (review.positiveFlags || 0) + 1;
        }
        existingFlag.flagType = flagType;
      } else {
        // User is trying to flag with the same type - return without change
        return res.json({ 
          message: 'You have already flagged this review as ' + flagType,
          review: {
            reviewId: review.reviewId,
            positiveFlags: review.positiveFlags,
            negativeFlags: review.negativeFlags,
            userFlag: existingFlag.flagType,
          },
        });
      }
    } else {
      // New flag - increment the appropriate count
      // Use userObjectId (ObjectId) instead of userId (string)
      review.userFlags.push({
        userId: userObjectId, // <-- FIXED: Use ObjectId, not string
        flagType: flagType,
      });

      if (flagType === 'positive') {
        review.positiveFlags = (review.positiveFlags || 0) + 1;
        // Create notification for reviewer if not flagging own review
        if (review.reviewer && review.reviewer._id.toString() !== userObjectId.toString()) {
          await notifyReviewHelpful(review.reviewer._id, user.name, review.reviewId);
        }
      } else {
        review.negativeFlags = (review.negativeFlags || 0) + 1;
      }
    }

    await review.save();

    // Find the user's current flag - using ObjectId
    const userFlag = review.userFlags.find(
      flag => flag.userId.toString() === userObjectId.toString()
    );

    res.json({ 
      message: `Review ${flagType} flag ${existingFlagIndex !== -1 ? 'updated' : 'added'} successfully`,
      review: {
        reviewId: review.reviewId,
        positiveFlags: review.positiveFlags,
        negativeFlags: review.negativeFlags,
        userFlag: userFlag?.flagType || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review (requires authentication; only reviewer or admin)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { course, term, rating, textContent } = req.body;

    const review = await Review.findOne({ reviewId, deleted: { $ne: true } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOwner = review.reviewer.toString() === req.userId.toString();
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    const hasAnyField =
      course !== undefined ||
      term !== undefined ||
      rating !== undefined ||
      textContent !== undefined;

    if (!hasAnyField) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    if (course !== undefined) {
      if (!course || course.trim() === '') {
        return res.status(400).json({ message: 'Course is required' });
      }
      review.course = course.trim();
    }

    if (term !== undefined) {
      if (!term || term.trim() === '') {
        return res.status(400).json({ message: 'Term is required' });
      }
      review.term = term.trim();
    }

    if (rating !== undefined) {
      const parsedRating = parseInt(rating);
      if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = parsedRating;
    }

    if (textContent !== undefined) {
      if (!textContent || textContent.trim() === '') {
        return res.status(400).json({ message: 'Review text is required' });
      }
      review.textContent = textContent.trim();
    }

    review.edited = true;
    review.editedAt = new Date();

    const savedReview = await review.save();
    await savedReview.populate('teacher', 'name designation email teacherId');
    await savedReview.populate('reviewer', 'name email');

    res.json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review (soft delete) (requires authentication; only reviewer or admin)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ reviewId, deleted: { $ne: true } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOwner = review.reviewer.toString() === req.userId.toString();
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    review.deleted = true;
    review.deletedAt = new Date();
    await review.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};