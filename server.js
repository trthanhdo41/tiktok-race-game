const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// Lưu trữ điểm số các đội
const scores = {
  'usa': 0,
  'mexico': 0,
  'germany': 0,
  'brazil': 0,
  'palestine': 0,
  'uk': 0
};

// Lưu trữ số lần thắng
const wins = {
  'usa': 0,
  'mexico': 0,
  'germany': 0,
  'brazil': 0,
  'palestine': 0,
  'uk': 0
};

// Broadcast đến tất cả clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Gửi điểm hiện tại cho client mới
  ws.send(JSON.stringify({ type: 'init', scores, wins }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'gift') {
        // Cập nhật điểm
        if (scores.hasOwnProperty(data.team)) {
          scores[data.team] += data.value;
          
          // Kiểm tra nếu về đích (>= 30) và chưa được tính thắng
          if (scores[data.team] >= 30 && scores[data.team] - data.value < 30) {
            wins[data.team] += 1;
            
            // Broadcast thông báo thắng
            broadcast({
              type: 'winner',
              team: data.team,
              wins: wins[data.team]
            });
            
            // Reset điểm về 0 sau 3 giây để bắt đầu vòng mới
            setTimeout(() => {
              scores[data.team] = 0;
              broadcast({
                type: 'update',
                team: data.team,
                value: 0,
                total: 0,
                giftName: '',
                username: ''
              });
            }, 3000);
          } else {
            // Broadcast cập nhật điểm bình thường
            broadcast({
              type: 'update',
              team: data.team,
              value: data.value,
              total: scores[data.team],
              giftName: data.giftName,
              username: data.username
            });
          }
        }
      } else if (data.type === 'reset') {
        // Reset tất cả điểm và số lần thắng
        Object.keys(scores).forEach(key => scores[key] = 0);
        Object.keys(wins).forEach(key => wins[key] = 0);
        broadcast({ type: 'reset', scores, wins });
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Game: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin.html`);
});
