import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/**
 * Step source preference: automatic (device pedometer) or manual (user logs steps).
 * Stored locally (the API has no such field) with a tiny pub/sub so Home and
 * Profile stay in sync without a context provider.
 */
export type StepSource = 'automatic' | 'manual';

const KEY = 'strack.stepSource';
let current: StepSource = 'automatic';
let loaded = false;
const listeners = new Set<(s: StepSource) => void>();

async function ensureLoaded() {
  if (loaded) return;
  const v = await AsyncStorage.getItem(KEY);
  if (v === 'manual' || v === 'automatic') current = v;
  loaded = true;
  listeners.forEach((l) => l(current));
}

export async function setStepSource(s: StepSource) {
  current = s;
  await AsyncStorage.setItem(KEY, s);
  listeners.forEach((l) => l(s));
}

export function useStepSource(): { source: StepSource; setSource: (s: StepSource) => void; ready: boolean } {
  const [source, setLocal] = useState(current);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    const listener = (v: StepSource) => {
      setLocal(v);
      setReady(true);
    };
    listeners.add(listener);
    ensureLoaded().then(() => setReady(true));
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { source, setSource: setStepSource, ready };
}
