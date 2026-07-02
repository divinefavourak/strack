import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { settingsApi, voiceApi } from '@/lib/api/endpoints';
import { type VoiceLanguage, type VoiceListenResponse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { qk } from '@/lib/query';
import { buildListenInput, playRemoteAudio, stopVoicePlayback } from './audio';

/** What the assistant is currently doing, for UI feedback. */
export type VoicePhase = 'idle' | 'briefing' | 'processing' | 'speaking';

type VoiceContextValue = {
  /** Whether the voice assistant is switched on in settings. */
  enabled: boolean;
  /** The user's chosen speech language code (e.g. 'en', 'yo'). */
  language: string;
  languages: VoiceLanguage[];
  languagesLoading: boolean;
  phase: VoicePhase;
  busy: boolean;
  /** Result of the most recent spoken command, for on-screen echo. */
  lastResult: VoiceListenResponse | null;
  clearResult: () => void;
  /** Upload a recorded command clip, play the reply, and refresh affected data. */
  sendCommand: (uri: string) => Promise<VoiceListenResponse | null>;
  /** Fetch and speak the progress briefing in the user's language. */
  playBriefing: () => Promise<void>;
};

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

// Don't re-brief on every foreground; wait at least this long between auto-briefings.
const BRIEFING_COOLDOWN_MS = 10 * 60 * 1000;

// Data a spoken command could plausibly change server-side. After a command we
// invalidate these so the UI reflects e.g. a new record or a deleted one.
const COMMAND_INVALIDATION_KEYS = [
  qk.todayStats,
  qk.todayGoal,
  qk.userStats,
  qk.milestones,
  qk.stepHistory('week'),
  qk.stepHistory('month'),
  qk.feed('activity'),
];

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const authed = status === 'authed';
  const qc = useQueryClient();

  // Settings drive enabled/language. Same query key as useSettings(), so React
  // Query dedupes to one shared cache entry (and re-renders us on change).
  const settingsQuery = useQuery({ queryKey: qk.settings, queryFn: settingsApi.get, enabled: authed });
  const settings = settingsQuery.data;
  const enabled = authed && (settings?.voice_assistant_enabled ?? false);
  const language = settings?.language ?? 'en';

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [lastResult, setLastResult] = useState<VoiceListenResponse | null>(null);
  const lastBriefedAt = useRef(0);

  const languagesQuery = useQuery({
    queryKey: qk.voiceLanguages,
    queryFn: voiceApi.languages,
    enabled: authed && enabled,
    staleTime: 60 * 60 * 1000, // languages rarely change
  });

  const playBriefing = useCallback(async () => {
    if (!enabled) return;
    lastBriefedAt.current = Date.now();
    setPhase('briefing');
    try {
      const res = await voiceApi.briefing(language);
      if (res.audio_url) await playRemoteAudio(res.audio_url);
    } catch {
      // A missed briefing shouldn't interrupt the user — fail silently.
    } finally {
      setPhase('idle');
    }
  }, [enabled, language]);

  const sendCommand = useCallback<VoiceContextValue['sendCommand']>(
    async (uri) => {
      setPhase('processing');
      try {
        const res = await voiceApi.listen(buildListenInput(uri, language));
        setLastResult(res);
        // The backend already executed the command; pull fresh data for the UI.
        COMMAND_INVALIDATION_KEYS.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
        if (res.audio_url) {
          setPhase('speaking');
          await playRemoteAudio(res.audio_url);
        }
        return res;
      } catch {
        return null;
      } finally {
        setPhase('idle');
      }
    },
    [language, qc],
  );

  const clearResult = useCallback(() => setLastResult(null), []);

  // Brief on app open (first authed mount) and when returning to the foreground,
  // throttled so reopening quickly doesn't nag.
  useEffect(() => {
    if (!enabled) return;
    if (Date.now() - lastBriefedAt.current > BRIEFING_COOLDOWN_MS) {
      playBriefing();
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastBriefedAt.current > BRIEFING_COOLDOWN_MS) {
        playBriefing();
      }
    });
    return () => sub.remove();
  }, [enabled, playBriefing]);

  // Silence any in-flight speech when the assistant is turned off.
  useEffect(() => {
    if (!enabled) {
      stopVoicePlayback();
      setPhase('idle');
    }
  }, [enabled]);

  const value = useMemo<VoiceContextValue>(
    () => ({
      enabled,
      language,
      languages: languagesQuery.data ?? [],
      languagesLoading: languagesQuery.isLoading,
      phase,
      busy: phase !== 'idle',
      lastResult,
      clearResult,
      sendCommand,
      playBriefing,
    }),
    [enabled, language, languagesQuery.data, languagesQuery.isLoading, phase, lastResult, clearResult, sendCommand, playBriefing],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used within a VoiceProvider');
  return ctx;
}
