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

  let resolvedTeamId: string | null = null;
  let resolvedTeamName: string | null = team || null;
  if (teamIdInput) {
    const selectedTeam = await prisma.team.findFirst({
      where: { id: teamIdInput, clubId: session.user.clubId },
      select: { id: true, name: true, code: true },
    });
    if (selectedTeam) {
      resolvedTeamId = selectedTeam.id;
      resolvedTeamName = selectedTeam.code || selectedTeam.name;
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

  if (playerId) {
    // Update
    await prisma.player.update({
      where: { id: playerId, clubId: session.user.clubId },
      data: {
        name,
        position,
        secondaryPosition,
        preferredFoot,
        team: safeType === 'INTERNAL' ? resolvedTeamName : team,
        teamId: safeType === 'INTERNAL' ? resolvedTeamId : null,
        dateOfBirth,
        age,
        type: safeType,
        joinedAt: safeType === 'INTERNAL' ? joinedAt : null,
        contractEndDate: safeType === 'INTERNAL' ? contractEndDate : null,
        optionYear: safeType === 'INTERNAL' ? optionYear : false,
        isTopTalent: safeType === 'INTERNAL' ? isTopTalent : false,
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
        team: safeType === 'INTERNAL' ? resolvedTeamName : team,
        teamId: safeType === 'INTERNAL' ? resolvedTeamId : null,
        dateOfBirth,
        age,
        type: safeType,
        joinedAt: safeType === 'INTERNAL' ? joinedAt : null,
        contractEndDate: safeType === 'INTERNAL' ? contractEndDate : null,
        optionYear: safeType === 'INTERNAL' ? optionYear : false,
        isTopTalent: safeType === 'INTERNAL' ? isTopTalent : false,
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
