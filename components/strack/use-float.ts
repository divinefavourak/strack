import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** A gentle, infinite up-and-down hover. Use different delays to stagger items. */
export function useFloat({ distance = 6, duration = 1500, delay = 0 } = {}) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -distance * v.value }] }));
}
