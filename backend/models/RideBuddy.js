import mongoose from 'mongoose';

const rideBuddySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car'],
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  fromLocation: {
    type: String,
    required: true
  },
  toLocation: {
    type: String,
    required: true
  },
  rideDate: {
    type: Date,
    required: true
  },
  rideTime: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  contactInfo: {
    type: String,
    default: ''
  },
  pairRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'completed', 'cancelled'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
rideBuddySchema.index({ rideDate: 1, status: 1 });
rideBuddySchema.index({ fromLocation: 'text', toLocation: 'text' });

export default mongoose.model('RideBuddy', rideBuddySchema);