import { generateCode } from '../utils/base62.js';
import prisma from '../db/prisma.js';
import redis from '../redis/client.js';
import { performance } from 'perf_hooks';
import { logQuery } from '../utils/queryLog.js';

export async function createShortUrl({ originalUrl, alias, expiresInDays, maxClicks }) {
  if (alias) {
    const existing = await prisma.url.findUnique({ where: { alias } });
    if (existing) {
      const err = new Error('ALIAS_TAKEN');
      err.code = 'ALIAS_TAKEN';
      throw err;
    }
  }

  let code = alias || generateCode();
  if (!alias) {
    let attempts = 0;
    while (await prisma.url.findUnique({ where: { code } })) {
      code = generateCode();
      if (++attempts > 10) {
        const err = new Error('CODE_GENERATION_FAILED');
        err.code = 'CODE_GENERATION_FAILED';
        throw err;
      }
    }
  }

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : null;

  const t0 = performance.now();
  const url = await prisma.url.create({
    data: { code, originalUrl, alias, expiresAt, maxClicks }
  });
  const t1 = performance.now();
  logQuery({ type: 'INSERT', table: 'urls', duration: t1 - t0, message: `${code} created` });

  try {
    await redis.setex(
      `url:${code}`,
      86400,
      JSON.stringify({ originalUrl, expiresAt, maxClicks, totalClicks: 0 })
    );
  } catch (err) {
    console.error('Redis setex failed', err);
  }

  return url;
}

export async function resolveUrl(code) {

  const cached = await redis.get(`url:${code}`);
  if (cached) {
    const data = JSON.parse(cached);
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return { expired: true };
    }
    return { originalUrl: data.originalUrl, expiresAt: data.expiresAt, maxClicks: data.maxClicks, totalClicks: data.totalClicks, fromCache: true };
  }

  const t2 = performance.now();
  const url = await prisma.url.findUnique({ where: { code } });
  const t3 = performance.now();
  if (url) {
    logQuery({ type: 'SELECT', table: 'urls', duration: t3 - t2, message: `${code} resolved` });
  }

  if (!url) return null;

  if (url.expiresAt && url.expiresAt < new Date()) {
    return { expired: true };
  }

  if (url.maxClicks && url.totalClicks >= url.maxClicks) {
    return { expired: true };
  }

  try {
    await redis.setex(
      `url:${code}`,
      86400,
      JSON.stringify({ originalUrl: url.originalUrl, expiresAt: url.expiresAt, maxClicks: url.maxClicks, totalClicks: url.totalClicks })
    );
  } catch (err) {
    console.error('Redis setex failed', err);
  }

  return url;
}
