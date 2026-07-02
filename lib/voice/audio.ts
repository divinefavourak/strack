import {
  AudioQuality,
  createAudioPlayer,
  IOSOutputFormat,
  setAudioModeAsync,
  type AudioPlayer,
  type RecordingOptions,
} from 'expo-audio';
import { Platform } from 'react-native';

import { type VoiceListenInput } from '@/lib/api/endpoints';
import { API_BASE_URL } from '@/lib/config';

/**
 * Recording format for voice commands.
 *
 * The backend's speech-to-text expects an encoding + sample rate (defaults
 * LINEAR16 @ 16 kHz — the Google Cloud Speech convention). iOS can capture true
 * uncompressed LINEAR16 WAV, but Android's MediaRecorder cannot emit raw PCM, so
 * there we record AMR-WB (also a native STT encoding at 16 kHz mono). Each
 * platform therefore reports the encoding it actually produced.
 *
 * If the backend rejects a clip, this is the one place to retune: swap the
 * options and the matching `encoding`/`mimeType`/`fileName` together.
 */
const SAMPLE_RATE = 16000;

type PlatformFormat = {
  options: RecordingOptions;
  fileName: string;
  mimeType: string;
  encoding: string;
};

const IOS_FORMAT: PlatformFormat = {
  options: {
    extension: '.wav',
    sampleRate: SAMPLE_RATE,
    numberOfChannels: 1,
    bitRate: 256000,
    ios: {
      outputFormat: IOSOutputFormat.LINEARPCM,
      audioQuality: AudioQuality.MAX,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    // Present to satisfy the cross-platform type; unused on iOS.
    android: { outputFormat: 'default', audioEncoder: 'default' },
    web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
  },
  fileName: 'command.wav',
  mimeType: 'audio/wav',
  encoding: 'LINEAR16',
};

const ANDROID_FORMAT: PlatformFormat = {
  options: {
    extension: '.amr',
    sampleRate: SAMPLE_RATE,
    numberOfChannels: 1,
    bitRate: 23850,
    android: {
      outputFormat: 'amrwb',
      audioEncoder: 'amr_wb',
    },
    ios: {
      outputFormat: IOSOutputFormat.LINEARPCM,
      audioQuality: AudioQuality.MAX,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
  },
  fileName: 'command.amr',
  mimeType: 'audio/amr',
  encoding: 'AMR_WB',
};

export const RECORDING_FORMAT: PlatformFormat = Platform.OS === 'android' ? ANDROID_FORMAT : IOS_FORMAT;
export const RECORDING_OPTIONS = RECORDING_FORMAT.options;

/** Build the multipart payload for voiceApi.listen from a recorded clip URI. */
export function buildListenInput(uri: string, language: string): VoiceListenInput {
  return {
    uri,
    fileName: RECORDING_FORMAT.fileName,
    mimeType: RECORDING_FORMAT.mimeType,
    language,
    encoding: RECORDING_FORMAT.encoding,
    sampleRateHertz: SAMPLE_RATE,
  };
}

// --- Playback -------------------------------------------------------------

// Only one voice clip plays at a time (briefing or command reply). We track the
// active player *and* its promise resolver so that interrupting playback (a new
// clip, or turning the assistant off) unblocks whoever is awaiting it instead of
// leaving them hung until the safety timeout.
let activePlayer: AudioPlayer | null = null;
let activeFinish: (() => void) | null = null;

/** Resolve a possibly-relative audio_url against the API origin. */
function resolveAudioUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const origin = new URL(API_BASE_URL).origin;
    return origin + (url.startsWith('/') ? url : `/${url}`);
  } catch {
    return url;
  }
}

/**
 * Play a remote audio URL, replacing whatever was playing. Resolves once
 * playback finishes, errors, or is interrupted, so callers can sequence UI state.
 */
export function playRemoteAudio(url: string): Promise<void> {
  stopVoicePlayback();
  return new Promise((resolve) => {
    let settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      if (activeFinish === finish) activeFinish = null;
      resolve();
    }
    // Never hang the UI if the clip fails to load or its finish event is missed.
    const guard = setTimeout(finish, 60000);
    activeFinish = finish;
    (async () => {
      try {
        // Recording leaves the iOS session in play-and-record mode routed to the
        // quiet earpiece; switch back to playback so replies come out the speaker
        // (and are audible even when the ringer switch is on silent).
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        const player = createAudioPlayer({ uri: resolveAudioUrl(url) });
        activePlayer = player;
        const sub = player.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish) {
            sub?.remove();
            if (activePlayer === player) {
              player.remove();
              activePlayer = null;
            }
            finish();
          }
        });
        player.play();
      } catch {
        finish();
      }
    })();
  });
}

/** Stop and release the current clip, resolving any promise awaiting it. */
export function stopVoicePlayback() {
  if (activePlayer) {
    try {
      activePlayer.remove();
    } catch {
      // already released
    }
    activePlayer = null;
  }
  // Unblock a caller still awaiting the interrupted playRemoteAudio().
  const finish = activeFinish;
  activeFinish = null;
  finish?.();
}
