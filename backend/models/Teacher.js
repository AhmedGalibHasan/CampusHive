import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  imagePath: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;

