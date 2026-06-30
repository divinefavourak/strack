import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/strack/button';
import { GoogleIcon } from '@/components/strack/google-icon';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { WalkMark } from '@/components/strack/walk-mark';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { useGoogleAuth } from '@/lib/auth/google';

type Mode = 'login' | 'register';

export function AuthForm({ mode }: { mode: Mode }) {
  const { colors } = useTheme();
  const { signIn, signUp } = useAuth();
  const google = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  async function submit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (isRegister) await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
      // Re-run the root guard, which routes to /setup or /(tabs).
      router.replace('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <Row style={styles.brand}>
            <Txt style={styles.word}>STR</Txt>
            <WalkMark size={24} color={Brand.green} />
            <Txt style={styles.word}>CK</Txt>
          </Row>

          <Txt variant="title" style={styles.title}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </Txt>
          <Txt variant="body" muted style={styles.subtitle}>
            {isRegister ? 'Start tracking your steps today.' : 'Log in to keep your streak going.'}
          </Txt>

          <Txt variant="label" muted style={styles.fieldLabel}>
            Email
          </Txt>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />

          <Txt variant="label" muted style={styles.fieldLabel}>
            Password
          </Txt>
          <View style={[styles.input, styles.passwordWrap, { borderColor: colors.border }]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
              placeholderTextColor={colors.textFaint}
              secureTextEntry={!show}
              autoCapitalize="none"
              style={[styles.flex, { color: colors.text, fontSize: 15 }]}
            />
            <Pressable onPress={() => setShow((s) => !s)} hitSlop={8}>
              <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {error && (
            <Txt variant="caption" color={colors.danger} style={styles.error}>
              {error}
            </Txt>
          )}

          <Button
            label={isRegister ? 'Sign Up' : 'Log In'}
            onPress={submit}
            loading={busy}
            style={styles.submit}
          />

          {/* Google (scaffolded) */}
          <Pressable
            onPress={google.signIn}
            style={[styles.google, { borderColor: colors.border }]}>
            <GoogleIcon size={18} />
            <Txt variant="label">Continue with Google</Txt>
          </Pressable>
        </View>

        <Row style={styles.footer}>
          <Txt variant="body" muted>
            {isRegister ? 'Already have an account?' : 'New to Strack?'}{' '}
          </Txt>
          <Link href={isRegister ? '/login' : '/register'} replace>
            <Txt variant="body" color={Brand.green}>
              {isRegister ? 'Log in' : 'Create one'}
            </Txt>
          </Link>
        </Row>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  brand: { justifyContent: 'center', marginBottom: Spacing.xl },
  word: { fontSize: 26, fontWeight: '800', letterSpacing: 1, color: Brand.green },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: Spacing.xl },
  fieldLabel: { marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
  },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  error: { marginTop: Spacing.md },
  submit: { marginTop: Spacing.xl },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 54,
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    marginTop: Spacing.md,
  },
  footer: { justifyContent: 'center', paddingBottom: Spacing.lg },
});
