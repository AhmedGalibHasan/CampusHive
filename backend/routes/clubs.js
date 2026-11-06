import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import Club from "../models/Club.js";
import User from "../models/User.js";
import { notifyAnnouncementApproved } from "../utils/notificationHelper.js";

const router = express.Router();

// ===========================
// MULTER STORAGE FOR LOGO UPLOAD
// ===========================
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads')); // save inside backend/public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage });

// ===========================
// AUTO-INCREMENT clubId
// ===========================
async function getNextClubId() {
  const last = await Club.findOne().sort({ clubId: -1 }).lean();
  return last ? last.clubId + 1 : 1;
}

// ===========================
// CREATE CLUB (Admin only)
// ===========================
router.post("/request", auth, admin, upload.single("logo"), async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!category || !['sports', 'cultural', 'academic', 'other'].includes(category)) {
      return res.status(400).json({ message: "Valid category is required (sports, cultural, academic, or other)" });
    }

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const clubId = await getNextClubId();

    const logo = req.file ? `/uploads/${req.file.filename}` : "";

    const club = await Club.create({
      clubId,
      name,
      description,
      category,
      creatorId: req.userId,
      creatorName: user.name,
      logo,
      members: [req.userId],
      memberNames: [user.name]
    });

    res.status(201).json(club);
  } catch (err) {
    console.error("Create club error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// GET ALL CLUBS (with search and filters)
// ===========================
router.get("/", async (req, res) => {
  try {
    const { search, filter, category, userId } = req.query;
    
    // Build query
    let query = {};
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Filter by category
    if (category && ['sports', 'cultural', 'academic', 'other'].includes(category)) {
      query.category = category;
    }
    
    // Get clubs
    let clubs = await Club.find(query).lean();
    
    // Apply filters
    if (filter === 'popular') {
      // Sort by member count (most popular)
      clubs.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));
    } else if (filter === 'newest') {
      // Sort by creation date (newest first)
      clubs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filter === 'joined' && userId) {
      // Filter clubs user has joined
      const userObjectId = userId;
      clubs = clubs.filter(club => 
        club.members && club.members.some(m => m.toString() === userObjectId)
      );
      // Sort by join date (most recently joined first) - approximate by creation date
      clubs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default: sort by creation date (newest first)
      clubs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Check if user is authenticated and is admin
    let isAdmin = false;
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        isAdmin = user && user.role === 'admin';
      } catch (err) {
        // Token invalid or missing, treat as non-admin
        isAdmin = false;
      }
    }
    
    // If not admin, filter announcements to only show approved
    if (!isAdmin) {
      clubs.forEach(club => {
        if (club.announcements) {
          club.announcements = club.announcements.filter(a => a.status === 'approved');
        }
      });
    }
    
    res.json(clubs);
  } catch (err) {
    console.error("Get clubs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// JOIN CLUB
// ===========================
router.post("/:id/join", auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = req.userId;

    if (!club.members.some(m => m.toString() === userId)) {
      club.members.push(userId);
      club.memberNames.push(user.name);
    }

    await club.save();
    res.json(club);
  } catch (err) {
    console.error("Join club error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// LEAVE CLUB
// ===========================
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = req.userId;

    club.members = club.members.filter((m) => m.toString() !== userId);
    club.memberNames = club.memberNames.filter((n) => n !== user.name);

    await club.save();
    res.json(club);
  } catch (err) {
    console.error("Leave club error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// ADD ANNOUNCEMENT
// ===========================
router.post("/:id/announcements", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Fetch user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add announcement with pending status
    club.announcements.push({
      authorName: user.name,
      content,
      status: 'pending',
      createdAt: new Date()
    });

    await club.save();

    res.json(club);
  } catch (err) {
    console.error("Announcement error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// DELETE CLUB (Admin only)
// ===========================
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: "Club deleted successfully" });
  } catch (err) {
    console.error("Delete club error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// APPROVE ANNOUNCEMENT (Admin only)
// ===========================
router.post("/:id/announcements/:announcementIndex/approve", auth, admin, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const announcementIndex = parseInt(req.params.announcementIndex);
    if (announcementIndex < 0 || announcementIndex >= club.announcements.length) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const announcement = club.announcements[announcementIndex];
    
    // Only notify if status is changing to approved
    if (announcement.status !== 'approved') {
      // Find the user who created the announcement
      const announcementAuthor = await User.findOne({ name: announcement.authorName });
      if (announcementAuthor) {
        await notifyAnnouncementApproved(announcementAuthor._id, club.name, club._id.toString());
      }
    }

    club.announcements[announcementIndex].status = 'approved';
    await club.save();

    res.json(club);
  } catch (err) {
    console.error("Approve announcement error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// REJECT ANNOUNCEMENT (Admin only)
// ===========================
router.post("/:id/announcements/:announcementIndex/reject", auth, admin, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const announcementIndex = parseInt(req.params.announcementIndex);
    if (announcementIndex < 0 || announcementIndex >= club.announcements.length) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    club.announcements[announcementIndex].status = 'rejected';
    await club.save();

    res.json(club);
  } catch (err) {
    console.error("Reject announcement error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// EXPORT ROUTER
// ===========================
export default router;
