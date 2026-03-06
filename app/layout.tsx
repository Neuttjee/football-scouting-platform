import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Topbar } from '@/components/Topbar';
import { hexToRgb, sanitizePrimaryColor, DEFAULT_PRIMARY_COLOR } from '@/lib/branding';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
  const effectiveClubId = getEffectiveClubId(session);
  let club = null;

  if (session && effectiveClubId) {
    club = await prisma.club.findUnique({
      where: { id: effectiveClubId },
    });
  }

  // Auto-promote club when a trial ends (no background job needed).
  if (club && (club as any).status === 'PROEFPERIODE' && (club as any).trialEndsAt) {
    const endsAt = new Date((club as any).trialEndsAt);
    if (!Number.isNaN(endsAt.getTime()) && endsAt.getTime() <= Date.now()) {
      club = await prisma.club.update({
        where: { id: (club as any).id },
        data: {
          status: 'ACTIEF' as any,
          trialStartsAt: null,
          trialEndsAt: null,
          billingStatus: 'ACTIVE' as any,
        } as any,
      });
    }
  }

  const primaryColor =
    session?.user?.role === 'SUPERADMIN'
      ? DEFAULT_PRIMARY_COLOR
      : sanitizePrimaryColor(club?.primaryColor);

  // Whitelabel styling variables
  const customStyles = {
    '--primary-color': primaryColor,
    '--primary-rgb': hexToRgb(primaryColor),
  } as React.CSSProperties;

  return (
    <html
      lang="nl"
      suppressHydrationWarning
      style={customStyles} // <<-- HIER staat nu de primary kleur
    >
      <body
        className={`antialiased bg-background text-foreground ${inter.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {session ? (
            <div className="flex h-screen overflow-hidden">
              <Sidebar role={session.user.role} clubName={club?.name} clubLogo={club?.logo} />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative bg-bg-secondary">
                  <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
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