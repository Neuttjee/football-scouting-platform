import prisma from '@/lib/prisma';
import { normalizeFeatureState } from '@/lib/clubFeatures';

type SessionLike = {
  user?: {
    role: string;
    clubId: string;
  };
  activeClubId?: string;
} | null;

export type ClubConfig = {
  clubId: string;
  name: string;
  shortName?: string | null;
  status: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  maxUsers: number;
  features: ReturnType<typeof normalizeFeatureState>;
  subscription?: {
    plan: string;
    status: string;
    billingCycle: string;
  } | null;
};

export async function getClubConfigByClubId(clubId: string): Promise<ClubConfig | null> {
  if (!clubId) return null;

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      settings: true,
      features: {
        select: { key: true, enabled: true },
      },
      subscription: true,
    },
  });

  if (!club) return null;

  const features = normalizeFeatureState(club.features);

  return {
    clubId: club.id,
    name: club.name,
    shortName: (club as any).shortName ?? null,
    status: ((club as any).status ?? 'ACTIEF') as string,
    primaryColor: (club as any).primaryColor ?? null,
    secondaryColor: (club as any).secondaryColor ?? null,
    maxUsers: club.settings?.maxUsers ?? 999,
    features,
    subscription: club.subscription
      ? {
          plan: (club.subscription as any).plan,
          status: (club.subscription as any).status,
          billingCycle: (club.subscription as any).billingCycle,
        }
      : null,
  };
}

export async function getClubConfigFromSession(
  session: SessionLike,
): Promise<ClubConfig | null> {
  if (!session?.user?.clubId) return null;
  const clubId =
    session.user.role === 'SUPERADMIN'
      ? session.activeClubId ?? null
      : session.user.clubId;

  if (!clubId) return null;
  return getClubConfigByClubId(clubId);
}

