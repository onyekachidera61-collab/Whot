import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { depositValidation } from '../middleware/validation.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ where: { userId: req.userId } });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.userId,
        balance: 0
      });
    }

    res.json({
      balance: wallet.balance,
      currency: 'NGN'
    });
  } catch (error) {
    logger.error('Wallet balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Deposit
router.post('/deposit', authenticate, depositValidation, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    let wallet = await Wallet.findOne({ where: { userId: req.userId } });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.userId,
        balance: 0
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.userId,
      type: 'deposit',
      amount,
      paymentMethod: paymentMethod || 'card',
      status: 'pending'
    });

    logger.info(`Deposit initiated: ${transaction.id} for user ${req.userId}`);

    res.json({
      message: 'Deposit initiated',
      transactionId: transaction.id,
      amount,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Deposit error:', error);
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// Withdraw
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;

    const wallet = await Wallet.findOne({ where: { userId: req.userId } });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      userId: req.userId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      bankAccount
    });

    logger.info(`Withdrawal requested: ${transaction.id} for user ${req.userId}`);

    res.json({
      message: 'Withdrawal request submitted',
      transactionId: transaction.id,
      amount,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// Get transactions
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ transactions });
  } catch (error) {
    logger.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;