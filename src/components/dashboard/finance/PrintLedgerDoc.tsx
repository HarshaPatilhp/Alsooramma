"use client";

import React from 'react';
import { LedgerReportData } from '@/types/finance';
import { numberToIndianWords } from '@/lib/finance-engine';
import { Printer, X } from 'lucide-react';

interface PrintLedgerDocProps {
  data: LedgerReportData;
  onClose: () => void;
}

export default function PrintLedgerDoc({ data, onClose }: PrintLedgerDocProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center">
      {/* Non-printable Screen Controls */}
      <div className="no-print w-full max-w-[210mm] mb-4 bg-slate-900 border border-slate-700 text-white p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Printer size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">General Ledger Print Document Preview</h4>
            <p className="text-[11px] text-slate-400">A4 Optimized • Full double-entry audit ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-md cursor-pointer transition-transform active:scale-95"
          >
            <Printer size={14} />
            <span>Print Now</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
          >
            <X size={14} />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Document Container */}
      <div 
        id="printable-ledger"
        className="bg-white text-slate-900 w-full max-w-[210mm] p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs leading-normal"
        style={{ color: '#0f172a' }}
      >
        {/* Organization Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <div className="inline-block px-3 py-0.5 mb-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-[10px] tracking-widest uppercase">
            Official General Ledger Book
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">
            {data.orgName || 'Mathaji Ulsooramma Sri Raghavendra Swamy Mutt'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {data.orgSubtitle || 'Vidyaranyapura, Bengaluru - 560097, Karnataka • Ph: 080 4972 3252'}
          </p>
          <div className="pt-2">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900 underline decoration-emerald-500 decoration-2 underline-offset-4">
              {data.title || 'GENERAL LEDGER STATEMENT'}
            </h2>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-300 text-[11px]">
          <div>
            <p className="text-slate-500 font-bold uppercase text-[9px]">Account & Book</p>
            <p className="font-extrabold text-slate-900">{data.accountName}</p>
            <p className="text-slate-600 mt-0.5">Period: <span className="font-bold text-slate-900">{data.periodLabel}</span> ({data.startDate} to {data.endDate})</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 font-bold uppercase text-[9px]">Report Info</p>
            <p className="font-semibold text-slate-700">Accounting Standard: Double-Entry Accrual</p>
            <p className="text-slate-600 mt-0.5">Printed At: <span className="font-mono text-slate-800">{data.generatedAt}</span></p>
          </div>
        </div>

        {/* Key Totals Summary */}
        <div className="grid grid-cols-4 gap-2 my-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <div className="border-r border-slate-200 pr-2">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Opening Balance</span>
            <span className="font-mono font-bold text-xs text-slate-900">₹{data.openingBalance.toLocaleString('en-IN')}</span>
          </div>
          <div className="border-r border-slate-200 pr-2">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Debits (-)</span>
            <span className="font-mono font-bold text-xs text-rose-700">₹{data.totalDebits.toLocaleString('en-IN')}</span>
          </div>
          <div className="border-r border-slate-200 pr-2">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Credits (+)</span>
            <span className="font-mono font-bold text-xs text-emerald-700">₹{data.totalCredits.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Closing Balance</span>
            <span className="font-mono font-black text-xs text-slate-950">₹{data.closingBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Ledger Entries Table */}
        <div className="mt-4">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-900 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-2.5 w-20">Date</th>
                <th className="py-2.5 px-2 w-24">Voucher No</th>
                <th className="py-2.5 px-2">Particulars & Description</th>
                <th className="py-2.5 px-2 w-24">Head of A/C</th>
                <th className="py-2.5 px-2 text-right w-24">Debit (-) (₹)</th>
                <th className="py-2.5 px-2 text-right w-24">Credit (+) (₹)</th>
                <th className="py-2.5 px-2 text-right w-28">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Opening Balance Row */}
              <tr className="bg-emerald-50/50 font-bold">
                <td className="py-2 px-2.5 font-mono">{data.startDate}</td>
                <td className="py-2 px-2 font-mono text-slate-500">—</td>
                <td className="py-2 px-2 text-slate-900 uppercase">To Opening Balance b/f</td>
                <td className="py-2 px-2 text-slate-500">Opening Balance</td>
                <td className="py-2 px-2 text-right text-slate-400 font-mono">—</td>
                <td className="py-2 px-2 text-right text-slate-400 font-mono">—</td>
                <td className="py-2 px-2 text-right font-mono text-slate-950 font-black">
                  ₹{data.openingBalance.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Transactions */}
              {data.entries.length > 0 ? (
                data.entries.map((entry, idx) => (
                  <tr key={entry.id || idx} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2.5 font-mono whitespace-nowrap text-slate-700">{entry.date}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 truncate max-w-[90px]">{entry.refNo}</td>
                    <td className="py-1.5 px-2 text-slate-900 font-medium">
                      {entry.particulars}
                    </td>
                    <td className="py-1.5 px-2 text-slate-600 font-medium truncate max-w-[90px]">{entry.category}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-rose-700 font-semibold">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-700 font-semibold">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                      ₹{entry.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    No ledger entries recorded during this selected date range.
                  </td>
                </tr>
              )}

              {/* Closing Summary Row */}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-slate-950">
                <td colSpan={4} className="py-2.5 px-2.5 uppercase tracking-wider text-[10px]">
                  TOTALS & CLOSING LEDGER BALANCE (c/f)
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-rose-800 text-xs">
                  ₹{data.totalDebits.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-emerald-800 text-xs">
                  ₹{data.totalCredits.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-950 text-xs">
                  ₹{data.closingBalance.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Closing Balance In Words */}
        <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
          <span className="font-bold text-slate-600 uppercase">Closing Balance in Words: </span>
          <span className="font-extrabold text-slate-900 italic font-serif">
            {numberToIndianWords(data.closingBalance)}
          </span>
        </div>

        {/* Signatures & Declarations */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 text-center gap-6">
          <div>
            <div className="h-10"></div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900 text-[11px]">Prepared by</p>
              <p className="text-[9px] text-slate-500">Chief Accountant</p>
            </div>
          </div>
          <div>
            <div className="h-10"></div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900 text-[11px]">Audited by</p>
              <p className="text-[9px] text-slate-500">Honorary Chartered Accountant</p>
            </div>
          </div>
          <div>
            <div className="h-10"></div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900 text-[11px]">Sanctioned by</p>
              <p className="text-[9px] text-slate-500">Managing Trustee / President</p>
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified A4 General Ledger Report • Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
