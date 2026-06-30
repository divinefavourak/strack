import { useEffect } from 'react';

import { useTheme } from '@/context/theme-context';
import { useSettings } from '@/hooks/api';
import { useFontScale } from '@/lib/prefs/font-scale';

// Module-level so seeding happens once per app run, surviving screen remounts.
let seededTheme = false;
let seededFont = false;

/**
 * Seed the app theme + font scale from the user's saved server settings exactly
 * once (at app entry). Doing this per-screen caused the theme to snap back to the
 * server value every time that screen mounted; here it runs a single time and all
 * later toggles persist to the server themselves.
 */
export function usePrefsSync() {
  const { data: settings } = useSettings();
  const { setScheme } = useTheme();
  const { setSize } = useFontScale();

  useEffect(() => {
    if (!seededTheme && settings?.theme) {
      seededTheme = true;
      setScheme(settings.theme);
    }
    if (!seededFont && settings?.font_size) {
      seededFont = true;
      setSize(settings.font_size);
    }
  }, [settings?.theme, settings?.font_size, setScheme, setSize]);
}
