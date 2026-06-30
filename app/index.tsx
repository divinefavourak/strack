import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Row, Txt } from '@/components/strack/themed';
import { useFloat } from '@/components/strack/use-float';
import { Brand } from '@/constants/theme';
import { GIRL_RUNNER } from '@/data/assets';
import { useAuth } from '@/lib/auth/auth-context';

const LETTERS_LEFT = ['S', 'T', 'R'];
const LETTERS_RIGHT = ['C', 'K'];

/**
 * Animated splash + route guard. Once the session resolves, route to the right
 * place: marketing onboarding for guests, setup if onboarding is incomplete,
 * otherwise the app.
 */
export default function Splash() {
  const { status, user } = useAuth();
  const bounce = useFloat({ distance: 10, duration: 380 });

  useEffect(() => {
    if (status === 'loading') return;
    // Brief beat so the splash animation can play before we navigate.
    const t = setTimeout(() => {
      if (status === 'guest') router.replace('/onboarding');
      else if (user?.onboarding_completed_at) router.replace('/(tabs)');
      else router.replace('/setup');
    }, 1100);
    return () => clearTimeout(t);
  }, [status, user]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Girl runner — static frame with a smooth running bounce (no video decode) */}
      <Animated.View entering={ZoomIn.springify().damping(12)}>
        <Animated.View style={bounce}>
          <Image source={GIRL_RUNNER} style={styles.runner} contentFit="contain" />
        </Animated.View>
      </Animated.View>

      {/* STR<run>CK wordmark — letters drop in one by one */}
      <Row style={styles.wordmark}>
        {LETTERS_LEFT.map((ch, i) => (
          <Letter key={`l${i}`} ch={ch} delay={250 + i * 70} />
        ))}
        <Animated.View entering={FadeInDown.delay(250 + 3 * 70).springify().damping(14)}>
          <MaterialCommunityIcons name="run" size={30} color="#FFFFFF" style={styles.runIcon} />
        </Animated.View>
        {LETTERS_RIGHT.map((ch, i) => (
          <Letter key={`r${i}`} ch={ch} delay={250 + (4 + i) * 70} />
        ))}
      </Row>

      <Animated.View entering={FadeInUp.delay(820).duration(600)}>
        <Txt style={styles.tagline}>Every step counts.</Txt>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(1000)} style={styles.dots}>
        <Dot delay={0} />
        <Dot delay={160} />
        <Dot delay={320} />
      </Animated.View>
    </View>
  );
}

function Letter({ ch, delay }: { ch: string; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(14)}>
      <Txt style={styles.word}>{ch}</Txt>
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: 0.3 + v.value * 0.7 }));
  return <Animated.View style={[styles.dot, style, { marginLeft: delay ? 8 : 0 }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.greenDark, alignItems: 'center', justifyContent: 'center' },
  runner: { width: 200, height: 200 },
  wordmark: { justifyContent: 'center', marginTop: 10 },
  word: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: 1 },
  runIcon: { marginHorizontal: -2, marginTop: 2 },
  tagline: { color: '#FFFFFFCC', fontSize: 15, fontWeight: '500', marginTop: 8, textAlign: 'center', letterSpacing: 0.3 },
  dots: { flexDirection: 'row', position: 'absolute', bottom: 80 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
});
