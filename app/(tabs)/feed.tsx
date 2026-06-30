import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/strack/avatar';
import { Icon3D } from '@/components/strack/icon3d';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { SegmentedControl } from '@/components/strack/segmented-control';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ICON_3D } from '@/data/assets';
import {
  ACTIVITY,
  COMMUNITY,
  type ActivityItem,
  type CommunityPost,
} from '@/data/mock';

const TABS = ['Community', 'Activity'] as const;

export default function Feed() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Community');

  return (
    <Screen edges={['top']}>
      <Txt variant="title" style={styles.title}>
        Feed
      </Txt>
      <View style={styles.segment}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {tab === 'Community'
          ? COMMUNITY.map((p) => <CommunityCard key={p.id} post={p} />)
          : ACTIVITY.map((a) => <ActivityCard key={a.id} item={a} />)}
      </ScrollView>
    </Screen>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.card : colors.background,
          borderColor: colors.border,
          shadowOpacity: isDark ? 0 : 0.06,
        },
      ]}>
      {children}
    </View>
  );
}

function CommunityCard({ post }: { post: CommunityPost }) {
  return (
    <Card>
      <Row style={styles.cardTop}>
        <Avatar name={post.name} size={40} />
        <View style={styles.flex}>
          <Txt variant="heading">{post.name}</Txt>
          <Txt variant="caption" muted style={{ marginTop: 2 }}>
            {post.time}
          </Txt>
        </View>
        <Icon3D source={post.icon ? ICON_3D[post.icon] : undefined} emoji={post.emoji} size={60} />
      </Row>
      <Txt variant="body" style={styles.message}>
        {post.message}
      </Txt>
      <Row style={styles.reactions}>
        {post.reactions.map((r, i) => (
          <Txt key={i} style={styles.reaction}>
            {r}
          </Txt>
        ))}
      </Row>
    </Card>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <Card>
      <Row style={styles.cardTop}>
        <View style={styles.flex}>
          <Txt variant="caption" muted>
            {item.label}
          </Txt>
          <Txt variant="heading" style={{ marginTop: 4 }}>
            {item.title}
          </Txt>
        </View>
        <Icon3D source={item.icon ? ICON_3D[item.icon] : undefined} emoji={item.emoji} size={48} />
      </Row>
      <Txt variant="body" muted style={[styles.message, { lineHeight: 21 }]}>
        {item.body}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { textAlign: 'center', paddingVertical: Spacing.md },
  segment: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardTop: { gap: Spacing.md, alignItems: 'flex-start' },
  message: { marginTop: Spacing.md },
  reactions: { marginTop: Spacing.md, gap: Spacing.sm },
  reaction: { fontSize: 18 },
});
