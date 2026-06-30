import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from '@/components/strack/avatar';
import { Button } from '@/components/strack/button';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { AVATARS } from '@/data/assets';
import { PENDING_REQUESTS, SUGGESTED_FRIENDS } from '@/data/mock';

export default function FindFriends() {
  const { colors } = useTheme();

  return (
    <Screen edges={['top', 'bottom']}>
      {/* Header */}
      <Row style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={colors.text} onPress={() => router.back()} />
        <Txt variant="heading" style={styles.headerTitle}>
          Find Friends
        </Txt>
        <View style={{ width: 24 }} />
      </Row>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Search */}
        <Row style={[styles.search, { borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search by username or email"
            placeholderTextColor={colors.textFaint}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </Row>

        {/* Pending requests */}
        <Txt variant="label" muted style={styles.section}>
          Pending Requests
        </Txt>
        {PENDING_REQUESTS.map((name) => (
          <Row key={name} style={styles.friendRow}>
            <Avatar name={name} size={40} image={AVATARS[name]} />
            <Txt variant="body" style={styles.flex}>
              {name}
            </Txt>
            <View style={[styles.iconBtn, { backgroundColor: colors.dangerSurface }]}>
              <Ionicons name="close" size={18} color={colors.danger} />
            </View>
            <View style={[styles.iconBtn, { backgroundColor: Brand.greenTint }]}>
              <Ionicons name="checkmark" size={18} color={Brand.green} />
            </View>
          </Row>
        ))}

        {/* Suggested */}
        <Txt variant="label" muted style={styles.section}>
          Suggested Friends
        </Txt>
        {SUGGESTED_FRIENDS.map((name) => (
          <Row key={name} style={styles.friendRow}>
            <Avatar name={name} size={40} image={AVATARS[name]} />
            <Txt variant="body" style={styles.flex}>
              {name}
            </Txt>
            <View style={[styles.addPill, { backgroundColor: Brand.greenTint }]}>
              <Txt variant="label" color={Brand.green}>
                Add
              </Txt>
            </View>
          </Row>
        ))}

        {/* Invite illustration */}
        <Image
          source={require('@/assets/images/find-friends.png')}
          style={styles.illustration}
          contentFit="contain"
        />
        <Txt variant="body" muted style={styles.invitePrompt}>
          Can’t find your walking buddy?{'\n'}Invite them to Strack!
        </Txt>
        <Button label="Share Invite Link" style={styles.inviteBtn} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  search: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  friendRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPill: {
    paddingHorizontal: Spacing.lg,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: { width: '70%', height: 160, alignSelf: 'center', marginTop: Spacing.xl },
  invitePrompt: { textAlign: 'center', marginTop: Spacing.lg, lineHeight: 22 },
  inviteBtn: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg },
});
