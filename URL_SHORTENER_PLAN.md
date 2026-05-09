# URL Shortener — Full Stack Project Plan
> Read this file completely before writing a single line of code. Follow every section precisely.

---

## 📌 Project Overview

A **production-grade fullstack URL shortener** with analytics, custom aliases, and expiry links. Built as a LinkedIn case study post demonstrating system design depth — specifically how caching layers, persistent storage, and real-time analytics work together at scale.

This is NOT a toy project. Every technical decision mirrors how bit.ly, TinyURL, and enterprise URL shorteners work in production.

**Live Demo Goal:** Someone pastes a URL, gets a short link, shares it, and watches the analytics dashboard update in real time with click counts, referrers, and geographic data.

---

## 🎯 Core Features

### 1. URL Shortening
- Paste any long URL → get a short code (e.g. `yourdomain.com/abc123`)
- Base62 encoding (a-z, A-Z, 0-9) for short codes
- Collision detection and retry logic
- URL validation before storing

### 2. Custom Aliases
- User optionally picks their own slug: `yourdomain.com/myportfolio`
- Uniqueness check against existing slugs
- Alphanumeric only, 3-20 characters, no spaces

### 3. Expiry Links
- Expires after X days (e.g. link dies after 7 days)
- OR expires after X clicks (e.g. link dies after 100 clicks)
- OR both conditions (whichever comes first)
- Shows branded "Link Expired" page on expired links
- Expiry stored in PostgreSQL, checked on every redirect

### 4. Analytics Dashboard
- Total clicks, unique clicks (by IP hash)
- Click timeline chart — last 7 days bar chart
- Top referrers list (where traffic is coming from)
- Geographic data — country from IP using ip-api.com
- All stats update in real time as clicks come in

### 5. Redirect Engine
- Sub-millisecond redirects using Redis cache
- Cache miss falls back to PostgreSQL
- Increments click counter atomically in Redis
- Batches write click data to PostgreSQL every 30 seconds

---

## 🧠 System Design — The Architecture Story

This is the core of the LinkedIn post. Every decision has a reason:

```
User visits short URL
        ↓
   Redis Cache lookup (< 1ms)
        ↓ (cache miss)
   PostgreSQL lookup (< 20ms)
        ↓
   Store in Redis cache (TTL 24h)
        ↓
   301/302 redirect to original URL
        ↓ (async, non-blocking)
   Increment Redis click counter (INCR atomic)
        ↓ (every 30 seconds)
   Batch flush click data to PostgreSQL
```

**Why Redis in front of PostgreSQL:**
A popular short link can get thousands of hits per second. Hitting PostgreSQL on every redirect would kill the DB. Redis handles 100K+ ops/sec, costs nothing extra, and makes redirects near-instant.

**Why Base62:**
- 6 character Base62 code = 62^6 = 56 billion possible URLs
- Shorter than Base64 (URL-safe, no +/= characters)
- Easy to type, share, remember

**Why batch writes for analytics:**
Recording a click to PostgreSQL on every redirect adds 20ms latency and hammers the DB under load. Instead: atomic Redis INCR (0.1ms) on every hit, batch flush to PostgreSQL every 30 seconds. Best of both worlds.

---

## 🖥️ Tech Stack

```
BACKEND
Runtime:          Node.js v18+
Framework:        Express.js
Primary DB:       PostgreSQL (persistent storage)
Cache:            Redis (redirects + click counting)
IP Geolocation:   ip-api.com (free, no API key needed)
ID Generation:    nanoid (short unique IDs)
Validation:       zod
ORM:              prisma
Env vars:         dotenv
CORS:             cors

FRONTEND
Framework:        React 18 (Vite)
Styling:          Tailwind CSS + custom CSS
Charts:           Recharts
HTTP Client:      axios
Icons:            Lucide React
Animations:       CSS transitions

DEPLOYMENT
Backend:          Render (free tier)
Frontend:         Vercel (free tier)
PostgreSQL:       Supabase (free tier — 500MB)
Redis:            Redis Cloud (already set up — free 30MB)
Repo:             GitHub (monorepo)
```

---

## 🗂️ Full Project File Structure

```
url-shortener/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma              # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js               # All env vars in one place
│   │   ├── db/
│   │   │   └── prisma.js              # Prisma client singleton
│   │   ├── redis/
│   │   │   └── client.js              # ioredis client
│   │   ├── routes/
│   │   │   ├── shorten.js             # POST /api/shorten
│   │   │   ├── redirect.js            # GET /:code
│   │   │   └── analytics.js           # GET /api/analytics/:code
│   │   ├── services/
│   │   │   ├── urlService.js          # Core shortening logic
│   │   │   ├── cacheService.js        # Redis cache operations
│   │   │   └── analyticsService.js    # Click tracking + batch flush
│   │   ├── utils/
│   │   │   ├── base62.js              # Base62 encode/decode
│   │   │   ├── validate.js            # URL + alias validation
│   │   │   └── geoip.js               # IP to country lookup
│   │   └── server.js                  # Express entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # axios instance + API functions
│   │   ├── components/
│   │   │   ├── Hero.jsx               # Main URL input + shorten form
│   │   │   ├── ResultCard.jsx         # Shows shortened URL + copy button
│   │   │   ├── AnalyticsDashboard.jsx # Full analytics view
│   │   │   ├── ClickChart.jsx         # 7-day bar chart (Recharts)
│   │   │   ├── StatsGrid.jsx          # Total clicks, unique, referrers
│   │   │   ├── GeoTable.jsx           # Country breakdown table
│   │   │   ├── ExpiryBadge.jsx        # Shows expiry status
│   │   │   └── ExpiredPage.jsx        # Branded expired link page
│   │   ├── hooks/
│   │   │   └── useAnalytics.js        # Polls analytics every 5s
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema (Prisma)

### `backend/prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Url {
  id           String   @id @default(cuid())
  code         String   @unique          // short code e.g. "abc123"
  originalUrl  String                    // full original URL
  alias        String?  @unique          // optional custom alias
  createdAt    DateTime @default(now())
  expiresAt    DateTime?                 // null = never expires
  maxClicks    Int?                      // null = unlimited
  totalClicks  Int      @default(0)
  isActive     Boolean  @default(true)

  clicks       Click[]
}

model Click {
  id        String   @id @default(cuid())
  urlCode   String
  url       Url      @relation(fields: [urlCode], references: [code])
  clickedAt DateTime @default(now())
  country   String?
  referrer  String?
  ipHash    String?                      // hashed IP for unique count

  @@index([urlCode, clickedAt])
}
```

---

## ⚙️ Backend Services

### `backend/src/utils/base62.js`
```js
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function isValidCode(code) {
  return /^[0-9a-zA-Z]{3,20}$/.test(code);
}
```

---

### `backend/src/services/urlService.js`
```js
import { generateCode } from '../utils/base62.js';
import prisma from '../db/prisma.js';
import redis from '../redis/client.js';

export async function createShortUrl({ originalUrl, alias, expiresInDays, maxClicks }) {
  // 1. If custom alias provided, check uniqueness
  if (alias) {
    const existing = await prisma.url.findUnique({ where: { alias } });
    if (existing) throw new Error('ALIAS_TAKEN');
  }

  // 2. Generate unique code with collision detection
  let code = alias || generateCode();
  if (!alias) {
    let attempts = 0;
    while (await prisma.url.findUnique({ where: { code } })) {
      code = generateCode();
      if (++attempts > 10) throw new Error('CODE_GENERATION_FAILED');
    }
  }

  // 3. Calculate expiry
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : null;

  // 4. Save to PostgreSQL
  const url = await prisma.url.create({
    data: { code, originalUrl, alias, expiresAt, maxClicks }
  });

  // 5. Cache in Redis
  await redis.setex(`url:${code}`, 86400, JSON.stringify({
    originalUrl, expiresAt, maxClicks, totalClicks: 0
  }));

  return url;
}

export async function resolveUrl(code) {
  // 1. Check Redis cache first
  const cached = await redis.get(`url:${code}`);
  if (cached) {
    const data = JSON.parse(cached);
    // Check expiry
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return { expired: true };
    }
    return { ...data, fromCache: true };
  }

  // 2. Cache miss — check PostgreSQL
  const url = await prisma.url.findUnique({ where: { code } });
  if (!url) return null;

  // 3. Check expiry
  if (url.expiresAt && url.expiresAt < new Date()) {
    return { expired: true };
  }

  // 4. Check max clicks
  if (url.maxClicks && url.totalClicks >= url.maxClicks) {
    return { expired: true };
  }

  // 5. Store in cache
  await redis.setex(`url:${code}`, 86400, JSON.stringify({
    originalUrl: url.originalUrl,
    expiresAt: url.expiresAt,
    maxClicks: url.maxClicks,
    totalClicks: url.totalClicks
  }));

  return url;
}
```

---

### `backend/src/services/analyticsService.js`
```js
import redis from '../redis/client.js';
import prisma from '../db/prisma.js';
import { getCountryFromIp } from '../utils/geoip.js';
import crypto from 'crypto';

// Record a click — fast path (Redis only)
export async function recordClick(code, req) {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  const referrer = req.headers['referer'] || 'direct';
  const country = await getCountryFromIp(ip);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Async fire-and-forget — don't await, don't block redirect
  setImmediate(async () => {
    try {
      await Promise.all([
        redis.incr(`clicks:total:${code}`),
        redis.sadd(`clicks:unique:${code}`, ipHash),
        redis.incr(`clicks:daily:${code}:${today}`),
        redis.incr(`clicks:country:${code}:${country}`),
        redis.incr(`clicks:referrer:${code}:${referrer}`),
      ]);
    } catch (err) {
      console.error('Analytics error', err);
    }
  });
}

// Get analytics for a code
export async function getAnalytics(code) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const [totalClicks, uniqueClicks, ...dailyCounts] = await Promise.all([
    redis.get(`clicks:total:${code}`),
    redis.scard(`clicks:unique:${code}`),
    ...last7Days.map(day => redis.get(`clicks:daily:${code}:${day}`))
  ]);

  // Get top countries
  const countryKeys = await redis.keys(`clicks:country:${code}:*`);
  const countries = await Promise.all(
    countryKeys.map(async key => ({
      country: key.split(':').pop(),
      clicks: parseInt(await redis.get(key) || '0')
    }))
  );

  // Get top referrers
  const referrerKeys = await redis.keys(`clicks:referrer:${code}:*`);
  const referrers = await Promise.all(
    referrerKeys.map(async key => ({
      referrer: key.split(':').pop(),
      clicks: parseInt(await redis.get(key) || '0')
    }))
  );

  return {
    totalClicks: parseInt(totalClicks || '0'),
    uniqueClicks: parseInt(uniqueClicks || '0'),
    dailyClicks: last7Days.map((day, i) => ({
      date: day,
      clicks: parseInt(dailyCounts[i] || '0')
    })),
    countries: countries.sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    referrers: referrers.sort((a, b) => b.clicks - a.clicks).slice(0, 10)
  };
}
```

---

## 🛣️ Backend Routes

### `POST /api/shorten`
**Request body:**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "alias": "mylink",
  "expiresInDays": 7,
  "maxClicks": 100
}
```
**Response 200:**
```json
{
  "code": "abc123",
  "shortUrl": "https://your-backend.onrender.com/abc123",
  "originalUrl": "https://example.com/very/long/url",
  "expiresAt": "2026-05-17T00:00:00.000Z",
  "maxClicks": 100,
  "createdAt": "2026-05-10T00:00:00.000Z"
}
```

---

### `GET /:code`
- Resolves short code → original URL
- Returns 301 redirect if found
- Returns 410 Gone if expired
- Records click async (non-blocking)

---

### `GET /api/analytics/:code`
**Response:**
```json
{
  "totalClicks": 247,
  "uniqueClicks": 183,
  "dailyClicks": [
    { "date": "2026-05-04", "clicks": 12 },
    { "date": "2026-05-05", "clicks": 34 }
  ],
  "countries": [
    { "country": "India", "clicks": 120 },
    { "country": "US", "clicks": 45 }
  ],
  "referrers": [
    { "referrer": "linkedin.com", "clicks": 89 },
    { "referrer": "direct", "clicks": 158 }
  ]
}
```

---

## 🎨 Design Aesthetic

**Theme:** Clean, modern SaaS — think Linear, Vercel dashboard, Raycast. Dark mode. Feels like a real product, not a student project.

```css
:root {
  --bg-primary: #080b14;
  --bg-card: #0f1623;
  --bg-card-hover: #161e2e;
  --accent-primary: #3b82f6;
  --accent-secondary: #8b5cf6;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  --accent-yellow: #f59e0b;
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
  --border: #1e293b;
  --gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
}
```

**Fonts:** `Sora` (headings) + `DM Sans` (body) — from Google Fonts

**Key UI moments:**
- URL input has a gradient border glow on focus
- Short URL result card slides in with animation
- Copy button flashes green + shows "Copied!" for 2 seconds
- Analytics charts animate in on load
- Expired page has a clean 404-style design with your branding

---

## 📱 Pages / Views

### Page 1 — Home (Shortener)
```
[Header: Logo + "URL Shortener"]

[Hero: Big headline]
"Make every link count."

[URL Input — large, centered]
[ https://your-very-long-url.com/paste/here    ] [Shorten →]

[Advanced options — collapsible]
  Custom alias: [ mylink        ]
  Expires in:   [ 7 days ▾     ]
  Max clicks:   [ 100           ]

[Result card — appears after shortening]
  ✓ Link created!
  yourdomain.com/abc123  [Copy] [View Analytics →]
  Expires: May 17, 2026 | Max clicks: 100
```

### Page 2 — Analytics Dashboard
```
[Back button] [Short URL: yourdomain.com/abc123]

[Stats Grid]
  247 Total Clicks | 183 Unique | 6 Countries | 3 Referrers

[Click Timeline — 7-day bar chart]

[Two columns]
  Left:  Top Countries table
  Right: Top Referrers table

[Expiry status badge]
  ⏱ Expires May 17, 2026 (7 days left)
  OR
  ✓ No expiry set
```

### Page 3 — Expired Link
```
[Big icon: 🔗 with X]
"This link has expired."
"The link you followed is no longer active."
[Create your own short link →]
```

---

## 🌍 Environment Variables

### `backend/.env.example`
```
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:3001
```

### `frontend/.env.example`
```
VITE_API_URL=http://localhost:3001
```

---

## 🚀 Local Dev Setup

```bash
# 1. Clone repo
git clone https://github.com/yourusername/url-shortener
cd url-shortener

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL from Supabase, REDIS_URL from Redis Cloud

# 3. Run Prisma migrations
npx prisma migrate dev --name init
npx prisma generate

# 4. Start backend
npm run dev   # http://localhost:3001

# 5. Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev   # http://localhost:5173
```

---

## ☁️ Deployment

```
PostgreSQL  → Supabase (free tier)
             Sign up at supabase.com
             Create new project → copy DATABASE_URL

Redis       → Redis Cloud (already set up ✅)

Backend     → Render
             Root: /backend
             Build: npm install && npx prisma generate
             Start: node src/server.js
             Env vars: DATABASE_URL, REDIS_URL, CORS_ORIGIN, BASE_URL

Frontend    → Vercel
             Root: /frontend
             Env vars: VITE_API_URL
```

---

## ✅ Definition of Done

- [ ] POST /api/shorten creates URL in PostgreSQL + caches in Redis
- [ ] GET /:code redirects in < 5ms (Redis cache hit)
- [ ] GET /:code falls back to PostgreSQL on cache miss
- [ ] Custom alias works and validates uniqueness
- [ ] Expiry by date works — expired links show branded page
- [ ] Expiry by max clicks works
- [ ] Click recording is non-blocking (doesn't slow redirect)
- [ ] Analytics endpoint returns correct daily/country/referrer data
- [ ] Frontend copy button works with clipboard API
- [ ] Analytics chart renders with real data
- [ ] Works on mobile
- [ ] Deployed on Render + Vercel + Supabase

---

## 💡 Copilot Prompt

```
Read URL_SHORTENER_PLAN.md completely before writing any code.

This is a fullstack project:
- Backend: Node.js + Express + PostgreSQL (Prisma) + Redis (ioredis)
- Frontend: React 18 + Vite + Tailwind CSS + Recharts + axios

Build in this exact order:
1. backend/ scaffold — Express + Prisma + ioredis + dotenv + cors + zod
2. backend/prisma/schema.prisma — exactly as in the plan
3. backend/src/db/prisma.js — Prisma client singleton
4. backend/src/redis/client.js — ioredis connection
5. backend/src/utils/base62.js — generateCode + isValidCode
6. backend/src/utils/geoip.js — fetch country from ip-api.com
7. backend/src/services/urlService.js — createShortUrl + resolveUrl
8. backend/src/services/analyticsService.js — recordClick + getAnalytics
9. backend/src/routes/shorten.js — POST /api/shorten
10. backend/src/routes/redirect.js — GET /:code
11. backend/src/routes/analytics.js — GET /api/analytics/:code
12. backend/src/server.js — Express entry point
13. frontend/ scaffold — Vite + React + Tailwind
14. frontend/src/api/client.js — axios client
15. All frontend components in order listed
16. Wire everything together

Follow the design aesthetic exactly — dark SaaS theme, Sora + DM Sans fonts,
CSS variables as specified. Do NOT skip Prisma. Do NOT skip Redis caching.
Build the complete project.
```

---

*File version: 1.0 | LinkedIn comeback post 2 — URL Shortener System Design Deep Dive*
