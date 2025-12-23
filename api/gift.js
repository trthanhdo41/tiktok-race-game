import { broadcast, scores, wins } from './events.js';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { team, giftName, value } = req.body;
    
    if (scores.hasOwnProperty(team)) {
      scores[team] += value;
      
      // Kiểm tra nếu về đích (>= 30)
      if (scores[team] >= 30) {
        wins[team] += 1;
        
        broadcast({
          type: 'winner',
          team: team,
          wins: wins[team]
        });
        
        // Reset điểm để bắt đầu vòng mới sau 5 giây
        setTimeout(() => {
          Object.keys(scores).forEach(key => scores[key] = 0);
          broadcast({ type: 'reset', scores, wins });
        }, 5000);
      } else {
        broadcast({
          type: 'update',
          team: team,
          value: value,
          total: scores[team],
          giftName: giftName
        });
      }
      
      res.status(200).json({ success: true, total: scores[team] });
    } else {
      res.status(400).json({ error: 'Invalid team' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
