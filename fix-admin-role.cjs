// Script to fix admin role for existing user
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL;
    
    if (!email) {
        console.error('❌ Error: ADMIN_EMAIL not found in .env');
        process.exit(1);
    }

    console.log('--- Fixing Admin Role ---');
    console.log(`Target Email: ${email}`);

    try {
        const user = await prisma.user.update({
            where: { email: email.toLowerCase().trim() },
            data: {
                role: 'admin'
            }
        });

        console.log(`✅ Success! User ${user.email} is now an admin.`);
        console.log(`   Role: ${user.role}`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`❌ Error: User with email ${email} not found in database.`);
            console.error('   Please run the seed script first to create the user.');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

