import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('Password123!', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'hacker@demo.com' },
    update: {},
    create: {
      email: 'hacker@demo.com',
      password,
      balance: 10000,
      wallets: {
        create: {
          publicKey: 'GC3HSABXAKAECMB3KZPJLNLSJCALG7GHKJ5NFMQCCQDLPJJQBHCCCMV',
          secretKey: 'SCMOCQECBKXR6L57QDWVXS5QDUJBHHQDIXMNLNX7KBYQJWQKMIGM77T',
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password,
      balance: 50000,
      wallets: {
        create: {
          publicKey: 'GA7QYNF7SOWQ3TL3LMQDMQBVQULKNB3KVLWGLFQHSCEHBXBQWFQHVPQ',
          secretKey: 'SB7HCGUDTXJPQXFGFR7CBQVJGK5EOXBGVAVQUQHQ74SBZWDFHUJNMZQ',
        },
      },
    },
  });

  console.log(`✅ Created user: ${user1.email} (balance: ${user1.balance})`);
  console.log(`✅ Created user: ${user2.email} (balance: ${user2.balance})`);
  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('   Email: hacker@demo.com');
  console.log('   Password: Password123!');
}

seed()
  .catch((e) => {
    console.error('[Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
