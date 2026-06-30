/**
 * Strack design tokens.
 *
 * The Figma design is a green-forward fitness / step-tracking app with both a
 * light and a dark theme. Every screen pulls its colors from the `light` / `dark`
 * palettes below (via the `useTheme` hook) so the Profile "Theme" toggle can flip
 * the whole app at once.
 */

import { Platform } from 'react-native';

/** Brand greens — constant across light & dark. */
export const Brand = {
  /** Deep forest green used on the splash background and primary buttons. */
  green: '#1E6B2F',
  /** Even darker green for pressed / splash states. */
  greenDark: '#16531F',
  /** Bright spring green — dark-mode progress ring, profile avatar, accents. */
  greenBright: '#4CAF50',
  /** Soft green tint for cards / banners on light backgrounds. */
  greenTint: '#E8F2E9',
} as const;

export const Colors = {
  light: {
    text: '#1E1E2F',
    textMuted: '#8A8A8A',
    textFaint: '#B5B5B5',
    background: '#FFFFFF',
    /** Subtle off-white used behind grouped content. */
    backgroundAlt: '#FFFFFF',
    /** Neutral card fill (stat cards, segmented control track). */
    card: '#F4F4F4',
    /** Border for outlined elements (day pills, inputs). */
    border: '#ECECEC',
    /** Primary accent — buttons, active states, progress. */
    tint: Brand.green,
    /** Progress ring track. */
    track: '#EFEFEF',
    /** Green tint surfaces. */
    accentSurface: Brand.greenTint,
    accentText: Brand.green,
    tabBar: '#FFFFFF',
    tabIconDefault: '#9A9A9A',
    tabIconSelected: Brand.green,
    danger: '#E5484D',
    dangerSurface: '#FCE9E9',
  },
  dark: {
    text: '#FFFFFF',
    textMuted: '#9A9A9A',
    textFaint: '#6E6E6E',
    background: '#0E0F11',
    backgroundAlt: '#0E0F11',
    card: '#1B1D1F',
    border: '#2A2C2E',
    tint: Brand.greenBright,
    track: '#E7E7E7',
    accentSurface: Brand.greenTint,
    accentText: Brand.green,
    tabBar: '#121315',
    tabIconDefault: '#7A7A7A',
    tabIconSelected: Brand.greenBright,
    danger: '#FF6369',
    dangerSurface: '#3A1F20',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
