import type { Metadata } from 'next';
import './globals.css';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Topbar } from '@/components/Topbar';

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
    <html lang="nl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" style={customStyles}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {session ? (
            <div className="flex h-screen overflow-hidden">
              <Sidebar role={session.user.role} clubName={club?.name} clubLogo={club?.logo} />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative bg-muted/20">
                  <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
              <MobileNav role={session.user.role} />
            </div>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
