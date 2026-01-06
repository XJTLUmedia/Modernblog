// Script to check and fix user role
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
        console.error('Error: ADMIN_EMAIL not found in .env');
        process.exit(1);
    }

    console.log('--- Checking User Role ---');
    console.log(`Checking email: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            console.error(`❌ User with email ${email} not found in database.`);
            console.error('   Please run the seed script first to create the user.');
            process.exit(1);
        }

        console.log('\n📋 Current User Info:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Is Admin: ${user.role === 'admin' ? '✅ YES' : '❌ NO'}`);

        if (user.role !== 'admin') {
            console.log('\n⚠️  User does NOT have admin role!');
            console.log('   Updating role to admin...');

            const updated = await prisma.user.update({
                where: { id: user.id },
                data: { role: 'admin' }
            });

            console.log('✅ Success! User role updated to admin.');
            console.log(`   New role: ${updated.role}`);
        } else {
            console.log('\n✅ User already has admin role. No changes needed.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
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

