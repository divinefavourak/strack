import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/strack/avatar';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { SegmentedControl } from '@/components/strack/segmented-control';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { MEDALS, RIBBONS } from '@/data/assets';
import { LEADERBOARD, type Leader } from '@/data/mock';

const RANGES = ['Today', 'This week', 'This month'] as const;

export default function Leaderboard() {
  const { colors } = useTheme();
  const [range, setRange] = useState<(typeof RANGES)[number]>('Today');

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

      <Txt variant="label" color={Brand.green} style={styles.callout}>
        You are #1 in {range.toLowerCase()}’s leaderboard.
      </Txt>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {LEADERBOARD.map((item) => (
          <LeaderRow key={item.rank} item={item} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function LeaderRow({ item }: { item: Leader }) {
  const { colors } = useTheme();
  return (
    <Row style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rank}>
        {RIBBONS[item.rank] ? (
          <Image source={RIBBONS[item.rank]} style={styles.ribbon} contentFit="contain" />
        ) : (
          <Txt variant="heading" muted>
            {item.rank}
          </Txt>
        )}
      </View>
      <Avatar name={item.name} size={40} />
      <Txt variant="heading" style={styles.name}>
        {item.name}
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
  podium: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: Spacing.lg,
    height: 130,
  },
  medalGold: { width: 110, height: 110 },
  medalSilver: { width: 78, height: 78, marginBottom: 6 },
  medalBronze: { width: 64, height: 64, marginBottom: 10 },
  ribbon: { width: 30, height: 30 },
  callout: { textAlign: 'center', marginVertical: Spacing.lg },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
  },
  rank: { width: 28, alignItems: 'center' },
  name: { flex: 1 },
});
