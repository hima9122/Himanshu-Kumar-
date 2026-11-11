/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BatteryState {
  level: number; // 0 to 100
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
  isSimulated?: boolean;
}

export type BatterySeverity = 'critical' | 'low' | 'normal' | 'charging';

export interface BatteryAlert {
  alert: boolean;
  severity: BatterySeverity;
  title: string;
  titleHindi: string;
  message: string;
  messageHindi: string;
  soundAlarm: boolean;
}

export const CRITICAL_BATTERY_THRESHOLD = 15;
export const LOW_BATTERY_THRESHOLD = 25;

/**
 * Evaluates battery status and determines if a recharge alert/notification is needed.
 */
export function evaluateBatteryStatus(level: number, charging: boolean): BatteryAlert {
  // If charging, no low battery reminder needed
  if (charging) {
    return {
      alert: false,
      severity: 'charging',
      title: 'Device Charging',
      titleHindi: 'डिवाइस चार्ज हो रहा है',
      message: `Device is plugged in (${Math.round(level)}%). Safe for card scanning & submissions.`,
      messageHindi: `डिवाइस चार्ज हो रहा है (${Math.round(level)}%)। कार्ड स्कैन और सबमिशन सुरक्षित हैं।`,
      soundAlarm: false,
    };
  }

  if (level <= CRITICAL_BATTERY_THRESHOLD) {
    return {
      alert: true,
      severity: 'critical',
      title: 'Critical Battery! Please Recharge Immediately',
      titleHindi: 'अत्यधिक कम बैटरी! कृपया तुरंत चार्ज करें',
      message: `Battery is critically low at ${Math.round(level)}%. Connect charger now to prevent shutdown and data loss during smart card capture.`,
      messageHindi: `बैटरी केवल ${Math.round(level)}% बची है। स्मार्ट कार्ड स्कैन या सबमिशन के दौरान डेटा हानि से बचने के लिए तुरंत चार्जर लगाएं।`,
      soundAlarm: true,
    };
  }

  if (level <= LOW_BATTERY_THRESHOLD) {
    return {
      alert: true,
      severity: 'low',
      title: 'Low Battery Warning - Connect Charger',
      titleHindi: 'कम बैटरी चेतावनी - चार्जर कनेक्ट करें',
      message: `Battery is at ${Math.round(level)}%. Camera usage consumes heavy power. Recharge recommended.`,
      messageHindi: `बैटरी ${Math.round(level)}% पर है। कैमरा उपयोग में अधिक बैटरी खर्च होती है। रीचार्ज करने की सलाह दी जाती है।`,
      soundAlarm: false,
    };
  }

  return {
    alert: false,
    severity: 'normal',
    title: 'Battery Normal',
    titleHindi: 'बैटरी सामान्य',
    message: `Battery level is sufficient (${Math.round(level)}%).`,
    messageHindi: `बैटरी स्तर पर्याप्त है (${Math.round(level)}%)।`,
    soundAlarm: false,
  };
}

/**
 * Synthesizes an alert sound chime using the Web Audio API without requiring external audio files.
 */
export function playRechargeAlertSound(severity: 'critical' | 'low') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (severity === 'critical') {
      // 3 urgent pulsating beeps
      [0, 0.22, 0.44].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + offset); // A5
        osc.frequency.setValueAtTime(660, now + offset + 0.1); // E5

        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.19);
      });
    } else {
      // Gentle warning chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    }
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

/**
 * Triggers device haptic vibration if supported.
 */
export function triggerHapticAlert(severity: 'critical' | 'low') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (severity === 'critical') {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } else {
        navigator.vibrate([150, 100, 150]);
      }
    } catch {
      // Ignore vibration error
    }
  }
}
