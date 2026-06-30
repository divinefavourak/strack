/**
 * Theme-aware primitives. `Screen` provides the safe-area padded page background,
 * `Txt` is a Text that defaults to the theme's text color, and `AppText` variants
 * cover the handful of type styles used across the app.
 */
import { type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/context/theme-context';

export function Screen({
  children,
  style,
  edges = ['top', 'bottom'],
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenScroll({
  children,
  contentContainerStyle,
  ...rest
}: ScrollViewProps & { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={contentContainerStyle}
      {...rest}>
      {children}
    </ScrollView>
  );
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

const variantStyle: Record<Variant, TextStyle> = {
  display: { fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
};

export function Txt({
  variant = 'body',
  color,
  muted,
  style,
  ...rest
}: TextProps & {
  variant?: Variant;
  color?: string;
  muted?: boolean;
}) {
  const { colors } = useTheme();
  const resolved = color ?? (muted ? colors.textMuted : colors.text);
  return <Text style={[variantStyle[variant], { color: resolved }, style]} {...rest} />;
}

export function Row({ style, ...rest }: ViewProps) {
  return <View style={[styles.row, style]} {...rest} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
