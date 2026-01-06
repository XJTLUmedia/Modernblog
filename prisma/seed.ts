// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// This line tells ts-node to use the correct module system
// @ts-ignore
process.env.TS_NODE_COMPILER_OPTIONS = '{"module":"CommonJS"}'

const prisma = new PrismaClient()

async function main() {
    // Use fallbacks if .env isn't loading in the script context
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
        console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env')
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email: email.toLowerCase() },
        update: { password: hashedPassword },
        create: {
            email: email.toLowerCase(),
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin',
        },
    })

    console.log(`✅ Seed successful. Created/Updated user: ${admin.email}`)
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })