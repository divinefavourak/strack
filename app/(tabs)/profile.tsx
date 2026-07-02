import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { CenterModal, Radio } from '@/components/strack/center-modal';
import { VoiceLanguageModal } from '@/components/strack/voice-language-modal';
import { GoogleIcon } from '@/components/strack/google-icon';
import { Icon3D } from '@/components/strack/icon3d';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { Brand, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ICON_3D } from '@/data/assets';
import { useProfile, useSettings, useUpdateSettings, useUserStats } from '@/hooks/api';
import { type FontSize } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useGoogleAuth } from '@/lib/auth/google';
import { useFontScale } from '@/lib/prefs/font-scale';
import { useStepSource } from '@/lib/steps/source';
import { useVoice } from '@/lib/voice/voice-context';

type ModalKind = 'font' | 'theme' | 'logout' | 'voiceLang' | null;
const FONT_OPTIONS: { value: FontSize; label: string; size: number }[] = [
  { value: 'large', label: 'Large', size: 22 },
  { value: 'medium', label: 'Medium', size: 17 },
  { value: 'small', label: 'Small', size: 14 },
];

export default function Profile() {
  const { colors, isDark, setScheme } = useTheme();
  const { user, signOut } = useAuth();
  const { data: stats } = useUserStats();
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { source, setSource } = useStepSource();
  const { size: fontSize, setSize: setFontSize } = useFontScale();
  const google = useGoogleAuth();
  const voice = useVoice();
  const [modal, setModal] = useState<ModalKind>(null);

  const voiceOn = settings?.voice_assistant_enabled ?? false;
  const langLabel =
    voice.languages.find((l) => l.code === voice.language)?.label ?? voice.language.toUpperCase();

  // Turning the assistant on prompts for a language — but only once the setting
  // has persisted, so useVoice() sees it enabled and the languages query fires
  // (otherwise the modal opens to an empty/disabled-query state).
  function toggleVoice(on: boolean) {
    updateSettings.mutate(
      { voice_assistant_enabled: on },
      { onSuccess: () => on && setModal('voiceLang') },
    );
  }

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

  function selectFont(value: FontSize) {
    setFontSize(value); // instant local effect
    updateSettings.mutate({ font_size: value });
    setModal(null);
  }
  function selectTheme(next: 'light' | 'dark') {
    setScheme(next);
    updateSettings.mutate({ theme: next });
    setModal(null);
  }
  async function logout() {
    setModal(null);
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
            <View style={styles.syncG}>
              <GoogleIcon size={16} />
            </View>
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

        <SettingRow icon="format-size" label="Font size" onPress={() => setModal('font')}>
          <ValuePill text={cap(fontSize)} />
        </SettingRow>
        <SettingRow icon="theme-light-dark" label="Theme" onPress={() => setModal('theme')}>
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
            value={voiceOn}
            onValueChange={toggleVoice}
            trackColor={{ true: Brand.green, false: '#D6D6D6' }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>
        {voiceOn && (
          <SettingRow icon="translate" label="Voice language" onPress={() => setModal('voiceLang')}>
            <ValuePill text={langLabel} />
          </SettingRow>
        )}
        <SettingRow icon="account-group-outline" label="Find friends" onPress={() => router.push('/find-friends')}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </SettingRow>
        <SettingRow icon="logout" label="Logout" onPress={() => setModal('logout')}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </SettingRow>
      </ScrollView>

      {/* Font size picker */}
      <CenterModal visible={modal === 'font'} onClose={() => setModal(null)}>
        <Txt variant="heading" style={styles.modalTitle}>
          Select preferred font size:
        </Txt>
        <View style={[styles.optionsBox, { borderColor: colors.border }]}>
          {FONT_OPTIONS.map((o) => (
            <Pressable key={o.value} onPress={() => selectFont(o.value)} style={styles.optionRow}>
              <Radio selected={fontSize === o.value} />
              <Txt style={{ fontSize: o.size, fontWeight: '600' }}>{o.label}</Txt>
            </Pressable>
          ))}
        </View>
      </CenterModal>

      {/* Theme picker */}
      <CenterModal visible={modal === 'theme'} onClose={() => setModal(null)}>
        <Txt variant="heading" style={styles.modalTitle}>
          Select preferred theme:
        </Txt>
        <Pressable onPress={() => selectTheme('light')} style={styles.optionRow}>
          <Radio selected={!isDark} />
          <Txt variant="body" style={styles.flex}>
            Light Mode
          </Txt>
          <Ionicons name="sunny" size={20} color="#FDB813" />
        </Pressable>
        <Pressable onPress={() => selectTheme('dark')} style={styles.optionRow}>
          <Radio selected={isDark} />
          <Txt variant="body" style={styles.flex}>
            Dark Mode
          </Txt>
          <Ionicons name="moon" size={20} color={colors.text} />
        </Pressable>
      </CenterModal>

      {/* Voice language picker */}
      <VoiceLanguageModal visible={modal === 'voiceLang'} onClose={() => setModal(null)} />

      {/* Logout confirmation */}
      <CenterModal visible={modal === 'logout'} onClose={() => setModal(null)}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="warning" size={52} color={Brand.green} />
          <Txt variant="title" style={styles.logoutTitle}>
            Are you sure you want to log out?
          </Txt>
        </View>
        <Pressable onPress={logout} style={[styles.logoutBtn, { backgroundColor: Brand.greenTint }]}>
          <Txt variant="heading" color={Brand.greenDark}>
            Log Out
          </Txt>
        </Pressable>
        <Pressable onPress={() => setModal(null)} style={[styles.cancelBtn, { borderColor: Brand.green }]}>
          <Txt variant="heading" color={Brand.green}>
            Cancel
          </Txt>
        </Pressable>
      </CenterModal>
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
  syncG: { backgroundColor: '#FFFFFF', padding: 3, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  statCard: { width: '47.5%', flexGrow: 1, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.soft },
  sectionLabel: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  modeToggle: { gap: 6 },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill },
  modalTitle: { textAlign: 'center', marginBottom: Spacing.lg },
  optionsBox: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  logoutTitle: { textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl },
  logoutBtn: { height: 52, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { height: 52, borderRadius: Radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
});
