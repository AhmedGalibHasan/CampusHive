import mongoose from 'mongoose';

const studyRoomViewSchema = new mongoose.Schema({
  studyRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  lastViewedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
studyRoomViewSchema.index({ studyRoom: 1, user: 1 }, { unique: true });
studyRoomViewSchema.index({ user: 1, lastViewedAt: -1 });

const StudyRoomView = mongoose.model('StudyRoomView', studyRoomViewSchema);

export default StudyRoomView;

