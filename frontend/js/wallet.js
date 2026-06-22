// Wallet Module
const API_URL = 'http://localhost:5000/api';

async function loadWalletData() {
  try {
    const response = await fetch(`${API_URL}/wallet/balance`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    document.getElementById('walletBalance').textContent = `₦${data.balance.toFixed(2)}`;

    const transResponse = await fetch(`${API_URL}/wallet/transactions`, {
      headers: getAuthHeaders()
    });
    const transData = await transResponse.json();
    displayTransactions(transData.transactions);
  } catch (error) {
    console.error('Load wallet error:', error);
    showToast('Failed to load wallet', 'error');
  }
}

function displayTransactions(transactions) {
  const list = document.getElementById('transactionsList');
  list.innerHTML = '';

  transactions.forEach(trans => {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    const date = new Date(trans.createdAt).toLocaleDateString();
    item.innerHTML = `
      <div class="transaction-type">
        <strong>${trans.type}</strong>
        <small>${date}</small>
      </div>
      <div class="transaction-status">${trans.status}</div>
      <div class="transaction-amount">₦${trans.amount.toFixed(2)}</div>
    `;
    list.appendChild(item);
  });
}

function showDepositForm() {
  const amount = prompt('Enter deposit amount (₦):');
  if (amount && parseFloat(amount) > 0) {
    initiateDeposit(parseFloat(amount));
  }
}

function showWithdrawForm() {
  const amount = prompt('Enter withdrawal amount (₦):');
  if (amount && parseFloat(amount) > 0) {
    initiateWithdraw(parseFloat(amount));
  }
}

async function initiateDeposit(amount) {
  try {
    const response = await fetch(`${API_URL}/wallet/deposit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, paymentMethod: 'card' })
    });

    const data = await response.json();
    if (response.ok) {
      showToast('Deposit initiated. Please check your email for payment link.', 'success');
      loadWalletData();
    } else {
      showToast(data.error || 'Deposit failed', 'error');
    }
  } catch (error) {
    console.error('Deposit error:', error);
    showToast('Deposit failed', 'error');
  }
}

async function initiateWithdraw(amount) {
  try {
    const response = await fetch(`${API_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });

    const data = await response.json();
    if (response.ok) {
      showToast('Withdrawal request submitted for processing', 'success');
      loadWalletData();
    } else {
      showToast(data.error || 'Withdrawal failed', 'error');
    }
  } catch (error) {
    console.error('Withdraw error:', error);
    showToast('Withdrawal failed', 'error');
  }
}