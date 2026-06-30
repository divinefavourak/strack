import { Image } from 'expo-image';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { Txt } from './themed';

/** Pastel ring of fill colors keyed off the first letter, matching the mockups. */
const PALETTE = [
  '#DCEBD3', '#D6E4F0', '#F0D6E4', '#E9F0D6', '#F0E0D6',
  '#D6F0EA', '#E4D6F0', '#F0D9D6', '#D6F0D9', '#EFE6D0',
];

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({
  name,
  size = 44,
  color,
  textColor = '#3A3A3A',
  image,
}: {
  name: string;
  size?: number;
  color?: string;
  textColor?: string;
  /** Real photo avatar; when provided it replaces the colored initial. */
  image?: ImageSourcePropType;
}) {
  const radius = size / 2;

  if (image) {
    return (
      <Image
        source={image}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
      />
    );
  }

  const bg = color ?? colorFor(name);
  return (
    <View
      style={[styles.base, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>
      <Txt style={{ fontSize: size * 0.4, fontWeight: '700', color: textColor }}>
        {name.charAt(0).toUpperCase()}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
