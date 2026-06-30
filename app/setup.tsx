import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
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
import { Row, Screen, Txt } from '@/components/strack/themed';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

type Gender = 'Male' | 'Female';

const STEPS = 3;

export default function Setup() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <Txt variant="title" style={styles.title}>
            Welcome to Strack
          </Txt>
          <Txt variant="body" muted style={styles.subtitle}>
            Let’s get started
          </Txt>

          <Stepper current={0} />

          <Txt variant="heading" style={styles.question}>
            What name do you prefer we call you?
          </Txt>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your preferred name"
            placeholderTextColor={colors.textFaint}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
            ]}
          />

          <Txt variant="heading" style={[styles.question, { marginTop: Spacing.xl }]}>
            Select your gender
          </Txt>
          <GenderCard
            label="Male"
            icon="face-man"
            selected={gender === 'Male'}
            onPress={() => setGender('Male')}
          />
          <GenderCard
            label="Female"
            icon="face-woman"
            selected={gender === 'Female'}
            onPress={() => setGender('Female')}
          />
        </View>

        <View style={styles.footer}>
          <Button label="Continue" onPress={() => router.replace('/(tabs)')} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Stepper({ current }: { current: number }) {
  const { colors } = useTheme();
  return (
    <Row style={styles.stepper}>
      {Array.from({ length: STEPS }).map((_, i) => (
        <Row key={i} style={styles.flex}>
          <View
            style={[
              styles.dot,
              { backgroundColor: i <= current ? Brand.green : colors.card },
            ]}
          />
          {i < STEPS - 1 && <View style={[styles.line, { backgroundColor: colors.card }]} />}
        </Row>
      ))}
    </Row>
  );
}

function GenderCard({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: 'face-man' | 'face-woman';
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.genderCard,
        {
          borderColor: selected ? Brand.green : colors.border,
          backgroundColor: selected ? Brand.greenTint : colors.background,
        },
      ]}>
      <View style={styles.genderIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={Brand.green} />
      </View>
      <Txt variant="heading">{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 4 },
  stepper: { marginVertical: Spacing.xl },
  dot: { width: 16, height: 16, borderRadius: 8 },
  line: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 6 },
  question: { marginBottom: Spacing.md },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
  },
  genderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: 64,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  genderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
});
