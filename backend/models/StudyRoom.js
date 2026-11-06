import mongoose from 'mongoose';

const studyRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  socialMediaLink: {
    type: String,
    default: '',
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

studyRoomSchema.index({ topic: 'text', 'creator.name': 'text' });

const StudyRoom = mongoose.model('StudyRoom', studyRoomSchema);

export default StudyRoom;

