'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

// App-wide theme context. `class` strategy flips `.dark` on <html>; the CSS
// variables in globals.css do the rest. `disableTransitionOnChange` stops
// colour transitions from animating during a theme switch (no flash/smear),
// and next-themes injects a pre-paint script so there's no FOUC.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
