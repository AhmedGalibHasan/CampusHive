import jwt from 'jsonwebtoken';

// Optional authentication middleware - doesn't fail if no token, but sets userId if token is valid
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
      } catch (error) {
        // Invalid token, but continue without userId
        req.userId = null;
      }
    } else {
      req.userId = null;
    }
    
    next();
  } catch (error) {
    // Continue even if there's an error
    req.userId = null;
    next();
  }
};

export default optionalAuth;

