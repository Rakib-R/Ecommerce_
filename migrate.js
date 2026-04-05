
// migrate-fields.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateFieldNames() {
  try {

     // Check exact collection name first
    const before = await prisma.product.findFirst()
    console.log('📄 Sample doc BEFORE:', JSON.stringify(before, null, 2))

    await prisma.$runCommandRaw({
      update: "Product", // your collection name
      updates: [
        {
          q: {},
          u: {
            $rename: {
              "regular_price": "regularPrice",   // mongoName → prismaName
              "sale_price": "salePrice",
              "createdAt": "created_at",
              // add all your mismatched fields here
            }
          },
          multi: true
        }
      ]
    })

    console.log('✅ Field names synced with Prisma schema!')
      const after = await prisma.product.findFirst()
    console.log('📄 Sample doc AFTER:', JSON.stringify(after, null, 2))
    
  } catch (error) {
    console.error('❌ Failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateFieldNames()