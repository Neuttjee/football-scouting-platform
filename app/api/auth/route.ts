import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { setSession, clearSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'logout') {
      await clearSession();
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      const { email, password } = body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.isActive || !user.passwordHash) {
        return NextResponse.json({ error: 'Ongeldige logingegevens' }, { status: 401 });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return NextResponse.json({ error: 'Ongeldige logingegevens' }, { status: 401 });
      }

      await setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
      });

      return NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
