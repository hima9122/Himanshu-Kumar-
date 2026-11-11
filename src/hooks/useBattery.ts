/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  evaluateBatteryStatus,
  playRechargeAlertSound,
  triggerHapticAlert,
  BatteryAlert,
  BatteryState,
} from '../utils/battery';

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  }>;
}

export function useBattery() {
  // We initialize with a realistic default (e.g. 37% as in user's screenshot) or simulated state
  const [batteryState, setBatteryState] = useState<BatteryState>({
    level: 37,
    charging: false,
    isSimulated: true, // Default to interactive simulation so users can test immediately
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [notificationsGranted, setNotificationsGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [dismissedAlertForLevel, setDismissedAlertForLevel] = useState<number | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Keep track of the last alerted level to prevent infinite sounds
  const lastAlertedLevelRef = useRef<number | null>(null);

  // Evaluate current battery alert
  const alertInfo: BatteryAlert = evaluateBatteryStatus(
    batteryState.level,
    batteryState.charging
  );

  // Play alarm and show modal when entering critical condition
  useEffect(() => {
    if (alertInfo.alert && alertInfo.severity === 'critical') {
      const currentLevelRounded = Math.round(batteryState.level);

      // Only trigger alarm if we haven't alerted at this exact level or lower
      if (lastAlertedLevelRef.current === null || lastAlertedLevelRef.current > currentLevelRounded) {
        lastAlertedLevelRef.current = currentLevelRounded;
        setIsAlertModalOpen(true);

        if (soundEnabled) {
          playRechargeAlertSound('critical');
        }
        if (hapticEnabled) {
          triggerHapticAlert('critical');
        }

        // Fire Web Notification if allowed
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('⚠️ Battery Critically Low - Please Recharge!', {
              body: `Battery is at ${currentLevelRounded}%. Connect charger to avoid shutdown during card photo verification.`,
              icon: '/favicon.ico',
            });
          } catch {
            // ignore
          }
        }
      }
    } else if (alertInfo.severity === 'charging' || alertInfo.severity === 'normal') {
      // Reset last alerted level once charging or safe
      lastAlertedLevelRef.current = null;
      setIsAlertModalOpen(false);
    }
  }, [batteryState.level, batteryState.charging, alertInfo.alert, alertInfo.severity, soundEnabled, hapticEnabled]);

  // Connect to real Battery API if user chooses to use real device battery
  const connectRealBattery = useCallback(async () => {
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithBattery) : null;
    if (nav?.getBattery) {
      try {
        const battery = await nav.getBattery();
        const update = () => {
          setBatteryState({
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            isSimulated: false,
          });
        };

        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);

        return () => {
          battery.removeEventListener('levelchange', update);
          battery.removeEventListener('chargingchange', update);
        };
      } catch (err) {
        console.warn('Real battery API error, keeping simulated mode', err);
      }
    }
    return undefined;
  }, []);

  const setSimulatedLevel = (level: number) => {
    setBatteryState((prev) => ({
      ...prev,
      level: Math.max(1, Math.min(100, Math.round(level))),
      isSimulated: true,
    }));
  };

  const toggleSimulatedCharging = () => {
    setBatteryState((prev) => ({
      ...prev,
      charging: !prev.charging,
      isSimulated: true,
    }));
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setNotificationsGranted(result === 'granted');
        return result === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  };

  const dismissCurrentAlert = () => {
    setDismissedAlertForLevel(Math.round(batteryState.level));
    setIsAlertModalOpen(false);
  };

  const triggerTestSound = (severity: 'critical' | 'low') => {
    playRechargeAlertSound(severity);
    triggerHapticAlert(severity);
  };

  return {
    batteryState,
    alertInfo,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    notificationsGranted,
    requestNotificationPermission,
    isAlertModalOpen,
    setIsAlertModalOpen,
    dismissCurrentAlert,
    dismissedAlertForLevel,
    setSimulatedLevel,
    toggleSimulatedCharging,
    connectRealBattery,
    triggerTestSound,
  };
}
