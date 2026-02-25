'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateClubBranding(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const primaryColor = formData.get('primaryColor') as string;
  const secondaryColor = formData.get('secondaryColor') as string;
  const tertiaryColor = formData.get('tertiaryColor') as string;
  const logo = formData.get('logo') as string;

  const data: any = { primaryColor, secondaryColor, tertiaryColor };
  if (logo) {
    data.logo = logo;
  }

  await prisma.club.update({
    where: { id: session.user.clubId },
    data,
  });

  revalidatePath('/settings');
  revalidatePath('/');
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  if (userId === session.user.id) throw new Error('Cannot deactivate yourself');

  await prisma.user.update({
    where: { id: userId, clubId: session.user.clubId },
    data: { isActive },
  });

  revalidatePath('/settings');
}
