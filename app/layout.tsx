import type { Metadata } from 'next';
import './globals.css';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Scouting Platform',
  description: 'Football Recruitment Platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let club = null;

  if (session && session.user && session.user.clubId) {
    club = await prisma.club.findUnique({
      where: { id: session.user.clubId },
    });
  }

  // Whitelabel styling variables
  const customStyles = {
    '--primary-color': club?.primaryColor || '#3b82f6',
    '--secondary-color': club?.secondaryColor || '#1e40af',
  } as React.CSSProperties;

  return (
    <html lang="nl">
      <body className="antialiased bg-gray-50 text-gray-900" style={customStyles}>
        {session ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar role={session.user.role} clubName={club?.name} />
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
              <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <MobileNav role={session.user.role} />
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
