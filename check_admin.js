const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function main() {
    const users = await prisma.user.findMany()
    fs.writeFileSync('users_debug.json', JSON.stringify(users, null, 2))
    console.log('Users written to users_debug.json')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
