import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { GameRoom } from '../models/GameRoom.js';
import { Match } from '../models/Match.js';
import { MatchPlayer } from '../models/MatchPlayer.js';
import { generateRoomCode, calculatePrizePool } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Create game room
router.post('/room', authenticate, async (req, res) => {
  try {
    const { gameMode, playerCount, entryFee, isPrivate } = req.body;

    const roomCode = generateRoomCode();
    const room = await GameRoom.create({
      roomCode,
      createdBy: req.userId,
      gameMode,
      playerCount,
      entryFee: entryFee || 0,
      isPrivate: isPrivate || false,
      status: 'waiting'
    });

    logger.info(`Game room created: ${room.id} by user ${req.userId}`);

    res.status(201).json({
      message: 'Room created',
      room: {
        id: room.id,
        roomCode: room.roomCode,
        gameMode: room.gameMode,
        playerCount: room.playerCount,
        entryFee: room.entryFee,
        isPrivate: room.isPrivate
      }
    });
  } catch (error) {
    logger.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room details
router.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const room = await GameRoom.findByPk(req.params.roomId, {
      include: ['players', 'match']
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      room: {
        id: room.id,
        roomCode: room.roomCode,
        gameMode: room.gameMode,
        playerCount: room.playerCount,
        entryFee: room.entryFee,
        isPrivate: room.isPrivate,
        status: room.status,
        players: room.players || [],
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    logger.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// List available rooms
router.get('/available', authenticate, async (req, res) => {
  try {
    const rooms = await GameRoom.findAll({
      where: {
        status: 'waiting',
        isPrivate: false
      },
      include: ['players'],
      limit: 20
    });

    res.json({ rooms });
  } catch (error) {
    logger.error('List rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Join room
router.post('/room/:roomId/join', authenticate, async (req, res) => {
  try {
    const room = await GameRoom.findByPk(req.params.roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'waiting') {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Check if player already joined
    const existingPlayer = await MatchPlayer.findOne({
      where: { userId: req.userId, roomId: room.id }
    });

    if (existingPlayer) {
      return res.status(400).json({ error: 'You already joined this room' });
    }

    res.json({ message: 'Room joined', roomId: room.id });
  } catch (error) {
    logger.error('Join room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get match history
router.get('/history', authenticate, async (req, res) => {
  try {
    const matches = await Match.findAll({
      include: {
        model: MatchPlayer,
        where: { userId: req.userId }
      },
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    res.json({ matches });
  } catch (error) {
    logger.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;