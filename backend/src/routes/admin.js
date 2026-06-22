import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Match } from '../models/Match.js';
import { Tournament } from '../models/Tournament.js';
import { Transaction } from '../models/Transaction.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticate, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMatches = await Match.count();
    const totalTournaments = await Tournament.count();
    const totalRevenue = await Transaction.sum('amount', { 
      where: { type: 'platform_fee', status: 'completed' }
    });

    res.json({
      dashboard: {
        totalUsers,
        totalMatches,
        totalTournaments,
        totalRevenue: totalRevenue || 0
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// List users
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({ users });
  } catch (error) {
    logger.error('Users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create tournament
router.post('/tournament', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, description, entryFee, maxPlayers, startTime, endTime, rewards } = req.body;

    const tournament = await Tournament.create({
      name,
      description,
      entryFee,
      maxPlayers,
      startTime,
      endTime,
      rewards,
      status: 'upcoming',
      createdBy: req.userId
    });

    logger.info(`Tournament created: ${tournament.id}`);

    res.status(201).json({
      message: 'Tournament created',
      tournament
    });
  } catch (error) {
    logger.error('Create tournament error:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Get revenue report
router.get('/revenue', authenticate, adminOnly, async (req, res) => {
  try {
    const revenue = await Transaction.findAll({
      where: { type: 'platform_fee', status: 'completed' },
      attributes: ['date', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['date']
    });

    res.json({ revenue });
  } catch (error) {
    logger.error('Revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

export default router;