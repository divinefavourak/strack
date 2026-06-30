import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Txt } from './themed';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The full-width pill CTA used on onboarding, setup, and find-friends. */
export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? Brand.green : colors.card,
          opacity: pressed || disabled ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.text} />
      ) : (
        <Txt variant="heading" color={isPrimary ? '#FFFFFF' : colors.text}>
          {label}
        </Txt>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
