import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const clubSchema = new mongoose.Schema({
  clubId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  category: {
    type: String,
    enum: ['sports', 'cultural', 'academic', 'other'],
    default: 'other',
    required: true
  },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  logo: { type: String, default: "" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  memberNames: [{ type: String }],
  announcements: [announcementSchema]
});

export default mongoose.model("Club", clubSchema);
