import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('Admin12345', 10)

  // 1. Platform club (for superadmin – always exists)
  let platformClub = await prisma.club.findFirst({ where: { name: 'Platform' } })
  if (!platformClub) {
    platformClub = await prisma.club.create({
      data: {
        name: 'Platform',
        primaryColor: '#64748b',
      },
    })
    console.log(`Platform club created: ${platformClub.name}`)
  }

  // 2. Superadmin user (standaard in code – admin@example.com / Admin12345)
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
  })
  console.log(`Superadmin created: ${superadmin.email} (SUPERADMIN)`)

  // 3. Demo club (SV Hillegom)
  let club = await prisma.club.findFirst({ where: { name: 'SV Hillegom' } })
  if (!club) {
    club = await prisma.club.create({
      data: {
        name: 'SV Hillegom',
        primaryColor: '#004aad',
      },
    })
    console.log(`Demo club created: ${club.name}`)
  }

  // 4. Demo club admin (voor testen van gewone club-omgeving)
  const admin = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo Club Admin',
      passwordHash,
      role: 'ADMIN',
      clubId: club.id,
    },
  })
  console.log(`Demo admin created: ${admin.email}`)

  // 5. Example players (only if none exist for this club)
  const existingPlayers = await prisma.player.count({ where: { clubId: club.id } })
  let player1: { id: string; name: string }, player2: { id: string; name: string }
  if (existingPlayers === 0) {
    player1 = await prisma.player.create({
      data: {
        clubId: club.id,
        name: 'Jan de Vries',
        position: 'Aanvaller',
        status: 'Te volgen',
        step: 'Longlist',
        createdById: admin.id,
      },
    })
    player2 = await prisma.player.create({
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
  } else {
    const [p1, p2] = await prisma.player.findMany({ where: { clubId: club.id }, take: 2 })
    player1 = p1
    player2 = p2 ?? p1
  }

  // 6. Example contact moment and task (only when we just created players)
  if (existingPlayers === 0) {
    await prisma.contactMoment.create({
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

    await prisma.task.create({
      data: {
        clubId: club.id,
        title: 'Plan vervolggesprek in met Piet Bakker',
        description: 'Na telefonische introductie',
        assignedToId: admin.id,
        createdById: admin.id,
      },
    })
    console.log('Example task created.')
  }

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
