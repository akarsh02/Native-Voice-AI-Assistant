import { Platform, AppRegistry } from 'react-native';
import BackgroundActions from 'react-native-background-actions';
import { BuiltInKeyword, PorcupineManager } from '@picovoice/porcupine-react-native';

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — fill these in after getting your Picovoice credentials
// ──────────────────────────────────────────────────────────────────────────────

// 1. Get your free AccessKey at https://console.picovoice.ai/
export const PICOVOICE_ACCESS_KEY = 'YOUR_PICOVOICE_ACCESS_KEY_HERE';

// 2. Train "Hey Mobile" at https://console.picovoice.ai/ → Wake Word
//    Download the Android .ppn file and place it in:
//    /assets/hey-mobile_android.ppn
//    Then update this path:
export const WAKE_WORD_MODEL_PATH = 'hey-mobile_android.ppn'; // relative to app assets

// ──────────────────────────────────────────────────────────────────────────────
// Background Task — this runs even when the app is in the background/closed
// ──────────────────────────────────────────────────────────────────────────────

let porcupineManager = null;

const wakeWordTask = async (taskData) => {
  const { delay } = taskData;

  await new Promise(async (resolve) => {
    const detectionCallback = async (keywordIndex) => {
      if (keywordIndex >= 0) {
        console.log('[WakeWordService] "Hey Mobile" detected! Launching app...');
        // Stop background detection so the app can use the mic
        await stopWakeWordService();

        // The app will be brought to foreground by the notification tap
        // or by the system when speech recognition starts
      }
    };

    const errorCallback = (error) => {
      console.error('[WakeWordService] Porcupine error:', error);
    };

    try {
      porcupineManager = await PorcupineManager.fromBuiltInKeywords(
        PICOVOICE_ACCESS_KEY,
        [BuiltInKeyword.PORCUPINE], // ← placeholder; replace with custom keyword below
        // To use your trained "Hey Mobile" keyword instead:
        // Use PorcupineManager.fromKeywordPaths(PICOVOICE_ACCESS_KEY, [WAKE_WORD_MODEL_PATH], ...)
        detectionCallback,
        errorCallback
      );

      await porcupineManager.start();
      console.log('[WakeWordService] Listening for wake word...');
    } catch (e) {
      console.error('[WakeWordService] Failed to init Porcupine:', e);
    }

    // Keep the background task alive
    while (BackgroundActions.isRunning()) {
      await new Promise((r) => setTimeout(r, delay));
    }

    resolve();
  });
};

const backgroundOptions = {
  taskName: 'HeyMobileWakeWord',
  taskTitle: 'Hey Mobile — Always Listening',
  taskDesc: 'Say "Hey Mobile" to activate your AI assistant',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#2563EB',
  parameters: {
    delay: 5000, // heartbeat every 5s to keep service alive
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

export const startWakeWordService = async () => {
  if (Platform.OS !== 'android') {
    console.log('[WakeWordService] Background wake word is Android-only.');
    return;
  }
  try {
    if (!BackgroundActions.isRunning()) {
      await BackgroundActions.start(wakeWordTask, backgroundOptions);
      console.log('[WakeWordService] Background service started.');
    }
  } catch (e) {
    console.error('[WakeWordService] Could not start service:', e);
  }
};

export const stopWakeWordService = async () => {
  try {
    if (porcupineManager) {
      await porcupineManager.stop();
      await porcupineManager.delete();
      porcupineManager = null;
    }
    if (BackgroundActions.isRunning()) {
      await BackgroundActions.stop();
    }
    console.log('[WakeWordService] Background service stopped.');
  } catch (e) {
    console.error('[WakeWordService] Could not stop service:', e);
  }
};
