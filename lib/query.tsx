import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry auth/permission errors; do retry transient/network ones.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

/** Stable query keys so screens and mutations invalidate the same caches. */
export const qk = {
  user: ['user'] as const,
  userStats: ['user', 'stats'] as const,
  settings: ['settings'] as const,
  onboardingStatus: ['onboarding', 'status'] as const,
  todayStats: ['steps', 'today'] as const,
  stepHistory: (range: string) => ['steps', 'history', range] as const,
  dailyStat: (date: string) => ['steps', 'daily', date] as const,
  todayGoal: ['goals', 'today'] as const,
  leaderboard: (scope: string) => ['leaderboard', scope] as const,
  feed: (kind: string) => ['feed', kind] as const,
  friends: ['friends'] as const,
  friendRequests: ['friends', 'requests'] as const,
  suggestions: ['friends', 'suggestions'] as const,
  milestones: ['milestones'] as const,
};

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
