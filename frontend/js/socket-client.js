// Socket.IO Client
let socket;
const SOCKET_URL = 'http://localhost:5001';

function connectSocket() {
  socket = io(SOCKET_URL, {
    auth: {
      userId: currentUser.id,
      token: authToken
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Connected to server');
    showToast('Connected to game server', 'success');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    showToast('Disconnected from server', 'error');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    showToast(error.message || 'Connection error', 'error');
  });

  // Game Events
  socket.on('player_joined', (data) => {
    showToast(`${data.username} joined! (${data.totalPlayers}/${data.maxPlayers})`, 'info');
    updatePlayerSlots(data);
  });

  socket.on('game_started', (gameState) => {
    console.log('🎮 Game started:', gameState);
    updateGameState(gameState);
    startTurnTimer(30);
  });

  socket.on('card_played', (data) => {
    console.log('Card played:', data);
    updateTopCard(data.card);
    updateGameState(data.gameState);
    highlightCurrentPlayer(data.gameState.currentPlayerIndex);
  });

  socket.on('your_turn', (data) => {
    console.log('Your turn!');
    showToast('Your turn!', 'success');
    displayPlayerHand(data.hand);
    startTurnTimer(30);
  });

  socket.on('game_ended', (data) => {
    console.log('Game ended:', data);
    showGameOver(data.winner);
  });

  socket.on('player_message', (data) => {
    addChatMessage(data.username, data.message, data.type);
  });

  socket.on('player_left', (data) => {
    showToast(`${data.playerId} left the game`, 'warning');
  });
}

function joinGameSocket(roomId) {
  socket.emit('join_game', {
    roomId,
    playerData: {
      username: currentUser.username,
      avatar: currentUser.avatar
    }
  });
}

function playCardSocket(roomId, cardIndex, chosenShape = null) {
  socket.emit('play_card', {
    roomId,
    cardIndex,
    chosenShape
  });
}

function pickCardSocket(roomId) {
  socket.emit('pick_card', { roomId });
}

function sendMessageSocket(roomId, message) {
  socket.emit('message', {
    roomId,
    message,
    username: currentUser.username,
    type: 'text'
  });
}

function leaveGameSocket(roomId) {
  socket.emit('leave_game', { roomId });
}