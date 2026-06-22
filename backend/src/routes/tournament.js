import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { Tournament } from '../models/Tournament.js';
import { TournamentPlayer } from '../models/TournamentPlayer.js';
import logger from '../utils/logger.js';

const router = express.Router();

// List tournaments
router.get('/', authenticate, async (req, res) => {
  try {
    const tournaments = await Tournament.findAll({
      where: { status: ['active', 'upcoming'] },
      order: [['startTime', 'ASC']],
      limit: 20
    });

    res.json({ tournaments });
  } catch (error) {
    logger.error('Tournament list error:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get tournament details
router.get('/:tournamentId', authenticate, async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.tournamentId, {
      include: ['players']
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ tournament });
  } catch (error) {
    logger.error('Tournament details error:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Join tournament
router.post('/:tournamentId/join', authenticate, async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'active' && tournament.status !== 'upcoming') {
      return res.status(400).json({ error: 'Tournament not available' });
    }

    // Check if already joined
    const existing = await TournamentPlayer.findOne({
      where: { userId: req.userId, tournamentId: tournament.id }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already joined this tournament' });
    }

    // Add player to tournament
    await TournamentPlayer.create({
      userId: req.userId,
      tournamentId: tournament.id,
      status: 'active'
    });

    logger.info(`User ${req.userId} joined tournament ${tournament.id}`);

    res.json({ message: 'Joined tournament' });
  } catch (error) {
    logger.error('Join tournament error:', error);
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// Get tournament results
router.get('/:tournamentId/results', authenticate, async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.tournamentId, {
      include: ['players']
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ results: tournament.players });
  } catch (error) {
    logger.error('Results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;