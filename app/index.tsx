import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Txt } from '@/components/strack/themed';
import { WalkMark } from '@/components/strack/walk-mark';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * Splash + route guard. Once the session has resolved, send the user to the
 * right place: marketing onboarding for guests, setup if signed in but
 * onboarding is incomplete, otherwise the app.
 */
export default function Splash() {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'guest') {
      router.replace('/onboarding');
    } else if (user?.onboarding_completed_at) {
      router.replace('/(tabs)');
    } else {
      router.replace('/setup');
    }
  }, [status, user]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logo}>
        <Txt style={styles.word}>STR</Txt>
        <WalkMark size={34} color="#FFFFFF" />
        <Txt style={styles.word}>CK</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { flexDirection: 'row', alignItems: 'center' },
  word: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', letterSpacing: 1 },
});
