import { api } from './client';
import {
  type DailyStatRead,
  type FeedKind,
  type FeedPostRead,
  type FeedShareRequest,
  type FriendRead,
  type FriendRequestCreate,
  type FriendRequestRead,
  type FriendSuggestion,
  type GoalRead,
  type GoogleAuthRequest,
  type InviteLinkResponse,
  type LeaderboardResponse,
  type LeaderboardScope,
  type LoginRequest,
  type ManualStepLogRequest,
  type MilestoneRead,
  type OnboardingAgeGroupRequest,
  type OnboardingProfileRequest,
  type OnboardingStatusResponse,
  type RegisterRequest,
  type SettingsRead,
  type SettingsUpdate,
  type StepRange,
  type StepSyncRequest,
  type StreakRead,
  type TodayStatsResponse,
  type TokenResponse,
  type UserRead,
  type UserStats,
  type UserUpdate,
  type UUID,
  type VoiceLanguage,
  type VoiceListenResponse,
  type VoiceSpeakRequest,
  type VoiceSpeakResponse,
} from './types';

export const authApi = {
  register: (body: RegisterRequest) => api.post<TokenResponse>('/auth/register', body, { auth: false }),
  login: (body: LoginRequest) => api.post<TokenResponse>('/auth/login', body, { auth: false }),
  google: (body: GoogleAuthRequest) => api.post<TokenResponse>('/auth/google', body, { auth: false }),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token }, { auth: false }),
  logout: () => api.post<void>('/auth/logout'),
};

export const usersApi = {
  me: () => api.get<UserRead>('/users/me'),
  update: (body: UserUpdate) => api.patch<UserRead>('/users/me', body),
  stats: () => api.get<UserStats>('/users/me/stats'),
};

export const onboardingApi = {
  profile: (body: OnboardingProfileRequest) =>
    api.post<OnboardingStatusResponse>('/onboarding/profile', body),
  ageGroup: (body: OnboardingAgeGroupRequest) =>
    api.post<OnboardingStatusResponse>('/onboarding/age-group', body),
  status: () => api.get<OnboardingStatusResponse>('/onboarding/status'),
};

export const settingsApi = {
  get: () => api.get<SettingsRead>('/settings'),
  update: (body: SettingsUpdate) => api.patch<SettingsRead>('/settings', body),
};

export const goalsApi = {
  today: () => api.get<GoalRead>('/goals/today'),
  updateToday: (goal_steps: number) => api.patch<GoalRead>('/goals/today', { goal_steps }),
  history: (days = 14) => api.get<GoalRead[]>('/goals/history', { query: { days } }),
};

export const stepsApi = {
  sync: (body: StepSyncRequest) => api.post<TodayStatsResponse>('/steps/sync', body),
  manual: (body: ManualStepLogRequest) => api.post<TodayStatsResponse>('/steps/manual', body),
  today: () => api.get<TodayStatsResponse>('/steps/today'),
  history: (range: StepRange = 'week') =>
    api.get<DailyStatRead[]>('/steps/history', { query: { range } }),
  daily: (date: string) => api.get<DailyStatRead>(`/steps/daily/${date}`),
};

export const streaksApi = {
  me: () => api.get<StreakRead>('/streaks/me'),
};

export const milestonesApi = {
  list: () => api.get<MilestoneRead[]>('/milestones'),
};

export const leaderboardApi = {
  get: (scope: LeaderboardScope = 'today') =>
    api.get<LeaderboardResponse>('/leaderboard', { query: { scope } }),
};

export const friendsApi = {
  list: () => api.get<FriendRead[]>('/friends'),
  requests: () => api.get<FriendRequestRead[]>('/friends/requests'),
  sendRequest: (body: FriendRequestCreate) =>
    api.post<FriendRequestRead>('/friends/requests', body),
  accept: (id: UUID) => api.post<void>(`/friends/requests/${id}/accept`),
  decline: (id: UUID) => api.post<void>(`/friends/requests/${id}/decline`),
  remove: (friendUserId: UUID) => api.del<void>(`/friends/${friendUserId}`),
  suggestions: () => api.get<FriendSuggestion[]>('/friends/suggestions'),
  invite: () => api.post<InviteLinkResponse>('/friends/invite'),
};

export const feedApi = {
  list: (kind: FeedKind, limit = 20) =>
    api.get<FeedPostRead[]>(`/feed/${kind}`, { query: { limit } }),
  share: (body: FeedShareRequest) => api.post<FeedPostRead>('/feed/share', body),
  react: (postId: UUID, emoji: string) => api.post<void>(`/feed/${postId}/react`, { emoji }),
};

/** A voice command clip to transcribe + execute (see voiceApi.listen). */
export type VoiceListenInput = {
  /** Local file URI of the recorded clip. */
  uri: string;
  /** File name to send (extension should match the recording, e.g. command.wav). */
  fileName: string;
  /** MIME type of the clip (e.g. audio/wav, audio/m4a). */
  mimeType: string;
  language: string;
  /** STT encoding hint the backend expects (default LINEAR16). */
  encoding: string;
  sampleRateHertz: number;
};

export const voiceApi = {
  languages: () => api.get<VoiceLanguage[]>('/voice/languages'),
  speak: (body: VoiceSpeakRequest) => api.post<VoiceSpeakResponse>('/voice/speak', body),
  briefing: (language: string) =>
    api.get<VoiceSpeakResponse>('/voice/briefing', { query: { language } }),
  listen: (input: VoiceListenInput) => {
    const form = new FormData();
    // React Native's fetch accepts a { uri, name, type } object as a file part.
    form.append('audio', {
      uri: input.uri,
      name: input.fileName,
      type: input.mimeType,
    } as unknown as Blob);
    form.append('language', input.language);
    form.append('encoding', input.encoding);
    form.append('sample_rate_hertz', String(input.sampleRateHertz));
    // rawBody skips JSON serialization; Content-Type is left unset so fetch adds
    // the multipart boundary itself.
    return api.post<VoiceListenResponse>('/voice/listen', undefined, { rawBody: form });
  },
};
