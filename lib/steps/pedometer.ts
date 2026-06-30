import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Pedometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { stepsApi } from '@/lib/api/endpoints';
import { type StepEventIn } from '@/lib/api/types';

/**
 * Offline-safe step pipeline. Pedometer deltas are appended to an AsyncStorage
 * queue (each with a stable client_event_id so the server can dedupe), then
 * flushed to POST /steps/sync. The queue survives app kills, so steps recorded
 * while offline sync on the next successful flush.
 */
const QUEUE_KEY = 'strack.stepQueue';
const FLUSH_INTERVAL_MS = 20_000;

async function loadQueue(): Promise<StepEventIn[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as StepEventIn[]) : [];
}
async function saveQueue(q: StepEventIn[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export async function enqueueSteps(delta: number) {
  if (delta <= 0) return;
  const q = await loadQueue();
  q.push({
    client_event_id: Crypto.randomUUID(),
    steps_delta: Math.round(delta),
    recorded_at: new Date().toISOString(),
  });
  await saveQueue(q);
}

/** Flush queued events; returns true if anything was synced. */
export async function flushSteps(): Promise<boolean> {
  const q = await loadQueue();
  if (q.length === 0) return false;
  const batch = q.slice(0, 500);
  await stepsApi.sync({ events: batch });
  await saveQueue(q.slice(batch.length));
  return true;
}

export function usePedometerAvailable() {
  const ref = useRef<boolean | null>(null);
  useEffect(() => {
    Pedometer.isAvailableAsync()
      .then((v) => (ref.current = v))
      .catch(() => (ref.current = false));
  }, []);
  return ref;
}

/**
 * While `enabled`, watch the pedometer, queue deltas, and periodically flush
 * (also on background). Calls `onSynced` after a successful flush so callers
 * can refetch today's stats.
 */
export function useAutoStepTracking({
  enabled,
  onSynced,
}: {
  enabled: boolean;
  onSynced: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    let watch: { remove: () => void } | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    let lastTotal = 0;

    const tryFlush = () => {
      flushSteps()
        .then((did) => {
          if (did && mounted) onSynced();
        })
        .catch(() => {});
    };

    (async () => {
      const available = await Pedometer.isAvailableAsync().catch(() => false);
      if (!available || !mounted) return;
      watch = Pedometer.watchStepCount((result) => {
        const delta = result.steps - lastTotal;
        if (delta > 0) {
          lastTotal = result.steps;
          enqueueSteps(delta);
        }
      });
      interval = setInterval(tryFlush, FLUSH_INTERVAL_MS);
    })();

    const appSub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') tryFlush();
    });

    return () => {
      mounted = false;
      watch?.remove();
      if (interval) clearInterval(interval);
      appSub.remove();
    };
  }, [enabled, onSynced]);
}
