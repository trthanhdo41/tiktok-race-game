let selectedTeam = null;
let selectedGift = null;

// Luôn dùng WebSocket (cho cả local và production)
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onerror = () => {
  console.log('WebSocket error');
};

ws.onclose = () => {
  console.log('Disconnected');
  setTimeout(() => window.location.reload(), 3000);
};

// Chọn đội
document.querySelectorAll('.team-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTeam = btn.dataset.team;
  });
});

// Chọn quà preset
document.querySelectorAll('.gift-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedGift = {
      name: btn.dataset.gift,
      value: parseInt(btn.dataset.value)
    };
    sendGift();
  });
});

function sendGift() {
  if (!selectedTeam) {
    showStatus('Vui lòng chọn đội!', 'error');
    return;
  }
  
  if (!selectedGift) {
    showStatus('Vui lòng chọn quà tặng!', 'error');
    return;
  }
  
  const data = {
    type: 'gift',
    team: selectedTeam,
    giftName: selectedGift.name,
    value: selectedGift.value
  };
  ws.send(JSON.stringify(data));
  showStatus(`✅ Đã gửi ${selectedGift.name} (+${selectedGift.value}) cho ${selectedTeam.toUpperCase()}`, 'success');
}

function resetGame() {
  if (confirm('Bạn có chắc muốn reset game?')) {
    ws.send(JSON.stringify({ type: 'reset' }));
    showStatus('Game đã được reset!', 'success');
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, 3000);
}
