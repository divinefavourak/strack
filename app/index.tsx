import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { WalkMark } from '@/components/strack/walk-mark';
import { Brand } from '@/constants/theme';
import { Txt } from '@/components/strack/themed';

/** Splash: deep-green brand screen that auto-advances to onboarding. */
export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/onboarding'), 1600);
    return () => clearTimeout(t);
  }, []);

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
