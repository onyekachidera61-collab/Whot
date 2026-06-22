import { Sequelize } from 'sequelize';
import logger from '../utils/logger.js';

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whot_game',
  dialect: 'mysql',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+00:00'
});

// Test connection
sequelize.authenticate()
  .then(() => logger.info('✅ Database connection established'))
  .catch(err => {
    logger.error('❌ Unable to connect to database:', err);
    process.exit(1);
  });

export default sequelize;