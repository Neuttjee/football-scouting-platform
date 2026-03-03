'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sanitizePrimaryColor } from '@/lib/branding';
import { sendInviteEmail } from '@/lib/email';
import crypto from 'crypto';

export async function updateClubBranding(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const primaryColor = sanitizePrimaryColor(formData.get('primaryColor') as string);
  const logo = formData.get('logo') as string;

  const data: any = { primaryColor };
  if (logo !== null && logo !== undefined) {
    data.logo = logo === "" ? null : logo;
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

export async function updateUserRole(userId: string, role: string) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  // Voorkom dat je jezelf zonder admin‑rechten zet
  if (userId === session.user.id && role !== 'ADMIN') {
    throw new Error('Je kunt je eigen admin-rechten niet verwijderen');
  }

  await prisma.user.update({
    where: { id: userId, clubId: session.user.clubId },
    data: { role },
  });

  revalidatePath('/settings');
}

export async function resendInvite(userId: string) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: userId, clubId: session.user.clubId },
  });

  if (!user) throw new Error('User not found');

  // Alleen voor gebruikers zonder wachtwoord (nog niet geactiveerd)
  if (user.passwordHash) {
    throw new Error('Gebruiker is al geactiveerd');
  }

  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      inviteToken,
      inviteTokenExpires,
    },
  });

  await sendInviteEmail(user.email, inviteToken, user.role);

  revalidatePath('/settings');
}

export async function deleteUser(userId: string) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  if (userId === session.user.id) {
    throw new Error('Je kunt jezelf niet verwijderen');
  }

  await prisma.user.delete({
    where: { id: userId, clubId: session.user.clubId },
  });

  revalidatePath('/settings');
}