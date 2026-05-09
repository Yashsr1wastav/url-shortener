import dotenv from 'dotenv';
dotenv.config();

const get = (key, fallback = undefined) => process.env[key] ?? fallback;

export default {
  PORT: get('PORT', '3001'),
  DATABASE_URL: get('DATABASE_URL', ''),
  REDIS_URL: get('REDIS_URL', 'redis://localhost:6379'),
  CORS_ORIGIN: get('CORS_ORIGIN', '*'),
  BASE_URL: get('BASE_URL', `http://localhost:${process.env.PORT || 3001}`),
};
