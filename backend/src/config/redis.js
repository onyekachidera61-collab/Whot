import redis from 'redis';
import logger from '../utils/logger.js';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connection established');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis error:', err);
});

redisClient.connect().catch(err => {
  logger.warn('⚠️ Redis not available, running without cache');
});

export default redisClient;