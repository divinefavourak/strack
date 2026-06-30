import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Icon3D } from '@/components/strack/icon3d';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ICON_3D } from '@/data/assets';
import { PROFILE_STATS, USER } from '@/data/mock';

export default function Profile() {
  const { colors, isDark, toggleScheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(false);

  return (
    <Screen edges={['top']}>
      <Txt variant="title" style={styles.title}>
        Profile
      </Txt>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Avatar band */}
        <View style={[styles.band, { backgroundColor: isDark ? colors.card : '#DCE8DC' }]}>
          <View style={styles.avatar}>
            <Txt style={styles.avatarText}>{USER.name.charAt(0)}</Txt>
          </View>
          <Txt variant="label" muted style={{ marginTop: Spacing.sm }}>
            Edit
          </Txt>
        </View>

        {/* Name + sync */}
        <Row style={styles.nameRow}>
          <View style={styles.flex}>
            <Txt variant="heading">{USER.name}</Txt>
            <Txt variant="caption" muted style={{ marginTop: 2 }}>
              Member since {USER.memberSince}.
            </Txt>
          </View>
          <Pressable style={styles.sync}>
            <Txt variant="label" color="#FFFFFF">
              Sync
            </Txt>
            <Txt variant="label" color="#FFFFFF" style={styles.syncG}>
              G
            </Txt>
          </Pressable>
        </Row>

        {/* Stat grid */}
        <View style={styles.grid}>
          {PROFILE_STATS.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Icon3D source={ICON_3D[s.icon]} emoji={s.emoji} size={38} />
              <Txt variant="title" style={{ marginTop: Spacing.sm }}>
                {s.value}
              </Txt>
              <Txt variant="caption" muted style={{ marginTop: 2 }}>
                {s.label}
              </Txt>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Txt variant="label" muted style={styles.sectionLabel}>
          Settings
        </Txt>

        <SettingRow icon="format-size" label="Font size">
          <ValuePill text="Medium" />
        </SettingRow>
        <SettingRow icon="theme-light-dark" label="Theme">
          <Pressable onPress={toggleScheme}>
            <ValuePill text={isDark ? 'Dark Mode' : 'Light Mode'} />
          </Pressable>
        </SettingRow>
        <SettingRow icon="bell-outline" label="Notifications">
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: Brand.green, false: '#D6D6D6' }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>
        <SettingRow icon="volume-high" label="Voice Assistant">
          <Switch
            value={voice}
            onValueChange={setVoice}
            trackColor={{ true: Brand.green, false: '#D6D6D6' }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>
        <SettingRow
          icon="account-group-outline"
          label="Find friends"
          onPress={() => router.push('/find-friends')}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </SettingRow>
        <SettingRow
          icon="logout"
          label="Logout"
          onPress={() => router.replace('/')}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </SettingRow>
      </ScrollView>
    </Screen>
  );
}

function ValuePill({ text }: { text: string }) {
  return (
    <Row style={{ gap: 4 }}>
      <Txt variant="label" color={Brand.green}>
        {text}
      </Txt>
      <Ionicons name="chevron-down" size={14} color={Brand.green} />
    </Row>
  );
}

function SettingRow({
  icon,
  label,
  children,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  children?: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <MaterialCommunityIcons name={icon} size={22} color={Brand.green} />
      <Txt variant="body" style={styles.flex}>
        {label}
      </Txt>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { textAlign: 'center', paddingVertical: Spacing.md },
  band: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Brand.greenBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 40, fontWeight: '700' },
  nameRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  sync: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.green,
    paddingHorizontal: Spacing.lg,
    height: 40,
    borderRadius: Radius.md,
  },
  syncG: {
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  sectionLabel: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
