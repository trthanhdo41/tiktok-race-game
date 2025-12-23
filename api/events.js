// SSE endpoint cho Vercel
let clients = [];
let scores = {
  'usa': 0,
  'mexico': 0,
  'germany': 0,
  'brazil': 0,
  'palestine': 0,
  'uk': 0
};
let wins = {
  'usa': 0,
  'mexico': 0,
  'germany': 0,
  'brazil': 0,
  'palestine': 0,
  'uk': 0
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Gửi điểm hiện tại
    res.write(`data: ${JSON.stringify({ type: 'init', scores, wins })}\n\n`);
    
    // Thêm client vào danh sách
    clients.push(res);
    
    // Xóa client khi disconnect
    req.on('close', () => {
      clients = clients.filter(client => client !== res);
    });
  }
}

export function broadcast(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.write(message);
    } catch (e) {
      console.error('Error broadcasting:', e);
    }
  });
}

export { scores, wins };
