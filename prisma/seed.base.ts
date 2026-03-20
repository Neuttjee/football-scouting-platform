import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function seedBase(prisma: PrismaClient) {
  console.log('Seeding base data (Platform club + SUPERADMIN)...');

  const superadminEmail = (process.env.SUPERADMIN_EMAIL ?? 'admin@example.com').trim();
  const superadminPassword = process.env.SUPERADMIN_PASSWORD?.trim();

  if (!superadminPassword) {
    throw new Error('Missing SUPERADMIN_PASSWORD. Set it in your environment before running `prisma db seed`.');
  }

  const passwordHash = await bcrypt.hash(superadminPassword, 10);

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

  // 2. Superadmin user.
  // In dev wordt dit account geset met SUPERADMIN_EMAIL + SUPERADMIN_PASSWORD uit je environment.
  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: { role: 'SUPERADMIN', clubId: platformClub.id, passwordHash },
    create: {
      email: superadminEmail,
      name: 'Superadmin',
      passwordHash,
      role: 'SUPERADMIN',
      clubId: platformClub.id,
    },
  });
  console.log(`Superadmin created or updated: ${superadmin.email} (SUPERADMIN)`);
}

