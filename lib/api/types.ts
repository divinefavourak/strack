/** TypeScript mirrors of the Strack API (FastAPI) schemas. */

export type UUID = string;
export type ISODateTime = string;
export type ISODate = string;

export type Gender = 'male' | 'female' | 'other';
export type AgeGroup = 'under_18' | '18_40' | '41_65' | '65_plus';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'active';

// --- Auth ---
export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: UUID;
};
export type RegisterRequest = { email: string; password: string };
export type LoginRequest = { email: string; password: string };
export type GoogleAuthRequest = { id_token: string };
export type RefreshRequest = { refresh_token: string };

// --- User ---
export type UserRead = {
  id: UUID;
  email: string;
  username: string | null;
  preferred_name: string | null;
  gender: Gender | null;
  age_group: AgeGroup | null;
  activity_level: ActivityLevel | null;
  avatar_url: string | null;
  created_at: ISODateTime;
  onboarding_completed_at: ISODateTime | null;
};
export type UserUpdate = Partial<{
  username: string;
  preferred_name: string;
  gender: Gender;
  avatar_url: string;
}>;
export type UserStats = {
  total_steps: number;
  best_day_steps: number;
  longest_streak: number;
  friend_count: number;
};

// --- Onboarding ---
export type OnboardingProfileRequest = { preferred_name: string; gender: Gender };
export type OnboardingAgeGroupRequest = { age_group: AgeGroup; activity_level?: ActivityLevel };
export type OnboardingStatusResponse = {
  profile_completed: boolean;
  age_group_completed: boolean;
  onboarding_completed: boolean;
};

// --- Settings ---
export type FontSize = 'small' | 'medium' | 'large';
export type ThemePref = 'light' | 'dark';
export type SettingsRead = {
  font_size: FontSize;
  theme: ThemePref;
  notifications_enabled: boolean;
  voice_assistant_enabled: boolean;
  alert_channel: 'audio' | 'haptic' | 'visual' | 'all';
  language: string;
  units: 'km' | 'mi';
  leaderboard_visibility: 'public' | 'friends' | 'anonymous';
};
export type SettingsUpdate = Partial<SettingsRead>;

// --- Goals ---
export type GoalRead = {
  date: ISODate;
  goal_steps: number;
  baseline_steps: number;
  is_manual_override: boolean;
};
export type GoalUpdate = { goal_steps: number };

// --- Steps ---
export type StepEventIn = {
  client_event_id: string;
  steps_delta: number;
  recorded_at: ISODateTime;
};
export type StepSyncRequest = { events: StepEventIn[] };
export type ManualStepLogRequest = { steps: number; recorded_at: ISODateTime };
export type TodayStatsResponse = {
  date: ISODate;
  total_steps: number;
  goal_steps: number;
  steps_remaining: number;
  progress_percent: number;
  distance_km: number;
  calories: number;
  active_minutes: number;
  goal_completed_at: ISODateTime | null;
  current_streak: number;
};
export type DailyStatRead = {
  date: ISODate;
  total_steps: number;
  distance_km: number;
  calories: number;
  active_minutes: number;
  goal_completed_at: ISODateTime | null;
};
export type StepRange = 'week' | 'month';

// --- Streaks / Milestones ---
export type StreakRead = {
  current_streak: number;
  longest_streak: number;
  last_active_date: ISODate;
};
export type MilestoneRead = {
  id: UUID;
  type: string;
  achieved_at: ISODateTime;
  extra_data: Record<string, unknown>;
};

// --- Leaderboard ---
export type LeaderboardScope = 'today' | 'week' | 'month';
export type LeaderboardEntry = {
  rank: number;
  user_id: UUID;
  display_name: string;
  avatar_url: string | null;
  steps: number;
  is_self: boolean;
};
export type LeaderboardResponse = {
  scope: LeaderboardScope;
  my_rank: number | null;
  entries: LeaderboardEntry[];
};

// --- Friends ---
export type FriendRead = {
  user_id: UUID;
  display_name: string;
  avatar_url: string | null;
  friends_since: ISODateTime;
};
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';
export type FriendRequestRead = {
  id: UUID;
  requester_id: UUID;
  addressee_id: UUID;
  status: FriendRequestStatus;
  created_at: ISODateTime;
  // The API enriches requests with the requester's display info for the UI.
  display_name?: string;
  avatar_url?: string | null;
};
export type FriendRequestCreate = { username_or_email: string };
export type FriendSuggestion = {
  user_id: UUID;
  display_name: string;
  avatar_url: string | null;
};
export type InviteLinkResponse = { invite_code: string; invite_url: string };

// --- Feed ---
export type FeedType = 'activity_summary' | 'milestone' | 'community_share';
export type FeedPostRead = {
  id: UUID;
  user_id: UUID;
  display_name: string;
  avatar_url: string | null;
  type: FeedType;
  payload: Record<string, unknown>;
  created_at: ISODateTime;
  reactions: Record<string, number>;
};
export type FeedShareRequest = { message?: string };
export type ReactionRequest = { emoji: string };
export type FeedKind = 'activity' | 'community';

// --- Voice ---
/** A speakable language the backend supports (e.g. { code: 'yo', label: 'Yorùbá' }). */
export type VoiceLanguage = { code: string; label: string };
export type VoiceSpeakRequest = { text: string; context_key?: string; language?: string };
export type VoiceSpeakResponse = {
  text: string;
  language: string;
  audio_url: string;
  cached: boolean;
};
/**
 * Result of POST /voice/listen. The backend transcribes the clip, classifies the
 * `intent`, performs the action server-side, and returns spoken feedback
 * (`response_text` + `audio_url`). `result` carries any structured payload.
 */
export type VoiceListenResponse = {
  transcript: string;
  language: string;
  intent: string;
  response_text: string;
  audio_url: string;
  result?: Record<string, unknown>;
};

/** Shape of FastAPI error responses ({ detail: ... }). */
export type ApiErrorBody = { detail?: string | { msg: string }[] };
