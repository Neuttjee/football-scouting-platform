import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getSession } from '@/lib/auth';

function isStrongPassphrase(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 4) return false;
  const hasLetter = /[A-Za-z]/.test(trimmed);
  if (!hasLetter) return false;
  return true;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Onverwachte gebruikersstatus' }, { status: 400 });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: 'Huidig wachtwoord is onjuist.' }, { status: 400 });
    }

    if (!isStrongPassphrase(newPassword)) {
      return NextResponse.json(
        {
          error:
            'Gebruik een sterke wachtzin van minimaal 16 tekens en 4 woorden.',
        },
        { status: 400 },
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

