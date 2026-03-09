import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function SuperadminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  return children;
}

