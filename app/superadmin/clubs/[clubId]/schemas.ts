import { z } from 'zod';

export const clubGeneralSchema = z.object({
  name: z.string().min(1, 'Clubnaam is verplicht'),
  shortName: z.string().max(50).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email('Ongeldig e-mailadres').optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

export const clubFeaturesSchema = z.object({
  features: z.record(z.boolean()),
});

export const clubLimitsSchema = z.object({
  maxUsers: z
    .number()
    .int()
    .min(1, 'Minimaal 1 gebruiker')
    .max(10000, 'Onrealistisch hoog maximum'),
});

export const clubSubscriptionSchema = z.object({
  plan: z.enum(['TRIAL', 'BASIC', 'PREMIUM', 'CUSTOM']),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  priceMinor: z.number().int().min(0).nullable().optional(),
  currency: z.string().min(1).max(10),
  startsAt: z.string().nullable().optional(),
  renewsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  paymentStatus: z.enum(['PAID', 'OPEN', 'PAST_DUE']),
  paymentMethod: z.enum(['MANUAL', 'INVOICE', 'DIRECT_DEBIT']),
  invoiceReference: z.string().max(255).nullable().optional(),
  customerNumber: z.string().max(255).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const clubInternalNotesSchema = z.object({
  notes: z.string().nullable().optional(),
});

