import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

const router = express.Router();

async function getNextEventId() {
  const last = await Event.findOne().sort({ eventId: -1 }).lean();
  return last ? last.eventId + 1 : 1;
}

// CREATE EVENT (Admin only)
router.post("/create", auth, admin, async (req, res) => {
  try {
    const { title, description, capacity, venue, startTime, endTime } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Title and times are required" });
    }

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventId = await getNextEventId();
    const creatorId = req.userId;
    const creatorName = user.name;

    const ev = await Event.create({
      eventId,
      title,
      description,
      capacity: capacity || 0,
      venue,
      startTime,
      endTime,
      creatorId,
      creatorName
    });
    res.status(201).json(ev);
  } catch (err) {
    console.error("Create event error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LIST EVENTS
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 }).lean();
    res.json(events);
  } catch (err) {
    console.error("Get events error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// REGISTER
router.post("/:id/register", auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = req.userId;
    const name = user.name;

    if (ev.capacity && ev.attendees.length >= ev.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    if (!ev.attendees.some(a => a.toString() === userId)) {
      ev.attendees.push(userId);
      ev.attendeeNames.push(name);
    }

    await ev.save();
    res.json(ev);
  } catch (err) {
    console.error("Register event error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CANCEL REGISTRATION
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = req.userId;
    ev.attendees = ev.attendees.filter(a => a.toString() !== userId);
    ev.attendeeNames = ev.attendeeNames.filter(n => n !== user.name);

    await ev.save();
    res.json(ev);
  } catch (err) {
    console.error("Cancel event error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// DELETE EVENT (Admin only)
// ===========================
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
