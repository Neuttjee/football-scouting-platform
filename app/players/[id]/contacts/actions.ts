'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createContact(playerId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const type = formData.get('type') as string;
  const channel = formData.get('channel') as string;
  const outcome = formData.get('outcome') as string || null;
  const reason = formData.get('reason') as string || null;
  const notes = formData.get('notes') as string || null;

  if ((outcome === 'Afgehaakt' || outcome === 'Niet haalbaar') && !reason) {
    throw new Error('Reden is verplicht bij uitkomst Afgehaakt of Niet haalbaar');
  }

  await prisma.contactMoment.create({
    data: {
      type,
      channel,
      outcome,
      reason,
      notes,
      playerId,
      clubId: session.user.clubId,
      createdById: session.user.id
    }
  });

  revalidatePath(`/players/${playerId}/contacts`);
}
