require('dotenv').config(); // This loads the .env variables
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Pulling from .env
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env');
        process.exit(1);
    }

    console.log('--- Seeding Started ---');
    console.log(`Target Email: ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email: email.toLowerCase().trim() },
        update: {
            password: hashedPassword,
            role: 'admin', // Ensure role is set to admin on update
        },
        create: {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin', // Set role to admin when creating
        },
    });

    console.log('✅ Success! Admin user is ready in the database.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });