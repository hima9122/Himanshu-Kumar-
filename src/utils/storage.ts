/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { URCFormData, URCRecord } from '../types';

const DRAFT_STORAGE_KEY = 'urc_form_draft_v1';
const RECORDS_STORAGE_KEY = 'urc_submitted_records_v1';

export function saveFormDraft(data: URCFormData): void {
  try {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        data,
        savedAt: Date.now(),
      })
    );
  } catch {
    // quota exceeded or private mode, handle gracefully
  }
}

export function loadFormDraft(): { data: URCFormData; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearFormDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getSavedRecords(): URCRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNewRecord(record: URCRecord): URCRecord[] {
  try {
    const current = getSavedRecords();
    const updated = [record, ...current];
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteSavedRecord(id: string): URCRecord[] {
  try {
    const current = getSavedRecords();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Creates an SVG Data URL representing an Indian Army / CSD / URC Smart Card
 * for realistic offline demo filling and camera fallback.
 */
export function generateSampleSmartCardSvg(
  type: 'old' | 'new',
  holderName: string = 'Rajesh Kumar',
  cardNo: string = 'URC-9842-4411'
): string {
  const isOld = type === 'old';
  const bgColor = isOld ? '#475569' : '#0369a1';
  const badgeColor = isOld ? '#dc2626' : '#16a34a';
  const badgeText = isOld ? 'OLD / DAMAGED' : 'NEW REPLACEMENT';
  const chipColor = isOld ? '#94a3b8' : '#eab308';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="400" height="250">
    <defs>
      <linearGradient id="bg-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="250" rx="14" fill="url(#bg-${type})"/>
    <rect x="20" y="20" width="360" height="210" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2"/>
    
    <!-- Chip -->
    <rect x="35" y="70" width="55" height="45" rx="6" fill="${chipColor}" stroke="#1e293b" stroke-width="2"/>
    <path d="M 35 92 H 90 M 55 70 V 115 M 70 70 V 115" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>
    
    <!-- Header -->
    <text x="35" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="#f8fafc" letter-spacing="1">CANTEEN STORES / URC SMART CARD</text>
    <rect x="260" y="32" width="105" height="18" rx="4" fill="${badgeColor}"/>
    <text x="312" y="45" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${badgeText}</text>
    
    <!-- Card Number -->
    <text x="35" y="150" font-family="monospace" font-size="18" font-weight="bold" fill="#ffffff" letter-spacing="3">${cardNo}</text>
    
    <!-- Holder Name -->
    <text x="35" y="180" font-family="sans-serif" font-size="10" fill="#94a3b8">CARD HOLDER</text>
    <text x="35" y="200" font-family="sans-serif" font-size="15" font-weight="bold" fill="#ffffff">${holderName.toUpperCase()}</text>
    
    <!-- Expiry / Issue -->
    <text x="270" y="180" font-family="sans-serif" font-size="10" fill="#94a3b8">${isOld ? 'EXPIRED' : 'VALID THRU'}</text>
    <text x="270" y="200" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">${isOld ? '10/24' : '11/30'}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
