const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  try {
    console.log('Generating Prisma Client...')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Generate client
    const result = await prisma.$generateClient()
    console.log('✅ Prisma Client generated')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error generating Prisma Client:', error)
    process.exit(1)
  }
}

main()
