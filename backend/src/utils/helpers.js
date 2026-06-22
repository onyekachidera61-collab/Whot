import jwt from 'jsonwebtoken';
import logger from './logger.js';

export const generateToken = (userId, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRATION) => {
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const calculatePrizePool = (totalPlayers, entryFee, feePercentage = 20) => {
  const totalPool = totalPlayers * entryFee;
  const platformFee = (totalPool * feePercentage) / 100;
  const prizePool = totalPool - platformFee;
  return { totalPool, platformFee, prizePool };
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};