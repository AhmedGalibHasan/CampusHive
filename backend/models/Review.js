import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    index: true,
  },
  course: {
    type: String,
    required: true,
    index: true,
  },
  term: {
    type: String,
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5',
    },
  },
  textContent: {
    type: String,
    required: true,
    trim: true,
  },
  positiveFlags: {
    type: Number,
    default: 0,
    min: 0,
  },
  negativeFlags: {
    type: Number,
    default: 0,
    min: 0,
  },
  userFlags: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flagType: {
      type: String,
      enum: ['positive', 'negative'],
      required: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: null,
  },

  deleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ teacher: 1, createdAt: -1 });
reviewSchema.index({ course: 1, term: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

