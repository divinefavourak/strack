import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/strack/avatar';
import { Icon3D } from '@/components/strack/icon3d';
import { Button } from '@/components/strack/button';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { SegmentedControl } from '@/components/strack/segmented-control';
import { ICON_3D } from '@/data/assets';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useFeed, useReactFeed, useShareFeed } from '@/hooks/api';
import { type FeedKind, type FeedPostRead, type FeedType } from '@/lib/api/types';

const TABS = ['Community', 'Activity'] as const;
const QUICK_REACTIONS = ['❤️', '👏', '🎉'];

const ICON_FOR: Record<FeedType, { key: string; emoji: string }> = {
  community_share: { key: 'thumbsUp', emoji: '🙌' },
  activity_summary: { key: 'smiley', emoji: '😊' },
  milestone: { key: 'trophy', emoji: '🏆' },
};

function pick(payload: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
}

export default function Feed() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Community');
  const [shareOpen, setShareOpen] = useState(false);
  const kind: FeedKind = tab === 'Community' ? 'community' : 'activity';
  const { data, isLoading } = useFeed(kind);

  return (
    <Screen edges={['top']}>
      <Row style={styles.titleRow}>
        <Txt variant="title" style={styles.title}>
          Feed
        </Txt>
        {tab === 'Community' && (
          <Txt variant="label" color="#1B5E20" onPress={() => setShareOpen(true)} style={styles.share}>
            Share
          </Txt>
        )}
      </Row>

      <View style={styles.segment}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#1B5E20" style={{ marginTop: Spacing.xl }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {(data ?? []).map((post, i) => (
            <Animated.View key={post.id} entering={FadeInDown.delay(i * 60).springify().damping(16)}>
              {tab === 'Community' ? <CommunityCard post={post} /> : <ActivityCard post={post} />}
            </Animated.View>
          ))}
          {data?.length === 0 && (
            <Txt variant="body" muted style={styles.empty}>
              {tab === 'Community' ? 'No community posts yet.' : 'No activity yet — take a walk!'}
            </Txt>
          )}
        </ScrollView>
      )}

      <ShareModal visible={shareOpen} onClose={() => setShareOpen(false)} />
    </Screen>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? colors.card : colors.background, borderColor: colors.border, shadowOpacity: isDark ? 0 : 0.06 },
      ]}>
      {children}
    </View>
  );
}

function CommunityCard({ post }: { post: FeedPostRead }) {
  const react = useReactFeed('community');
  const icon = ICON_FOR[post.type];
  const message = pick(post.payload, 'message', 'text', 'body') ?? 'shared an update';
  const reactionEntries = Object.entries(post.reactions ?? {});

  return (
    <Card>
      <Row style={styles.cardTop}>
        <Avatar name={post.display_name} size={40} image={post.avatar_url ? { uri: post.avatar_url } : undefined} />
        <View style={styles.flex}>
          <Txt variant="heading">{post.display_name}</Txt>
          <Txt variant="caption" muted style={{ marginTop: 2 }}>
            {timeLabel(post.created_at)}
          </Txt>
        </View>
        <Icon3D source={ICON_3D[icon.key]} emoji={icon.emoji} size={60} />
      </Row>
      <Txt variant="body" style={styles.message}>
        {message}
      </Txt>
      <Row style={styles.reactions}>
        {QUICK_REACTIONS.map((emoji) => {
          const count = post.reactions?.[emoji];
          return (
            <Pressable
              key={emoji}
              onPress={() => react.mutate({ postId: post.id, emoji })}
              style={styles.reactionChip}>
              <Txt style={styles.reaction}>{emoji}</Txt>
              {count ? <Txt variant="caption" muted>{count}</Txt> : null}
            </Pressable>
          );
        })}
        {reactionEntries
          .filter(([e]) => !QUICK_REACTIONS.includes(e))
          .map(([emoji, count]) => (
            <Row key={emoji} style={styles.reactionChip}>
              <Txt style={styles.reaction}>{emoji}</Txt>
              <Txt variant="caption" muted>{count}</Txt>
            </Row>
          ))}
      </Row>
    </Card>
  );
}

function ActivityCard({ post }: { post: FeedPostRead }) {
  const icon = ICON_FOR[post.type];
  const title = pick(post.payload, 'title', 'headline') ?? (post.type === 'milestone' ? 'Milestone unlocked' : 'Activity summary');
  const body = pick(post.payload, 'body', 'message', 'summary', 'description') ?? '';
  const label = pick(post.payload, 'period', 'label') ?? timeLabel(post.created_at);

  return (
    <Card>
      <Row style={styles.cardTop}>
        <View style={styles.flex}>
          <Txt variant="caption" muted>
            {label}
          </Txt>
          <Txt variant="heading" style={{ marginTop: 4 }}>
            {title}
          </Txt>
        </View>
        <Icon3D source={ICON_3D[icon.key]} emoji={icon.emoji} size={48} />
      </Row>
      {!!body && (
        <Txt variant="body" muted style={[styles.message, { lineHeight: 21 }]}>
          {body}
        </Txt>
      )}
    </Card>
  );
}

function ShareModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const share = useShareFeed();
  const [text, setText] = useState('');

  function submit() {
    share.mutate(text.trim(), {
      onSuccess: () => {
        setText('');
        onClose();
      },
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          <Txt variant="heading" style={{ marginBottom: Spacing.md }}>
            Share to community
          </Txt>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textFaint}
            multiline
            maxLength={280}
            style={[styles.shareInput, { borderColor: colors.border, color: colors.text }]}
          />
          <Button label="Post" onPress={submit} loading={share.isPending} style={{ marginTop: Spacing.lg }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'center' },
  title: { textAlign: 'center' },
  share: { position: 'absolute', right: Spacing.lg },
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
  reactions: { marginTop: Spacing.md, gap: Spacing.md },
  reactionChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reaction: { fontSize: 18 },
  empty: { textAlign: 'center', marginTop: Spacing.xxl, paddingHorizontal: Spacing.xl },
  backdrop: { flex: 1, backgroundColor: '#0006', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  shareInput: { minHeight: 90, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.lg, fontSize: 15, textAlignVertical: 'top' },
});
