import redis from '../redis/client.js';
import prisma from '../db/prisma.js';
import { getCountryFromIp } from '../utils/geoip.js';
import crypto from 'crypto';
import { performance } from 'perf_hooks';
import { logQuery } from '../utils/queryLog.js';

export async function recordClick(code, req) {
  const ip = req.headers['x-forwarded-for'] || req.ip || '';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  const referrer = req.headers['referer'] || 'direct';
  const country = await getCountryFromIp(ip);
  const today = new Date().toISOString().split('T')[0];

  setImmediate(async () => {
    try {
      const t0 = performance.now();
      await Promise.all([
        redis.incr(`clicks:total:${code}`),
        redis.sadd(`clicks:unique:${code}`, ipHash),
        redis.incr(`clicks:daily:${code}:${today}`),
        redis.incr(`clicks:country:${code}:${country}`),
        redis.incr(`clicks:referrer:${code}:${referrer}`),
      ]);
      const t1 = performance.now();
      logQuery({ type: 'INSERT', table: 'clicks', duration: t1 - t0, message: `Click on ${code}` });
    } catch (err) {
      console.error('Analytics error', err);
    }
  });
}

export async function getAnalytics(code) {
  const url = await prisma.url.findUnique({
    where: { code },
    select: { expiresAt: true, maxClicks: true, totalClicks: true, isActive: true, createdAt: true }
  });

  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const results = await Promise.all([
    redis.get(`clicks:total:${code}`),
    redis.scard(`clicks:unique:${code}`),
    ...last7Days.map(day => redis.get(`clicks:daily:${code}:${day}`))
  ]);

  const totalClicks = parseInt(results[0] || '0');
  const uniqueClicks = parseInt(results[1] || '0');
  const dailyCounts = results.slice(2).map(v => parseInt(v || '0'));

  const countryKeys = await redis.keys(`clicks:country:${code}:*`);
  const countries = await Promise.all(
    countryKeys.map(async key => ({
      country: key.split(':').pop(),
      clicks: parseInt(await redis.get(key) || '0')
    }))
  );

  const referrerKeys = await redis.keys(`clicks:referrer:${code}:*`);
  const referrers = await Promise.all(
    referrerKeys.map(async key => ({
      referrer: key.split(':').pop(),
      clicks: parseInt(await redis.get(key) || '0')
    }))
  );

  return {
    expiresAt: url?.expiresAt || null,
    maxClicks: url?.maxClicks || null,
    totalUrlClicks: url?.totalClicks || 0,
    isActive: url?.isActive ?? true,
    totalClicks,
    uniqueClicks,
    dailyClicks: last7Days.map((day, i) => ({ date: day, clicks: dailyCounts[i] })),
    countries: countries.sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    referrers: referrers.sort((a, b) => b.clicks - a.clicks).slice(0, 10)
  };
}
