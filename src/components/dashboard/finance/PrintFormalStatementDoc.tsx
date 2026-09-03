"use client";

import React, { useEffect } from 'react';
import { FormalStatementData } from '@/types/finance';
import { numberToIndianWords } from '@/lib/finance-engine';
import { printHtmlInNewWindow } from '@/lib/print-utils';
import { Printer, X, ArrowLeft } from 'lucide-react';

interface PrintFormalStatementDocProps {
  data: FormalStatementData;
  onClose: () => void;
}

function buildFormalStatementHtml(data: FormalStatementData): string {
  const expRows = data.expenseCategories.length > 0
    ? data.expenseCategories.map(item => `
        <div class="ie-row">
          <span>To ${item.category} Expenses</span>
          <span style="font-family:monospace;font-weight:700;">₹${item.amount.toLocaleString('en-IN')}</span>
        </div>`).join('')
    : `<div class="ie-row" style="color:#94a3b8;font-style:italic;justify-content:center;">No expenditure in this period</div>`;

  const incRows = data.incomeCategories.length > 0
    ? data.incomeCategories.map(item => `
        <div class="ie-row">
          <span>By ${item.category} Receipts</span>
          <span style="font-family:monospace;font-weight:700;">₹${item.amount.toLocaleString('en-IN')}</span>
        </div>`).join('')
    : `<div class="ie-row" style="color:#94a3b8;font-style:italic;justify-content:center;">No receipts in this period</div>`;

  const balRows = data.accountBalances.map(acc => `
    <div class="bal-row">
      <span>${acc.name}</span>
      <span style="font-family:monospace;font-weight:700;">₹${acc.balance.toLocaleString('en-IN')}</span>
    </div>`).join('');

  const surplusSign = data.netSurplus >= 0 ? '+' : '-';
  const surplusColor = data.netSurplus >= 0 ? '#065f46' : '#9f1239';

  return `
    <div class="screen-toolbar">
      <div class="toolbar-left">
        <div>
          <div class="doc-title">📊 Formal Statement — Preview</div>
          <div class="doc-subtitle">A4 Optimized • ${data.periodLabel} • Ready to Print or Save as PDF</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn-print" style="background:linear-gradient(135deg,#0d9488,#059669);" onclick="window.print()">
          🖨&nbsp; Print / Save as PDF
        </button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>
    </div>

    <div class="paper-wrapper">
      <div class="document">

        <div class="doc-header">
          <div class="doc-badge badge-teal">Religious &amp; Charitable Trust Accounts</div>
          <div class="org-name">${data.orgName || 'Mathaji Ulsooramma Sri Raghavendra Swamy Mutt'}</div>
          <div class="org-sub">${data.orgSubtitle || 'Vidyaranyapura, Bengaluru - 560097, Karnataka • Ph: 080 4972 3252'}</div>
          <div class="report-title" style="text-decoration-color:#0d9488;">${data.title || 'STATEMENT OF INCOME &amp; EXPENDITURE'}</div>
        </div>

        <div class="meta-grid">
          <div>
            <span class="meta-label">Financial Period</span>
            <span class="meta-value">${data.periodLabel}</span><br/>
            <span style="font-size:9pt;color:#475569;">Date Range: <strong>${data.startDate}</strong> to <strong>${data.endDate}</strong></span>
          </div>
          <div class="text-right">
            <span class="meta-label">Reporting Standard</span>
            <span class="meta-value">Indian Trust &amp; Religious Institutions Format</span><br/>
            <span style="font-size:9pt;color:#475569;">Generated: <span style="font-family:monospace;">${data.generatedAt}</span></span>
          </div>
        </div>

        <!-- Income & Expenditure Side-by-Side -->
        <div class="ie-grid">
          <div class="ie-col">
            <div class="ie-col-header exp">EXPENDITURE (OUTFLOWS) — Dr</div>
            ${expRows}
            <div class="ie-row" style="font-weight:900;background:#fff1f2;border-top:1pt solid #fecdd3;">
              <span style="text-transform:uppercase;font-size:8.5pt;">TOTAL EXPENDITURE (A)</span>
              <span style="font-family:monospace;color:#9f1239;">₹${data.totalExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div class="ie-col">
            <div class="ie-col-header inc">INCOME &amp; RECEIPTS (INFLOWS) — Cr</div>
            ${incRows}
            <div class="ie-row" style="font-weight:900;background:#f0fdf4;border-top:1pt solid #bbf7d0;">
              <span style="text-transform:uppercase;font-size:8.5pt;">TOTAL INCOME (B)</span>
              <span style="font-family:monospace;color:#065f46;">₹${data.totalIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Net Surplus/Deficit -->
        <div style="margin-top:10pt;padding:8pt 12pt;background:#f8fafc;border:1.5pt solid #0f172a;border-radius:4pt;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:9.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;color:#0f172a;">
            NET ${data.netSurplus >= 0 ? 'SURPLUS' : 'DEFICIT'} CARRIED TO GENERAL RESERVE (B − A):
          </span>
          <span style="font-family:monospace;font-size:13pt;font-weight:900;color:${surplusColor};">
            ${surplusSign}₹${Math.abs(data.netSurplus).toLocaleString('en-IN')}
          </span>
        </div>

        <!-- Schedule of Bank Balances -->
        <div style="margin-top:14pt;padding:10pt 12pt;background:#f8fafc;border:1pt solid #e2e8f0;border-radius:6pt;">
          <div style="font-size:8.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#0f172a;border-bottom:1pt solid #e2e8f0;padding-bottom:6pt;margin-bottom:6pt;">
            SCHEDULE OF BANK &amp; TREASURY CASH BALANCES (CLOSING)
          </div>
          ${balRows}
          <div class="bal-row total">
            <span style="text-transform:uppercase;font-size:8pt;letter-spacing:0.06em;">Total Liquid Treasury Reserves:</span>
            <span style="font-family:monospace;font-size:10.5pt;">₹${data.totalReserves.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Net in Words -->
        <div class="words-box" style="margin-top:8pt;">
          <span class="words-label">Net ${data.netSurplus >= 0 ? 'Surplus' : 'Deficit'} in Words: </span>
          <em style="font-size:9pt;color:#1e293b;">${data.netSurplus >= 0
            ? numberToIndianWords(data.netSurplus)
            : `Deficit of ${numberToIndianWords(Math.abs(data.netSurplus))}`}</em>
        </div>

        <div class="sig-row">
          <div>
            <div class="sig-line"></div>
            <div class="sig-name">Chief Accountant</div>
            <div class="sig-role">Mutt Finance Section</div>
          </div>
          <div>
            <div class="sig-line"></div>
            <div class="sig-name">Internal Auditor</div>
            <div class="sig-role">Certified Public Auditor</div>
          </div>
          <div>
            <div class="sig-line"></div>
            <div class="sig-name">Managing Trustee / President</div>
            <div class="sig-role">Board of Trustees</div>
          </div>
        </div>

        <div class="doc-footer">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified Income &amp; Expenditure Statement</span>
        </div>
      </div>
    </div>`;
}

export default function PrintFormalStatementDoc({ data, onClose }: PrintFormalStatementDocProps) {
  const handlePrint = () => {
    printHtmlInNewWindow(buildFormalStatementHtml(data), `Formal Statement — ${data.periodLabel}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* ── Sticky Toolbar (scroll-relative, never covered by dashboard navbar) ── */}
      <div className="sticky top-0 z-[10000] bg-slate-900 border-b border-slate-700 shadow-2xl px-4 sm:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Finance</span>
          </button>
          <div className="h-5 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
              <Printer size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Formal Statement Preview</div>
              <div className="text-[11px] text-slate-400 leading-tight">A4 Optimized · Statement of Income &amp; Expenditure · {data.periodLabel}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-xl text-sm font-black shadow-lg cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
          >
            <Printer size={16} />
            <span>🖨 Print / Save PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer border border-slate-700"
            title="Close Preview (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Info Bar ── */}
      <div className="bg-teal-950/30 border-b border-teal-800/40 px-4 sm:px-8 py-2 text-[11px] text-teal-300 flex items-center gap-2">
        <Printer size={12} />
        <span>Click <strong>"🖨 Print / Save PDF"</strong> — a clean print window opens with the full A4 report. Use your browser's print dialog to print or save as PDF.</span>
      </div>

      {/* ── On-screen A4 Preview ── */}
      <div className="w-full flex justify-center py-8 px-2 sm:px-6">
        <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 sm:p-12 rounded-2xl shadow-2xl border border-gray-200 text-xs leading-relaxed" style={{ color: '#0f172a' }}>

          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <div className="inline-block px-3 py-0.5 mb-1 rounded-full bg-teal-50 border border-teal-300 text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">
              Religious &amp; Charitable Trust Accounts
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">{data.orgName}</h1>
            <p className="text-xs text-slate-600 font-medium">{data.orgSubtitle}</p>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 underline decoration-teal-600 decoration-2 underline-offset-4 mt-2">{data.title}</h2>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-300 text-[11px]">
            <div>
              <p className="text-slate-500 font-bold uppercase text-[9px]">Financial Period</p>
              <p className="font-extrabold text-slate-900">{data.periodLabel}</p>
              <p className="text-slate-600 mt-0.5">Date Range: <span className="font-bold text-slate-900">{data.startDate} to {data.endDate}</span></p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-bold uppercase text-[9px]">Reporting Standard</p>
              <p className="font-semibold text-slate-700">Indian Trust &amp; Religious Institutions Format</p>
              <p className="text-slate-600 mt-0.5">Generated: <span className="font-mono text-slate-800">{data.generatedAt}</span></p>
            </div>
          </div>

          {/* Income & Expenditure table */}
          <div className="mt-4 border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[9.5px] tracking-wider">
                  <th className="py-2.5 px-3 w-1/2 border-r border-slate-700">EXPENDITURE (OUTFLOWS)</th>
                  <th className="py-2.5 px-3 w-1/2">INCOME &amp; RECEIPTS (INFLOWS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 align-top">
                <tr>
                  <td className="p-3 border-r border-slate-200">
                    <div className="space-y-2">
                      {data.expenseCategories.length > 0 ? data.expenseCategories.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                          <span className="text-slate-800 font-medium">To {item.category} Expenses</span>
                          <span className="font-mono font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                      )) : <p className="text-slate-400 italic py-3 text-center">No expenditure recorded in this period.</p>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-2">
                      {data.incomeCategories.length > 0 ? data.incomeCategories.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                          <span className="text-slate-800 font-medium">By {item.category} Receipts</span>
                          <span className="font-mono font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                      )) : <p className="text-slate-400 italic py-3 text-center">No receipts recorded in this period.</p>}
                    </div>
                  </td>
                </tr>
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
                <tr className="bg-amber-50 font-black border-t border-slate-300">
                  <td colSpan={2} className="p-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="uppercase tracking-wider text-slate-900">
                        NET {data.netSurplus >= 0 ? 'SURPLUS' : 'DEFICIT'} CARRIED OVER TO GENERAL RESERVE (B − A):
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

          {/* Schedule of Balances */}
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-[10.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5">
              SCHEDULE OF BANK &amp; TREASURY CASH BALANCES (CLOSING)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {data.accountBalances.map((acc, idx) => (
                <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block truncate">{acc.name}</span>
                  <span className="font-mono font-extrabold text-xs text-slate-900 mt-0.5 block">₹{acc.balance.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-black">
              <span className="text-slate-700 uppercase text-[10px]">TOTAL LIQUID TREASURY RESERVES:</span>
              <span className="font-mono text-slate-950 text-xs">₹{data.totalReserves.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Amount in words */}
          <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
            <span className="font-bold text-slate-600 uppercase">Net {data.netSurplus >= 0 ? 'Surplus' : 'Deficit'} in Words: </span>
            <span className="font-extrabold text-slate-900 italic font-serif">
              {data.netSurplus >= 0 ? numberToIndianWords(data.netSurplus) : `Deficit of ${numberToIndianWords(Math.abs(data.netSurplus))}`}
            </span>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 text-center gap-6">
            <div><div className="h-10" /><div className="border-t border-slate-400 pt-1"><p className="font-bold text-slate-900 text-[11px]">Chief Accountant</p><p className="text-[9px] text-slate-500">Mutt Finance Section</p></div></div>
            <div><div className="h-10" /><div className="border-t border-slate-400 pt-1"><p className="font-bold text-slate-900 text-[11px]">Internal Auditor</p><p className="text-[9px] text-slate-500">Certified Public Auditor</p></div></div>
            <div><div className="h-10" /><div className="border-t border-slate-400 pt-1"><p className="font-bold text-slate-900 text-[11px]">Managing Trustee / President</p><p className="text-[9px] text-slate-500">Board of Trustees</p></div></div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
            <span>Certified Income &amp; Expenditure Statement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
