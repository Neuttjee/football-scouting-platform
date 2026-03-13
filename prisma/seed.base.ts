import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function seedBase(prisma: PrismaClient) {
  console.log('Seeding base data (Platform club + SUPERADMIN)...');

  const passwordHash = await bcrypt.hash('Admin12345', 10);

  // 1. Platform club (alleen voor superadmin user – wordt niet getoond in de clubs-tabel)
  let platformClub = await prisma.club.findFirst({ where: { name: 'Platform' } });
  if (!platformClub) {
    platformClub = await prisma.club.create({
      data: {
        name: 'Platform',
        primaryColor: '#64748b',
      },
    });
    console.log(`Platform club created: ${platformClub.name}`);
  }

  // 2. Superadmin user (admin@example.com / Admin12345). Clubs voeg je handmatig toe via Superadmin.
  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'SUPERADMIN', clubId: platformClub.id },
    create: {
      email: 'admin@example.com',
      name: 'Superadmin',
      passwordHash,
      role: 'SUPERADMIN',
      clubId: platformClub.id,
    },
  });
  console.log(`Superadmin created or updated: ${superadmin.email} (SUPERADMIN)`);
}

