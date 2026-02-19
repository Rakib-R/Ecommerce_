// Change this line:
import { Redis } from "ioredis"; 

const client = new Redis(process.env.REDIS_URL as string);

client.on("connect", () => console.log("✅ Redis connected successfully!"));
client.on("error", (err: any) => console.error("❌ Redis Error:", err));

export default client;