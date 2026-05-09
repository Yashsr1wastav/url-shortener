import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shortenRouter from './routes/shorten.js';
import analyticsRouter from './routes/analytics.js';
import redirectRouter from './routes/redirect.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api', shortenRouter);
app.use('/api', analyticsRouter);
// mount redirect last to avoid /api conflicts
app.use('/', redirectRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
