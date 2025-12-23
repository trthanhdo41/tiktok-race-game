const scores = {
  'usa': 0,
  'mexico': 0,
  'germany': 0,
  'brazil': 0,
  'palestine': 0,
  'uk': 0
};

const wins = {
  'usa': 0,
  'mexico': 0,
  'germany': 0,
  'brazil': 0,
  'palestine': 0,
  'uk': 0
};

// Ảnh quà tặng
const giftImages = {
  'Hoa Hồng': 'images/1.webp',
  'Tiktok': 'images/2.webp',
  'Kem': 'images/3.webp',
  'Hehe': 'images/4.webp',
  'Mèo': 'images/5.webp',
  'Thương': 'images/6.webp'
};

// Luôn dùng WebSocket (cho cả local và production)
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from server');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

function handleMessage(data) {
  if (data.type === 'init') {
    Object.assign(scores, data.scores);
    Object.assign(wins, data.wins);
    updateAllPositions();
    updateAllWins();
  } else if (data.type === 'update') {
    scores[data.team] = data.total;
    updatePosition(data.team, data);
    showGiftNotification(data);
  } else if (data.type === 'winner') {
    wins[data.team] = data.wins;
    updateWins(data.team);
    // Hiển thị celebration khi nhận message winner từ server
    const lane = document.querySelector(`.lane[data-team="${data.team}"]`);
    showWinnerCelebration(data.team, lane);
  } else if (data.type === 'reset') {
    Object.assign(scores, data.scores);
    Object.assign(wins, data.wins);
    updateAllPositions();
    updateAllWins();
    // Xóa class winner khỏi tất cả lanes
    document.querySelectorAll('.lane').forEach(lane => lane.classList.remove('winner'));
  }
}

function updatePosition(team, giftData) {
  const lane = document.querySelector(`.lane[data-team="${team}"]`);
  const racerContainer = lane.querySelector('.racer-container');
  const scoreEl = document.querySelector(`[data-score="${team}"]`);
  const remainingEl = document.querySelector(`[data-remaining="${team}"]`);
  const giftIcon = lane.querySelector('.gift-icon');
  
  const maxScore = 30;
  const remaining = Math.max(0, maxScore - scores[team]);
  
  // Cập nhật điểm trên bảng
  scoreEl.textContent = scores[team];
  
  // Cập nhật điểm còn thiếu
  if (remaining > 0) {
    remainingEl.textContent = `Còn ${remaining}`;
    remainingEl.style.color = '#ffeb3b';
  } else {
    remainingEl.textContent = '🏆 HOÀN THÀNH';
    remainingEl.style.color = '#ffd700';
  }
  
  // Hiển thị icon quà tặng bên cạnh con vật
  if (giftData) {
    const imgSrc = giftImages[giftData.giftName] || 'images/1.webp';
    giftIcon.innerHTML = `<img src="${imgSrc}" alt="${giftData.giftName}">`;
    giftIcon.style.display = 'block';
    
    // Ẩn sau 2 giây
    setTimeout(() => {
      giftIcon.style.display = 'none';
    }, 2000);
  }
  
  // Tính toán vị trí (tối đa 70% để không vượt qua vạch đích)
  const progress = Math.min(scores[team] / maxScore, 1);
  const position = 2 + (progress * 68); // 2% đến 70%
  
  racerContainer.style.left = position + '%';
}

function updateAllPositions() {
  Object.keys(scores).forEach(team => {
    updatePosition(team);
  });
}

function updateWins(team) {
  const winsEl = document.querySelector(`[data-wins="${team}"]`);
  winsEl.textContent = `🏆 ${wins[team]}`;
}

function updateAllWins() {
  Object.keys(wins).forEach(team => {
    updateWins(team);
  });
}

function showGiftNotification(data) {
  const notification = document.createElement('div');
  notification.className = 'gift-notification';
  const imgSrc = giftImages[data.giftName] || 'images/1.webp';
  notification.innerHTML = `
    <div class="gift"><img src="${imgSrc}" style="width: 40px; height: 40px; vertical-align: middle;"> ${data.giftName} +${data.value}</div>
    <div style="font-size: 12px; color: #aaa;">Team: ${data.team.toUpperCase()}</div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showWinnerCelebration(team, lane) {
  // Thêm class winner cho lane
  lane.classList.add('winner');
  
  // Tạo confetti
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = (Math.random() * 100) + '%';
      confetti.style.animationDelay = (Math.random() * 0.5) + 's';
      confetti.style.background = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731'][Math.floor(Math.random() * 5)];
      lane.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }, i * 50);
  }
  
  // Hiển thị thông báo chiến thắng lớn
  const winnerBanner = document.createElement('div');
  winnerBanner.className = 'winner-banner';
  winnerBanner.innerHTML = `
    <div style="font-size: 60px; margin-bottom: 10px;">🏆</div>
    <div style="font-size: 40px; font-weight: bold;">${team.toUpperCase()} WINS!</div>
  `;
  document.body.appendChild(winnerBanner);
  
  setTimeout(() => {
    winnerBanner.remove();
  }, 5000);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
