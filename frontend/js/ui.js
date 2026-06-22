// UI Helper Functions

function getAuthHeaders() {
  const authToken = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
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

function formatCurrency(amount) {
  return `₦${amount.toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-NG');
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-NG');
}

// Global Functions
window.toggleForms = toggleForms;
window.logout = logout;
window.showHome = showHome;
window.showGames = showGames;
window.showTournaments = showTournaments;
window.showWallet = showWallet;
window.showProfile = showProfile;
window.filterGames = filterGames;
window.createGame = createGame;
window.createGameSubmit = createGameSubmit;
window.joinGame = joinGame;
window.joinTournament = joinTournament;
window.closeModal = closeModal;
window.playSelectedCard = playSelectedCard;
window.pickCard = pickCard;
window.sendMessage = sendMessage;
window.showDepositForm = showDepositForm;
window.showWithdrawForm = showWithdrawForm;