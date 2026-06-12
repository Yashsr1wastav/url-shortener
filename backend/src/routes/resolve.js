import express from 'express';
import { resolveUrl } from '../services/urlService.js';

const router = express.Router();

router.get('/resolve/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await resolveUrl(code);
    if (result === null) {
      return res.status(404).json({ error: 'Link not found' });
    }
    if (result && result.expired) {
      return res.status(410).json({ error: 'Link expired', expired: true });
    }

    return res.json({ originalUrl: result.originalUrl, expiresAt: result.expiresAt || null, maxClicks: result.maxClicks || null, totalClicks: result.totalClicks || 0 });
  } catch (err) {
    console.error('Resolve route error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
