import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  connectTimeout: 5000,
  enableReadyCheck: true,
});


redis.on('error', (err) => {
  console.error('[Redis Client] Error connecting:', err.message);
});
