let selectedTeam = null;
let selectedGift = null;

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let ws;

if (isLocal) {
  // WebSocket cho local
  ws = new WebSocket(`ws://${window.location.host}`);
  
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
}

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

async function sendGift() {
  if (!selectedTeam) {
    showStatus('Vui lòng chọn đội!', 'error');
    return;
  }
  
  if (!selectedGift) {
    showStatus('Vui lòng chọn quà tặng!', 'error');
    return;
  }
  
  if (isLocal) {
    // WebSocket cho local
    const data = {
      type: 'gift',
      team: selectedTeam,
      giftName: selectedGift.name,
      value: selectedGift.value
    };
    ws.send(JSON.stringify(data));
    showStatus(`✅ Đã gửi ${selectedGift.name} (+${selectedGift.value}) cho ${selectedTeam.toUpperCase()}`, 'success');
  } else {
    // API cho production
    try {
      const response = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team: selectedTeam,
          giftName: selectedGift.name,
          value: selectedGift.value
        })
      });
      
      if (response.ok) {
        showStatus(`✅ Đã gửi ${selectedGift.name} (+${selectedGift.value}) cho ${selectedTeam.toUpperCase()}`, 'success');
      } else {
        showStatus('Lỗi khi gửi quà!', 'error');
      }
    } catch (error) {
      showStatus('Lỗi kết nối!', 'error');
    }
  }
}

async function resetGame() {
  if (confirm('Bạn có chắc muốn reset game?')) {
    if (isLocal) {
      // WebSocket cho local
      ws.send(JSON.stringify({ type: 'reset' }));
      showStatus('Game đã được reset!', 'success');
    } else {
      // API cho production
      try {
        const response = await fetch('/api/reset', {
          method: 'POST'
        });
        
        if (response.ok) {
          showStatus('Game đã được reset!', 'success');
        }
      } catch (error) {
        showStatus('Lỗi khi reset!', 'error');
      }
    }
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
