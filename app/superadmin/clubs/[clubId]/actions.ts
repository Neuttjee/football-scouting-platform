'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  clubGeneralSchema,
  clubFeaturesSchema,
  clubLimitsSchema,
  clubSubscriptionSchema,
  clubInternalNotesSchema,
} from './schemas';
import { CLUB_FEATURE_DEFINITIONS } from '@/lib/clubFeatures';
import { sanitizePrimaryColor } from '@/lib/branding';

async function assertSuperadmin() {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function updateClubGeneral(clubId: string, formData: FormData) {
  await assertSuperadmin();

  const raw = {
    name: (formData.get('name') as string) ?? '',
    shortName: (formData.get('shortName') as string) || null,
    contactName: (formData.get('contactName') as string) || null,
    contactEmail: (formData.get('contactEmail') as string) || null,
    contactPhone: (formData.get('contactPhone') as string) || null,
    primaryColor: (formData.get('primaryColor') as string) || null,
    secondaryColor: (formData.get('secondaryColor') as string) || null,
    internalNotes: (formData.get('internalNotes') as string) || null,
  };

  const parsed = clubGeneralSchema.parse(raw);

  const primaryColor = parsed.primaryColor
    ? sanitizePrimaryColor(parsed.primaryColor)
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.club.update({
      where: { id: clubId },
      data: {
        name: parsed.name.trim(),
        shortName: parsed.shortName?.trim() || null,
        contactName: parsed.contactName?.trim() || null,
        contactEmail: parsed.contactEmail?.trim() || null,
        contactPhone: parsed.contactPhone?.trim() || null,
        primaryColor,
        secondaryColor: parsed.secondaryColor?.trim() || null,
      } as any,
    });

    await tx.clubInternalNote.upsert({
      where: { clubId },
      create: {
        clubId,
        notes: parsed.internalNotes || null,
      },
      update: {
        notes: parsed.internalNotes || null,
      },
    });
  });

  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/clubs/${clubId}`);
  revalidatePath('/', 'layout');
}

export async function updateClubFeatures(clubId: string, formData: FormData) {
  await assertSuperadmin();

  const featureEntries = CLUB_FEATURE_DEFINITIONS.map((def) => {
    const value = formData.get(`feature_${def.key}`);
    return [def.key, value === 'on'] as const;
  });

  const parsed = clubFeaturesSchema.parse({
    features: Object.fromEntries(featureEntries),
  });

  await prisma.$transaction(
    Object.entries(parsed.features).map(([key, enabled]) =>
      prisma.clubFeature.upsert({
        where: {
          clubId_key: {
            clubId,
            key,
          },
        },
        create: {
          clubId,
          key,
          enabled,
        },
        update: {
          enabled,
        },
      }),
    ),
  );

  revalidatePath(`/superadmin/clubs/${clubId}`);
}

export async function updateClubLimits(clubId: string, formData: FormData) {
  await assertSuperadmin();

  const rawMaxUsers = Number(formData.get('maxUsers') ?? '0');
  const parsed = clubLimitsSchema.parse({
    maxUsers: Number.isFinite(rawMaxUsers) ? rawMaxUsers : 0,
  });

  await prisma.clubSettings.upsert({
    where: { clubId },
    create: {
      clubId,
      maxUsers: parsed.maxUsers,
    },
    update: {
      maxUsers: parsed.maxUsers,
    },
  });

  revalidatePath(`/superadmin/clubs/${clubId}`);
}

export async function updateClubSubscription(clubId: string, formData: FormData) {
  await assertSuperadmin();

  const raw = {
    plan: (formData.get('plan') as string) ?? 'CUSTOM',
    status: (formData.get('status') as string) ?? 'ACTIVE',
    billingCycle: (formData.get('billingCycle') as string) ?? 'MONTHLY',
    priceMinor: formData.get('priceMinor')
      ? Number(formData.get('priceMinor'))
      : null,
    currency: ((formData.get('currency') as string) || 'EUR').toUpperCase(),
    startsAt: (formData.get('startsAt') as string) || null,
    renewsAt: (formData.get('renewsAt') as string) || null,
    endsAt: (formData.get('endsAt') as string) || null,
    paymentStatus: (formData.get('paymentStatus') as string) ?? 'OPEN',
    paymentMethod: (formData.get('paymentMethod') as string) ?? 'MANUAL',
    invoiceReference: (formData.get('invoiceReference') as string) || null,
    customerNumber: (formData.get('customerNumber') as string) || null,
    notes: (formData.get('notes') as string) || null,
  };

  const parsed = clubSubscriptionSchema.parse(raw);

  const parseDate = (value: string | null | undefined) =>
    value ? new Date(value) : null;

  await prisma.clubSubscription.upsert({
    where: { clubId },
    create: {
      clubId,
      plan: parsed.plan,
      status: parsed.status,
      billingCycle: parsed.billingCycle,
      priceMinor: parsed.priceMinor ?? null,
      currency: parsed.currency,
      startsAt: parseDate(parsed.startsAt),
      renewsAt: parseDate(parsed.renewsAt),
      endsAt: parseDate(parsed.endsAt),
      paymentStatus: parsed.paymentStatus,
      paymentMethod: parsed.paymentMethod,
      invoiceReference: parsed.invoiceReference || null,
      customerNumber: parsed.customerNumber || null,
      notes: parsed.notes || null,
    } as any,
    update: {
      plan: parsed.plan,
      status: parsed.status,
      billingCycle: parsed.billingCycle,
      priceMinor: parsed.priceMinor ?? null,
      currency: parsed.currency,
      startsAt: parseDate(parsed.startsAt),
      renewsAt: parseDate(parsed.renewsAt),
      endsAt: parseDate(parsed.endsAt),
      paymentStatus: parsed.paymentStatus,
      paymentMethod: parsed.paymentMethod,
      invoiceReference: parsed.invoiceReference || null,
      customerNumber: parsed.customerNumber || null,
      notes: parsed.notes || null,
    } as any,
  });

  revalidatePath(`/superadmin/clubs/${clubId}`);
}

export async function updateClubInternalNotes(
  clubId: string,
  formData: FormData,
) {
  await assertSuperadmin();

  const raw = {
    notes: (formData.get('notes') as string) || null,
  };

  const parsed = clubInternalNotesSchema.parse(raw);

  await prisma.clubInternalNote.upsert({
    where: { clubId },
    create: {
      clubId,
      notes: parsed.notes || null,
    },
    update: {
      notes: parsed.notes || null,
    },
  });

  revalidatePath(`/superadmin/clubs/${clubId}`);
}

