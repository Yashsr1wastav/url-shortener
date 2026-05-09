import express from 'express';
import { resolveUrl } from '../services/urlService.js';
import { recordClick } from '../services/analyticsService.js';

const router = express.Router();

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await resolveUrl(code);
    if (result === null) {
      return res.status(404).json({ error: 'Link not found' });
    }
    if (result && result.expired) {
      return res.status(410).json({ error: 'Link expired', expired: true });
    }

    const originalUrl = result.originalUrl || result.originalUrl;

    // record click asynchronously (non-blocking)
    try {
      recordClick(code, req);
    } catch (e) {
      console.error('recordClick failed', e);
    }

    return res.redirect(301, originalUrl);
  } catch (err) {
    console.error('Redirect error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
