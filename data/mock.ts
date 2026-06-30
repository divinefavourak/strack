/** All copy/numbers below are transcribed from the Strack Figma mockups. */

export const USER = {
  name: 'Elizabeth',
  memberSince: 'June, 2026',
  stepGoal: 8000,
  steps: 5850,
  distanceKm: 4.6,
  kcal: 245,
  streak: 4,
};

export type DayDot = { date: string; label: string; active?: boolean; done?: boolean };

export const WEEK: DayDot[] = [
  { date: '28/06', label: 'Sun', done: true },
  { date: '29/06', label: 'Mon', done: true },
  { date: '30/06', label: 'Tue', done: true },
  { date: '01/07', label: 'Wed', active: true },
  { date: '02/07', label: 'Thur' },
  { date: '03/07', label: 'Fri' },
  { date: '04/07', label: 'Sat' },
];

export type Leader = { rank: number; name: string; steps: number };

export const LEADERBOARD: Leader[] = [
  { rank: 1, name: 'Elizabeth', steps: 5850 },
  { rank: 2, name: 'Kayode', steps: 5201 },
  { rank: 3, name: 'Halimat', steps: 3850 },
  { rank: 4, name: 'Pemisire', steps: 3582 },
  { rank: 5, name: 'Grace', steps: 2810 },
  { rank: 6, name: 'Ahmed', steps: 2802 },
];

export type CommunityPost = {
  id: string;
  name: string;
  time: string;
  message: string;
  emoji: string;
  /** Key into ICON_3D for the post's 3D image, when available. */
  icon?: string;
  reactions: string[];
};

export const COMMUNITY: CommunityPost[] = [
  {
    id: 'c1',
    name: 'Pemisire',
    time: '10:14',
    message: 'Crushed his daily goal of 8,000 steps!',
    emoji: '🙌',
    icon: 'thumbsManImg',
    reactions: ['❤️', '👏', '🎉'],
  },
  {
    id: 'c2',
    name: 'Halimat',
    time: '08:25',
    message: 'Moved into the top 3 this week!',
    emoji: '🥉',
    icon: 'communityBronze',
    reactions: ['❤️', '👏', '🎉'],
  },
  {
    id: 'c3',
    name: 'Ahmed',
    time: '25/06/2026',
    message: 'Is on a 5-day walking streak. 🔥',
    emoji: '⚡',
    icon: 'lightning',
    reactions: ['❤️', '👏', '🎉'],
  },
  {
    id: 'c4',
    name: 'Kayode',
    time: '20/06/2026',
    message: 'Hit 10,000 steps today!',
    emoji: '👏',
    icon: 'clap',
    reactions: ['❤️', '👏', '🎉'],
  },
];

export type ActivityItem = {
  id: string;
  label: string;
  title: string;
  body: string;
  emoji: string;
  /** Key into ICON_3D for the item's 3D image, when available. */
  icon?: string;
};

export const ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    label: 'June 29, 2026',
    title: '7,420 steps • 5.1 km • 310 kcal',
    body: 'Solid effort! You hit 92% of your daily goal. Just a short evening stroll away from a perfect circle.',
    emoji: '😊',
    icon: 'smiley',
  },
  {
    id: 'a2',
    label: 'Week in Review (June 22 - 28)',
    title: '48,500 Total Steps',
    body: 'You averaged 6,928 steps a day this week. Your most active day was Thursday - keep building that momentum!',
    emoji: '👋',
    icon: 'wave',
  },
  {
    id: 'a3',
    label: 'Milestone Unlocked!',
    title: 'The 50k Club',
    body: "You've officially logged over 50,000 steps since joining Strack. That's the equivalent of walking a full marathon!",
    emoji: '🏆',
    icon: 'trophy',
  },
];

export const PENDING_REQUESTS = ['Folashade', 'Peter', 'Ridwan'];
export const SUGGESTED_FRIENDS = ['Kosisochukwu', 'Abdulganiu', 'Rahama', 'Eunice'];

export const PROFILE_STATS = [
  { emoji: '👟', value: '245,000', label: 'Total Steps', icon: 'shoe' },
  { emoji: '🏅', value: '14,202', label: 'Steps on Best day', icon: 'bestDayMedal' },
  { emoji: '🔥', value: '12 days', label: 'Longest Streak', icon: 'fire' },
  { emoji: '🤝', value: '32', label: 'Friends', icon: 'handshake' },
] as const;
