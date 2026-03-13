import { PrismaClient } from '@prisma/client';

export async function seedDev(prisma: PrismaClient) {
  console.log('Seeding additional dev data (optional demo club)...');

  const existing = await prisma.club.findFirst({ where: { name: 'Dev Demo Club' } });
  if (existing) {
    console.log('Dev Demo Club already exists, skipping dev-specific seed.');
    return;
  }

  const demoClub = await prisma.club.create({
    data: {
      name: 'Dev Demo Club',
      primaryColor: '#0ea5e9',
    },
  });

  console.log(`Dev Demo Club created: ${demoClub.name}`);
}

