import http from 'http';
import socketIO from 'socket.io';
import logger from '../utils/logger.js';
import { WhotGame } from '../services/WhotGameEngine.js';

const activeGames = new Map();
const activePlayers = new Map();

export const initializeSocketIO = (server) => {
  const io = new socketIO.Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) {
      return next(new Error('Authentication error'));
    }
    socket.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`📄 Player connected: ${socket.userId}`);

    // Mark player as online
    activePlayers.set(socket.userId, {
      socketId: socket.id,
      connectedAt: new Date()
    });

    // Join Game Room
    socket.on('join_game', (data) => {
      try {
        const { roomId, playerData } = data;
        const game = activeGames.get(roomId);

        if (!game) {
          socket.emit('error', { message: 'Game room not found' });
          return;
        }

        // Add player to game
        game.addPlayer({
          id: socket.userId,
          username: playerData.username,
          avatar: playerData.avatar
        });

        socket.join(roomId);
        socket.gameRoom = roomId;

        // Notify other players
        io.to(roomId).emit('player_joined', {
          playerId: socket.userId,
          username: playerData.username,
          totalPlayers: game.players.length,
          maxPlayers: game.playerCount
        });

        // If all players joined, start game
        if (game.players.length === game.playerCount) {
          setTimeout(() => {
            game.startGame();
            io.to(roomId).emit('game_started', game.getGameState());
          }, 2000);
        }

        logger.info(`🎮 Player ${socket.userId} joined room ${roomId}`);
      } catch (error) {
        logger.error('Join game error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Play Card
    socket.on('play_card', (data) => {
      try {
        const { roomId, cardIndex, chosenShape } = data;
        const game = activeGames.get(roomId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const playerIndex = game.players.findIndex(p => p.id === socket.userId);
        if (playerIndex === -1) {
          socket.emit('error', { message: 'Player not in game' });
          return;
        }

        const result = game.playCard(playerIndex, cardIndex, chosenShape);

        io.to(roomId).emit('card_played', {
          playerId: socket.userId,
          card: game.discardPile[game.discardPile.length - 1],
          gameState: game.getGameState(),
          special: result.special
        });

        // Notify next player
        const nextPlayer = game.getCurrentPlayer();
        const nextPlayerSocket = Array.from(io.sockets.sockets.values()).find(
          s => s.userId === nextPlayer.id
        );

        if (nextPlayerSocket) {
          nextPlayerSocket.emit('your_turn', {
            gameState: game.getGameState(),
            hand: game.getPlayerHand(game.currentPlayerIndex)
          });
        }

        // Check if game ended
        if (result.gameEnded) {
          io.to(roomId).emit('game_ended', {
            winner: result.winner,
            gameState: game.getGameState()
          });

          // Clean up
          activeGames.delete(roomId);
        }

        logger.info(`Card played in room ${roomId}`);
      } catch (error) {
        logger.error('Play card error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Pick Card
    socket.on('pick_card', (data) => {
      try {
        const { roomId } = data;
        const game = activeGames.get(roomId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const playerIndex = game.players.findIndex(p => p.id === socket.userId);
        const card = game.pickCard(playerIndex);

        io.to(roomId).emit('card_picked', {
          playerId: socket.userId,
          deckRemaining: game.deck.remainingCards()
        });

        // Notify next player
        const nextPlayer = game.getCurrentPlayer();
        const nextPlayerSocket = Array.from(io.sockets.sockets.values()).find(
          s => s.userId === nextPlayer.id
        );

        if (nextPlayerSocket) {
          nextPlayerSocket.emit('your_turn', {
            gameState: game.getGameState(),
            hand: game.getPlayerHand(game.currentPlayerIndex)
          });
        }

        logger.info(`Card picked in room ${roomId}`);
      } catch (error) {
        logger.error('Pick card error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Send Message
    socket.on('message', (data) => {
      try {
        const { roomId, message, type = 'text' } = data;

        io.to(roomId).emit('player_message', {
          playerId: socket.userId,
          username: data.username,
          message,
          type,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Message error:', error);
      }
    });

    // Leave Game
    socket.on('leave_game', () => {
      try {
        const roomId = socket.gameRoom;
        if (roomId) {
          io.to(roomId).emit('player_left', { playerId: socket.userId });
          socket.leave(roomId);
        }
      } catch (error) {
        logger.error('Leave game error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`📅 Player disconnected: ${socket.userId}`);
      activePlayers.delete(socket.userId);

      if (socket.gameRoom) {
        io.to(socket.gameRoom).emit('player_disconnected', {
          playerId: socket.userId
        });
      }
    });
  });

  return io;
};

export { activeGames, activePlayers };