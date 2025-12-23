import { broadcast, scores, wins } from './events.js';

export default function handler(req, res) {
  if (req.method === 'POST') {
    Object.keys(scores).forEach(key => scores[key] = 0);
    Object.keys(wins).forEach(key => wins[key] = 0);
    
    broadcast({ type: 'reset', scores, wins });
    
    res.status(200).json({ success: true, scores, wins });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
