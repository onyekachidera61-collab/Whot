import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

export const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 20 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').optional().isMobilePhone(),
  validate
];

export const loginValidation = [
  body('email').isEmail(),
  body('password').exists(),
  validate
];

export const createRoomValidation = [
  body('gameMode').isIn(['free', 'money']),
  body('playerCount').isIn([2, 3, 4]),
  body('entryFee').optional().isFloat({ min: 0 }),
  validate
];

export const depositValidation = [
  body('amount').isFloat({ min: process.env.WALLET_MIN_DEPOSIT || 100 }),
  validate
];