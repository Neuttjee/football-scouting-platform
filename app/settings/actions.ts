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

  const data: { primaryColor: string; logo?: string | null } = { primaryColor };
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

export async function updateAgingThreshold(agingThreshold: number) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const safeThreshold = Number.isFinite(agingThreshold)
    ? Math.max(16, Math.min(45, Math.round(agingThreshold)))
    : 30;

  await (prisma as any).club.update({
    where: { id: session.user.clubId },
    data: { agingThreshold: safeThreshold } as any,
  });

  revalidatePath('/settings');
  revalidatePath('/players');
  revalidatePath('/squad-planning');
}

export async function createTeam(name: string, code: string | null, niveau: string | null) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const cleanedName = name?.trim();
  if (!cleanedName) throw new Error('Teamnaam is verplicht');
  const cleanedNiveau = niveau?.trim() || null;

  const maxOrder = await (prisma as any).team.aggregate({
    where: { clubId: session.user.clubId },
    _max: { displayOrder: true },
  });

  await (prisma as any).team.create({
    data: {
      name: cleanedName,
      code: code?.trim() ? code.trim() : null,
      niveau: cleanedNiveau,
      clubId: session.user.clubId,
      displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      isActive: true,
    },
  });

  revalidatePath('/settings');
  revalidatePath('/players');
  revalidatePath('/squad-planning');
}

export async function updateTeamNiveau(teamId: string, niveau: string | null) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const cleaned = niveau?.trim() || null;

  await (prisma as any).team.update({
    where: { id: teamId, clubId: session.user.clubId },
    data: { niveau: cleaned },
  });

  revalidatePath('/settings');
  revalidatePath('/players');
  revalidatePath('/squad-planning');
}

export async function setTeamActive(teamId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  await (prisma as any).team.update({
    where: { id: teamId, clubId: session.user.clubId },
    data: { isActive },
  });

  revalidatePath('/settings');
  revalidatePath('/players');
  revalidatePath('/squad-planning');
}

export async function moveTeam(teamId: string, direction: 'up' | 'down') {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const teams = await (prisma as any).team.findMany({
    where: { clubId: session.user.clubId },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, displayOrder: true },
  });

  const currentIndex = teams.findIndex((t: { id: string }) => t.id === teamId);
  if (currentIndex === -1) throw new Error('Team niet gevonden');

  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (swapIndex < 0 || swapIndex >= teams.length) return;

  const current = teams[currentIndex];
  const target = teams[swapIndex];

  await prisma.$transaction([
    (prisma as any).team.update({
      where: { id: current.id },
      data: { displayOrder: target.displayOrder },
    }),
    (prisma as any).team.update({
      where: { id: target.id },
      data: { displayOrder: current.displayOrder },
    }),
  ]);

  revalidatePath('/settings');
  revalidatePath('/players');
  revalidatePath('/squad-planning');
}