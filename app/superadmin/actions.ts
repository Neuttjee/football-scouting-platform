'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { setActiveClubId } from '@/lib/auth';
import { sanitizePrimaryColor } from '@/lib/branding';

export async function createClub(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('Clubnaam is verplicht');

  const primaryColor = sanitizePrimaryColor((formData.get('primaryColor') as string) || undefined);
  const logo = (formData.get('logo') as string) || null;

  await prisma.club.create({
    data: {
      name,
      primaryColor,
      logo: logo === '' ? null : logo,
    },
  });

  revalidatePath('/superadmin');
}

export async function selectClub(clubId: string) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const club = await prisma.club.findFirst({
    where: { id: clubId, name: { not: 'Platform' } },
  });
  if (!club) throw new Error('Club niet gevonden');

  await setActiveClubId(clubId);
  revalidatePath('/', 'layout');
  revalidatePath('/superadmin');
  revalidatePath('/dashboard');
  revalidatePath('/players');
  revalidatePath('/tasks');
  revalidatePath('/contacts');
  revalidatePath('/squad-planning');
  revalidatePath('/settings');
}

export async function clearSelectedClub() {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await setActiveClubId(null);
  revalidatePath('/', 'layout');
  revalidatePath('/superadmin');
  revalidatePath('/dashboard');
  revalidatePath('/players');
  revalidatePath('/tasks');
  revalidatePath('/contacts');
  revalidatePath('/squad-planning');
  revalidatePath('/settings');
}
