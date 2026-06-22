import express from 'express';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get notifications
router.get('/', authenticate, async (req, res) => {
  try {
    // Fetch user notifications
    res.json({ notifications: [] });
  } catch (error) {
    logger.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;