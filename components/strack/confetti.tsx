import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#F2C94C', '#27AE60', '#2F80ED', '#EB5757', '#BB6BD9', '#F2994A', '#4CAF50'];

/**
 * Lightweight confetti burst built on Reanimated (GPU-driven, smooth — no video).
 * Each piece falls from the top with horizontal drift and spin, then fades.
 */
function Piece({ index }: { index: number }) {
  const progress = useSharedValue(0);
  const startX = Math.random() * width;
  const drift = (Math.random() - 0.5) * 160;
  const delay = Math.random() * 500;
  const duration = 1800 + Math.random() * 1400;
  const spin = (Math.random() - 0.5) * 1080;
  const size = 7 + Math.random() * 7;
  const color = COLORS[index % COLORS.length];
  const square = Math.random() > 0.5;

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.linear }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + drift * progress.value },
      { translateY: -20 + progress.value * (height * 0.75) },
      { rotate: `${spin * progress.value}deg` },
    ],
    opacity: progress.value < 0.85 ? 1 : 1 - (progress.value - 0.85) / 0.15,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        { width: size, height: size, backgroundColor: color, borderRadius: square ? 1 : size / 2 },
        style,
      ]}
    />
  );
}

export function Confetti({ count = 36 }: { count?: number }) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {Array.from({ length: count }).map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', zIndex: 10 },
  piece: { position: 'absolute', top: 0, left: 0 },
});
