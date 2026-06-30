/** React Query hooks wrapping the Strack API. Screens use these instead of mock data. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  feedApi,
  friendsApi,
  goalsApi,
  leaderboardApi,
  milestonesApi,
  onboardingApi,
  settingsApi,
  stepsApi,
  usersApi,
} from '@/lib/api/endpoints';
import {
  type FeedKind,
  type LeaderboardScope,
  type OnboardingAgeGroupRequest,
  type OnboardingProfileRequest,
  type SettingsUpdate,
  type StepRange,
  type StepSyncRequest,
  type UserUpdate,
} from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { qk } from '@/lib/query';

/** Only fire authed queries once the session is ready. */
function useAuthed() {
  return useAuth().status === 'authed';
}

// --- Queries ---
export function useProfile() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.user, queryFn: usersApi.me, enabled });
}
export function useUserStats() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.userStats, queryFn: usersApi.stats, enabled });
}
export function useSettings() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.settings, queryFn: settingsApi.get, enabled });
}
export function useOnboardingStatus() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.onboardingStatus, queryFn: onboardingApi.status, enabled });
}
export function useTodayStats() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.todayStats, queryFn: stepsApi.today, enabled });
}
export function useStepHistory(range: StepRange = 'week') {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.stepHistory(range), queryFn: () => stepsApi.history(range), enabled });
}
export function useTodayGoal() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.todayGoal, queryFn: goalsApi.today, enabled });
}
export function useLeaderboard(scope: LeaderboardScope) {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.leaderboard(scope), queryFn: () => leaderboardApi.get(scope), enabled });
}
export function useFeed(kind: FeedKind) {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.feed(kind), queryFn: () => feedApi.list(kind), enabled });
}
export function useFriendRequests() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.friendRequests, queryFn: friendsApi.requests, enabled });
}
export function useSuggestions() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.suggestions, queryFn: friendsApi.suggestions, enabled });
}
export function useMilestones() {
  const enabled = useAuthed();
  return useQuery({ queryKey: qk.milestones, queryFn: milestonesApi.list, enabled });
}

// --- Mutations ---
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SettingsUpdate) => settingsApi.update(body),
    onSuccess: (data) => qc.setQueryData(qk.settings, data),
  });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserUpdate) => usersApi.update(body),
    onSuccess: (data) => qc.setQueryData(qk.user, data),
  });
}
export function useOnboardingProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OnboardingProfileRequest) => onboardingApi.profile(body),
    onSuccess: (data) => qc.setQueryData(qk.onboardingStatus, data),
  });
}
export function useOnboardingAgeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OnboardingAgeGroupRequest) => onboardingApi.ageGroup(body),
    onSuccess: (data) => qc.setQueryData(qk.onboardingStatus, data),
  });
}
export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goalSteps: number) => goalsApi.updateToday(goalSteps),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.todayGoal });
      qc.invalidateQueries({ queryKey: qk.todayStats });
    },
  });
}
export function useLogManualSteps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (steps: number) =>
      stepsApi.manual({ steps, recorded_at: new Date().toISOString() }),
    onSuccess: (today) => {
      qc.setQueryData(qk.todayStats, today);
      qc.invalidateQueries({ queryKey: qk.stepHistory('week') });
    },
  });
}
export function useSyncSteps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StepSyncRequest) => stepsApi.sync(body),
    onSuccess: (today) => {
      qc.setQueryData(qk.todayStats, today);
      qc.invalidateQueries({ queryKey: qk.stepHistory('week') });
    },
  });
}
export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (usernameOrEmail: string) =>
      friendsApi.sendRequest({ username_or_email: usernameOrEmail }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.suggestions });
      qc.invalidateQueries({ queryKey: qk.friendRequests });
    },
  });
}
export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      action === 'accept' ? friendsApi.accept(id) : friendsApi.decline(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.friendRequests });
      qc.invalidateQueries({ queryKey: qk.friends });
      qc.invalidateQueries({ queryKey: qk.userStats });
    },
  });
}
export function useShareFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => feedApi.share({ message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.feed('community') }),
  });
}
export function useReactFeed(kind: FeedKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, emoji }: { postId: string; emoji: string }) =>
      feedApi.react(postId, emoji),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.feed(kind) }),
  });
}
