
import prisma from "@packages/prisma";
import cron from 'node-cron'

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    // Delete products where deletedAt is older than 24 hours
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        isDeleted: true,
        deleteAt: { lte: now },
      },
    });

    console.log(`${deletedProducts.count} expired products permanently deleted.`);
  } catch (error) {}
});