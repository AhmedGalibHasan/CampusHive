import Message from '../models/Message.js';
import User from '../models/User.js';
import { notifyNewMessage } from '../utils/notificationHelper.js';

// In-memory store for typing indicators (in production, use Redis)
const typingUsers = new Map();

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType, fileUrl, fileName } = req.body;

    // Get sender's name
    const sender = await User.findById(req.userId);
    const senderName = sender ? sender.name : 'Someone';

    const newMessage = new Message({
      sender: req.userId,
      receiver: receiverId,
      message,
      messageType: messageType || 'text',
      fileUrl: fileUrl || '',
      fileName: fileName || ''
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name email');
    await newMessage.populate('receiver', 'name email');

    // Create notification for receiver (only if not sending to self)
    if (receiverId !== req.userId) {
      await notifyNewMessage(receiverId, senderName, newMessage._id.toString());
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Chat with Specific User
export const getChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ],
      deleted: false
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('reactions.user', 'name')
      .sort({ createdAt: 1 });

    // Mark messages as read when user opens chat
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Chat List with Last Message and Unread Count
export const getChatList = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select('-password').lean();
    
    const chatList = await Promise.all(users.map(async (user) => {
      // Get last message
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.userId, receiver: user._id },
          { sender: user._id, receiver: req.userId }
        ],
        deleted: false
      })
        .sort({ createdAt: -1 })
        .populate('sender', 'name')
        .lean();

      // Get unread count
      const unreadCount = await Message.countDocuments({
        sender: user._id,
        receiver: req.userId,
        read: false,
        deleted: false
      });

      return {
        ...user,
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          messageType: lastMessage.messageType,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.sender._id,
          senderName: lastMessage.sender.name
        } : null,
        unreadCount
      };
    }));

    // Sort by last message time (most recent first)
    chatList.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json(chatList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Users for Chat List (legacy endpoint)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark Messages as Read
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or receiver
    if (message.sender.toString() !== req.userId && message.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Reaction to Message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.userId
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.emoji = emoji || '👍';
    } else {
      // Add new reaction
      message.reactions.push({
        user: req.userId,
        emoji: emoji || '👍'
      });
    }

    await message.save();
    await message.populate('reactions.user', 'name');

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove Reaction from Message
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.reactions = message.reactions.filter(
      r => r.user.toString() !== req.userId
    );

    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Typing Indicator - Start Typing
export const startTyping = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const key = `${req.userId}-${receiverId}`;
    typingUsers.set(key, Date.now());
    res.json({ message: 'Typing started' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Typing Indicator - Stop Typing
export const stopTyping = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const key = `${req.userId}-${receiverId}`;
    typingUsers.delete(key);
    res.json({ message: 'Typing stopped' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Typing Status
export const getTypingStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const key = `${userId}-${req.userId}`;
    const typingTime = typingUsers.get(key);
    
    // Check if typing happened in last 3 seconds
    if (typingTime && Date.now() - typingTime < 3000) {
      return res.json({ typing: true });
    }
    
    // Clean up old entries
    if (typingTime) {
      typingUsers.delete(key);
    }
    
    res.json({ typing: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};