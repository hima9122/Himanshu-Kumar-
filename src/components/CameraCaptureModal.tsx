/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { generateSampleSmartCardSvg } from '../utils/storage';

interface CameraCaptureModalProps {
  isOpen: boolean;
  type: 'old' | 'new';
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  holderName?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  type,
  onCapture,
  onClose,
  holderName = 'Army Card Holder',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isOld = type === 'old';

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) return;

    let currentStream: MediaStream | null = null;
    setCameraError(null);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this device/browser.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: unknown) {
        console.warn('Camera error or permission denied:', err);
        setCameraError(
          err instanceof Error
            ? err.message
            : 'Unable to access camera. Please allow camera permissions or use demo card generator.'
        );
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleCaptureFromVideo = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
      onClose();
    }
    setIsCapturing(false);
  };

  const handleUseGeneratedSample = () => {
    const cardSvg = generateSampleSmartCardSvg(
      type,
      holderName || (isOld ? 'Havildar Rajesh Kumar' : 'Rajesh Kumar'),
      isOld ? 'URC-CARD-8832-OLD' : 'URC-CARD-9912-NEW'
    );
    onCapture(cardSvg);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800/90 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">
                Capture {isOld ? 'Old (Damaged)' : 'New Replacement'} Smart Card
              </h3>
              <p className="text-[11px] text-slate-400">
                {isOld ? 'पुराने कार्ड की फोटो खींचे' : 'नए कार्ड की फोटो खींचे'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">Camera Inactive or Not Allowed</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cameraError}
              </p>
              <button
                type="button"
                onClick={handleUseGeneratedSample}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Insert Realistic Smart Card Photo</span>
              </button>
            </div>
          ) : (
            <>
              {/* Real Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Card Bounding Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-full max-w-sm aspect-[85.6/53.98] border-2 border-emerald-400 rounded-xl shadow-2xl flex flex-col justify-between p-3 bg-emerald-500/5">
                  <div className="flex justify-between items-center text-[10px] text-emerald-300 font-mono tracking-wider">
                    <span>ALIGN CARD WITHIN BORDER</span>
                    <span>CSD / URC</span>
                  </div>

                  {/* Corner marks */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-300" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-300" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-300" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-300" />

                  <div className="text-center text-[11px] font-semibold text-emerald-200 bg-black/60 py-1 px-2 rounded backdrop-blur-xs self-center">
                    {isOld ? 'Scan Old Unreadable Card' : 'Scan New Issued Card'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={!!cameraError}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40"
            title="Flip Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {!cameraError && (
            <button
              type="button"
              onClick={handleCaptureFromVideo}
              disabled={isCapturing}
              className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 active:scale-95 transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full border-2 border-slate-950 bg-red-600" />
              <span>Capture Photo</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleUseGeneratedSample}
            className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-500/40 text-blue-200 text-xs font-medium cursor-pointer"
            title="Generate card scan directly"
          >
            Use Sample Scan
          </button>
        </div>
      </div>
    </div>
  );
};
