import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a club
  let club = await prisma.club.findFirst({ where: { name: 'SV Hillegom' } })
  if (!club) {
    club = await prisma.club.create({
      data: {
        name: 'SV Hillegom',
        primaryColor: '#004aad',
      },
    })
  }
  
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
      name: 'Jan de Vries',
      position: 'Aanvaller',
      status: 'Te volgen',
      step: 'Longlist',
      createdById: admin.id,
    },
  })

  const player2 = await prisma.player.create({
    data: {
      clubId: club.id,
      name: 'Piet Bakker',
      position: 'Middenvelder',
      status: 'Actief',
      step: 'Gesprek',
      createdById: admin.id,
    },
  })

  console.log(`Players created: ${player1.name}, ${player2.name}`)

  // 4. Create an example contact moment
  const contact = await prisma.contactMoment.create({
    data: {
      clubId: club.id,
      playerId: player2.id,
      type: 'Intro benadering',
      channel: 'Telefoon',
      outcome: 'Positief',
      notes: 'Goed gesprek gehad, speler staat open voor een vervolggesprek.',
      createdById: admin.id,
    },
  })

  console.log(`Contact moment created for: ${player2.name}`)

  // 5. Create an example task
  const task = await prisma.task.create({
    data: {
      clubId: club.id,
      title: 'Plan vervolggesprek in met Piet Bakker',
      description: 'Na telefonische introductie',
      assignedToId: admin.id,
      createdById: admin.id,
    },
  })

  console.log(`Task created: ${task.title}`)
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
