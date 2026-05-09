import express from 'express';
import { z } from 'zod';
import { createShortUrl } from '../services/urlService.js';
import config from '../config/index.js';

const router = express.Router();

const bodySchema = z.object({
  originalUrl: z.string().url(),
  alias: z.string().min(3).max(20).regex(/^[0-9a-zA-Z]+$/).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  maxClicks: z.number().int().min(1).optional()
});

router.post('/shorten', async (req, res) => {
  try {
    const parsed = bodySchema.parse(req.body);
    const url = await createShortUrl(parsed);
    return res.json({
      ...url,
      shortUrl: `${config.BASE_URL}/${url.code}`
    });
  } catch (err) {
    if (err && err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: err.errors });
    }
    if (err && err.code === 'ALIAS_TAKEN') {
      return res.status(409).json({ error: 'Alias already taken' });
    }
    console.error('Shorten error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
