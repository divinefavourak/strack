import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';

import { CenterModal, Radio } from '@/components/strack/center-modal';
import { Txt } from '@/components/strack/themed';
import { Brand, Spacing } from '@/constants/theme';
import { useUpdateSettings } from '@/hooks/api';
import { useVoice } from '@/lib/voice/voice-context';

/**
 * Language chooser shown when the voice assistant is turned on (and reopenable
 * from the "Voice language" setting). Persists the pick to settings.language,
 * which the briefing and command endpoints then speak in.
 */
export function VoiceLanguageModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { languages, languagesLoading, language } = useVoice();
  const updateSettings = useUpdateSettings();

  function select(code: string) {
    if (code !== language) updateSettings.mutate({ language: code });
    onClose();
  }

  return (
    <CenterModal visible={visible} onClose={onClose}>
      <Txt variant="heading" style={styles.title}>
        Choose your voice language
      </Txt>
      <Txt variant="caption" muted style={styles.subtitle}>
        Your briefing and spoken replies will use this language.
      </Txt>

      {languagesLoading && !languages.length ? (
        <ActivityIndicator color={Brand.green} style={{ marginVertical: Spacing.xl }} />
      ) : !languages.length ? (
        <Txt variant="body" muted style={{ marginVertical: Spacing.lg, textAlign: 'center' }}>
          Couldn’t load languages. Check your connection and try again.
        </Txt>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {languages.map((l) => (
            <Pressable key={l.code} onPress={() => select(l.code)} style={styles.row}>
              <Radio selected={l.code === language} />
              <Txt variant="body">{l.label}</Txt>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </CenterModal>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 4, marginBottom: Spacing.md },
  list: { maxHeight: 320 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
});
