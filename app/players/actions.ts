'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { mapTargetStepToStatus } from '@/lib/statusMapping';

export async function createPlayer(formData: FormData) {
  await savePlayer(null, formData);
}

export async function updatePlayer(playerId: string, formData: FormData) {
  await savePlayer(playerId, formData);
}

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

  // Calculate automated status
  const mappedStatus = mapTargetStepToStatus(step);
  let finalStatus = mappedStatus;
  let statusManuallyChanged = false;

  // If user provided a status and it differs from mapped status, it's a manual override
  if (statusInput && statusInput !== mappedStatus) {
    finalStatus = statusInput;
    statusManuallyChanged = true;
  }

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
        status: finalStatus,
        statusManuallyChanged,
        currentClub,
        advies,
        niveau,
        contactPerson,
        notes
      }
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
        status: finalStatus,
        statusManuallyChanged,
        currentClub,
        advies,
        niveau,
        contactPerson,
        notes,
        clubId: session.user.clubId,
        createdById: session.user.id
      }
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

export async function updatePlayerField(playerId: string, field: string, value: string | null) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  if (field === 'step') {
    const mappedStatus = mapTargetStepToStatus(value);
    await prisma.player.update({
      where: { id: playerId, clubId: session.user.clubId },
      data: {
        step: value,
        status: mappedStatus,
        statusManuallyChanged: false,
      }
    });
  } else if (field === 'status') {
    await prisma.player.update({
      where: { id: playerId, clubId: session.user.clubId },
      data: {
        status: value,
        statusManuallyChanged: true,
      }
    });
  } else {
    await prisma.player.update({
      where: { id: playerId, clubId: session.user.clubId },
      data: {
        [field]: value
      }
    });
  }
  revalidatePath('/players');
}
