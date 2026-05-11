import express from 'express';
import prisma from '../db/prisma.js';
import { getRecentQueries } from '../utils/queryLog.js';
import redis from '../redis/client.js';

const router = express.Router();

function timeAgo(ts) {
  if (!ts) return 'never';
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

router.get('/system/stats', async (req, res) => {
  try {
    const urlCountP = prisma.url.count();
    const clickCountP = prisma.click.count();
    const lastUrlP = prisma.url.findFirst({ orderBy: { createdAt: 'desc' } });
    const lastClickP = prisma.click.findFirst({ orderBy: { clickedAt: 'desc' } });

    const [urlCount, clickCount, lastUrl, lastClick] = await Promise.all([urlCountP, clickCountP, lastUrlP, lastClickP]);

    res.json({
      urlCount,
      clickCount,
      lastUrlCreated: lastUrl ? timeAgo(lastUrl.createdAt) : 'never',
      lastClickRecorded: lastClick ? timeAgo(lastClick.createdAt) : 'never'
    });
  } catch (err) {
    console.error('system stats error', err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/system/recent-queries', (req, res) => {
  try {
    const q = getRecentQueries();
    res.json(q);
  } catch (err) {
    console.error('recent-queries error', err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/system/cache/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const exists = await redis.exists(`url:${code}`);
    res.json({ cached: !!exists });
  } catch (err) {
    console.error('cache check error', err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
