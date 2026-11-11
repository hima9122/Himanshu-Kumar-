/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Volume2,
  VolumeX,
  Bell,
  Smartphone,
  Zap,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { BatteryState } from '../utils/battery';

interface BatterySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batteryState: BatteryState;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  hapticEnabled: boolean;
  onToggleHaptic: (enabled: boolean) => void;
  notificationsGranted: boolean;
  onRequestNotifications: () => Promise<boolean>;
  onSetLevel: (level: number) => void;
  onToggleCharging: () => void;
  onConnectRealBattery: () => void;
  onTriggerTestSound: (severity: 'critical' | 'low') => void;
}

export const BatterySettingsModal: React.FC<BatterySettingsModalProps> = ({
  isOpen,
  onClose,
  batteryState,
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
  notificationsGranted,
  onRequestNotifications,
  onSetLevel,
  onToggleCharging,
  onConnectRealBattery,
  onTriggerTestSound,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="battery-settings-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#1b3a8c] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-300" />
            <div>
              <h3 id="battery-settings-title" className="font-bold text-base">
                Battery & Recharge Notification Settings
              </h3>
              <p className="text-xs text-blue-200">
                रीचार्ज और बैटरी सूचना सेटिंग्स
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close battery settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {/* Current Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              batteryState.charging
                ? 'bg-emerald-50 border-emerald-300'
                : batteryState.level <= 15
                ? 'bg-red-50 border-red-300'
                : batteryState.level <= 25
                ? 'bg-amber-50 border-amber-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  batteryState.charging
                    ? 'bg-emerald-600 text-white'
                    : batteryState.level <= 15
                    ? 'bg-red-600 text-white animate-pulse'
                    : batteryState.level <= 25
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {batteryState.charging ? (
                  <BatteryCharging className="w-6 h-6" />
                ) : batteryState.level <= 15 ? (
                  <BatteryWarning className="w-6 h-6" />
                ) : (
                  <Battery className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono">
                    {batteryState.level}%
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      batteryState.charging
                        ? 'bg-emerald-200 text-emerald-800'
                        : batteryState.level <= 15
                        ? 'bg-red-200 text-red-900'
                        : batteryState.level <= 25
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {batteryState.charging
                      ? '⚡ Charging'
                      : batteryState.level <= 15
                      ? '🔴 Critical (<15%)'
                      : batteryState.level <= 25
                      ? '🟡 Low (<25%)'
                      : '🟢 Good (>25%)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {batteryState.isSimulated ? 'Interactive Simulator Mode' : 'Connected to Hardware Battery'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleCharging}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
                batteryState.charging
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{batteryState.charging ? 'Disconnect' : 'Connect Charger'}</span>
            </button>
          </div>

          {/* Test Simulation Controls */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="battery-slider" className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                <span>Simulate Battery Level for Testing</span>
              </label>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {batteryState.level}%
              </span>
            </div>

            <input
              id="battery-slider"
              type="range"
              min="1"
              max="100"
              value={batteryState.level}
              onChange={(e) => onSetLevel(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onSetLevel(8);
                  if (batteryState.charging) onToggleCharging();
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer"
              >
                🔴 Test Critical (8%)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSetLevel(18);
                  if (batteryState.charging) onToggleCharging();
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
              >
                🟡 Test Low (18%)
              </button>
              <button
                type="button"
                onClick={() => onSetLevel(37)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              >
                🔵 Screenshot Match (37%)
              </button>
              <button
                type="button"
                onClick={() => onSetLevel(90)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
              >
                🟢 Safe (90%)
              </button>
            </div>
          </div>

          {/* Alert Preferences */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Alert Reminders & Signals
            </h4>

            {/* Sound toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Audible Chime / अलार्म ध्वनि</p>
                  <p className="text-[11px] text-slate-500">
                    Plays sound alarm when critical battery threshold (≤15%) is reached
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerTestSound('critical')}
                  className="text-xs text-blue-600 hover:underline px-2 py-1 font-medium cursor-pointer"
                >
                  Play
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => onToggleSound(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Haptic vibration toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Vibration / कंपन अलर्ट</p>
                  <p className="text-[11px] text-slate-500">
                    Vibrates handheld mobile or tablet on low battery
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hapticEnabled}
                onChange={(e) => onToggleHaptic(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Web Push Notification */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Browser Push Notification</p>
                  <p className="text-[11px] text-slate-500">
                    Sends OS banner even if operator switches tabs
                  </p>
                </div>
              </div>

              {notificationsGranted ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Enabled</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onRequestNotifications}
                  className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* Sync Hardware Battery */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onConnectRealBattery}
              className="w-full py-2 px-3 rounded-xl border border-blue-300 text-blue-700 bg-blue-50/50 hover:bg-blue-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Battery className="w-4 h-4" />
              <span>Detect & Read Device Hardware Battery</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1b3a8c] hover:bg-[#2550b5] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Done / सहेजें
          </button>
        </div>
      </div>
    </div>
  );
};
