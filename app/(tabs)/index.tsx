import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { type ImageSourcePropType } from 'react-native';

import { Icon3D } from '@/components/strack/icon3d';
import { ProgressRing } from '@/components/strack/progress-ring';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { WalkMark } from '@/components/strack/walk-mark';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ICON_3D } from '@/data/assets';
import { useLogManualSteps, useStepHistory, useTodayStats } from '@/hooks/api';
import { type DailyStatRead } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useAutoStepTracking } from '@/lib/steps/pedometer';
import { useStepSource } from '@/lib/steps/source';
import { qk } from '@/lib/query';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function weekday(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' });
}
function dayMonth(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function Home() {
  const { colors, isDark, toggleScheme } = useTheme();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: today, isLoading } = useTodayStats();
  const { data: history } = useStepHistory('week');
  const { source } = useStepSource();
  const [manualOpen, setManualOpen] = useState(false);

  const onSynced = useCallback(() => {
    qc.invalidateQueries({ queryKey: qk.todayStats });
    qc.invalidateQueries({ queryKey: qk.stepHistory('week') });
  }, [qc]);

  useAutoStepTracking({ enabled: source === 'automatic', onSynced });

  const steps = today?.total_steps ?? 0;
  const goal = today?.goal_steps ?? 8000;
  const pct = today ? today.progress_percent / 100 : 0;

  return (
    <Screen edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Header */}
        <Row style={styles.header}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={colors.text}
            onPress={toggleScheme}
          />
          <View style={styles.headerCenter}>
            <Txt variant="heading">
              {greeting()}, {user?.preferred_name ?? 'there'} 👋
            </Txt>
            <Txt variant="caption" muted style={{ marginTop: 2 }}>
              Great job staying active!
            </Txt>
          </View>
          {source === 'manual' ? (
            <Ionicons name="add-circle" size={26} color={Brand.green} onPress={() => setManualOpen(true)} />
          ) : (
            <Ionicons name="volume-high-outline" size={22} color={colors.text} />
          )}
        </Row>

        {/* Day strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
          {(history ?? []).map((d) => (
            <DayPill key={d.date} day={d} />
          ))}
        </ScrollView>

        {/* Streak */}
        <Row style={styles.streak}>
          <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
          <Txt variant="label" style={{ marginHorizontal: Spacing.md }}>
            🔥 {today?.current_streak ?? 0} days streak
          </Txt>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Row>

        {/* Progress ring */}
        <View style={styles.ringWrap}>
          <ProgressRing size={228} strokeWidth={18} progress={pct} color={colors.tint} trackColor={colors.track}>
            <WalkMark size={30} color={colors.tint} />
            {isLoading ? (
              <ActivityIndicator color={colors.tint} style={{ marginVertical: Spacing.md }} />
            ) : (
              <Txt style={[styles.ringValue, { color: colors.text }]}>{steps.toLocaleString()}</Txt>
            )}
            <Txt variant="heading" color={colors.tint}>
              /{goal.toLocaleString()} Steps
            </Txt>
          </ProgressRing>
        </View>

        {/* Stat cards */}
        <Row style={styles.statRow}>
          <StatCard value={(today?.steps_remaining ?? goal).toLocaleString()} label="Steps to go" emoji="👟" source={ICON_3D.shoe} />
          <StatCard value={`${(today?.distance_km ?? 0).toFixed(1)} km`} label="distance" emoji="📍" />
          <StatCard value={`${today?.calories ?? 0}`} label="kcal" emoji="🔥" source={ICON_3D.fire} />
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

      <ManualStepModal visible={manualOpen} onClose={() => setManualOpen(false)} />
    </Screen>
  );
}

function ManualStepModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const log = useLogManualSteps();
  const presets = [500, 1000, 2000, 5000];

  function add(n: number) {
    log.mutate(n, { onSuccess: onClose });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          <Txt variant="heading" style={{ marginBottom: Spacing.lg }}>
            Log steps
          </Txt>
          <Row style={styles.presetRow}>
            {presets.map((p) => (
              <Pressable
                key={p}
                onPress={() => add(p)}
                disabled={log.isPending}
                style={[styles.preset, { backgroundColor: Brand.greenTint }]}>
                <Txt variant="heading" color={Brand.greenDark}>
                  +{p.toLocaleString()}
                </Txt>
              </Pressable>
            ))}
          </Row>
          {log.isPending && <ActivityIndicator color={Brand.green} style={{ marginTop: Spacing.md }} />}
          <Pressable onPress={onClose} style={{ marginTop: Spacing.lg, alignItems: 'center' }}>
            <Txt variant="label" muted>
              Cancel
            </Txt>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DayPill({ day }: { day: DailyStatRead }) {
  const { colors } = useTheme();
  const active = day.date === todayIso();
  const done = day.goal_completed_at != null;
  const boltColor = active || done ? Brand.green : colors.textFaint;
  return (
    <View
      style={[
        styles.dayPill,
        { borderColor: colors.border, backgroundColor: active ? Brand.greenTint : colors.background },
      ]}>
      <Txt variant="caption" color={active ? Brand.green : colors.textMuted}>
        {dayMonth(day.date)}
      </Txt>
      <Txt variant="label" color={active ? Brand.green : colors.text} style={{ marginTop: 2 }}>
        {weekday(day.date)}
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
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'space-between' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.sm },
  dayStrip: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingVertical: Spacing.sm },
  dayPill: { width: 56, paddingVertical: Spacing.md, borderRadius: Radius.pill, borderWidth: 1.5, alignItems: 'center' },
  streak: { justifyContent: 'center', paddingVertical: Spacing.md },
  ringWrap: { alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  ringValue: { fontSize: 40, fontWeight: '800', marginTop: 2 },
  statRow: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  statCard: { flex: 1, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
  },
  backdrop: { flex: 1, backgroundColor: '#0006', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  presetRow: { flexWrap: 'wrap', gap: Spacing.md },
  preset: { flexGrow: 1, minWidth: '45%', alignItems: 'center', paddingVertical: Spacing.lg, borderRadius: Radius.lg },
});
