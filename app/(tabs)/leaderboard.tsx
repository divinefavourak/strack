import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/strack/avatar';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { SegmentedControl } from '@/components/strack/segmented-control';
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

export default function Leaderboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>('Today');
  const { data, isLoading } = useLeaderboard(SCOPE[range]);

  return (
    <Screen edges={['top']}>
      <Txt variant="title" style={styles.title}>
        My Leaderboard
      </Txt>

      <View style={styles.segment}>
        <SegmentedControl options={RANGES} value={range} onChange={setRange} />
      </View>

      {/* Podium */}
      <Row style={styles.podium}>
        <Image source={MEDALS[2]} style={styles.medalSilver} contentFit="contain" />
        <Image source={MEDALS[1]} style={styles.medalGold} contentFit="contain" />
        <Image source={MEDALS[3]} style={styles.medalBronze} contentFit="contain" />
      </Row>

      {data?.my_rank != null && (
        <Txt variant="label" color={Brand.green} style={styles.callout}>
          You are #{data.my_rank} in {range.toLowerCase()}’s leaderboard.
        </Txt>
      )}

      {isLoading ? (
        <ActivityIndicator color={Brand.green} style={{ marginTop: Spacing.xl }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
          {(data?.entries ?? []).map((item) => (
            <LeaderRow key={item.user_id} item={item} />
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

function LeaderRow({ item }: { item: LeaderboardEntry }) {
  const { colors } = useTheme();
  return (
    <Row style={[styles.row, { borderBottomColor: colors.border }, item.is_self && { backgroundColor: Brand.greenTint }]}>
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
      <Txt variant="heading" style={styles.name}>
        {item.display_name}
      </Txt>
      <Txt variant="body" muted>
        {item.steps.toLocaleString()} steps
      </Txt>
    </Row>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: Spacing.md },
  segment: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  podium: { justifyContent: 'center', alignItems: 'flex-end', gap: Spacing.lg, height: 130 },
  medalGold: { width: 110, height: 110 },
  medalSilver: { width: 78, height: 78, marginBottom: 6 },
  medalBronze: { width: 64, height: 64, marginBottom: 10 },
  ribbon: { width: 30, height: 30 },
  callout: { textAlign: 'center', marginVertical: Spacing.lg },
  row: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderRadius: 12 },
  rank: { width: 28, alignItems: 'center' },
  name: { flex: 1 },
  empty: { textAlign: 'center', marginTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
});
