import { verifyToken } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const adminOnly = (req, res, next) => {
  // Check if user is admin
  // This should be extended with actual role checking from database
  const adminIds = (process.env.ADMIN_IDS || '').split(',');
  
  if (!adminIds.includes(req.userId)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};