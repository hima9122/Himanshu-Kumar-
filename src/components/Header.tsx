/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, User, History, Sparkles, Battery, BatteryCharging, BatteryWarning, Edit3, Check } from 'lucide-react';
import { BatteryState } from '../utils/battery';

interface HeaderProps {
  onSampleDemo: () => void;
  onOpenRecords: () => void;
  onOpenBatterySettings: () => void;
  recordsCount: number;
  batteryState: BatteryState;
  checkerName: string;
  onUpdateCheckerName: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSampleDemo,
  onOpenRecords,
  onOpenBatterySettings,
  recordsCount,
  batteryState,
  checkerName,
  onUpdateCheckerName,
}) => {
  const [isEditingChecker, setIsEditingChecker] = useState(false);
  const [tempName, setTempName] = useState(checkerName);

  const handleSaveChecker = () => {
    if (tempName.trim()) {
      onUpdateCheckerName(tempName.trim());
    }
    setIsEditingChecker(false);
  };

  const isLow = batteryState.level <= 25 && !batteryState.charging;
  const isCritical = batteryState.level <= 15 && !batteryState.charging;

  return (
    <header className="w-full bg-[#1b3a8c] text-white pt-4 pb-6 px-4 shadow-md transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Top Actions Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Sample Demo Button */}
          <button
            type="button"
            onClick={onSampleDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2550b5] hover:bg-[#2e5ece] active:scale-95 text-xs font-semibold text-white tracking-wide transition shadow-sm border border-blue-400/30 cursor-pointer"
            title="Auto-fill sample data for demo testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Sample Demo</span>
          </button>

          {/* Center: Battery Recharge Notification Monitor Status Badge */}
          <button
            type="button"
            onClick={onOpenBatterySettings}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition border ${
              isCritical
                ? 'bg-red-600/90 text-white border-red-400 animate-pulse'
                : isLow
                ? 'bg-amber-600/90 text-white border-amber-400'
                : batteryState.charging
                ? 'bg-emerald-600/90 text-white border-emerald-400'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="Click to view & test Battery Recharge Notifications"
          >
            {batteryState.charging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-300" />
            ) : isCritical ? (
              <BatteryWarning className="w-4 h-4 text-red-200 animate-bounce" />
            ) : (
              <Battery className="w-4 h-4 text-white" />
            )}
            <span className="font-mono font-bold">{batteryState.level}%</span>
            {batteryState.charging && <span className="text-[10px] bg-emerald-700/80 px-1 rounded">CHARGING</span>}
            {isCritical && <span className="text-[10px] bg-red-800 px-1 rounded font-bold">RECHARGE!</span>}
          </button>

          {/* Records Button */}
          <button
            type="button"
            onClick={onOpenRecords}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2550b5] hover:bg-[#2e5ece] active:scale-95 text-xs font-semibold text-white tracking-wide transition shadow-sm border border-blue-400/30 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-blue-200" />
            <span>Records</span>
            {recordsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-amber-400 text-blue-950 rounded-full text-[10px] font-bold">
                {recordsCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Title Header */}
        <div className="flex flex-col items-center justify-center text-center mt-1">
          <div className="flex items-center justify-center gap-2.5 mb-0.5">
            <CreditCard className="w-7 h-7 text-[#facc15]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              URC (Unreadable Smart Card)
            </h1>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-[#facc15] drop-shadow-sm">
            REPLACE FORM
          </h2>

          {/* Checking By Subtitle */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm">
            <User className="w-4 h-4 text-teal-300" />
            <span className="text-blue-100 font-medium">Checking By:</span>

            {isEditingChecker ? (
              <div className="flex items-center gap-1 ml-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white text-slate-900 px-2 py-0.5 rounded text-xs font-medium w-36 outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveChecker()}
                />
                <button
                  type="button"
                  onClick={handleSaveChecker}
                  className="p-1 bg-emerald-500 rounded text-white hover:bg-emerald-600"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempName(checkerName);
                  setIsEditingChecker(true);
                }}
                className="group flex items-center gap-1 font-semibold text-white border-b border-dotted border-white hover:text-amber-200 hover:border-amber-200 transition cursor-pointer"
                title="Click to edit inspector name"
              >
                <span>{checkerName}</span>
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100 text-amber-200" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
