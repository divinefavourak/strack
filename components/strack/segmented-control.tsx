import { Pressable, StyleSheet, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Txt } from './themed';

/** The pill segmented control used on Leaderboard (Today/Week/Month) and Feed. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.card }]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={styles.segment}>
            <View style={[styles.fill, active && { backgroundColor: Brand.green }]}>
              <Txt
                variant="label"
                color={active ? '#FFFFFF' : colors.textMuted}
                numberOfLines={1}>
                {opt}
              </Txt>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
  },
  segment: { flex: 1 },
  fill: {
    height: 40,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
