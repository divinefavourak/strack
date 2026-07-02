import Ionicons from '@expo/vector-icons/Ionicons';
import {
  AudioModule,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Row, Txt } from '@/components/strack/themed';
import { Brand, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { RECORDING_OPTIONS } from '@/lib/voice/audio';
import { useVoice } from '@/lib/voice/voice-context';

/**
 * Press-and-hold mic. Holding records a spoken command; releasing uploads it to
 * /voice/listen, which transcribes, acts, and returns spoken feedback. Only
 * rendered when the voice assistant is enabled.
 */
export function VoiceMic() {
  const { colors } = useTheme();
  const voice = useVoice();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder);
  const hasPermission = useRef<boolean | null>(null);
  const startedAt = useRef(0);

  const recording = recorderState.isRecording;
  const working = voice.phase === 'processing' || voice.phase === 'speaking';

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = recording
      ? withRepeat(withTiming(1.18, { duration: 550 }), -1, true)
      : withTiming(1, { duration: 200 });
  }, [recording, pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const ensurePermission = useCallback(async () => {
    if (hasPermission.current) return true;
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      hasPermission.current = granted;
      if (!granted) {
        Alert.alert('Microphone needed', 'Enable microphone access to use voice commands.');
      }
      return granted;
    } catch {
      Alert.alert('Voice', 'Voice recording needs a development build. Please install a dev build / APK.');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (working || recording) return;
    if (!(await ensurePermission())) return;
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
    } catch {
      Alert.alert('Voice', "Couldn't start recording. Please try again.");
    }
  }, [ensurePermission, recorder, recording, working]);

  const stopRecording = useCallback(async () => {
    if (!recorder.isRecording) return;
    try {
      await recorder.stop();
    } catch {
      return;
    }
    const uri = recorder.uri;
    // Ignore accidental taps that capture almost nothing.
    if (!uri || Date.now() - startedAt.current < 500) return;
    const res = await voice.sendCommand(uri);
    if (!res) Alert.alert('Voice', "Sorry, I couldn't process that. Please try again.");
  }, [recorder, voice]);

  if (!voice.enabled) return null;

  const hint = recording ? 'Listening… release to send' : working ? 'Working…' : 'Hold to speak';

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {voice.lastResult ? (
        <Pressable style={[styles.bubble, { backgroundColor: colors.card }]} onPress={voice.clearResult}>
          {!!voice.lastResult.transcript && (
            <Txt variant="caption" muted numberOfLines={2}>
              “{voice.lastResult.transcript}”
            </Txt>
          )}
          <Txt variant="body" style={{ marginTop: 2 }} numberOfLines={4}>
            {voice.lastResult.response_text}
          </Txt>
        </Pressable>
      ) : null}

      <Row style={styles.dock}>
        <View style={[styles.hintPill, { backgroundColor: colors.card }]}>
          <Txt variant="caption" color={recording ? Brand.green : colors.textMuted}>
            {hint}
          </Txt>
        </View>
        <Pressable
          onPress={voice.playBriefing}
          disabled={voice.busy}
          hitSlop={10}
          style={[styles.replay, { backgroundColor: colors.card }]}>
          <Ionicons
            name={voice.phase === 'briefing' ? 'volume-high' : 'volume-high-outline'}
            size={22}
            color={voice.phase === 'briefing' ? Brand.green : colors.text}
          />
        </Pressable>
        <Pressable
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={working}
          hitSlop={12}>
          <Animated.View
            style={[
              styles.fab,
              pulseStyle,
              { backgroundColor: recording ? colors.danger : Brand.green },
            ]}>
            {working ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="mic" size={30} color="#FFFFFF" />
            )}
          </Animated.View>
        </Pressable>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: Spacing.lg, bottom: Spacing.xl, alignItems: 'flex-end', gap: Spacing.md },
  bubble: { maxWidth: 260, padding: Spacing.md, borderRadius: Radius.lg, ...Shadow.soft },
  dock: { alignItems: 'center', gap: Spacing.sm },
  hintPill: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill, ...Shadow.soft },
  replay: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...Shadow.soft },
  fab: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', ...Shadow.soft },
});
