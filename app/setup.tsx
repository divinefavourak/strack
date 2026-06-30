import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { ApiError } from '@/lib/api/client';
import { type AgeGroup, type Gender } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useOnboardingAgeGroup, useOnboardingProfile, useTodayGoal } from '@/hooks/api';

const STEPS = 3;

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_40', label: '18 - 40' },
  { value: '41_65', label: '41 - 65' },
  { value: '65_plus', label: '65+' },
];

export default function Setup() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileMut = useOnboardingProfile();
  const ageMut = useOnboardingAgeGroup();
  const [finishing, setFinishing] = useState(false);

  async function next() {
    setError(null);
    try {
      if (step === 0) {
        if (!name.trim() || !gender) {
          setError('Please enter your name and select a gender.');
          return;
        }
        await profileMut.mutateAsync({ preferred_name: name.trim(), gender });
        setStep(1);
      } else if (step === 1) {
        if (!ageGroup) {
          setError('Please select your age group.');
          return;
        }
        await ageMut.mutateAsync({ age_group: ageGroup, activity_level: 'lightly_active' });
        setStep(2);
      } else {
        setFinishing(true);
        await refreshUser();
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setFinishing(false);
    }
  }

  const busy = profileMut.isPending || ageMut.isPending || finishing;

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

          <Stepper current={step} />

          {step === 0 && (
            <ProfileStep
              name={name}
              setName={setName}
              gender={gender}
              setGender={setGender}
            />
          )}
          {step === 1 && <AgeStep ageGroup={ageGroup} setAgeGroup={setAgeGroup} />}
          {step === 2 && <GoalStep />}

          {error && (
            <Txt variant="caption" color="#E5484D" style={{ marginTop: Spacing.lg }}>
              {error}
            </Txt>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            label={step === 2 ? 'Finish' : 'Continue'}
            onPress={next}
            loading={busy}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ProfileStep({
  name,
  setName,
  gender,
  setGender,
}: {
  name: string;
  setName: (v: string) => void;
  gender: Gender | null;
  setGender: (g: Gender) => void;
}) {
  const { colors } = useTheme();
  return (
    <>
      <Txt variant="heading" style={styles.question}>
        What name do you prefer we call you?
      </Txt>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your preferred name"
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
      />

      <Txt variant="heading" style={[styles.question, { marginTop: Spacing.xl }]}>
        Select your gender
      </Txt>
      <GenderCard label="Male" icon="face-man" selected={gender === 'male'} onPress={() => setGender('male')} />
      <GenderCard label="Female" icon="face-woman" selected={gender === 'female'} onPress={() => setGender('female')} />
      <GenderCard label="Other" icon="account" selected={gender === 'other'} onPress={() => setGender('other')} />
    </>
  );
}

function AgeStep({
  ageGroup,
  setAgeGroup,
}: {
  ageGroup: AgeGroup | null;
  setAgeGroup: (a: AgeGroup) => void;
}) {
  const { colors } = useTheme();
  return (
    <>
      <Txt variant="heading" style={styles.question}>
        Select your age group
      </Txt>
      {AGE_GROUPS.map((g) => {
        const selected = ageGroup === g.value;
        return (
          <Pressable
            key={g.value}
            onPress={() => setAgeGroup(g.value)}
            style={[
              styles.optionCard,
              {
                borderColor: selected ? Brand.green : colors.border,
                backgroundColor: selected ? Brand.greenTint : colors.background,
              },
            ]}>
            <Txt variant="heading" color={selected ? Brand.greenDark : colors.text}>
              {g.label}
            </Txt>
            {selected && <Ionicons name="checkmark-circle" size={22} color={Brand.green} />}
          </Pressable>
        );
      })}
    </>
  );
}

function GoalStep() {
  const { colors } = useTheme();
  const { data: goal, isLoading } = useTodayGoal();
  return (
    <View style={styles.goalWrap}>
      <View style={[styles.goalCard, { backgroundColor: Brand.greenTint }]}>
        <Txt variant="body" color={Brand.greenDark}>
          Recommended daily goal!
        </Txt>
        {isLoading ? (
          <ActivityIndicator color={Brand.green} style={{ marginVertical: Spacing.md }} />
        ) : (
          <Txt style={styles.goalValue} color={Brand.greenDark}>
            {(goal?.goal_steps ?? 8000).toLocaleString()} Steps
          </Txt>
        )}
        <Txt variant="caption" muted>
          Based on general activity guidelines for your age group.
        </Txt>
      </View>
      <Txt variant="body" muted style={{ textAlign: 'center', marginTop: Spacing.lg }}>
        You’re all set — tap Finish to start tracking.
      </Txt>
    </View>
  );
}

function Stepper({ current }: { current: number }) {
  const { colors } = useTheme();
  return (
    <Row style={styles.stepper}>
      {Array.from({ length: STEPS }).map((_, i) => (
        <Row key={i} style={styles.flex}>
          <View style={[styles.dot, { backgroundColor: i <= current ? Brand.green : colors.card }]} />
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
  icon: 'face-man' | 'face-woman' | 'account';
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.genderCard,
        { borderColor: selected ? Brand.green : colors.border, backgroundColor: selected ? Brand.greenTint : colors.background },
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  goalWrap: { marginTop: Spacing.lg },
  goalCard: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm },
  goalValue: { fontSize: 28, fontWeight: '800' },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
});
