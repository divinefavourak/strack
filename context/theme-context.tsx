import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  /** Follows the OS by default; can be pinned by the Profile "Theme" setting. */
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);

  const scheme: ColorScheme = override ?? (system === 'dark' ? 'dark' : 'light');

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: Colors[scheme],
      isDark: scheme === 'dark',
      setScheme: setOverride,
      toggleScheme: () => setOverride(scheme === 'dark' ? 'light' : 'dark'),
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
