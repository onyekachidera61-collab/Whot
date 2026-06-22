// Game UI Logic
let currentGameState = null;
let playerHand = [];
let selectedCards = new Set();
let currentRoomId = null;

function updateGameState(gameState) {
  currentGameState = gameState;
  document.getElementById('deckRemaining').textContent = gameState.deckRemaining;
  document.getElementById('currentPlayer').textContent = gameState.players[gameState.currentPlayerIndex].username;
}

function updatePlayerSlots(data) {
  const slots = document.querySelectorAll('.player-slot');
  slots.forEach((slot, index) => {
    if (index < data.totalPlayers) {
      slot.classList.remove('hidden');
    } else {
      slot.classList.add('hidden');
    }
  });
}

function displayPlayerHand(hand) {
  playerHand = hand;
  const container = document.getElementById('playerCards');
  container.innerHTML = '';

  hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card player-card ${card.shape || 'whot'} playable`;
    cardEl.innerHTML = cardEl.innerHTML = card.specialType ? `<span>${card.specialType}</span>` : `<span>${card.number}</span>`;
    cardEl.onclick = () => selectCard(index, cardEl);
    container.appendChild(cardEl);
  });
}

function selectCard(index, element) {
  if (selectedCards.has(index)) {
    selectedCards.delete(index);
    element.classList.remove('selected');
  } else {
    selectedCards.forEach(i => {
      document.querySelectorAll('.player-card')[i].classList.remove('selected');
    });
    selectedCards.clear();
    selectedCards.add(index);
    element.classList.add('selected');
  }
}

function playSelectedCard() {
  if (selectedCards.size === 0) {
    showToast('Select a card to play', 'warning');
    return;
  }

  const cardIndex = Array.from(selectedCards)[0];
  const card = playerHand[cardIndex];

  if (card.number === 20) {
    // WHOT card - choose shape
    chooseShapeModal(cardIndex);
  } else {
    playCardSocket(currentRoomId, cardIndex);
    selectedCards.clear();
  }
}

function pickCard() {
  if (!currentRoomId) return;
  pickCardSocket(currentRoomId);
}

function chooseShapeModal(cardIndex) {
  const shapes = ['circle', 'triangle', 'square', 'star', 'cross'];
  const shapeEmojis = {
    circle: '🟢',
    triangle: '🔵',
    square: '🔴',
    star: '⭐',
    cross: '🟣'
  };

  const choice = prompt(`Choose a shape for WHOT card:\n${shapes.map(s => `${shapeEmojis[s]} ${s}`).join('\n')}`);
  if (choice && shapes.includes(choice)) {
    playCardSocket(currentRoomId, cardIndex, choice);
    selectedCards.clear();
  }
}

function updateTopCard(card) {
  const topCardEl = document.getElementById('topCard');
  const shape = card.shape || 'whot';
  const display = card.specialType ? card.specialType : card.number;

  topCardEl.className = `card ${shape}`;
  topCardEl.innerHTML = `<span>${display}</span>`;
}

function highlightCurrentPlayer(playerIndex) {
  document.querySelectorAll('.player-slot').forEach((slot, index) => {
    if (index === playerIndex) {
      slot.classList.add('active');
    } else {
      slot.classList.remove('active');
    }
  });
}

function startTurnTimer(seconds) {
  const timerEl = document.getElementById('turnTimer');
  let remaining = seconds;

  timerEl.textContent = remaining;
  timerEl.classList.remove('warning', 'critical');

  const interval = setInterval(() => {
    remaining--;
    timerEl.textContent = remaining;

    if (remaining <= 10) {
      timerEl.classList.add('warning');
    }
    if (remaining <= 5) {
      timerEl.classList.remove('warning');
      timerEl.classList.add('critical');
    }

    if (remaining <= 0) {
      clearInterval(interval);
      pickCard();
    }
  }, 1000);
}

function addChatMessage(username, message, type = 'text') {
  const messagesEl = document.getElementById('chatMessages');
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.innerHTML = `<strong>${username}:</strong> ${message}`;
  messagesEl.appendChild(messageEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (message && currentRoomId) {
    sendMessageSocket(currentRoomId, message);
    input.value = '';
  }
}

function showGameOver(winner) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="game-over">
        <h2>🎉 Game Over!</h2>
        <div class="winner-info">
          <img src="${winner.avatar}" class="winner-avatar" alt="${winner.username}">
          <div class="winner-name">${winner.username}</div>
          ${winner.winnings > 0 ? `<div class="prize-amount">Won ₦${winner.winnings}</div>` : ''}
        </div>
        <button class="btn btn-primary" onclick="showGames()">Back to Games</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}