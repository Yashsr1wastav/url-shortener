import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => {
  console.error('Redis error', err);
});

export default redis;
