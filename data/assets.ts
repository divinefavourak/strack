import { type ImageSourcePropType } from 'react-native';

/** Real 3D rank medals (podium) and rosette ribbons (list rows), exported from Figma. */
export const MEDALS: Record<number, ImageSourcePropType> = {
  1: require('@/assets/images/medal-gold.png'),
  2: require('@/assets/images/medal-silver.png'),
  3: require('@/assets/images/medal-bronze.png'),
};

export const RIBBONS: Record<number, ImageSourcePropType> = {
  1: require('@/assets/images/ribbon-1.png'),
  2: require('@/assets/images/ribbon-2.png'),
  3: require('@/assets/images/ribbon-3.png'),
};

/** Monochrome navbar icons exported from the design (tinted per active state). */
export const NAV_ICONS: Record<string, { line: ImageSourcePropType; solid: ImageSourcePropType }> = {
  index: {
    line: require('@/assets/images/nav-home-line.png'),
    solid: require('@/assets/images/nav-home-solid.png'),
  },
  leaderboard: {
    line: require('@/assets/images/nav-leaderboard-line.png'),
    solid: require('@/assets/images/nav-leaderboard-solid.png'),
  },
  feed: {
    line: require('@/assets/images/nav-feed-line.png'),
    solid: require('@/assets/images/nav-feed-solid.png'),
  },
};

/** Photo avatars (3D character renders). Names without an entry fall back to a colored initial. */
export const AVATARS: Record<string, ImageSourcePropType> = {
  Folashade: require('@/assets/images/avatar-folashade.png'),
  Peter: require('@/assets/images/avatar-peter.png'),
  Ridwan: require('@/assets/images/avatar-ridwan.png'),
};

/**
 * 3D icon renders from the design. Entries left `undefined` fall back to an emoji
 * (see Icon3D). To wire one up, export the node from Figma into assets/images with
 * the listed filename and replace `undefined` with the matching `require(...)`.
 *
 *   thumbsUp     22:24   -> icon-thumbsup.png      (home "Keep it up" banner)
 *   trophy       175:879 -> icon-trophy.png        (activity feed milestone)
 *   smiley       171:841 -> icon-smiley.png        (activity feed)
 *   clap         171:830 -> icon-clap.png          (community / activity)
 *   lightning    95:402  -> icon-lightning.png     (community streak post)
 *   thumbsManImg 91:364  -> icon-thumbs-man.png    (community post avatar)
 *   fire         106:618 -> icon-fire.png          (profile streak stat)
 *   handshake    135:685 -> icon-handshake.png     (profile friends stat)
 *   shoe         75:274  -> icon-shoe.png          (home / profile steps stat)
 *   wave         —       -> icon-wave.png          (activity "week in review")
 */
export const ICON_3D: Record<string, ImageSourcePropType | undefined> = {
  // Reuses of the exported medals:
  bestDayMedal: MEDALS[1],
  communityBronze: MEDALS[3],

  // Exported 3D renders:
  thumbsUp: require('@/assets/images/icon-thumbsup.png'),
  trophy: require('@/assets/images/icon-trophy.png'),
  smiley: require('@/assets/images/icon-smiley.png'),
  clap: require('@/assets/images/icon-clap.png'),
  lightning: require('@/assets/images/icon-lightning.png'),
  thumbsManImg: require('@/assets/images/icon-thumbs-man.png'),
  handshake: require('@/assets/images/icon-handshake.png'),
  shoe: require('@/assets/images/icon-shoe.png'),

  fire: require('@/assets/images/icon-fire.png'),

  // Not yet exported — emoji fallback until the PNG is dropped in:
  wave: undefined, // 175:881 -> icon-wave.png
};

/** Streak flame is an animated WebP; the runner is a static frame (bounced in code). */
export const STREAK_FIRE: ImageSourcePropType = require('@/assets/images/streak-fire.webp');
export const GIRL_RUNNER: ImageSourcePropType = require('@/assets/images/girl-runner.png');
export const LOGO_MARK: ImageSourcePropType = require('@/assets/images/logo-mark.png');
