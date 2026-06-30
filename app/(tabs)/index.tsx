import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon3D } from '@/components/strack/icon3d';
import { ProgressRing } from '@/components/strack/progress-ring';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { WalkMark } from '@/components/strack/walk-mark';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ICON_3D } from '@/data/assets';
import { USER, WEEK, type DayDot } from '@/data/mock';
import { type ImageSourcePropType } from 'react-native';

export default function Home() {
  const { colors, isDark, toggleScheme } = useTheme();
  const pct = USER.steps / USER.stepGoal;
  const stepsToGo = USER.stepGoal - USER.steps;

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Header */}
        <Row style={styles.header}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={colors.text}
            onPress={toggleScheme}
          />
          <View style={styles.headerCenter}>
            <Txt variant="heading">Good afternoon, {USER.name} 👋</Txt>
            <Txt variant="caption" muted style={{ marginTop: 2 }}>
              Great job staying active!
            </Txt>
          </View>
          <Ionicons name="volume-high-outline" size={22} color={colors.text} />
        </Row>

        {/* Day strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}>
          {WEEK.map((d) => (
            <DayPill key={d.date} day={d} />
          ))}
        </ScrollView>

        {/* Streak */}
        <Row style={styles.streak}>
          <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
          <Txt variant="label" style={{ marginHorizontal: Spacing.md }}>
            🔥 {USER.streak} days streak
          </Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Row>

        {/* Progress ring */}
        <View style={styles.ringWrap}>
          <ProgressRing
            size={228}
            strokeWidth={18}
            progress={pct}
            color={colors.tint}
            trackColor={colors.track}>
            <WalkMark size={30} color={colors.tint} />
            <Txt style={[styles.ringValue, { color: colors.text }]}>
              {USER.steps.toLocaleString()}
            </Txt>
            <Txt variant="heading" color={colors.tint}>
              /{USER.stepGoal.toLocaleString()} Steps
            </Txt>
          </ProgressRing>
        </View>

        {/* Stat cards */}
        <Row style={styles.statRow}>
          <StatCard value={stepsToGo.toLocaleString()} label="Steps to go" emoji="👟" source={ICON_3D.shoe} />
          <StatCard value={`${USER.distanceKm} km`} label="distance" emoji="📍" />
          <StatCard value={`${USER.kcal}`} label="kcal" emoji="🔥" source={ICON_3D.fire} />
        </Row>

        {/* Encouragement banner */}
        <View style={[styles.banner, { backgroundColor: Brand.greenTint }]}>
          <View style={styles.flex}>
            <Txt variant="title" color={Brand.greenDark}>
              Keep it up!
            </Txt>
            <Txt variant="body" color={Brand.green} style={{ marginTop: 4 }}>
              You’re doing great today.
            </Txt>
          </View>
          <Icon3D source={ICON_3D.thumbsUp} emoji="👍" size={78} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function DayPill({ day }: { day: DayDot }) {
  const { colors } = useTheme();
  const boltColor = day.active || day.done ? Brand.green : colors.textFaint;
  return (
    <View
      style={[
        styles.dayPill,
        {
          borderColor: colors.border,
          backgroundColor: day.active ? Brand.greenTint : colors.background,
        },
      ]}>
      <Txt variant="caption" color={day.active ? Brand.green : colors.textMuted}>
        {day.date}
      </Txt>
      <Txt variant="label" color={day.active ? Brand.green : colors.text} style={{ marginTop: 2 }}>
        {day.label}
      </Txt>
      <Ionicons name="flash" size={16} color={boltColor} style={{ marginTop: 6 }} />
    </View>
  );
}

function StatCard({
  value,
  label,
  emoji,
  source,
}: {
  value: string;
  label: string;
  emoji: string;
  source?: ImageSourcePropType;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <Txt variant="heading">{value}</Txt>
      <Txt variant="caption" muted style={{ marginVertical: 4 }}>
        {label}
      </Txt>
      <Icon3D source={source} emoji={emoji} size={28} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.sm },
  dayStrip: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingVertical: Spacing.sm },
  dayPill: {
    width: 56,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  streak: { justifyContent: 'center', paddingVertical: Spacing.md },
  ringWrap: { alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  ringValue: { fontSize: 40, fontWeight: '800', marginTop: 2 },
  statRow: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
  },
});
