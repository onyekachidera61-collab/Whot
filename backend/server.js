import dotenv from 'dotenv';
import app from './src/app.js';
import { initializeSocketIO } from './src/events/socketServer.js';
import http from 'http';
import logger from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocketIO(server);

server.listen(PORT, HOST, () => {
  logger.info(`🎮 WHOT Game Server running on http://${HOST}:${PORT}`);
  logger.info(`📡 Socket.IO server ready for real-time connections`);
});

process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;