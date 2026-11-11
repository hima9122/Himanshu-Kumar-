/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Search,
  Printer,
  Trash2,
  Calendar,
  Phone,
  User,
  Battery,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';
import { URCRecord } from '../types';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: URCRecord[];
  onDeleteRecord: (id: string) => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  isOpen,
  onClose,
  records,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<URCRecord | null>(null);

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobile.includes(searchTerm) ||
      r.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintSlip = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Token', 'Name', 'Mobile', 'Reason', 'Inspector', 'Date', 'Battery %', 'Status'];
    const rows = records.map((r) => [
      r.tokenNumber,
      `"${r.name}"`,
      r.mobile,
      `"${r.reason}"`,
      `"${r.checkerName}"`,
      new Date(r.createdAt).toLocaleString(),
      r.batteryLevelAtSubmission,
      r.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `URC_SmartCard_Records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-[#1b3a8c] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-300" />
              <span>URC Replacement Submissions & Records</span>
            </h3>
            <p className="text-xs text-blue-200">
              कार्ड प्रतिस्थापन रिकॉर्ड और सत्यापन पर्ची
            </p>
          </div>

          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-600 text-xs font-medium flex items-center gap-1 cursor-pointer"
                title="Export records to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Name, Mobile, Token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Records: <span className="font-bold text-slate-800">{filteredRecords.length}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-medium text-sm text-slate-600">No records found</p>
              <p className="text-xs">
                Fill out the form or click &quot;Sample Demo&quot; to test submission.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {record.tokenNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{record.status}</span>
                      </span>
                    </div>

                    {/* Beneficiary Details */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+91 {record.mobile}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg text-xs space-y-1">
                      <p className="text-slate-600">
                        <span className="font-medium text-slate-700">Reason:</span> {record.reason}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium text-slate-700">Checked By:</span> {record.checkerName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Battery className="w-3 h-3 text-emerald-600" />
                          <span>{record.batteryLevelAtSubmission}% Batt</span>
                        </span>
                      </div>
                    </div>

                    {/* Photos Preview */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="border border-slate-200 rounded-lg p-1 text-center bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">
                          OLD CARD
                        </span>
                        {record.oldCardPhoto ? (
                          <img
                            src={record.oldCardPhoto}
                            alt="Old Card"
                            className="w-full h-16 object-contain rounded bg-slate-900"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No Photo</span>
                        )}
                      </div>

                      <div className="border border-slate-200 rounded-lg p-1 text-center bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">
                          NEW CARD
                        </span>
                        {record.newCardPhoto ? (
                          <img
                            src={record.newCardPhoto}
                            alt="New Card"
                            className="w-full h-16 object-contain rounded bg-slate-900"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No Photo</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print Slip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slip Modal View */}
        {selectedRecord && (
          <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">
                  URC Replacement Acknowledgement Slip
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div id="printable-slip" className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50 text-xs">
                <div className="text-center border-b pb-2">
                  <h3 className="font-black text-sm text-slate-900 uppercase">
                    UNIT RUN CANTEEN (URC) SMART CARD REPLACEMENT
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Token: {selectedRecord.tokenNumber} | Date: {new Date(selectedRecord.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">BENEFICIARY</span>
                    <strong className="text-slate-900">{selectedRecord.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">MOBILE</span>
                    <strong className="text-slate-900">+91 {selectedRecord.mobile}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">REASON FOR REPLACEMENT</span>
                    <span className="font-semibold">{selectedRecord.reason}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">VERIFIED BY</span>
                    <span className="font-semibold">{selectedRecord.checkerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DEVICE STATUS AT SCAN</span>
                    <span className="font-semibold font-mono text-emerald-700">
                      {selectedRecord.batteryLevelAtSubmission}% Battery OK
                    </span>
                  </div>
                </div>

                <div className="border-t pt-2 flex justify-between items-end text-[10px] text-slate-400">
                  <div>
                    <span>Official Stamp & Seal</span>
                    <div className="w-24 h-8 border border-dashed border-slate-300 mt-1 rounded flex items-center justify-center text-[9px] text-slate-300">
                      URC STAMP
                    </div>
                  </div>
                  <div className="text-right">
                    <span>Officer Signature</span>
                    <p className="font-serif italic font-bold text-slate-800 text-xs mt-1">
                      {selectedRecord.checkerName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-800"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
