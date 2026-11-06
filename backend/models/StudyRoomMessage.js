import mongoose from 'mongoose';

const studyRoomMessageSchema = new mongoose.Schema({
  studyRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

studyRoomMessageSchema.index({ studyRoom: 1, createdAt: -1 });

const StudyRoomMessage = mongoose.model('StudyRoomMessage', studyRoomMessageSchema);

export default StudyRoomMessage;

