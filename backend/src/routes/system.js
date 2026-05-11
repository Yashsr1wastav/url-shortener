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

const defaultStats = {
  urlCount: 0,
  clickCount: 0,
  lastUrlCreated: 'unknown',
  lastClickRecorded: 'unknown',
};

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout')), ms)
  ),
]);

router.get('/system/stats', async (req, res) => {
  try {
    const [urlCount, clickCount, lastUrlTime, lastClickTime] = await Promise.all([
      redis.get('system:url_count'),
      redis.get('system:click_count'),
      redis.get('system:last_url_time'),
      redis.get('system:last_click_time'),
    ]);

    res.json({
      urlCount: parseInt(urlCount || '0'),
      clickCount: parseInt(clickCount || '0'),
      lastUrlCreated: lastUrlTime ? timeAgo(parseInt(lastUrlTime)) : 'never',
      lastClickRecorded: lastClickTime ? timeAgo(parseInt(lastClickTime)) : 'never'
    });
  } catch (err) {
    console.error('system stats error', err);
    res.status(200).json(defaultStats);
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
