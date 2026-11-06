import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  venue: { type: String, default: "" },
  capacity: { type: Number, default: 0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendeeNames: [{ type: String }]
});

export default mongoose.model("Event", eventSchema);
