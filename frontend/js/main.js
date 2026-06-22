// Main Application Logic
const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  if (authToken && currentUser) {
    showApp();
    showHome();
    initializeApp();
  } else {
    showAuth();
  }
});

function showAuth() {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('authContainer').classList.remove('hidden');
  document.getElementById('appContainer').classList.add('hidden');
}

function showApp() {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('authContainer').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');
}

function initializeApp() {
  loadUserStats();
  connectSocket();
}

function showHome() {
  hideAllScreens();
  document.getElementById('homeScreen').classList.remove('hidden');
}

function showGames() {
  hideAllScreens();
  document.getElementById('gamesScreen').classList.remove('hidden');
  loadAvailableGames();
}

function showGameTable() {
  hideAllScreens();
  document.getElementById('gameTableScreen').classList.remove('hidden');
}

function showTournaments() {
  hideAllScreens();
  document.getElementById('tournamentsScreen').classList.remove('hidden');
  loadTournaments();
}

function showWallet() {
  hideAllScreens();
  document.getElementById('walletScreen').classList.remove('hidden');
  loadWalletData();
}

function showProfile() {
  hideAllScreens();
  document.getElementById('profileScreen').classList.remove('hidden');
  loadProfile();
}

function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
}

// Load User Stats
async function loadUserStats() {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    const user = data.user;

    document.getElementById('userWins').textContent = `Wins: ${user.wins}`;
    document.getElementById('userBalance').textContent = `Balance: ₦${user.balance || 0}`;
  } catch (error) {
    console.error('Load stats error:', error);
  }
}

// Load Available Games
async function loadAvailableGames(filter = 'all') {
  try {
    const response = await fetch(`${API_URL}/games/available`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    const rooms = data.rooms || [];

    const gamesList = document.getElementById('gamesList');
    gamesList.innerHTML = '';

    rooms.forEach(room => {
      if (filter !== 'all' && room.gameMode !== filter) return;

      const gameCard = document.createElement('div');
      gameCard.className = 'game-card';
      gameCard.innerHTML = `
        <h3>${room.gameMode === 'free' ? '🎮 Free Game' : '💰 Money Match'}</h3>
        <p>Players: ${room.currentPlayers}/${room.playerCount}</p>
        ${room.gameMode === 'money' ? `<p>Entry Fee: ₦${room.entryFee}</p>` : ''}
        <p>Code: ${room.roomCode}</p>
        <span class="badge">${room.status}</span>
        <button class="btn btn-primary" onclick="joinGame('${room.id}')">Join</button>
      `;
      gamesList.appendChild(gameCard);
    });
  } catch (error) {
    console.error('Load games error:', error);
    showToast('Failed to load games', 'error');
  }
}

function filterGames(filter) {
  loadAvailableGames(filter);
}

// Create Game
function createGame() {
  document.getElementById('createGameModal').classList.remove('hidden');
}

document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const entryFeeLabel = document.getElementById('entryFeeLabel');
    if (e.target.value === 'money') {
      entryFeeLabel.classList.remove('hidden');
    } else {
      entryFeeLabel.classList.add('hidden');
    }
  });
});

async function createGameSubmit() {
  const gameMode = document.querySelector('input[name="gameMode"]:checked').value;
  const playerCount = parseInt(document.getElementById('playerCount').value);
  const entryFee = gameMode === 'money' ? parseFloat(document.getElementById('entryFee').value) : 0;

  try {
    const response = await fetch(`${API_URL}/games/room`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ gameMode, playerCount, entryFee, isPrivate: false })
    });

    const data = await response.json();

    if (response.ok) {
      closeModal('createGameModal');
      joinGame(data.room.id);
      showToast('Game created!', 'success');
    } else {
      showToast(data.error || 'Failed to create game', 'error');
    }
  } catch (error) {
    console.error('Create game error:', error);
    showToast('Failed to create game', 'error');
  }
}

async function joinGame(roomId) {
  try {
    const response = await fetch(`${API_URL}/games/room/${roomId}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      showGameTable();
      joinGameSocket(roomId);
      showToast('Joined game!', 'success');
    } else {
      showToast('Failed to join game', 'error');
    }
  } catch (error) {
    console.error('Join game error:', error);
    showToast('Failed to join game', 'error');
  }
}

// Load Tournaments
async function loadTournaments() {
  try {
    const response = await fetch(`${API_URL}/tournaments`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    const tournaments = data.tournaments || [];

    const tournamentsList = document.getElementById('tournamentsList');
    tournamentsList.innerHTML = '';

    tournaments.forEach(tournament => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <h3>${tournament.name}</h3>
        <p>${tournament.description}</p>
        <p>Players: ${tournament.currentPlayers}/${tournament.maxPlayers}</p>
        <p>Entry: ₦${tournament.entryFee}</p>
        <p>Prize Pool: ₦${tournament.totalPrizePool}</p>
        <button class="btn btn-primary" onclick="joinTournament('${tournament.id}')">Join</button>
      `;
      tournamentsList.appendChild(card);
    });
  } catch (error) {
    console.error('Load tournaments error:', error);
    showToast('Failed to load tournaments', 'error');
  }
}

async function joinTournament(tournamentId) {
  try {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      showToast('Joined tournament!', 'success');
      loadTournaments();
    } else {
      showToast('Failed to join tournament', 'error');
    }
  } catch (error) {
    console.error('Join tournament error:', error);
    showToast('Failed to join tournament', 'error');
  }
}

// Load Profile
async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    const user = data.user;

    document.getElementById('profileAvatar').src = user.avatar;
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('profileTotalGames').textContent = user.totalGames;
    document.getElementById('profileWins').textContent = user.wins;
    const winrate = user.totalGames > 0 ? ((user.wins / user.totalGames) * 100).toFixed(1) : 0;
    document.getElementById('profileWinrate').textContent = `${winrate}%`;
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}