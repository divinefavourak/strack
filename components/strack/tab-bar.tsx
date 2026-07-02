import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { NAV_ICONS } from '@/data/assets';
import { Txt } from './themed';

const LABELS: Record<string, string> = {
  index: 'Home',
  leaderboard: 'Leaderboard',
  feed: 'Feed',
  profile: 'Profile',
};

/**
 * Custom bottom tab bar matching the Strack design: the exact monochrome icons
 * (tinted grey→green per state) and a small green pill that slides smoothly to
 * the active tab.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabWidth = width / state.routes.length;

  // Slide the indicator to the focused tab.
  const indicatorX = useDerivedValue(() => withTiming(state.index * tabWidth, { duration: 220 }));
  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicatorX.value }] }));

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.background, paddingBottom: insets.bottom || 10 },
      ]}>
      {/* Sliding green pill indicator */}
      <Animated.View style={[styles.indicatorTrack, { width: tabWidth }, indicatorStyle]}>
        <View style={styles.indicatorPill} />
      </Animated.View>

      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color = focused ? colors.tabIconSelected : colors.tabIconDefault;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <NavIcon route={route.name} focused={focused} color={color} />
            <Txt style={[styles.label, { color }]}>{LABELS[route.name] ?? route.name}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function NavIcon({ route, focused, color }: { route: string; focused: boolean; color: string }) {
  const icon = NAV_ICONS[route];
  if (icon) {
    return (
      <Image
        source={focused ? icon.solid : icon.line}
        style={[styles.icon, { tintColor: color }]}
        resizeMode="contain"
      />
    );
  }
  // Profile (no exported asset — fluent:person ≈ Ionicons person)
  return <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  icon: { width: 24, height: 24 },
  label: { fontSize: 12, fontWeight: '500' },
  indicatorTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
  },
  indicatorPill: {
    width: 18,
    height: 3,
    borderRadius: 100,
    backgroundColor: Brand.green,
  },
});
