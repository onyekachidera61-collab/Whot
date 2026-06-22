import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { User } from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, bio, phone } = req.body;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (phone) user.phone = phone;

    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'wins', 'totalGames', 'avatar'],
      order: [['wins', 'DESC']],
      limit: 100
    });

    res.json({ users });
  } catch (error) {
    logger.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;