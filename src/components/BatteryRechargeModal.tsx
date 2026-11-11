/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BatteryWarning, Zap, ShieldCheck, Volume2, X, AlertTriangle } from 'lucide-react';
import { BatteryAlert } from '../utils/battery';

interface BatteryRechargeModalProps {
  isOpen: boolean;
  alertInfo: BatteryAlert;
  batteryLevel: number;
  onDismiss: () => void;
  onPluggedIn: () => void;
  onTestSound: () => void;
}

export const BatteryRechargeModal: React.FC<BatteryRechargeModalProps> = ({
  isOpen,
  alertInfo,
  batteryLevel,
  onDismiss,
  onPluggedIn,
  onTestSound,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="battery-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden transform transition-all">
        {/* Urgent Header */}
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-700 rounded-full animate-bounce">
              <BatteryWarning className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 id="battery-modal-title" className="font-bold text-base sm:text-lg leading-tight">
                Critical Battery Reminder!
              </h3>
              <p className="text-xs text-red-100 font-medium">
                अत्यधिक कम बैटरी - तुरंत चार्ज करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-red-700 cursor-pointer"
            aria-label="Close battery alert modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-slate-800 space-y-4">
          <div className="flex items-center justify-center py-2">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-500 flex flex-col items-center justify-center animate-pulse">
                <span className="text-3xl font-black text-red-600 font-mono">
                  {Math.round(batteryLevel)}%
                </span>
                <span className="text-[10px] font-bold tracking-wider text-red-500 uppercase">
                  Remaining
                </span>
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-400 p-1.5 rounded-full shadow text-red-950">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <p className="font-semibold text-slate-900 text-sm">
              Your device power is dangerously low ({Math.round(batteryLevel)}%).
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Camera capture and photo processing demand peak power and may cause your tablet or phone to power off abruptly. Please connect your charger to continue safely.
            </p>
          </div>

          {/* Auto-Draft Protection Guarantee */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                Automatic Draft Protection Active
              </h4>
              <p className="text-[11px] text-emerald-800 leading-normal">
                Don&apos;t worry: Your entered card details and captured photos have been cached in your device memory. If the device powers off, you can resume seamlessly.
              </p>
            </div>
          </div>

          {/* Quick Sound Test */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Audio Notification Alert</span>
            <button
              type="button"
              onClick={onTestSound}
              className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Chime</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer order-2 sm:order-1"
          >
            I&apos;ll Plug In Soon (Dismiss)
          </button>
          <button
            type="button"
            onClick={onPluggedIn}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer order-1 sm:order-2"
          >
            <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
            <span>I Plugged In Charger!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
