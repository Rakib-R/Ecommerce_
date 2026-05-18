// Change this line:

import { Redis } from '@upstash/redis'

const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

const redis = new Redis({
  url: process.env['UPSTASH_REDIS_REST_URL'] as string,
  token,
})

// ONLY AVAILABLE IN IO-REDIS
// redis.on("connect", () => console.log("✅ Redis connected successfully!"));
// redis.on("error", (err : unknown) => console.error("❌ Redis Error:", err));

export default redis;