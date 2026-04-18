import { createClient } from 'redis';

function hasRedisConfig() {
  return Boolean(
    process.env.REDIS_HOST &&
      process.env.REDIS_PORT &&
      process.env.REDIS_USERNAME &&
      process.env.REDIS_PASSWORD
  );
}

function createRedisConnection() {
  const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      connectTimeout: 5000,
    },
  });

  // Keep logging simple so Redis outages are visible in server logs.
  client.on('error', (error) => {
    console.error('Redis Client Error', error);
  });

  return client;
}

type RedisConnection = ReturnType<typeof createRedisConnection>;

let redisClient: RedisConnection | null = null;
let redisConnectPromise: Promise<RedisConnection | null> | null = null;

export async function getRedisClient() {
  if (!hasRedisConfig()) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    redisClient = createRedisConnection();
    redisConnectPromise = redisClient
      .connect()
      .then(() => redisClient)
      .catch((error) => {
        console.error('Redis connection failed', error);
        redisClient = null;
        return null;
      })
      .finally(() => {
        redisConnectPromise = null;
      });
  }

  return redisConnectPromise;
}
