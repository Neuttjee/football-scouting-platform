import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendInviteEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email, name, role } = await req.json();
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        clubId: session.user.clubId,
        inviteToken,
        inviteTokenExpires,
      },
    });

    await sendInviteEmail(email, inviteToken, role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { token, password } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { inviteToken: token } });
    if (!user || !user.inviteTokenExpires || user.inviteTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        inviteToken: null,
        inviteTokenExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
