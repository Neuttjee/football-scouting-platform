import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a club
  const club = await prisma.club.upsert({
    where: { slug: 'sv-hillegom' },
    update: {},
    create: {
      name: 'SV Hillegom',
      slug: 'sv-hillegom',
      primaryColor: '#004aad',
      secondaryColor: '#ffffff',
    },
  })
  
  console.log(`Club created: ${club.name}`)

  // 2. Create an admin user
  const passwordHash = await bcrypt.hash('Admin12345', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      clubId: club.id,
    },
  })
  
  console.log(`Admin user created: ${admin.email}`)

  // 3. Create a couple of example players
  const player1 = await prisma.player.create({
    data: {
      clubId: club.id,
      naam: 'Jan de Vries',
      clubHuidig: 'VV Lisse',
      team: 'Zondag 1',
      niveauCompetitie: '1e Klasse',
      positie: 'Aanvaller',
      leeftijd: 24,
      voorkeursbeen: 'RECHTS',
      status: 'TE_VOLGEN',
      processtap: 'LONGLIST',
      advies: 'NOG_BEKIJKEN',
      createdByUserId: admin.id,
    },
  })

  const player2 = await prisma.player.create({
    data: {
      clubId: club.id,
      naam: 'Piet Bakker',
      clubHuidig: 'FC Lisse',
      team: 'O23',
      niveauCompetitie: 'Divisie',
      positie: 'Middenvelder',
      leeftijd: 21,
      voorkeursbeen: 'LINKS',
      status: 'ACTIEF',
      processtap: 'TELEFONISCH_CONTACT',
      advies: 'BENADEREN',
      createdByUserId: admin.id,
    },
  })

  console.log(`Players created: ${player1.naam}, ${player2.naam}`)

  // 4. Create an example contact moment
  const contact = await prisma.contactMoment.create({
    data: {
      clubId: club.id,
      playerId: player2.id,
      contactType: 'INTRO_BENADERING',
      kanaal: 'TELEFOON',
      uitkomst: 'POSITIEF',
      samenvatting: 'Goed gesprek gehad, speler staat open voor een vervolggesprek.',
      createdByUserId: admin.id,
    },
  })

  console.log(`Contact moment created for: ${player2.naam}`)

  // 5. Create an example task
  const task = await prisma.task.create({
    data: {
      clubId: club.id,
      titel: 'Plan vervolggesprek in met Piet Bakker',
      playerId: player2.id,
      eigenaarUserId: admin.id,
      prioriteit: 'HOOG',
      status: 'OPEN',
      createdByUserId: admin.id,
      deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
    },
  })

  console.log(`Task created: ${task.titel}`)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })