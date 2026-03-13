import prisma from '@/lib/prisma';
import { getEffectiveClubId } from '@/lib/auth';

type SessionLike = {
  user?: {
    id: string;
    role: string;
    clubId?: string;
  };
  activeClubId?: string;
} | null;

type AuditEventInput = {
  session: SessionLike;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logAuditEvent(input: AuditEventInput) {
  try {
    const { session, action, entityType, entityId, metadata, ipAddress, userAgent } = input;
    if (!session || !session.user) {
      // Geen sessie beschikbaar; sla logging stilletjes over
      return;
    }

    const clubId = getEffectiveClubId(session as any);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorRole: session.user.role,
        clubId: clubId ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        metadata: metadata ?? undefined,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    });
  } catch (error) {
    // Audit logging mag functionele logica nooit blokkeren
    console.error('Failed to write audit log', error);
  }
}

