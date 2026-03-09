"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
  primaryColor: string;
  defaultPrimaryColor: string;
  hexToRgb: (hex: string) => string;
};

export function RootClientLayout({
  children,
  primaryColor,
  defaultPrimaryColor,
  hexToRgb,
}: Props) {
  const pathname = usePathname();

  const isSuperadminRoute = pathname.startsWith("/superadmin");

  const effectivePrimary = isSuperadminRoute ? defaultPrimaryColor : primaryColor;

  const customStyles = {
    "--primary-color": effectivePrimary,
    "--primary-rgb": hexToRgb(effectivePrimary),
  } as React.CSSProperties;

  return (
    <html lang="nl" suppressHydrationWarning style={customStyles}>
      {children}
    </html>
  );
}

