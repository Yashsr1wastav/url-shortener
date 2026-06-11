import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shortenRouter from './routes/shorten.js';
import analyticsRouter from './routes/analytics.js';
import redirectRouter from './routes/redirect.js';
import systemRouter from './routes/system.js';
import prisma from './db/prisma.js';

dotenv.config();

const app = express();

function normalizeOrigin(origin) {
  if (!origin || origin === '*') {
    return origin || '*';
  }

  return origin.endsWith('/') ? origin.slice(0, -1) : origin;
}

app.use(cors({ origin: normalizeOrigin(process.env.CORS_ORIGIN) }));
app.use(express.json());

app.get('/', (req, res) => res.json({ name: 'linkr API', status: 'ok', version: '1.0' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api', shortenRouter);
app.use('/api', analyticsRouter);
app.use('/api', systemRouter);
// mount redirect last to avoid /api conflicts
app.use('/', redirectRouter);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  return next(err);
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT.`);
    process.exit(1);
  }

  console.error('Server error', error);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Prisma disconnect failed', error);
    }
    process.exit(0);
  });
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.once('SIGUSR2', () => {
  void shutdown('SIGUSR2');
});
