import StudyRoomMessage from '../models/StudyRoomMessage.js';
import StudyRoom from '../models/StudyRoom.js';
import StudyRoomView from '../models/StudyRoomView.js';
import User from '../models/User.js';

// Send a message to a study room
export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Verify the study room exists
    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Verify user is a member of the study room
    const isMember = studyRoom.members.some(
      memberId => memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of the study room to send messages' });
    }

    const newMessage = new StudyRoomMessage({
      studyRoom: roomId,
      sender: userId,
      message: message.trim(),
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('sender', 'name email');
    await savedMessage.populate('studyRoom', 'roomNumber topic');

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages for a study room (sorted by latest first)
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify the study room exists
    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await StudyRoomMessage.find({ studyRoom: roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 }) // Oldest first (newest at bottom for chat UI)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudyRoomMessage.countDocuments({ studyRoom: roomId });

    // Mark messages as viewed by updating/creating StudyRoomView
    const userId = req.userId;
    if (userId) {
      await StudyRoomView.findOneAndUpdate(
        { studyRoom: roomId, user: userId },
        { lastViewedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    res.json({
      messages,
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

