/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface URCFormData {
  name: string;
  mobile: string;
  reason: string;
  oldCardPhoto: string | null;
  newCardPhoto: string | null;
  checkerName: string;
  notes?: string;
}

export interface URCRecord extends URCFormData {
  id: string;
  tokenNumber: string;
  createdAt: number;
  batteryLevelAtSubmission: number;
  isBatteryChargingAtSubmission: boolean;
  status: 'Approved' | 'Pending Verification' | 'Dispatched';
}

export const REASON_OPTIONS = [
  'Unreadable Chip / चिप काम नहीं कर रही',
  'Physical Damage / कार्ड टूट गया',
  'Card Expired / कार्ड समाप्त हो गया',
  'Magnetic Stripe Damaged / मैग्नेटिक स्ट्रिप खराब',
  'Card Lost / कार्ड खो गया',
  'Chip Corrupted / चिप करप्ट हो गई',
  'Name/Details Mismatch / नाम या विवरण गलत',
  'Other / अन्य',
];
