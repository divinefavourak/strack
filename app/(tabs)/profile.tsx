import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Icon3D } from '@/components/strack/icon3d';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ICON_3D } from '@/data/assets';
import { useProfile, useSettings, useUpdateSettings, useUserStats } from '@/hooks/api';
import { type FontSize } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useGoogleAuth } from '@/lib/auth/google';
import { useStepSource } from '@/lib/steps/source';

const FONT_ORDER: FontSize[] = ['small', 'medium', 'large'];

export default function Profile() {
  const { colors, isDark, setScheme } = useTheme();
  const { user, signOut } = useAuth();
  const { data: stats } = useUserStats();
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { source, setSource } = useStepSource();
  const google = useGoogleAuth();

  // Seed the app theme from the user's saved server preference.
  useEffect(() => {
    if (settings?.theme) setScheme(settings.theme);
  }, [settings?.theme]);

  const me = profile ?? user;
  const name = me?.preferred_name || me?.username || me?.email?.split('@')[0] || 'You';
  const memberSince = me?.created_at
    ? new Date(me.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';

  const statCards = [
    { icon: 'shoe', emoji: '👟', value: (stats?.total_steps ?? 0).toLocaleString(), label: 'Total Steps' },
    { icon: 'bestDayMedal', emoji: '🏅', value: (stats?.best_day_steps ?? 0).toLocaleString(), label: 'Steps on Best day' },
    { icon: 'fire', emoji: '🔥', value: `${stats?.longest_streak ?? 0} days`, label: 'Longest Streak' },
    { icon: 'handshake', emoji: '🤝', value: `${stats?.friend_count ?? 0}`, label: 'Friends' },
  ];

  function cycleFont() {
    const cur = settings?.font_size ?? 'medium';
    const next = FONT_ORDER[(FONT_ORDER.indexOf(cur) + 1) % FONT_ORDER.length];
    updateSettings.mutate({ font_size: next });
  }
  function toggleTheme() {
    const next = isDark ? 'light' : 'dark';
    setScheme(next);
    updateSettings.mutate({ theme: next });
  }
  async function logout() {
    await signOut();
    router.replace('/');
  }

  return (
    <Screen edges={['top']}>
      <Txt variant="title" style={styles.title}>
        Profile
      </Txt>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Avatar band */}
        <View style={[styles.band, { backgroundColor: isDark ? colors.card : '#DCE8DC' }]}>
          {me?.avatar_url ? (
            <Image source={{ uri: me.avatar_url }} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <View style={styles.avatar}>
              <Txt style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Txt>
            </View>
          )}
          <Txt variant="label" muted style={{ marginTop: Spacing.sm }}>
            Edit
          </Txt>
        </View>

        {/* Name + sync */}
        <Row style={styles.nameRow}>
          <View style={styles.flex}>
            <Txt variant="heading">{name}</Txt>
            <Txt variant="caption" muted style={{ marginTop: 2 }}>
              Member since {memberSince}.
            </Txt>
          </View>
          <Pressable style={styles.sync} onPress={google.signIn}>
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
          {statCards.map((s) => (
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

        <SettingRow icon="format-size" label="Font size" onPress={cycleFont}>
          <ValuePill text={cap(settings?.font_size ?? 'medium')} />
        </SettingRow>
        <SettingRow icon="theme-light-dark" label="Theme" onPress={toggleTheme}>
          <ValuePill text={isDark ? 'Dark Mode' : 'Light Mode'} />
        </SettingRow>
        <SettingRow icon="run" label="Step tracking">
          <Row style={styles.modeToggle}>
            <ModeChip label="Auto" active={source === 'automatic'} onPress={() => setSource('automatic')} />
            <ModeChip label="Manual" active={source === 'manual'} onPress={() => setSource('manual')} />
          </Row>
        </SettingRow>
        <SettingRow icon="bell-outline" label="Notifications">
          <Switch
            value={settings?.notifications_enabled ?? true}
            onValueChange={(v) => updateSettings.mutate({ notifications_enabled: v })}
            trackColor={{ true: Brand.green, false: '#D6D6D6' }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>
        <SettingRow icon="volume-high" label="Voice Assistant">
          <Switch
            value={settings?.voice_assistant_enabled ?? false}
            onValueChange={(v) => updateSettings.mutate({ voice_assistant_enabled: v })}
            trackColor={{ true: Brand.green, false: '#D6D6D6' }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>
        <SettingRow icon="account-group-outline" label="Find friends" onPress={() => router.push('/find-friends')}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </SettingRow>
        <SettingRow icon="logout" label="Logout" onPress={logout}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </SettingRow>
      </ScrollView>
    </Screen>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function ModeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? Brand.green : colors.card }]}>
      <Txt variant="caption" color={active ? '#FFFFFF' : colors.textMuted}>
        {label}
      </Txt>
    </Pressable>
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
    <Pressable onPress={onPress} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
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
  band: { alignItems: 'center', paddingVertical: Spacing.xl, marginHorizontal: Spacing.lg, borderRadius: Radius.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Brand.greenBright, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { color: '#FFFFFF', fontSize: 40, fontWeight: '700' },
  nameRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, gap: Spacing.md },
  sync: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Brand.green, paddingHorizontal: Spacing.lg, height: 40, borderRadius: Radius.md },
  syncG: { backgroundColor: '#FFFFFF22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  statCard: { width: '47.5%', flexGrow: 1, borderRadius: Radius.lg, padding: Spacing.lg },
  sectionLabel: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  modeToggle: { gap: 6 },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill },
});
