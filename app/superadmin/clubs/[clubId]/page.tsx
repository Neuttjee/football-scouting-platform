import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ClubProfileClient } from './ClubProfileClient';
import { CLUB_FEATURE_DEFINITIONS, normalizeFeatureState } from '@/lib/clubFeatures';

type PageProps = {
  params: {
    clubId: string;
  };
};

export default async function ClubProfilePage({ params }: PageProps) {
  if (!params?.clubId) {
    notFound();
  }

  const club = await prisma.club.findUnique({
    where: {
      id: params.clubId,
    },
    include: {
      settings: true,
      features: {
        select: { key: true, enabled: true },
      },
      subscription: true,
      internalNote: true,
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true },
      },
    },
  });

  if (!club || club.name === 'Platform') {
    notFound();
  }

  const featureState = normalizeFeatureState(club.features);
  // Schakel nog-niet-werkende modules standaard uit
  (featureState as any).contracts = false;
  (featureState as any).match_reports = false;
  const activeUsers = club.users.filter((u) => u.isActive).length;

  return (
    <ClubProfileClient
      club={club}
      settings={club.settings}
      featureState={featureState}
      subscription={club.subscription}
      internalNote={club.internalNote}
      userStats={{ activeUsers }}
      clubUsers={club.users}
    />
  );
}

