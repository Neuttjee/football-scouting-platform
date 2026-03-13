'use server';

import { getSession } from '@/lib/auth';
import { upsertUserTablePreference, TABLE_KEY_PLAYERS } from '@/lib/tablePreferences';
import type { SortingState } from '@tanstack/react-table';

type SavePlayersTablePreferenceInput = {
  sorting: SortingState;
  columnVisibility: Record<string, boolean>;
  columnOrder?: string[];
};

export async function savePlayersTablePreference(input: SavePlayersTablePreferenceInput) {
  const session = await getSession();
  if (!session) return;

  await upsertUserTablePreference({
    session,
    tableKey: TABLE_KEY_PLAYERS,
    sorting: input.sorting,
    columnVisibility: input.columnVisibility,
    columnOrder: input.columnOrder,
  });
}

