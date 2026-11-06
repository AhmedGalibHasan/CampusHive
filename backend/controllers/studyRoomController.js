import StudyRoom from '../models/StudyRoom.js';
import StudyRoomMessage from '../models/StudyRoomMessage.js';
import StudyRoomView from '../models/StudyRoomView.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all active study rooms
export const getAllStudyRooms = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    // Search by topic or creator name
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query.$or = [
        { topic: { $regex: searchTerm, $options: 'i' } },
      ];
      
      // Also search by creator name
      const users = await User.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).select('_id');
      
      if (users.length > 0) {
        query.$or.push({ creator: { $in: users.map(u => u._id) } });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const studyRooms = await StudyRoom.find(query)
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudyRoom.countDocuments(query);

    // Get message counts for each study room (if user is authenticated and a member)
    const userId = req.userId;
    const studyRoomsWithCounts = await Promise.all(
      studyRooms.map(async (room) => {
        const roomObj = room.toObject();
        
        // Only include unread message count if user is authenticated and is a member
        if (userId) {
          const isMember = room.members.some(
            member => member._id.toString() === userId.toString() || member.toString() === userId.toString()
          );
          
          if (isMember) {
            // Get last viewed timestamp for this user in this room
            const viewRecord = await StudyRoomView.findOne({
              studyRoom: room._id,
              user: userId,
            });
            
            // Count messages created after last viewed time (or all messages if never viewed)
            const query = { studyRoom: room._id };
            if (viewRecord && viewRecord.lastViewedAt) {
              query.createdAt = { $gt: viewRecord.lastViewedAt };
            }
            
            const unreadCount = await StudyRoomMessage.countDocuments(query);
            roomObj.messageCount = unreadCount;
          } else {
            roomObj.messageCount = 0;
          }
        } else {
          roomObj.messageCount = 0;
        }
        
        return roomObj;
      })
    );

    res.json({
      studyRooms: studyRoomsWithCounts,
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

// Get single study room by ID
export const getStudyRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const studyRoom = await StudyRoom.findById(roomId)
      .populate('creator', 'name email')
      .populate('members', 'name email');

    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    res.json(studyRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single study room by room number
export const getStudyRoomByNumber = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    
    const studyRoom = await StudyRoom.findOne({ roomNumber: parseInt(roomNumber) })
      .populate('creator', 'name email')
      .populate('members', 'name email');

    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    res.json(studyRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new study room
export const createStudyRoom = async (req, res) => {
  try {
    const { topic, location, socialMediaLink } = req.body;
    const creatorId = req.userId;

    if (!creatorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the lowest available room number
    const existingRooms = await StudyRoom.find({})
      .select('roomNumber')
      .sort({ roomNumber: 1 });

    let roomNumber = 1;
    if (existingRooms.length > 0) {
      // Find the first gap in the sequence
      let foundGap = false;
      for (let i = 0; i < existingRooms.length; i++) {
        if (existingRooms[i].roomNumber !== i + 1) {
          roomNumber = i + 1;
          foundGap = true;
          break;
        }
      }
      // If no gap found, use the next number after the highest
      if (!foundGap) {
        roomNumber = existingRooms.length + 1;
      }
    }

    const studyRoom = new StudyRoom({
      roomNumber,
      topic: topic.trim(),
      creator: creatorId,
      location: location ? location.trim() : '',
      socialMediaLink: socialMediaLink ? socialMediaLink.trim() : '',
      members: [creatorId], // Creator is automatically a member
    });

    const savedRoom = await studyRoom.save();
    await savedRoom.populate('creator', 'name email');
    await savedRoom.populate('members', 'name email');

    res.status(201).json(savedRoom);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate room number (shouldn't happen with our logic, but handle it)
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Join a study room
export const joinStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Check if user is already a member
    if (studyRoom.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this room' });
    }

    studyRoom.members.push(userId);
    await studyRoom.save();

    await studyRoom.populate('creator', 'name email');
    await studyRoom.populate('members', 'name email');

    res.json(studyRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave a study room
export const leaveStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Check if user is the creator
    if (studyRoom.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the room. Please disband it instead.' });
    }

    // Remove user from members
    studyRoom.members = studyRoom.members.filter(
      memberId => memberId.toString() !== userId.toString()
    );
    await studyRoom.save();

    await studyRoom.populate('creator', 'name email');
    await studyRoom.populate('members', 'name email');

    res.json(studyRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disband a study room (only creator can do this)
export const disbandStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Check if user is the creator
    if (studyRoom.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the creator can disband the room' });
    }

    await StudyRoom.findByIdAndDelete(roomId);

    res.json({ message: 'Study room disbanded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

