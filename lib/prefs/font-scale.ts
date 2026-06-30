import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { type FontSize } from '@/lib/api/types';

/**
 * App-wide font scale. The OS font scale isn't app-controllable, so we keep our
 * own multiplier (driven by the user's "Font size" setting) and the Txt
 * component multiplies every variant size by it. Persisted locally for instant
 * effect; seeded from /settings on load. Tiny pub/sub keeps all text in sync.
 */
const KEY = 'strack.fontSize';
const SCALE: Record<FontSize, number> = { small: 0.9, medium: 1, large: 1.15 };

let current: FontSize = 'medium';
let loaded = false;
const listeners = new Set<(s: FontSize) => void>();

async function ensureLoaded() {
  if (loaded) return;
  const v = await AsyncStorage.getItem(KEY);
  if (v === 'small' || v === 'medium' || v === 'large') current = v;
  loaded = true;
  listeners.forEach((l) => l(current));
}

export async function setFontSize(s: FontSize) {
  if (s === current) return;
  current = s;
  await AsyncStorage.setItem(KEY, s);
  listeners.forEach((l) => l(s));
}

export function useFontScale(): { size: FontSize; scale: number; setSize: (s: FontSize) => void } {
  const [size, setLocal] = useState(current);
  useEffect(() => {
    const listener = (v: FontSize) => setLocal(v);
    listeners.add(listener);
    ensureLoaded();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return { size, scale: SCALE[size], setSize: setFontSize };
}
