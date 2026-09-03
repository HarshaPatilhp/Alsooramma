"use client";

import React from 'react';
import { FormalStatementData } from '@/types/finance';
import { numberToIndianWords } from '@/lib/finance-engine';
import { Printer, X } from 'lucide-react';

interface PrintFormalStatementDocProps {
  data: FormalStatementData;
  onClose: () => void;
}

export default function PrintFormalStatementDoc({ data, onClose }: PrintFormalStatementDocProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center">
      {/* Non-printable Screen Controls */}
      <div className="no-print w-full max-w-[210mm] mb-4 bg-slate-900 border border-slate-700 text-white p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
            <Printer size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Formal Financial Statement Print Document</h4>
            <p className="text-[11px] text-slate-400">A4 Optimized • Statement of Income & Expenditure</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-md cursor-pointer transition-transform active:scale-95"
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
        id="printable-statement"
        className="bg-white text-slate-900 w-full max-w-[210mm] p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs leading-normal"
        style={{ color: '#0f172a' }}
      >
        {/* Organization Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <div className="inline-block px-3 py-0.5 mb-1 rounded-full bg-teal-50 border border-teal-300 text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">
            Religious & Charitable Trust Accounts
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">
            {data.orgName || 'Mathaji Ulsooramma Sri Raghavendra Swamy Mutt'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {data.orgSubtitle || 'Vidyaranyapura, Bengaluru - 560097, Karnataka • Ph: 080 4972 3252'}
          </p>
          <div className="pt-2">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900 underline decoration-teal-600 decoration-2 underline-offset-4">
              {data.title || 'STATEMENT OF INCOME & EXPENDITURE'}
            </h2>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-300 text-[11px]">
          <div>
            <p className="text-slate-500 font-bold uppercase text-[9px]">Financial Period</p>
            <p className="font-extrabold text-slate-900">{data.periodLabel}</p>
            <p className="text-slate-600 mt-0.5">Date Range: <span className="font-bold text-slate-900">{data.startDate} to {data.endDate}</span></p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 font-bold uppercase text-[9px]">Reporting Standard</p>
            <p className="font-semibold text-slate-700">Indian Trust & Religious Institutions Accounting Format</p>
            <p className="text-slate-600 mt-0.5">Generated: <span className="font-mono text-slate-800">{data.generatedAt}</span></p>
          </div>
        </div>

        {/* Two-Column Accounting Table: Expenditure (Dr) vs Income (Cr) */}
        <div className="mt-4 border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[9.5px] tracking-wider">
                <th className="py-2.5 px-3 w-1/2 border-r border-slate-700">EXPENDITURE (OUTFLOWS)</th>
                <th className="py-2.5 px-3 w-1/2">INCOME & RECEIPTS (INFLOWS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 align-top">
              <tr>
                {/* Left: Expenditure Items */}
                <td className="p-3 border-r border-slate-200">
                  <div className="space-y-2">
                    {data.expenseCategories.length > 0 ? (
                      data.expenseCategories.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                          <span className="text-slate-800 font-medium">{item.category}</span>
                          <span className="font-mono font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic py-3 text-center">No expenditure recorded in this period.</p>
                    )}
                  </div>
                </td>

                {/* Right: Income Items */}
                <td className="p-3">
                  <div className="space-y-2">
                    {data.incomeCategories.length > 0 ? (
                      data.incomeCategories.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                          <span className="text-slate-800 font-medium">{item.category}</span>
                          <span className="font-mono font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic py-3 text-center">No receipts recorded in this period.</p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Totals Row */}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                <td className="p-3 border-r border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="uppercase text-[10px] text-slate-700 font-black">TOTAL EXPENDITURE (A)</span>
                    <span className="font-mono font-black text-rose-800 text-xs">₹{data.totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="uppercase text-[10px] text-slate-700 font-black">TOTAL INCOME (B)</span>
                    <span className="font-mono font-black text-emerald-800 text-xs">₹{data.totalIncome.toLocaleString('en-IN')}</span>
                  </div>
                </td>
              </tr>

              {/* Net Surplus / Deficit Row */}
              <tr className="bg-amber-50/80 font-black border-t border-slate-300">
                <td colSpan={2} className="p-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="uppercase tracking-wider text-slate-900">
                      NET SURPLUS / (DEFICIT) CARRIED OVER TO GENERAL RESERVE (B - A):
                    </span>
                    <span className={`font-mono text-sm ${data.netSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {data.netSurplus >= 0 ? `+₹${data.netSurplus.toLocaleString('en-IN')}` : `-₹${Math.abs(data.netSurplus).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Schedule of Bank & Treasury Balances */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="text-[10.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5">
            SCHEDULE OF BANK & TREASURY CASH BALANCES (CLOSING)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {data.accountBalances.map((acc, idx) => (
              <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block truncate">{acc.name}</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 mt-0.5 block">
                  ₹{acc.balance.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-black">
            <span className="text-slate-700 uppercase text-[10px]">TOTAL LIQUID TREASURY RESERVES:</span>
            <span className="font-mono text-slate-950 text-xs">₹{data.totalReserves.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Declaration in Words */}
        <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
          <span className="font-bold text-slate-600 uppercase">Net Surplus in Words: </span>
          <span className="font-extrabold text-slate-900 italic font-serif">
            {data.netSurplus >= 0 ? numberToIndianWords(data.netSurplus) : `Deficit of ${numberToIndianWords(Math.abs(data.netSurplus))}`}
          </span>
        </div>

        {/* Signatures & Certification */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 text-center gap-6">
          <div>
            <div className="h-10"></div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900 text-[11px]">Chief Accountant</p>
              <p className="text-[9px] text-slate-500">Mutt Finance Section</p>
            </div>
          </div>
          <div>
            <div className="h-10"></div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900 text-[11px]">Internal Auditor</p>
              <p className="text-[9px] text-slate-500">Certified Public Auditor</p>
            </div>
          </div>
          <div>
            <div className="h-10"></div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900 text-[11px]">Managing Trustee / President</p>
              <p className="text-[9px] text-slate-500">Board of Trustees</p>
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified Income & Expenditure Statement • Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
