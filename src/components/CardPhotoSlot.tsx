/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';

interface CardPhotoSlotProps {
  type: 'old' | 'new';
  photo: string | null;
  onPhotoSelected: (dataUrl: string) => void;
  onRemovePhoto: () => void;
  onOpenLiveCamera: () => void;
}

export const CardPhotoSlot: React.FC<CardPhotoSlotProps> = ({
  type,
  photo,
  onPhotoSelected,
  onRemovePhoto,
  onOpenLiveCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOld = type === 'old';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onPhotoSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const circleBg = isOld ? 'bg-red-50 text-red-500' : 'bg-sky-50 text-sky-500';
  const primaryBtnText = isOld ? 'ADD OLD CARD' : 'ADD NEW CARD';
  const primaryBtnHindi = isOld ? 'पुराना कार्ड जोड़ें' : 'नया कार्ड जोड़ें';

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${type}-card`}
      />

      {/* Card Drop / Preview Area */}
      <div
        className={`relative w-full h-48 sm:h-56 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-3 text-center overflow-hidden ${
          photo
            ? 'border-blue-400 bg-slate-900 shadow-inner'
            : 'border-slate-300 bg-white hover:border-blue-400/80 hover:bg-slate-50/50'
        }`}
      >
        {photo ? (
          // Captured / Uploaded Image View
          <div className="relative w-full h-full group flex items-center justify-center">
            <img
              src={photo}
              alt={`${isOld ? 'Old' : 'New'} Smart Card`}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Badge Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{isOld ? 'OLD CARD ATTACHED' : 'NEW CARD ATTACHED'}</span>
            </div>

            {/* Hover / Tap Quick Overlay Controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg cursor-pointer transition transform hover:scale-105"
                title="Change File"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onRemovePhoto}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg cursor-pointer transition transform hover:scale-105"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Empty State Matching Screenshot
          <div className="flex flex-col items-center justify-center space-y-1 select-none">
            {/* Circle with camera icon */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-1 ${circleBg}`}
            >
              <Camera className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
            </div>

            <p className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
              Place Card Here
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              कार्ड यहाँ रखें
            </p>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Tap buttons below
            </p>
          </div>
        )}
      </div>

      {/* Primary Action Button (Navy Blue) */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-[#1b3a8c] hover:bg-[#2348aa] active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-bold transition shadow-sm flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <ImageIcon className="w-4 h-4" />
          <span>{primaryBtnText}</span>
        </div>
        <span className="text-[11px] text-blue-200 font-normal">
          {primaryBtnHindi}
        </span>
      </button>

      {/* Secondary Action Button (Outline / Live Camera) */}
      <button
        type="button"
        onClick={onOpenLiveCamera}
        className="w-full bg-white hover:bg-blue-50/60 active:scale-[0.98] border border-slate-200 hover:border-blue-300 text-slate-700 py-2 px-3 rounded-xl font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-xs"
      >
        <Camera className="w-3.5 h-3.5 text-blue-600" />
        <span>Use Live Camera / कैमरा खोलें</span>
      </button>
    </div>
  );
};
