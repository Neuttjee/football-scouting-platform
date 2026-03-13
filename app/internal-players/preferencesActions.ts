'use server';

import { getSession } from '@/lib/auth';
import { upsertUserTablePreference, TABLE_KEY_INTERNAL_PLAYERS } from '@/lib/tablePreferences';
import type { SortingState } from '@tanstack/react-table';

type SaveInternalPlayersTablePreferenceInput = {
  sorting: SortingState;
  columnVisibility: Record<string, boolean>;
  columnOrder?: string[];
};

export async function saveInternalPlayersTablePreference(
  input: SaveInternalPlayersTablePreferenceInput,
) {
  const session = await getSession();
  if (!session) return;

  await upsertUserTablePreference({
    session,
    tableKey: TABLE_KEY_INTERNAL_PLAYERS,
    sorting: input.sorting,
    columnVisibility: input.columnVisibility,
    columnOrder: input.columnOrder,
  });
}

