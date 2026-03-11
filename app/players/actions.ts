'use server';

import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function savePlayerLogic(playerId: string | null, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const clubId = getEffectiveClubId(session);
  if (!clubId) throw new Error('Geen club geselecteerd');

  const name = formData.get('name') as string;
  const position = formData.get('position') as string;
  const secondaryPosition = formData.get('secondaryPosition') as string;
  const favoritePosition = formData.get('favoritePosition') as string;
  const preferredFoot = formData.get('preferredFoot') as string;
  const team = formData.get('team') as string;
  const teamIdInput = (formData.get('teamId') as string | null) || null;
  const playerTypeInput = (formData.get('type') as string | null) || 'EXTERNAL';
  const step = formData.get('step') as string || null;
  const statusInput = formData.get('status') as string || null;

  const currentClub = formData.get('currentClub') as string || null;
  const advies = formData.get('advies') as string || null;
  const niveau = formData.get('niveau') as string || null;
  const contactPerson = formData.get('contactPerson') as string || null;
  const notes = formData.get('notes') as string || null;
  const optionYear = formData.get('optionYear') === 'on';
  const isTopTalent = formData.get('isTopTalent') === 'on';

  const distanceFromClubKmRaw = formData.get('distanceFromClubKm') as string;
  const distanceFromClubKm =
    distanceFromClubKmRaw && distanceFromClubKmRaw.trim() !== ''
      ? parseInt(distanceFromClubKmRaw, 10)
      : null;

  let dateOfBirth: Date | null = null;
  const dobStr = formData.get('dateOfBirth') as string;
  if (dobStr) {
    dateOfBirth = new Date(dobStr);
  }

  const joinedAtStr = formData.get('joinedAt') as string;
  const joinedAt = joinedAtStr ? new Date(joinedAtStr) : null;
  const contractEndDateStr = formData.get('contractEndDate') as string;
  const contractEndDate = contractEndDateStr ? new Date(contractEndDateStr) : null;

  const safeType = playerTypeInput === 'INTERNAL' ? 'INTERNAL' : 'EXTERNAL';
  const isInternalType = safeType === 'INTERNAL';

  let resolvedTeamId: string | null = null;
  let resolvedTeamName: string | null = team || null;
  let resolvedNiveau: string | null = niveau;
  if (teamIdInput) {
    const selectedTeam = await prisma.team.findFirst({
      where: { id: teamIdInput, clubId },
      select: { id: true, name: true, code: true, niveau: true },
    });
    if (selectedTeam) {
      resolvedTeamId = selectedTeam.id;
      resolvedTeamName = selectedTeam.code || selectedTeam.name;
      resolvedNiveau = selectedTeam.niveau || niveau;
    }
  }

  let age: number | null = null;
  const ageStr = formData.get('age') as string;
  if (ageStr) {
    const parsed = parseInt(ageStr, 10);
    if (!Number.isNaN(parsed)) {
      age = parsed;
    }
  }

  if (dateOfBirth) {
    const today = new Date();
    let derivedAge = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      derivedAge--;
    }
    age = derivedAge;
  }

  // Geen automatische mapping meer:
  // - step wordt gewoon opgeslagen zoals gekozen
  // - status komt direct uit het formulier (statusInput)

  const baseData: any = {
    name,
    position,
    secondaryPosition,
    favoritePosition,
    preferredFoot,
    type: safeType,
    dateOfBirth,
    age,
    step,
    status: statusInput,
    currentClub,
    advies,
    niveau: resolvedNiveau,
    contactPerson,
    notes,
    isTopTalent,
  };

  if (isInternalType) {
    baseData.team = resolvedTeamName;
    baseData.teamId = resolvedTeamId;
    baseData.joinedAt = joinedAt;
    baseData.contractEndDate = contractEndDate;
    baseData.optionYear = optionYear;
    baseData.distanceFromClubKm = distanceFromClubKm;
  } else {
    baseData.team = team || null;
    baseData.teamId = null;
    baseData.joinedAt = null;
    baseData.contractEndDate = null;
    baseData.optionYear = false;
    baseData.distanceFromClubKm = null;
  }

  if (playerId) {
    await prisma.player.update({
      where: { id: playerId, clubId },
      data: baseData,
    });
  } else {
    await prisma.player.create({
      data: {
        ...baseData,
        clubId,
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
}

export async function deletePlayer(playerId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const clubId = getEffectiveClubId(session);
  if (!clubId) throw new Error('Geen club geselecteerd');

  await prisma.player.delete({
    where: { id: playerId, clubId },
  });

  revalidatePath("/players");
}

export async function deletePlayersBulk(playerIds: string[]) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "SUPERADMIN") {
    throw new Error("Forbidden");
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) throw new Error("Geen club geselecteerd");
  if (!Array.isArray(playerIds) || playerIds.length === 0) return;

  await prisma.player.deleteMany({
    where: {
      clubId,
      id: { in: playerIds },
    },
  });

  revalidatePath("/players");
}

export async function updatePlayerField(
  playerId: string,
  field: string,
  value: string | null
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const clubId = getEffectiveClubId(session);
  if (!clubId) throw new Error('Geen club geselecteerd');

  await prisma.player.update({
    where: { id: playerId, clubId },
    data: {
      [field]: value,
    },
  });

  revalidatePath("/players");
}

export async function searchPlayers(query: string) {
  const session = await getSession();
  if (!session) return [];
  const clubId = getEffectiveClubId(session);
  if (!clubId) return [];

  if (!query || query.trim() === '') return [];

  const players = await prisma.player.findMany({
    where: {
      clubId,
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
