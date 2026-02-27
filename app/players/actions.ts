'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function savePlayerLogic(playerId: string | null, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const position = formData.get('position') as string;
  const secondaryPosition = formData.get('secondaryPosition') as string;
  const preferredFoot = formData.get('preferredFoot') as string;
  const team = formData.get('team') as string;
  const step = formData.get('step') as string || null;
  const statusInput = formData.get('status') as string || null;

  const currentClub = formData.get('currentClub') as string || null;
  const advies = formData.get('advies') as string || null;
  const niveau = formData.get('niveau') as string || null;
  const contactPerson = formData.get('contactPerson') as string || null;
  const notes = formData.get('notes') as string || null;

  let dateOfBirth: Date | null = null;
  const dobStr = formData.get('dateOfBirth') as string;
  if (dobStr) {
    dateOfBirth = new Date(dobStr);
  }

  // Geen automatische mapping meer:
  // - step wordt gewoon opgeslagen zoals gekozen
  // - status komt direct uit het formulier (statusInput)

  if (playerId) {
    // Update
    await prisma.player.update({
      where: { id: playerId, clubId: session.user.clubId },
      data: {
        name,
        position,
        secondaryPosition,
        preferredFoot,
        team,
        dateOfBirth,
        step,
        status: statusInput, // direct uit formulier
        currentClub,
        advies,
        niveau,
        contactPerson,
        notes,
      },
    });
  } else {
    // Create
    await prisma.player.create({
      data: {
        name,
        position,
        secondaryPosition,
        preferredFoot,
        team,
        dateOfBirth,
        step,
        status: statusInput, // direct uit formulier
        currentClub,
        advies,
        niveau,
        contactPerson,
        notes,
        clubId: session.user.clubId,
        createdById: session.user.id,
      },
    });
  }
}

export async function createPlayer(formData: FormData) {
  await savePlayerLogic(null, formData);
  revalidatePath('/players');
  redirect('/players');
}

export async function updatePlayer(playerId: string, formData: FormData) {
  await savePlayerLogic(playerId, formData);
  revalidatePath('/players');
  redirect('/players');
}

export async function updatePlayerProfile(playerId: string, formData: FormData) {
  await savePlayerLogic(playerId, formData);
  revalidatePath(`/players/${playerId}/profile`);
  redirect(`/players/${playerId}/profile`);
}

export async function updatePlayerField(
  playerId: string,
  field: string,
  value: string | null
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.player.update({
    where: { id: playerId, clubId: session.user.clubId },
    data: {
      [field]: value,
    },
  });

  revalidatePath("/players");
}

export async function searchPlayers(query: string) {
  const session = await getSession();
  if (!session) return [];
  
  if (!query || query.trim() === '') return [];

  const players = await prisma.player.findMany({
    where: {
      clubId: session.user.clubId,
      name: { contains: query, mode: 'insensitive' }
    },
    select: {
      id: true,
      name: true,
      currentClub: true,
      position: true
    },
    take: 5
  });

  return players;
}
