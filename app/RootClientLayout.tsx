"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
  primaryColor: string;
  defaultPrimaryColor: string;
  primaryRgb: string;
  defaultPrimaryRgb: string;
};

export function RootClientLayout({
  children,
  primaryColor,
  defaultPrimaryColor,
  primaryRgb,
  defaultPrimaryRgb,
}: Props) {
  const pathname = usePathname();

  const isSuperadminRoute = pathname.startsWith("/superadmin");

  const effectivePrimary = isSuperadminRoute ? defaultPrimaryColor : primaryColor;
  const effectiveRgb = isSuperadminRoute ? defaultPrimaryRgb : primaryRgb;

  const customStyles = {
    "--primary-color": effectivePrimary,
    "--primary-rgb": effectiveRgb,
  } as React.CSSProperties;

  return (
    <html lang="nl" suppressHydrationWarning style={customStyles}>
      {children}
    </html>
  );
}

