import express from 'express';
import { z } from 'zod';
import { createShortUrl } from '../services/urlService.js';

const router = express.Router();

const bodySchema = z.object({
  originalUrl: z.string().url(),
  alias: z.string().min(3).max(20).regex(/^[0-9a-zA-Z]+$/).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  maxClicks: z.number().int().min(1).optional()
});

router.post('/shorten', async (req, res) => {
  try {
    let { originalUrl, alias, expiresInDays, maxClicks } = req.body || {};

    // Auto-prepend https:// if missing
    if (originalUrl && !originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      originalUrl = 'https://' + originalUrl;
    }

    const parsed = bodySchema.parse({ originalUrl, alias, expiresInDays, maxClicks });
    const url = await createShortUrl(parsed);
    const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');

    // Return the full canonical short URL from the backend environment.
    return res.json({
      code: url.code,
      shortUrl: baseUrl ? `${baseUrl}/${url.code}` : null,
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt,
      maxClicks: url.maxClicks,
      createdAt: url.createdAt
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
