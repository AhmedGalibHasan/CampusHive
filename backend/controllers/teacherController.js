import Teacher from '../models/Teacher.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';


// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const teachers = await Teacher.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get average ratings for each teacher
    const teachersWithRatings = await Promise.all(
      teachers.map(async (teacher) => {
        const ratingData = await Review.aggregate([
          { $match: { teacher: teacher._id, deleted: { $ne: true } } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ]);

        return {
          ...teacher.toObject(),
          averageRating: ratingData.length > 0 
            ? parseFloat(ratingData[0].averageRating.toFixed(2)) 
            : 0,
          totalReviews: ratingData.length > 0 ? ratingData[0].totalReviews : 0,
        };
      })
    );

    const total = await Teacher.countDocuments(query);

    res.json({
      teachers: teachersWithRatings,
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


// Get teacher by ID with reviews summary
export const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    let teacher;
    if (mongoose.Types.ObjectId.isValid(teacherId)) {
      teacher = await Teacher.findById(teacherId);
    } else {
      teacher = await Teacher.findOne({ teacherId });
    }

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get rating statistics
    const ratingData = await Review.aggregate([
      { $match: { teacher: teacher._id, deleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let averageRating = 0;
    let totalReviews = 0;

    if (ratingData.length > 0) {
      ratingData[0].ratingDistribution.forEach((rating) => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
      averageRating = parseFloat(ratingData[0].averageRating.toFixed(2));
      totalReviews = ratingData[0].totalReviews;
    }

    res.json({
      ...teacher.toObject(),
      averageRating,
      totalReviews,
      ratingDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all reviews for a specific teacher
export const getTeacherReviews = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { course, term, page = 1, limit = 10 } = req.query;
    
    // Validate teacher exists
    let teacher;
    if (mongoose.Types.ObjectId.isValid(teacherId)) {
      teacher = await Teacher.findById(teacherId);
    } else {
      teacher = await Teacher.findOne({ teacherId });
    }

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Use the getReviews logic from reviewController
    const query = { teacher: teacher._id, deleted: { $ne: true } };
    
    if (course) {
      query.course = { $regex: course, $options: 'i' };
    }
    
    if (term) {
      query.term = { $regex: term, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find(query)
      .populate('teacher', 'name designation email teacherId')
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 })
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

