/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';
import { URCFormData, URCRecord, REASON_OPTIONS } from './types';
import { Header } from './components/Header';
import { CardPhotoSlot } from './components/CardPhotoSlot';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { RecordsModal } from './components/RecordsModal';
import { BatteryNotificationBanner } from './components/BatteryNotificationBanner';
import { BatteryRechargeModal } from './components/BatteryRechargeModal';
import { BatterySettingsModal } from './components/BatterySettingsModal';
import { useBattery } from './hooks/useBattery';
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  getSavedRecords,
  saveNewRecord,
  deleteSavedRecord,
  generateSampleSmartCardSvg,
} from './utils/storage';

const INITIAL_FORM: URCFormData = {
  name: '',
  mobile: '',
  reason: 'Unreadable Chip / चिप काम नहीं कर रही',
  oldCardPhoto: null,
  newCardPhoto: null,
  checkerName: 'Deepanshu Sir',
};

export default function App() {
  const [formData, setFormData] = useState<URCFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; photos?: string }>({});
  const [records, setRecords] = useState<URCRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Modals state
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isBatterySettingsOpen, setIsBatterySettingsOpen] = useState(false);
  const [activeCameraSlot, setActiveCameraSlot] = useState<'old' | 'new' | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [lastDraftSaveTime, setLastDraftSaveTime] = useState<number | null>(null);

  // Battery & Recharge Notification Hook
  const {
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
    setSimulatedLevel,
    toggleSimulatedCharging,
    connectRealBattery,
    triggerTestSound,
  } = useBattery();

  // Load initial draft and saved records on mount
  useEffect(() => {
    const saved = getSavedRecords();
    setRecords(saved);

    const draft = loadFormDraft();
    if (draft && draft.data) {
      setFormData(draft.data);
      setLastDraftSaveTime(draft.savedAt);
    }
  }, []);

  // Auto-save draft when form changes (safeguarding against sudden battery shutdown)
  useEffect(() => {
    if (formData.name || formData.mobile || formData.oldCardPhoto || formData.newCardPhoto) {
      saveFormDraft(formData);
      setLastDraftSaveTime(Date.now());
    }
  }, [formData]);

  // When battery level drops to critical or changes, un-dismiss banner so user stays warned
  useEffect(() => {
    if (alertInfo.severity === 'critical') {
      setBannerDismissed(false);
    }
  }, [alertInfo.severity]);

  // Handle Form Validation
  const validateForm = (): boolean => {
    const errs: { name?: string; mobile?: string; photos?: string } = {};

    if (!formData.name.trim()) {
      errs.name = 'Beneficiary Name is required / नाम दर्ज करना अनिवार्य है';
    }

    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile Number is required / मोबाइल नंबर अनिवार्य है';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Please enter a valid 10-digit mobile number / कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें';
    }

    if (!formData.oldCardPhoto && !formData.newCardPhoto) {
      errs.photos = 'Please attach at least one card photo / कृपया कम से कम एक कार्ड की फोटो अपलोड करें';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate verification processing
    setTimeout(() => {
      const tokenNumber = `URC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord: URCRecord = {
        ...formData,
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tokenNumber,
        createdAt: Date.now(),
        batteryLevelAtSubmission: Math.round(batteryState.level),
        isBatteryChargingAtSubmission: batteryState.charging,
        status: 'Approved',
      };

      const updated = saveNewRecord(newRecord);
      setRecords(updated);
      clearFormDraft();
      setFormData({
        ...INITIAL_FORM,
        checkerName: formData.checkerName,
      });
      setErrors({});
      setIsSubmitting(false);
      setSubmissionSuccess(tokenNumber);

      // Scroll to top to see success banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Sample Demo Auto-fill
  const handleSampleDemo = () => {
    const sampleOld = generateSampleSmartCardSvg('old', 'Sub. Rajesh Kumar', 'CSD-URC-7412-OLD');
    const sampleNew = generateSampleSmartCardSvg('new', 'Sub. Rajesh Kumar', 'CSD-URC-9988-NEW');

    setFormData({
      name: 'Subedar Rajesh Kumar',
      mobile: '9876543210',
      reason: 'Unreadable Chip / चिप काम नहीं कर रही',
      oldCardPhoto: sampleOld,
      newCardPhoto: sampleNew,
      checkerName: formData.checkerName || 'Deepanshu Sir',
    });
    setErrors({});
    setSubmissionSuccess(null);
  };

  // Clear Form
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to clear the form? / क्या आप फॉर्म रीसेट करना चाहते हैं?')) {
      clearFormDraft();
      setFormData({
        ...INITIAL_FORM,
        checkerName: formData.checkerName,
      });
      setErrors({});
      setSubmissionSuccess(null);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = deleteSavedRecord(id);
    setRecords(updated);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col font-sans pb-12 selection:bg-blue-600 selection:text-white">
      {/* 1. Header (Exact Match to Screenshot + Battery Indicator) */}
      <Header
        onSampleDemo={handleSampleDemo}
        onOpenRecords={() => setIsRecordsOpen(true)}
        onOpenBatterySettings={() => setIsBatterySettingsOpen(true)}
        recordsCount={records.length}
        batteryState={batteryState}
        checkerName={formData.checkerName}
        onUpdateCheckerName={(name) => setFormData((prev) => ({ ...prev, checkerName: name }))}
      />

      {/* 2. Low Battery Recharge Notification Banner */}
      {!bannerDismissed && (
        <BatteryNotificationBanner
          alertInfo={alertInfo}
          batteryLevel={batteryState.level}
          onDismiss={() => setBannerDismissed(true)}
          onOpenSettings={() => setIsBatterySettingsOpen(true)}
          onPlayChime={() => triggerTestSound(alertInfo.severity === 'critical' ? 'critical' : 'low')}
        />
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6 flex-1">
        {/* Success Confirmation Toast */}
        {submissionSuccess && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  Card Replacement Request Submitted Successfully!
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Token Number: <span className="font-mono font-black text-amber-300">{submissionSuccess}</span>. Records saved locally.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionSuccess(null);
                      setIsRecordsOpen(true);
                    }}
                    className="px-3 py-1 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 cursor-pointer shadow-xs"
                  >
                    View Slip in Records
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmissionSuccess(null)}
              className="text-white/80 hover:text-white p-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Battery Recharge Reminder Helper Card (if battery is in critical or low state) */}
        {alertInfo.alert && (
          <div className="mb-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-xs text-red-900">
            <div className="flex items-center gap-2">
              <span className="font-bold">⚡ Low Battery Safeguard:</span>
              <span>Your entries are continuously auto-saved. Connect charger to scan safely.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBatterySettingsOpen(true)}
              className="font-bold underline shrink-0 hover:text-red-700 cursor-pointer"
            >
              Battery Options
            </button>
          </div>
        )}

        {/* Main Replace Form Card (Matches Screenshot) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Field 1: Name / नाम */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-name"
                  className="font-bold text-slate-800 text-sm tracking-tight"
                >
                  Name / नाम
                </label>
                <span className="text-xs font-semibold text-red-600">* Required</span>
              </div>
              <input
                id="input-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter Name / नाम दर्ज करें"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-400/40 bg-red-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Field 2: Mobile Number / मोबाइल नंबर */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-mobile"
                  className="font-bold text-slate-800 text-sm tracking-tight"
                >
                  Mobile Number / मोबाइल नंबर
                </label>
                <span className="text-xs font-semibold text-red-600">* Required</span>
              </div>
              <div className="relative">
                <input
                  id="input-mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData((prev) => ({ ...prev, mobile: clean }));
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                  }}
                  placeholder="Enter 10-digit Mobile / मोबाइल नंबर"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 bg-white font-mono transition focus:outline-none focus:ring-2 ${
                    errors.mobile
                      ? 'border-red-500 focus:ring-red-400/40 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.mobile}</span>
                </p>
              )}
            </div>

            {/* Field 3: Reason for Replacement / प्रतिस्थापन का कारण */}
            <div className="space-y-1.5">
              <label
                htmlFor="select-reason"
                className="font-bold text-slate-800 text-sm tracking-tight block"
              >
                Reason for Replacement / प्रतिस्थापन का कारण
              </label>
              <div className="relative">
                <select
                  id="select-reason"
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white transition focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Field 4: SMART CARD PHOTOS / कार्ड फोटो */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  SMART CARD PHOTOS / कार्ड फोटो
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Take or upload both
                </span>
              </div>

              {errors.photos && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.photos}</span>
                </p>
              )}

              {/* 2 Card Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slot 1: Old Card */}
                <CardPhotoSlot
                  type="old"
                  photo={formData.oldCardPhoto}
                  onPhotoSelected={(dataUrl) =>
                    setFormData((prev) => ({ ...prev, oldCardPhoto: dataUrl }))
                  }
                  onRemovePhoto={() =>
                    setFormData((prev) => ({ ...prev, oldCardPhoto: null }))
                  }
                  onOpenLiveCamera={() => setActiveCameraSlot('old')}
                />

                {/* Slot 2: New Card */}
                <CardPhotoSlot
                  type="new"
                  photo={formData.newCardPhoto}
                  onPhotoSelected={(dataUrl) =>
                    setFormData((prev) => ({ ...prev, newCardPhoto: dataUrl }))
                  }
                  onRemovePhoto={() =>
                    setFormData((prev) => ({ ...prev, newCardPhoto: null }))
                  }
                  onOpenLiveCamera={() => setActiveCameraSlot('new')}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1b3a8c] hover:bg-[#2348aa] active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'PROCESSING / सत्यापन जारी है...' : 'SUBMIT VERIFICATION / फॉर्म जमा करें'}
                </span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Auto-saved {lastDraftSaveTime ? new Date(lastDraftSaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'locally'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex items-center gap-1 text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form / साफ़ करें</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Feature Highlights Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-200/60 border border-slate-300/60 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Battery & Recharge Protection:</strong> Field operators receive alerts at &le;25% and sound alarms at &le;15% so smart card verification is never lost.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsBatterySettingsOpen(true)}
            className="text-blue-700 font-bold hover:underline shrink-0 cursor-pointer"
          >
            Adjust Thresholds
          </button>
        </div>
      </main>

      {/* 3. Live Camera Modal */}
      {activeCameraSlot && (
        <CameraCaptureModal
          isOpen={!!activeCameraSlot}
          type={activeCameraSlot}
          holderName={formData.name || 'Army Card Holder'}
          onCapture={(dataUrl) => {
            if (activeCameraSlot === 'old') {
              setFormData((prev) => ({ ...prev, oldCardPhoto: dataUrl }));
            } else {
              setFormData((prev) => ({ ...prev, newCardPhoto: dataUrl }));
            }
          }}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}

      {/* 4. Records Modal */}
      <RecordsModal
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        records={records}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* 5. Critical Low Battery Recharge Reminder Modal (triggers on <=15% or user simulation) */}
      <BatteryRechargeModal
        isOpen={isAlertModalOpen}
        alertInfo={alertInfo}
        batteryLevel={batteryState.level}
        onDismiss={dismissCurrentAlert}
        onPluggedIn={() => {
          toggleSimulatedCharging();
          dismissCurrentAlert();
        }}
        onTestSound={() => triggerTestSound('critical')}
      />

      {/* 6. Battery & Recharge Notification Settings Modal */}
      <BatterySettingsModal
        isOpen={isBatterySettingsOpen}
        onClose={() => setIsBatterySettingsOpen(false)}
        batteryState={batteryState}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        hapticEnabled={hapticEnabled}
        onToggleHaptic={setHapticEnabled}
        notificationsGranted={notificationsGranted}
        onRequestNotifications={requestNotificationPermission}
        onSetLevel={setSimulatedLevel}
        onToggleCharging={toggleSimulatedCharging}
        onConnectRealBattery={connectRealBattery}
        onTriggerTestSound={triggerTestSound}
      />
    </div>
  );
}
