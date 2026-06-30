import { Image } from 'expo-image';
import { type ImageSourcePropType } from 'react-native';

import { Txt } from './themed';

/**
 * Renders a 3D icon PNG when one has been exported from Figma, otherwise falls
 * back to the matching emoji glyph. This lets every screen reference the design's
 * 3D icon set while degrading gracefully when an asset isn't present yet.
 */
export function Icon3D({
  source,
  emoji,
  size = 24,
}: {
  source?: ImageSourcePropType;
  emoji: string;
  size?: number;
}) {
  if (source) {
    return <Image source={source} style={{ width: size, height: size }} contentFit="contain" />;
  }
  // Emoji renders a touch smaller than its box, so nudge the font size up to match.
  return <Txt style={{ fontSize: size * 0.92 }}>{emoji}</Txt>;
}
