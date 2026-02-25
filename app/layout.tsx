import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Topbar } from '@/components/Topbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Scouting Platform',
  description: 'Football Recruitment Platform',
};

// Helper to convert hex to rgb for the glow effect
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 59, 48';
}

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

  const primaryColor = club?.primaryColor || '#FF3B30';

  // Whitelabel styling variables
  const customStyles = {
    '--primary-color': primaryColor,
    '--primary-rgb': hexToRgb(primaryColor),
    '--secondary-color': club?.secondaryColor || '#FF6A00',
  } as React.CSSProperties;

  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`antialiased bg-background text-foreground ${inter.variable} ${jetbrainsMono.variable} font-sans`} style={customStyles}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {session ? (
            <div className="flex h-screen overflow-hidden">
              <Sidebar role={session.user.role} clubName={club?.name} clubLogo={club?.logo} />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative bg-bg-secondary">
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
