import { type ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Lighten a hex color toward white so the overflow lap is visible over the full ring. */
function lighten(hex: string, amount: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/**
 * Circular progress ring (react-native-svg). The arc starts at 12 o'clock and
 * sweeps clockwise with rounded caps.
 *
 * When `progress` exceeds 1 (goal beaten) the ring fills fully and a second
 * "overflow" lap is drawn on top, overlapping the start — with a soft shadow
 * under its leading cap, like the Apple Activity ring.
 */
export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  children,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor: string;
  children?: ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const p = Math.max(0, progress);
  const base = Math.min(p, 1);
  const over = Math.max(0, Math.min(p - 1, 1));

  const animBase = useSharedValue(0);
  const animOver = useSharedValue(0);
  useEffect(() => {
    animBase.value = withTiming(base, { duration: 1100, easing: Easing.out(Easing.cubic) });
    animOver.value = withTiming(over, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [base, over, animBase, animOver]);

  const baseProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animBase.value),
  }));
  const overProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animOver.value),
    opacity: animOver.value > 0 ? 1 : 0,
  }));
  // Soft shadow that tracks the leading tip of the overflow lap.
  const shadowProps = useAnimatedProps(() => {
    const angle = animOver.value * 2 * Math.PI; // radians clockwise from top
    return {
      cx: size / 2 + radius * Math.sin(angle),
      cy: size / 2 - radius * Math.cos(angle),
      opacity: animOver.value > 0.02 ? 0.3 : 0,
    };
  });
  const overColor = lighten(color, 0.28);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        {/* Track */}
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        {/* First lap */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={baseProps}
        />
        {/* Shadow under the overflow cap (drawn over the first lap) */}
        <AnimatedCircle r={strokeWidth * 0.66} fill="#000000" animatedProps={shadowProps} />
        {/* Overflow lap, on top — a lighter shade so it's visible over the full ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={overColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={overProps}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
