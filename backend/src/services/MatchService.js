import { Match } from '../models/Match.js';
import { MatchPlayer } from '../models/MatchPlayer.js';
import { GameRoom } from '../models/GameRoom.js';
import { calculatePrizePool } from '../utils/helpers.js';
import WalletService from './WalletService.js';
import logger from '../utils/logger.js';

export class MatchService {
  static async createMatch(roomData, players) {
    try {
      const { gameMode, entryFee, playerCount } = roomData;
      const totalPrizePool = entryFee * playerCount;
      const feePercentage = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || 20);
      const { platformFee, prizePool } = calculatePrizePool(
        playerCount,
        entryFee,
        feePercentage
      );

      const match = await Match.create({
        gameMode,
        playerCount,
        entryFee: gameMode === 'money' ? entryFee : 0,
        totalPrizePool: gameMode === 'money' ? prizePool : 0,
        platformFee: gameMode === 'money' ? platformFee : 0,
        status: 'ongoing'
      });

      // Deduct entry fees from players if money match
      if (gameMode === 'money') {
        for (const player of players) {
          await WalletService.deductGameFee(player.id, entryFee, match.id);
        }
      }

      // Add players to match
      for (let i = 0; i < players.length; i++) {
        await MatchPlayer.create({
          matchId: match.id,
          userId: players[i].id,
          position: i + 1,
          status: 'playing'
        });
      }

      logger.info(`Match created: ${match.id}`);
      return match;
    } catch (error) {
      logger.error('Create match error:', error);
      throw error;
    }
  }

  static async completeMatch(matchId, winnerId, players) {
    try {
      const match = await Match.findByPk(matchId);

      if (!match) {
        throw new Error('Match not found');
      }

      match.winnerId = winnerId;
      match.status = 'completed';
      match.endedAt = new Date();
      await match.save();

      // Credit winnings to winner
      if (match.gameMode === 'money' && match.totalPrizePool > 0) {
        await WalletService.creditWinnings(
          winnerId,
          match.totalPrizePool,
          matchId
        );
      }

      // Update match players
      const matchPlayers = await MatchPlayer.findAll({
        where: { matchId }
      });

      for (const mp of matchPlayers) {
        if (mp.userId === winnerId) {
          mp.winnings =
            match.gameMode === 'money' ? match.totalPrizePool : 0;
          mp.status = 'finished';
        }
        await mp.save();
      }

      logger.info(`Match completed: ${matchId}, Winner: ${winnerId}`);
      return match;
    } catch (error) {
      logger.error('Complete match error:', error);
      throw error;
    }
  }

  static async getMatchHistory(userId, limit = 20) {
    try {
      const matches = await Match.findAll({
        include: {
          model: MatchPlayer,
          where: { userId },
          attributes: ['id', 'userId']
        },
        order: [['createdAt', 'DESC']],
        limit
      });
      return matches;
    } catch (error) {
      logger.error('Get match history error:', error);
      throw error;
    }
  }
}

export default MatchService;