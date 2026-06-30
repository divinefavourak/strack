import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/strack/avatar';
import { Confetti } from '@/components/strack/confetti';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { SegmentedControl } from '@/components/strack/segmented-control';
import { useFloat } from '@/components/strack/use-float';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { MEDALS, RIBBONS } from '@/data/assets';
import { useLeaderboard } from '@/hooks/api';
import { type LeaderboardEntry, type LeaderboardScope } from '@/lib/api/types';

const RANGES = ['Today', 'This week', 'This month'] as const;
const SCOPE: Record<(typeof RANGES)[number], LeaderboardScope> = {
  Today: 'today',
  'This week': 'week',
  'This month': 'month',
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Leaderboard() {
  const { colors } = useTheme();
  const [range, setRange] = useState<(typeof RANGES)[number]>('Today');
  const { data, isLoading } = useLeaderboard(SCOPE[range]);

  const silver = useFloat({ delay: 0, distance: 5 });
  const gold = useFloat({ delay: 200, distance: 8 });
  const bronze = useFloat({ delay: 400, distance: 5 });

  const isChampion = data?.my_rank === 1;

  return (
    <Screen edges={['top']}>
      {isChampion && <Confetti />}

      <Txt variant="title" style={styles.title}>
        My Leaderboard
      </Txt>

      <View style={styles.segment}>
        <SegmentedControl options={RANGES} value={range} onChange={setRange} />
      </View>

      {/* Podium */}
      <Row style={styles.podium}>
        <AnimatedImage source={MEDALS[2]} style={[styles.medalSilver, silver]} contentFit="contain" />
        <AnimatedImage source={MEDALS[1]} style={[styles.medalGold, gold]} contentFit="contain" />
        <AnimatedImage source={MEDALS[3]} style={[styles.medalBronze, bronze]} contentFit="contain" />
      </Row>

      {data?.my_rank != null && (
        <Txt variant="label" color={colors.tint} style={styles.callout}>
          You are #{data.my_rank} in {range.toLowerCase()}’s leaderboard.
        </Txt>
      )}

      {isLoading ? (
        <ActivityIndicator color={Brand.green} style={{ marginTop: Spacing.xl }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
          {(data?.entries ?? []).map((item, i) => (
            <LeaderRow key={item.user_id} item={item} index={i} />
          ))}
          {data?.entries.length === 0 && (
            <Txt variant="body" muted style={styles.empty}>
              No rankings yet. Get moving to climb the board!
            </Txt>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function LeaderRow({ item, index }: { item: LeaderboardEntry; index: number }) {
  const { colors, isDark } = useTheme();
  const selfBg = isDark ? 'rgba(76,175,80,0.16)' : Brand.greenTint;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 55).springify().damping(16)}
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        item.is_self && { backgroundColor: selfBg, borderBottomColor: 'transparent' },
      ]}>
      <View style={styles.rank}>
        {RIBBONS[item.rank] ? (
          <Image source={RIBBONS[item.rank]} style={styles.ribbon} contentFit="contain" />
        ) : (
          <Txt variant="heading" muted>
            {item.rank}
          </Txt>
        )}
      </View>
      <Avatar
        name={item.display_name}
        size={40}
        image={item.avatar_url ? { uri: item.avatar_url } : undefined}
      />
      <Txt variant="heading" style={styles.name} color={colors.text}>
        {item.display_name}
      </Txt>
      <Txt variant="body" muted>
        {item.steps.toLocaleString()} steps
      </Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: Spacing.md },
  segment: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  podium: { justifyContent: 'center', alignItems: 'flex-end', gap: Spacing.lg, height: 140 },
  medalGold: { width: 110, height: 110 },
  medalSilver: { width: 78, height: 78, marginBottom: 6 },
  medalBronze: { width: 64, height: 64, marginBottom: 10 },
  ribbon: { width: 30, height: 30 },
  callout: { textAlign: 'center', marginVertical: Spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderRadius: 12,
  },
  rank: { width: 28, alignItems: 'center' },
  name: { flex: 1 },
  empty: { textAlign: 'center', marginTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
});
