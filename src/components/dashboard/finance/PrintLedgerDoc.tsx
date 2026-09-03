"use client";

import React, { useEffect } from 'react';
import { LedgerReportData } from '@/types/finance';
import { numberToIndianWords } from '@/lib/finance-engine';
import { printHtmlInNewWindow } from '@/lib/print-utils';
import { Printer, X, ArrowLeft } from 'lucide-react';

interface PrintLedgerDocProps {
  data: LedgerReportData;
  onClose: () => void;
}

function buildLedgerHtml(data: LedgerReportData): string {
  const entriesRows = data.entries.length > 0
    ? data.entries.map(entry => `
        <tr>
          <td class="mono">${entry.date}</td>
          <td class="mono">${entry.refNo || '—'}</td>
          <td class="bold">${entry.particulars}</td>
          <td>${entry.category || ''}</td>
          <td class="text-right val-rose">${entry.debit > 0 ? '₹' + entry.debit.toLocaleString('en-IN') : '—'}</td>
          <td class="text-right val-emerald">${entry.credit > 0 ? '₹' + entry.credit.toLocaleString('en-IN') : '—'}</td>
          <td class="text-right bold">₹${entry.balance.toLocaleString('en-IN')}</td>
        </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:20pt;color:#94a3b8;font-style:italic;">No ledger entries recorded during this selected date range.</td></tr>`;

  return `
    <div class="screen-toolbar">
      <div class="toolbar-left">
        <div>
          <div class="doc-title">📗 General Ledger — Preview</div>
          <div class="doc-subtitle">A4 Optimized • ${data.periodLabel} • Ready to Print or Save as PDF</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn-print" style="background:linear-gradient(135deg,#10b981,#0d9488);" onclick="window.print()">
          🖨&nbsp; Print / Save as PDF
        </button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>
    </div>

    <div class="paper-wrapper">
      <div class="document">

        <div class="doc-header">
          <div class="doc-badge badge-emerald">Official General Ledger Book</div>
          <div class="org-name">${data.orgName || 'Mathaji Ulsooramma Sri Raghavendra Swamy Mutt'}</div>
          <div class="org-sub">${data.orgSubtitle || 'Vidyaranyapura, Bengaluru - 560097, Karnataka • Ph: 080 4972 3252'}</div>
          <div class="report-title" style="text-decoration-color:#059669;">${data.title || 'GENERAL LEDGER STATEMENT'}</div>
        </div>

        <div class="meta-grid">
          <div>
            <span class="meta-label">Account &amp; Book</span>
            <span class="meta-value">${data.accountName}</span><br/>
            <span style="font-size:9pt;color:#475569;">Period: <strong>${data.periodLabel}</strong> (${data.startDate} to ${data.endDate})</span>
          </div>
          <div class="text-right">
            <span class="meta-label">Report Info</span>
            <span class="meta-value">Accounting: Double-Entry Accrual</span><br/>
            <span style="font-size:9pt;color:#475569;">Printed At: <span style="font-family:monospace;">${data.generatedAt}</span></span>
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-cell">
            <span class="summary-label">Opening Balance</span>
            <span class="summary-value">₹${data.openingBalance.toLocaleString('en-IN')}</span>
          </div>
          <div class="summary-cell">
            <span class="summary-label">Total Debits (-)</span>
            <span class="summary-value val-rose">₹${data.totalDebits.toLocaleString('en-IN')}</span>
          </div>
          <div class="summary-cell">
            <span class="summary-label">Total Credits (+)</span>
            <span class="summary-value val-emerald">₹${data.totalCredits.toLocaleString('en-IN')}</span>
          </div>
          <div class="summary-cell">
            <span class="summary-label">Closing Balance</span>
            <span class="summary-value">₹${data.closingBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Voucher No</th>
              <th>Particulars &amp; Description</th>
              <th>Head of A/C</th>
              <th class="text-right">Debit (-) (₹)</th>
              <th class="text-right">Credit (+) (₹)</th>
              <th class="text-right">Running Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-opening">
              <td class="mono">${data.startDate}</td>
              <td class="mono">—</td>
              <td style="text-transform:uppercase;">To Opening Balance b/f</td>
              <td>Opening Balance</td>
              <td class="text-right" style="color:#94a3b8;">—</td>
              <td class="text-right" style="color:#94a3b8;">—</td>
              <td class="text-right bold">₹${data.openingBalance.toLocaleString('en-IN')}</td>
            </tr>
            ${entriesRows}
            <tr class="row-closing">
              <td colspan="4" style="text-transform:uppercase;letter-spacing:0.06em;font-size:8.5pt;">Totals &amp; Closing Ledger Balance (c/f)</td>
              <td class="text-right val-rose">₹${data.totalDebits.toLocaleString('en-IN')}</td>
              <td class="text-right val-emerald">₹${data.totalCredits.toLocaleString('en-IN')}</td>
              <td class="text-right">₹${data.closingBalance.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="words-box">
          <span class="words-label">Closing Balance in Words: </span>
          <em style="font-size:9pt;color:#1e293b;">${numberToIndianWords(data.closingBalance)}</em>
        </div>

        <div class="sig-row">
          <div>
            <div class="sig-line"></div>
            <div class="sig-name">Prepared by</div>
            <div class="sig-role">Chief Accountant</div>
          </div>
          <div>
            <div class="sig-line"></div>
            <div class="sig-name">Audited by</div>
            <div class="sig-role">Honorary Chartered Accountant</div>
          </div>
          <div>
            <div class="sig-line"></div>
            <div class="sig-name">Sanctioned by</div>
            <div class="sig-role">Managing Trustee / President</div>
          </div>
        </div>

        <div class="doc-footer">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified A4 General Ledger Report</span>
        </div>
      </div>
    </div>`;
}

export default function PrintLedgerDoc({ data, onClose }: PrintLedgerDocProps) {
  const handlePrint = () => {
    printHtmlInNewWindow(buildLedgerHtml(data), `General Ledger — ${data.periodLabel}`);
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
              <Printer size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">General Ledger Report Preview</div>
              <div className="text-[11px] text-slate-400 leading-tight">A4 Optimized · {data.periodLabel}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-sm font-black shadow-lg cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
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
      <div className="bg-emerald-950/30 border-b border-emerald-800/40 px-4 sm:px-8 py-2 text-[11px] text-emerald-300 flex items-center gap-2">
        <Printer size={12} />
        <span>Click <strong>"🖨 Print / Save PDF"</strong> — a clean print window opens with the full A4 report. Use your browser's print dialog to print or save as PDF.</span>
      </div>

      {/* ── On-screen A4 Preview ── */}
      <div className="w-full flex justify-center py-8 px-2 sm:px-6">
        <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 sm:p-12 rounded-2xl shadow-2xl border border-gray-200 text-xs leading-relaxed" style={{ color: '#0f172a' }}>

          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <div className="inline-block px-3 py-0.5 mb-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-[10px] tracking-widest uppercase">
              Official General Ledger Book
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">{data.orgName}</h1>
            <p className="text-xs text-slate-600 font-medium">{data.orgSubtitle}</p>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 underline decoration-emerald-500 decoration-2 underline-offset-4 mt-2">{data.title}</h2>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-300 text-[11px]">
            <div>
              <p className="text-slate-500 font-bold uppercase text-[9px]">Account &amp; Book</p>
              <p className="font-extrabold text-slate-900">{data.accountName}</p>
              <p className="text-slate-600 mt-0.5">Period: <span className="font-bold text-slate-900">{data.periodLabel}</span> ({data.startDate} to {data.endDate})</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-bold uppercase text-[9px]">Report Info</p>
              <p className="font-semibold text-slate-700">Accounting: Double-Entry Accrual</p>
              <p className="text-slate-600 mt-0.5">Printed At: <span className="font-mono text-slate-800">{data.generatedAt}</span></p>
            </div>
          </div>

          {/* Totals Box */}
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

          {/* Table */}
          <table className="w-full text-left border-collapse text-[10.5px] mt-4">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-2.5 w-20">Date</th>
                <th className="py-2.5 px-2 w-24">Voucher No</th>
                <th className="py-2.5 px-2">Particulars &amp; Description</th>
                <th className="py-2.5 px-2 w-24">Head of A/C</th>
                <th className="py-2.5 px-2 text-right w-24">Debit (-) (₹)</th>
                <th className="py-2.5 px-2 text-right w-24">Credit (+) (₹)</th>
                <th className="py-2.5 px-2 text-right w-28">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-emerald-50 font-bold">
                <td className="py-2 px-2.5 font-mono">{data.startDate}</td>
                <td className="py-2 px-2 font-mono text-slate-500">—</td>
                <td className="py-2 px-2 text-slate-900 uppercase">To Opening Balance b/f</td>
                <td className="py-2 px-2 text-slate-500">Opening Balance</td>
                <td className="py-2 px-2 text-right text-slate-400 font-mono">—</td>
                <td className="py-2 px-2 text-right text-slate-400 font-mono">—</td>
                <td className="py-2 px-2 text-right font-mono text-slate-950 font-black">₹{data.openingBalance.toLocaleString('en-IN')}</td>
              </tr>
              {data.entries.length > 0 ? (
                data.entries.map((entry, idx) => (
                  <tr key={entry.id || idx} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2.5 font-mono whitespace-nowrap text-slate-700">{entry.date}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600">{entry.refNo}</td>
                    <td className="py-1.5 px-2 text-slate-900 font-medium">{entry.particulars}</td>
                    <td className="py-1.5 px-2 text-slate-600 font-medium">{entry.category}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-rose-700 font-semibold">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-700 font-semibold">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">₹{entry.balance.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">No ledger entries recorded during this selected date range.</td>
                </tr>
              )}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-slate-950">
                <td colSpan={4} className="py-2.5 px-2.5 uppercase tracking-wider text-[10px]">Totals &amp; Closing Ledger Balance (c/f)</td>
                <td className="py-2.5 px-2 text-right font-mono text-rose-800 text-xs">₹{data.totalDebits.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-2 text-right font-mono text-emerald-800 text-xs">₹{data.totalCredits.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-950 text-xs">₹{data.closingBalance.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
            <span className="font-bold text-slate-600 uppercase">Closing Balance in Words: </span>
            <span className="font-extrabold text-slate-900 italic font-serif">{numberToIndianWords(data.closingBalance)}</span>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 text-center gap-6">
            <div><div className="h-10" /><div className="border-t border-slate-400 pt-1"><p className="font-bold text-slate-900 text-[11px]">Prepared by</p><p className="text-[9px] text-slate-500">Chief Accountant</p></div></div>
            <div><div className="h-10" /><div className="border-t border-slate-400 pt-1"><p className="font-bold text-slate-900 text-[11px]">Audited by</p><p className="text-[9px] text-slate-500">Honorary Chartered Accountant</p></div></div>
            <div><div className="h-10" /><div className="border-t border-slate-400 pt-1"><p className="font-bold text-slate-900 text-[11px]">Sanctioned by</p><p className="text-[9px] text-slate-500">Managing Trustee / President</p></div></div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
            <span>Certified A4 General Ledger Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
