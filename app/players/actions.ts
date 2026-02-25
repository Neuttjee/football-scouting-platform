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

async function savePlayer(playerId: string | null, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const position = formData.get('position') as string;
  const secondaryPosition = formData.get('secondaryPosition') as string;
  const preferredFoot = formData.get('preferredFoot') as string;
  const team = formData.get('team') as string;
  const step = formData.get('step') as string || null;
  const statusInput = formData.get('status') as string || null;
  
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
        statusManuallyChanged
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
        clubId: session.user.clubId,
        createdById: session.user.id
      }
    });
  }

  revalidatePath('/players');
  redirect('/players');
}
