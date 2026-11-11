/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BatteryWarning, Zap, ShieldCheck, X, Volume2 } from 'lucide-react';
import { BatteryAlert } from '../utils/battery';

interface BatteryNotificationBannerProps {
  alertInfo: BatteryAlert;
  batteryLevel: number;
  onDismiss: () => void;
  onOpenSettings: () => void;
  onPlayChime: () => void;
}

export const BatteryNotificationBanner: React.FC<BatteryNotificationBannerProps> = ({
  alertInfo,
  batteryLevel,
  onDismiss,
  onOpenSettings,
  onPlayChime,
}) => {
  if (!alertInfo.alert) return null;

  const isCritical = alertInfo.severity === 'critical';

  return (
    <div
      role="alert"
      className={`w-full py-2.5 px-4 text-sm font-medium transition-all shadow-md ${
        isCritical
          ? 'bg-red-600 text-white border-b-2 border-red-700 animate-pulse'
          : 'bg-amber-500 text-slate-900 border-b-2 border-amber-600'
      }`}
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-full ${
              isCritical ? 'bg-red-800 text-white' : 'bg-amber-600 text-amber-100'
            }`}
          >
            <BatteryWarning className="w-4 h-4 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-xs">
                {isCritical ? '⚡ Critical Battery Alert (अत्यधिक कम बैटरी)' : '⚠️ Low Battery Reminder (कम बैटरी)'}
              </span>
              <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-black/20">
                {Math.round(batteryLevel)}%
              </span>
            </div>
            <p className="text-xs opacity-95">
              {isCritical
                ? 'Device may shut down mid-verification! Please plug in charger now.'
                : 'Connect your charger soon to avoid interruption while using the camera.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span
            className={`hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
              isCritical ? 'bg-red-800/80 text-red-100' : 'bg-amber-600/80 text-amber-950'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>Draft Auto-Protected</span>
          </span>

          <button
            type="button"
            onClick={onPlayChime}
            title="Hear recharge chime"
            className={`p-1 rounded hover:bg-black/10 text-xs flex items-center gap-1 cursor-pointer`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`px-2 py-0.5 rounded text-xs font-semibold underline hover:no-underline cursor-pointer`}
          >
            Details
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss battery warning banner"
            className="p-1 rounded-full hover:bg-black/15 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
