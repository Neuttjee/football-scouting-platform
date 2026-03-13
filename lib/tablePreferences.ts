import prisma from '@/lib/prisma';
import { getEffectiveClubId } from '@/lib/auth';
import type { SortingState } from '@tanstack/react-table';
import type { Prisma } from '@prisma/client';

export const TABLE_KEY_PLAYERS = 'players';
export const TABLE_KEY_INTERNAL_PLAYERS = 'internalPlayers';

type SessionLike = {
  user?: {
    id: string;
    role: string;
    clubId?: string;
  };
  activeClubId?: string;
} | null;

export async function getUserTablePreference(params: {
  session: SessionLike;
  tableKey: string;
}) {
  const { session, tableKey } = params;
  if (!session?.user) return null;

  const clubId = getEffectiveClubId(session as any);
  if (!clubId) return null;

  return prisma.userTablePreference.findUnique({
    where: {
      userId_clubId_tableKey: {
        userId: session.user.id,
        clubId,
        tableKey,
      },
    },
  });
}

export async function upsertUserTablePreference(params: {
  session: SessionLike;
  tableKey: string;
  columnVisibility: Record<string, boolean>;
  sorting: SortingState;
  columnOrder?: string[];
}) {
  const { session, tableKey, columnVisibility, sorting, columnOrder } = params;
  if (!session?.user) return;

  const clubId = getEffectiveClubId(session as any);
  if (!clubId) return;

  const sortingJson: Prisma.InputJsonValue = params.sorting as unknown as Prisma.InputJsonValue;
  const columnVisibilityJson: Prisma.InputJsonValue = params.columnVisibility as unknown as Prisma.InputJsonValue;
  const columnOrderJson: Prisma.InputJsonValue | undefined = params.columnOrder as unknown as Prisma.InputJsonValue | undefined;

  await prisma.userTablePreference.upsert({
    where: {
      userId_clubId_tableKey: {
        userId: session.user.id,
        clubId,
        tableKey,
      },
    },
    create: {
      userId: session.user.id,
      clubId,
      tableKey,
      columnVisibility: columnVisibilityJson,
      sorting: sortingJson,
      columnOrder: columnOrderJson,
    },
    update: {
      columnVisibility: columnVisibilityJson,
      sorting: sortingJson,
      columnOrder: columnOrderJson,
    },
  });
}

