import User from '../models/User.js';

// Middleware to check if user is admin
const admin = async (req, res, next) => {
  try {
    // req.userId is set by auth middleware
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Fetch user to check role
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Attach user to request for convenience
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default admin;

