import { PrismaClient } from '@prisma/client';
import { seedBase } from './seed.base';
import { seedDev } from './seed.dev';
import { seedTest } from './seed.test';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding not allowed in production');
  }

  const target = (process.env.SEED_TARGET ?? 'dev').toLowerCase();
  console.log(`Seeding database (target=${target})...`);

  await seedBase(prisma);

  if (target === 'test') {
    await seedTest(prisma);
  } else {
    await seedDev(prisma);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

