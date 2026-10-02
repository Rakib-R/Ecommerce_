import { PrismaClient } from '@prisma/client';

type PrismaClientSingleton = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// ✅ Declare prisma FIRST so withRetry can reference it
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma;

// ✅ Now withRetry can safely use prisma
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isConnectionError =
        err.message?.includes('Server selection timeout') ||
        err.message?.includes('timed out');

      if (isConnectionError && i < retries - 1) {
        console.warn(
          `⚠️ DB timeout — retrying (${i + 1}/${retries}) in ${delay}ms...`
        );
        await prisma.$disconnect();
        await new Promise((r) => setTimeout(r, delay));
        await prisma.$connect();
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached');
}
