import { PrismaClient } from '@prisma/client';

export async function seedTest(prisma: PrismaClient) {
  console.log('Seeding test data (fictieve clubs en spelers)...');

  // Fictieve testclub
  let club = await prisma.club.findFirst({
    where: { name: 'Testclub Noord' },
  });

  if (!club) {
    club = await prisma.club.create({
      data: {
        name: 'Testclub Noord',
        primaryColor: '#22c55e',
      },
    });
  }

  // Zorg voor een eenvoudige testgebruiker (SCOUT) in de testclub
  const scoutEmail = 'scout@testclub-noord.example';
  await prisma.user.upsert({
    where: { email: scoutEmail },
    update: {
      clubId: club.id,
    },
    create: {
      email: scoutEmail,
      name: 'Test Scout',
      role: 'SCOUT',
      clubId: club.id,
      isActive: true,
    },
  });

  // Een paar fictieve spelers
  const existingPlayers = await prisma.player.count({ where: { clubId: club.id } });
  if (existingPlayers === 0) {
    await prisma.player.createMany({
      data: [
        {
          name: 'Fictieve Speler 1',
          type: 'EXTERNAL',
          position: 'CM',
          clubId: club.id,
        },
        {
          name: 'Fictieve Speler 2',
          type: 'EXTERNAL',
          position: 'ST',
          clubId: club.id,
        },
      ],
    });
    console.log('Test players created for Testclub Noord');
  } else {
    console.log('Test players already exist, skipping creation.');
  }
}

