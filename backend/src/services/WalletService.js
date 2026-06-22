import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { Reward } from '../models/Reward.js';
import { Match } from '../models/Match.js';
import { MatchPlayer } from '../models/MatchPlayer.js';
import logger from '../utils/logger.js';

export class WalletService {
  static async getBalance(userId) {
    try {
      let wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
      }
      return wallet.balance;
    } catch (error) {
      logger.error('Get balance error:', error);
      throw error;
    }
  }

  static async deposit(userId, amount, paymentMethod = 'card') {
    try {
      let wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
      }

      const transaction = await Transaction.create({
        userId,
        type: 'deposit',
        amount,
        paymentMethod,
        status: 'completed'
      });

      wallet.balance += amount;
      wallet.totalDeposited += amount;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      logger.info(`Deposit completed: ${transaction.id} for user ${userId}`);
      return { transaction, newBalance: wallet.balance };
    } catch (error) {
      logger.error('Deposit error:', error);
      throw error;
    }
  }

  static async withdraw(userId, amount) {
    try {
      const wallet = await Wallet.findOne({ where: { userId } });

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const transaction = await Transaction.create({
        userId,
        type: 'withdrawal',
        amount,
        status: 'pending'
      });

      logger.info(`Withdrawal requested: ${transaction.id} for user ${userId}`);
      return transaction;
    } catch (error) {
      logger.error('Withdraw error:', error);
      throw error;
    }
  }

  static async deductGameFee(userId, amount, gameId) {
    try {
      const wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance for game entry');
      }

      wallet.balance -= amount;
      wallet.totalLosses += amount;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      const transaction = await Transaction.create({
        userId,
        type: 'game_fee',
        amount,
        status: 'completed',
        relatedGameId: gameId
      });

      logger.info(`Game fee deducted: ${transaction.id}`);
      return transaction;
    } catch (error) {
      logger.error('Deduct fee error:', error);
      throw error;
    }
  }

  static async creditWinnings(userId, amount, gameId, matchId = null) {
    try {
      const wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      wallet.balance += amount;
      wallet.totalWinnings += amount;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      const reward = await Reward.create({
        userId,
        type: 'match_win',
        amount,
        status: 'credited',
        creditedAt: new Date(),
        relatedGameId: gameId
      });

      const transaction = await Transaction.create({
        userId,
        type: 'game_winnings',
        amount,
        status: 'completed',
        relatedGameId: gameId
      });

      logger.info(`Winnings credited: ${reward.id}`);
      return { transaction, reward, newBalance: wallet.balance };
    } catch (error) {
      logger.error('Credit winnings error:', error);
      throw error;
    }
  }

  static async getTransactionHistory(userId, limit = 50) {
    try {
      const transactions = await Transaction.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit
      });
      return transactions;
    } catch (error) {
      logger.error('Get transaction history error:', error);
      throw error;
    }
  }
}

export default WalletService;