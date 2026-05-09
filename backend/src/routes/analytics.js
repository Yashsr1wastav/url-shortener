import express from 'express';
import { getAnalytics } from '../services/analyticsService.js';

const router = express.Router();

router.get('/analytics/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const data = await getAnalytics(code);
    return res.json(data);
  } catch (err) {
    console.error('Analytics route error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
