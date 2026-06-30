import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/strack/button';
import { Txt } from '@/components/strack/themed';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';

export default function Onboarding() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('@/assets/images/onboarding-hero.png')}
        style={styles.hero}
        contentFit="cover"
      />
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Txt variant="title" style={styles.title}>
          Every step counts.
        </Txt>
        <Txt variant="body" muted style={styles.subtitle}>
          Track your steps, set a goal that fits you, and build a healthier life - one walk at a
          time.
        </Txt>
        <Button label="Get Started" onPress={() => router.replace('/register')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { width: '100%', flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  title: { textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
});
