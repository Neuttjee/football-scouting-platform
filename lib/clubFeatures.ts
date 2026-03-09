export const CLUB_FEATURE_DEFINITIONS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Overzichtspagina met belangrijkste statistieken en updates.',
    defaultEnabled: true,
  },
  {
    key: 'internal_players',
    label: 'Interne spelers',
    description: 'Beheer spelers binnen de eigen club.',
    defaultEnabled: true,
  },
  {
    key: 'external_players',
    label: 'Externe spelers',
    description: 'Scouting database voor externe spelers.',
    defaultEnabled: true,
  },
  {
    key: 'tasks',
    label: 'Taken',
    description: 'Taakbeheer voor scouts en TC-leden.',
    defaultEnabled: true,
  },
  {
    key: 'contact_logs',
    label: 'Contactmomenten',
    description: 'Logboek van contactmomenten met spelers en clubs.',
    defaultEnabled: true,
  },
  {
    key: 'match_reports',
    label: 'Wedstrijdrapporten',
    description: 'Verslagen en beoordelingen van wedstrijden.',
    defaultEnabled: true,
  },
  {
    key: 'shortlists',
    label: 'Shortlists',
    description: 'Lijsten met interessante spelers per rol of periode.',
    defaultEnabled: true,
  },
  {
    key: 'exports',
    label: 'Exportfunctie',
    description: 'Exporteren van data naar bijvoorbeeld Excel.',
    defaultEnabled: true,
  },
  {
    key: 'advanced_filters',
    label: 'Geavanceerde filters',
    description: 'Extra filtermogelijkheden in lijsten en overzichten.',
    defaultEnabled: true,
  },
  {
    key: 'contracts',
    label: 'Contractmodule',
    description: 'Contractinformatie en einddata beheren.',
    defaultEnabled: false,
  },
  {
    key: 'custom_workflows',
    label: 'Custom workflows',
    description: 'Club-specifieke statussen en processtappen.',
    defaultEnabled: false,
  },
  {
    key: 'notifications',
    label: 'Notificaties',
    description: 'E-mail- en in-app notificaties.',
    defaultEnabled: false,
  },
] as const;

export type ClubFeatureKey = (typeof CLUB_FEATURE_DEFINITIONS)[number]['key'];

export type ClubFeatureState = Record<ClubFeatureKey, boolean>;

export function getDefaultFeatureState(): ClubFeatureState {
  return CLUB_FEATURE_DEFINITIONS.reduce<ClubFeatureState>((acc, feature) => {
    acc[feature.key] = feature.defaultEnabled;
    return acc;
  }, {} as ClubFeatureState);
}

export function normalizeFeatureState(
  dbRows: { key: string; enabled: boolean }[] | null | undefined,
): ClubFeatureState {
  const base = getDefaultFeatureState();
  if (!dbRows || dbRows.length === 0) return base;

  const allowedKeys = new Set(
    CLUB_FEATURE_DEFINITIONS.map((f) => f.key),
  );

  for (const row of dbRows) {
    if (allowedKeys.has(row.key as ClubFeatureKey)) {
      base[row.key as ClubFeatureKey] = row.enabled;
    }
  }

  return base;
}

