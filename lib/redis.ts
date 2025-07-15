import { createClient } from 'redis';
import 'server-only';

// Configuration options for Redis client
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries: number) => {
      // Exponential backoff with max delay of 10 seconds
      const delay = Math.min(Math.pow(2, retries) * 100, 10000);
      return delay;
    },
  },
};

// Create a singleton Redis client
let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client
export async function getRedisClient() {
  if (!redisClient) {
    try {
      redisClient = createClient(redisConfig);
      await redisClient.connect();
      console.log('Redis client connected');
    } catch (error) {
      console.error('Redis client connection error:', error);
      redisClient = null;
      // Return null instead of throwing to allow graceful fallback
    }
  }
  return redisClient;
}

// Cache data with TTL (Time To Live)
export async function cacheData<T>(key: string, data: T, ttlSeconds = 3600): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;
  
  try {
    await client.set(key, JSON.stringify(data), { EX: ttlSeconds });
    return true;
  } catch (error) {
    console.error('Redis cache error:', error);
    return false;
  }
}

// Get cached data
export async function getCachedData<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  if (!client) return null;
  
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

// Delete cached data
export async function deleteCachedData(key: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;
  
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

// Cache key generator helper
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${String(params[key])}`)
    .join('&');
    
  return `${prefix}:${sortedParams}`;
}

// Check if Redis is available
export async function isRedisAvailable(): Promise<boolean> {
  const client = await getRedisClient();
  return client !== null;
} 