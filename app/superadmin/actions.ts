'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { setActiveClubId } from '@/lib/auth';
import { sanitizePrimaryColor } from '@/lib/branding';

export type ClubStatus = 'ACTIEF' | 'INACTIEF' | 'PROEFPERIODE' | 'GESCHORST';

export type ClubStatusUpdatePayload =
  | { status: 'ACTIEF' | 'INACTIEF' | 'GESCHORST' }
  | { status: 'PROEFPERIODE'; trialStartsAtISO: string; trialDurationDays: number };

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
  if ((club as any).status === 'INACTIEF' || (club as any).status === 'GESCHORST') {
    throw new Error('Deze club is inactief en kan niet geselecteerd worden.');
  }

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

export async function updateClubStatus(clubId: string, status: ClubStatus) {
  return updateClubStatusInteractive(clubId, { status: status as any });
}

export async function updateClubStatusInteractive(clubId: string, payload: ClubStatusUpdatePayload) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const club = await prisma.club.findFirst({
    where: { id: clubId, name: { not: 'Platform' } },
    select: { id: true },
  });
  if (!club) throw new Error('Club niet gevonden');

  if (payload.status === 'PROEFPERIODE') {
    const startsAt = new Date(payload.trialStartsAtISO);
    if (Number.isNaN(startsAt.getTime())) throw new Error('Ongeldige startdatum');
    const days = Number(payload.trialDurationDays);
    if (!Number.isFinite(days) || days < 1 || days > 365) throw new Error('Ongeldige proefperiode duur');

    const endsAt = new Date(startsAt.getTime() + days * 24 * 60 * 60 * 1000);
    await prisma.club.update({
      where: { id: clubId },
      data: {
        status: 'PROEFPERIODE' as any,
        trialStartsAt: startsAt,
        trialEndsAt: endsAt,
        billingStatus: 'TRIAL' as any,
      } as any,
    });
  } else {
    await prisma.club.update({
      where: { id: clubId },
      data: {
        status: payload.status as any,
        trialStartsAt: null,
        trialEndsAt: null,
        billingStatus: payload.status === 'ACTIEF' ? ('ACTIVE' as any) : undefined,
      } as any,
    });
  }

  // Als de actieve club gedeactiveerd wordt, maak de selectie leeg.
  if (
    (payload.status === 'INACTIEF' || payload.status === 'GESCHORST') &&
    (session as any).activeClubId === clubId
  ) {
    await setActiveClubId(null);
    revalidatePath('/', 'layout');
  }

  revalidatePath('/superadmin');
  revalidatePath('/dashboard');
  revalidatePath('/players');
  revalidatePath('/tasks');
  revalidatePath('/contacts');
  revalidatePath('/squad-planning');
  revalidatePath('/settings');
}

export async function deleteClub(clubId: string) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const club = await prisma.club.findFirst({
    where: { id: clubId, name: { not: 'Platform' } },
    select: { id: true, name: true },
  });
  if (!club) throw new Error('Club niet gevonden');

  const [users, players, teams, tasks, contacts] = await Promise.all([
    prisma.user.count({ where: { clubId } }),
    prisma.player.count({ where: { clubId } }),
    (prisma as any).team.count({ where: { clubId } }),
    prisma.task.count({ where: { clubId } }),
    prisma.contactMoment.count({ where: { clubId } }),
  ]);

  const blockers: string[] = [];
  if (users > 0) blockers.push(`${users} gebruikers`);
  if (players > 0) blockers.push(`${players} spelers`);
  if (teams > 0) blockers.push(`${teams} teams`);
  if (tasks > 0) blockers.push(`${tasks} taken`);
  if (contacts > 0) blockers.push(`${contacts} contactmomenten`);

  if (blockers.length > 0) {
    throw new Error(`Kan club niet verwijderen. Verwijder eerst: ${blockers.join(', ')}.`);
  }

  if ((session as any).activeClubId === clubId) {
    await setActiveClubId(null);
    revalidatePath('/', 'layout');
  }

  await prisma.club.delete({ where: { id: clubId } });

  revalidatePath('/superadmin');
  revalidatePath('/dashboard');
  revalidatePath('/players');
  revalidatePath('/tasks');
  revalidatePath('/contacts');
  revalidatePath('/squad-planning');
  revalidatePath('/settings');
}
