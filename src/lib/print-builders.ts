/**
 * Pure HTML-string builders for each report type.
 * These are called by the finance page's direct print handlers.
 * The resulting HTML is fed into printHtmlInNewWindow() which opens a clean
 * browser window with inline CSS and calls window.print() on it.
 *
 * No React, no Tailwind, no dashboard CSS — just plain HTML + inline styles.
 */

import { numberToIndianWords } from '@/lib/finance-engine';
import { CashBookReportData, LedgerReportData, FormalStatementData } from '@/types/finance';

// ─── Shared inline CSS injected into every print document ───────────────────
export const PRINT_SHARED_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 10pt;
    color: #0f172a;
    background: #f1f5f9;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .screen-toolbar {
    position: sticky; top: 0; z-index: 999;
    background: #0f172a; padding: 10px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }
  .doc-title { color: #f1f5f9; font-size: 13px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .doc-subtitle { color: #64748b; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .btn-print {
    background: linear-gradient(135deg, #f59e0b, #ea580c);
    color: #0f172a; border: none; padding: 10px 24px;
    border-radius: 10px; font-size: 14px; font-weight: 900;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    letter-spacing: 0.02em;
  }
  .btn-print:hover { opacity: 0.88; }
  .btn-close {
    background: #1e293b; color: #94a3b8; border: 1px solid #334155;
    padding: 9px 16px; border-radius: 10px; font-size: 12px; font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; cursor: pointer;
  }
  .btn-close:hover { background: #334155; color: #f1f5f9; }
  .paper-wrapper { padding: 28px 16px 56px; display: flex; justify-content: center; }
  .document {
    background: #ffffff; color: #0f172a;
    width: 210mm; max-width: 100%;
    padding: 16mm 14mm;
    box-shadow: 0 4px 32px rgba(0,0,0,0.18);
    border-radius: 6px; font-size: 10pt; line-height: 1.5;
  }
  h1 { font-size: 16pt; font-weight: 900; letter-spacing: 0.02em; text-transform: uppercase; }
  h2 { font-size: 11pt; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .doc-header { text-align: center; padding-bottom: 10pt; border-bottom: 2pt solid #0f172a; }
  .doc-badge {
    display: inline-block; padding: 2px 10px; border-radius: 20px;
    font-size: 7pt; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6pt;
  }
  .badge-amber { background: #fef3c7; border: 1px solid #d97706; color: #78350f; }
  .badge-emerald { background: #d1fae5; border: 1px solid #059669; color: #064e3b; }
  .badge-teal { background: #ccfbf1; border: 1px solid #0d9488; color: #134e4a; }
  .org-name { font-size: 15pt; font-weight: 900; color: #0f172a; }
  .org-sub { font-size: 9pt; color: #475569; margin-top: 3pt; }
  .report-title { font-size: 11pt; font-weight: 900; text-decoration: underline; text-underline-offset: 4pt; margin-top: 8pt; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; padding: 8pt 0; border-bottom: 1pt solid #cbd5e1; font-size: 9pt; }
  .meta-label { font-size: 7pt; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; display: block; margin-bottom: 2pt; }
  .meta-value { font-weight: 800; color: #0f172a; }
  .text-right { text-align: right; }
  .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1pt solid #e2e8f0; border-radius: 6pt; margin: 8pt 0; overflow: hidden; }
  .summary-cell { text-align: center; padding: 6pt 4pt; background: #f8fafc; border-right: 1pt solid #e2e8f0; }
  .summary-cell:last-child { border-right: none; }
  .summary-label { font-size: 7pt; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em; display: block; margin-bottom: 2pt; }
  .summary-value { font-size: 10pt; font-weight: 900; font-family: 'Courier New', monospace; color: #0f172a; }
  .val-emerald { color: #065f46; } .val-rose { color: #9f1239; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 8pt; }
  thead tr { background: #0f172a; color: #ffffff; font-size: 7.5pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; }
  thead th { padding: 6pt 5pt; text-align: left; }
  thead th.text-right { text-align: right; }
  tbody tr { border-bottom: 0.5pt solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 5pt 5pt; font-size: 9pt; vertical-align: top; color: #1e293b; }
  tbody td.text-right { text-align: right; font-family: 'Courier New', monospace; }
  tbody td.mono { font-family: 'Courier New', monospace; }
  tbody td.bold { font-weight: 700; }
  tbody td.val-emerald { color: #065f46; font-weight: 700; }
  tbody td.val-rose { color: #9f1239; font-weight: 700; }
  tr.row-opening { background: #fef9c3 !important; font-weight: 900; }
  tr.row-closing { background: #f1f5f9 !important; font-weight: 900; border-top: 2pt solid #0f172a; }
  .words-box { margin-top: 8pt; padding: 5pt 8pt; background: #f8fafc; border: 0.5pt solid #e2e8f0; border-radius: 4pt; font-size: 8.5pt; }
  .words-label { font-weight: 900; text-transform: uppercase; font-size: 7.5pt; color: #64748b; }
  .sig-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20pt; margin-top: 40pt; padding-top: 12pt; border-top: 1pt solid #cbd5e1; text-align: center; }
  .sig-line { border-top: 1pt solid #94a3b8; padding-top: 4pt; margin-top: 24pt; }
  .sig-name { font-size: 9pt; font-weight: 700; color: #0f172a; }
  .sig-role { font-size: 7.5pt; color: #64748b; margin-top: 1pt; }
  .ie-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; margin-top: 10pt; }
  .ie-col { border: 1pt solid #e2e8f0; border-radius: 4pt; overflow: hidden; }
  .ie-col-header { padding: 6pt 8pt; font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
  .ie-col-header.exp { background: #fff1f2; color: #9f1239; border-bottom: 1pt solid #fecdd3; }
  .ie-col-header.inc { background: #f0fdf4; color: #065f46; border-bottom: 1pt solid #bbf7d0; }
  .ie-row { display: flex; justify-content: space-between; padding: 4pt 8pt; border-bottom: 0.5pt solid #f1f5f9; font-size: 9pt; }
  .ie-row.total { font-weight: 900; background: #f8fafc; border-top: 1pt solid #e2e8f0; border-bottom: none; }
  .bal-row { display: flex; justify-content: space-between; padding: 4pt 6pt; border-bottom: 0.5pt solid #f1f5f9; font-size: 8.5pt; }
  .bal-row.total { font-weight: 900; background: #f1f5f9; border-top: 1pt solid #cbd5e1; border-bottom: none; }
  .doc-footer { margin-top: 20pt; padding-top: 6pt; border-top: 0.5pt solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #94a3b8; }
  @media print {
    @page { size: A4 portrait; margin: 10mm 10mm 15mm 10mm; }
    body { background: #ffffff; }
    .screen-toolbar { display: none !important; }
    .paper-wrapper { padding: 0; }
    .document { box-shadow: none; border-radius: 0; width: 100%; max-width: 100%; padding: 0; }
    table { page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; page-break-after: auto; }
  }
`;

// ─── Cash Book ───────────────────────────────────────────────────────────────
export function buildCashBookHtml(data: CashBookReportData): string {
  const entriesRows = data.entries.length > 0
    ? data.entries.map(entry => `
        <tr>
          <td class="mono">${entry.date}</td>
          <td class="mono">${entry.refNo || '—'}</td>
          <td class="bold">${entry.particulars}</td>
          <td>${entry.category || ''}</td>
          <td class="text-right val-rose">${entry.outflow > 0 ? '₹' + entry.outflow.toLocaleString('en-IN') : '—'}</td>
          <td class="text-right val-emerald">${entry.inflow > 0 ? '₹' + entry.inflow.toLocaleString('en-IN') : '—'}</td>
          <td class="text-right bold">₹${entry.balance.toLocaleString('en-IN')}</td>
        </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:20pt;color:#94a3b8;font-style:italic;">No cash transactions recorded during this selected date range.</td></tr>`;

  return `
    <div class="screen-toolbar">
      <div>
        <div class="doc-title">📒 Cash Book Report — Preview</div>
        <div class="doc-subtitle">A4 Optimized &bull; ${data.periodLabel} &bull; ${data.startDate} to ${data.endDate}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn-print" onclick="window.print()">🖨️&nbsp; Print / Save as PDF</button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>
    </div>
    <div class="paper-wrapper">
      <div class="document">
        <div class="doc-header">
          <div class="doc-badge badge-amber">Official Mutt Accounting Document</div>
          <div class="org-name">${data.orgName}</div>
          <div class="org-sub">${data.orgSubtitle}</div>
          <div class="report-title" style="text-decoration-color:#d97706;">${data.title}</div>
        </div>
        <div class="meta-grid">
          <div>
            <span class="meta-label">Account &amp; Book</span>
            <span class="meta-value">${data.accountName}</span><br/>
            <span style="font-size:9pt;color:#475569;">Period: <strong>${data.periodLabel}</strong> (${data.startDate} to ${data.endDate})</span>
          </div>
          <div class="text-right">
            <span class="meta-label">Report Info</span>
            <span class="meta-value">Currency: INR (₹)</span><br/>
            <span style="font-size:9pt;color:#475569;">Printed At: <span style="font-family:monospace;">${data.generatedAt}</span></span>
          </div>
        </div>
        <div class="summary-box">
          <div class="summary-cell"><span class="summary-label">Opening Cash</span><span class="summary-value">₹${data.openingBalance.toLocaleString('en-IN')}</span></div>
          <div class="summary-cell"><span class="summary-label">Cash Receipts (+)</span><span class="summary-value val-emerald">+₹${data.totalInflows.toLocaleString('en-IN')}</span></div>
          <div class="summary-cell"><span class="summary-label">Cash Payments (-)</span><span class="summary-value val-rose">-₹${data.totalOutflows.toLocaleString('en-IN')}</span></div>
          <div class="summary-cell"><span class="summary-label">Closing Cash</span><span class="summary-value">₹${data.closingBalance.toLocaleString('en-IN')}</span></div>
        </div>
        <table>
          <thead><tr>
            <th>Date</th><th>Voucher No</th><th>Particulars &amp; Description</th><th>Account Head</th>
            <th class="text-right">Cash Outflow (-)</th><th class="text-right">Cash Inflow (+)</th><th class="text-right">Running Balance</th>
          </tr></thead>
          <tbody>
            <tr class="row-opening">
              <td class="mono">${data.startDate}</td><td class="mono">—</td>
              <td style="text-transform:uppercase;">To Opening Balance b/f</td><td>Opening Balance</td>
              <td class="text-right" style="color:#94a3b8;">—</td><td class="text-right" style="color:#94a3b8;">—</td>
              <td class="text-right bold">₹${data.openingBalance.toLocaleString('en-IN')}</td>
            </tr>
            ${entriesRows}
            <tr class="row-closing">
              <td colspan="4" style="text-transform:uppercase;letter-spacing:0.06em;font-size:8.5pt;">Totals &amp; Closing Cash Balance (c/f)</td>
              <td class="text-right val-rose">₹${data.totalOutflows.toLocaleString('en-IN')}</td>
              <td class="text-right val-emerald">₹${data.totalInflows.toLocaleString('en-IN')}</td>
              <td class="text-right bold">₹${data.closingBalance.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div class="words-box"><span class="words-label">Closing Balance in Words: </span><em>${numberToIndianWords(data.closingBalance)}</em></div>
        <div class="sig-row">
          <div><div class="sig-line"></div><div class="sig-name">Prepared by</div><div class="sig-role">Treasury Accountant</div></div>
          <div><div class="sig-line"></div><div class="sig-name">Verified by</div><div class="sig-role">Internal Auditor</div></div>
          <div><div class="sig-line"></div><div class="sig-name">Approved by</div><div class="sig-role">Managing Trustee / President</div></div>
        </div>
        <div class="doc-footer">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified A4 Cash Book Statement</span>
        </div>
      </div>
    </div>`;
}

// ─── General Ledger / Bank Book ──────────────────────────────────────────────
export function buildLedgerHtml(data: LedgerReportData): string {
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
    : `<tr><td colspan="7" style="text-align:center;padding:20pt;color:#94a3b8;font-style:italic;">No entries recorded during this selected date range.</td></tr>`;

  const isBank = data.title?.toLowerCase().includes('bank');
  const accentColor = isBank ? '#1d4ed8' : '#059669';
  const badgeClass = isBank ? 'badge-emerald' : 'badge-emerald';
  const badgeLabel = isBank ? 'Official Bank Book' : 'Official General Ledger Book';

  return `
    <div class="screen-toolbar">
      <div>
        <div class="doc-title">📗 ${isBank ? 'Bank Book' : 'General Ledger'} — Preview</div>
        <div class="doc-subtitle">A4 Optimized &bull; ${data.periodLabel} &bull; ${data.startDate} to ${data.endDate}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn-print" style="background:linear-gradient(135deg,${isBank ? '#1d4ed8,#0891b2' : '#10b981,#0d9488'});" onclick="window.print()">🖨️&nbsp; Print / Save as PDF</button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>
    </div>
    <div class="paper-wrapper">
      <div class="document">
        <div class="doc-header">
          <div class="doc-badge ${badgeClass}">${badgeLabel}</div>
          <div class="org-name">${data.orgName}</div>
          <div class="org-sub">${data.orgSubtitle}</div>
          <div class="report-title" style="text-decoration-color:${accentColor};">${data.title}</div>
        </div>
        <div class="meta-grid">
          <div>
            <span class="meta-label">Account &amp; Book</span>
            <span class="meta-value">${data.accountName}</span><br/>
            <span style="font-size:9pt;color:#475569;">Period: <strong>${data.periodLabel}</strong> (${data.startDate} to ${data.endDate})</span>
          </div>
          <div class="text-right">
            <span class="meta-label">Report Info</span>
            <span class="meta-value">${isBank ? 'Banking: UTR / IMPS / NEFT Tracking' : 'Accounting: Double-Entry Accrual'}</span><br/>
            <span style="font-size:9pt;color:#475569;">Printed At: <span style="font-family:monospace;">${data.generatedAt}</span></span>
          </div>
        </div>
        <div class="summary-box">
          <div class="summary-cell"><span class="summary-label">Opening Balance</span><span class="summary-value">₹${data.openingBalance.toLocaleString('en-IN')}</span></div>
          <div class="summary-cell"><span class="summary-label">Total Debits (-)</span><span class="summary-value val-rose">₹${data.totalDebits.toLocaleString('en-IN')}</span></div>
          <div class="summary-cell"><span class="summary-label">Total Credits (+)</span><span class="summary-value val-emerald">₹${data.totalCredits.toLocaleString('en-IN')}</span></div>
          <div class="summary-cell"><span class="summary-label">Closing Balance</span><span class="summary-value">₹${data.closingBalance.toLocaleString('en-IN')}</span></div>
        </div>
        <table>
          <thead><tr>
            <th>Date</th><th>Voucher No</th><th>Particulars &amp; Description</th><th>Head of A/C</th>
            <th class="text-right">Debit (-) (₹)</th><th class="text-right">Credit (+) (₹)</th><th class="text-right">Running Balance (₹)</th>
          </tr></thead>
          <tbody>
            <tr class="row-opening">
              <td class="mono">${data.startDate}</td><td class="mono">—</td>
              <td style="text-transform:uppercase;">To Opening Balance b/f</td><td>Opening Balance</td>
              <td class="text-right" style="color:#94a3b8;">—</td><td class="text-right" style="color:#94a3b8;">—</td>
              <td class="text-right bold">₹${data.openingBalance.toLocaleString('en-IN')}</td>
            </tr>
            ${entriesRows}
            <tr class="row-closing">
              <td colspan="4" style="text-transform:uppercase;letter-spacing:0.06em;font-size:8.5pt;">Totals &amp; Closing Balance (c/f)</td>
              <td class="text-right val-rose">₹${data.totalDebits.toLocaleString('en-IN')}</td>
              <td class="text-right val-emerald">₹${data.totalCredits.toLocaleString('en-IN')}</td>
              <td class="text-right bold">₹${data.closingBalance.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div class="words-box"><span class="words-label">Closing Balance in Words: </span><em>${numberToIndianWords(data.closingBalance)}</em></div>
        <div class="sig-row">
          <div><div class="sig-line"></div><div class="sig-name">Prepared by</div><div class="sig-role">Chief Accountant</div></div>
          <div><div class="sig-line"></div><div class="sig-name">Audited by</div><div class="sig-role">Honorary Chartered Accountant</div></div>
          <div><div class="sig-line"></div><div class="sig-name">Sanctioned by</div><div class="sig-role">Managing Trustee / President</div></div>
        </div>
        <div class="doc-footer">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified A4 ${isBank ? 'Bank Book' : 'General Ledger'} Report</span>
        </div>
      </div>
    </div>`;
}

// ─── Formal Income & Expenditure Statement ───────────────────────────────────
export function buildFormalStatementHtml(data: FormalStatementData): string {
  const expRows = data.expenseCategories.length > 0
    ? data.expenseCategories.map(item => `
        <div class="ie-row"><span>To ${item.category} Expenses</span><span style="font-family:monospace;font-weight:700;">₹${item.amount.toLocaleString('en-IN')}</span></div>`).join('')
    : `<div class="ie-row" style="color:#94a3b8;font-style:italic;justify-content:center;">No expenditure in this period</div>`;

  const incRows = data.incomeCategories.length > 0
    ? data.incomeCategories.map(item => `
        <div class="ie-row"><span>By ${item.category} Receipts</span><span style="font-family:monospace;font-weight:700;">₹${item.amount.toLocaleString('en-IN')}</span></div>`).join('')
    : `<div class="ie-row" style="color:#94a3b8;font-style:italic;justify-content:center;">No receipts in this period</div>`;

  const balRows = data.accountBalances.map(acc => `
    <div class="bal-row"><span>${acc.name}</span><span style="font-family:monospace;font-weight:700;">₹${acc.balance.toLocaleString('en-IN')}</span></div>`).join('');

  const surplus = data.netSurplus;
  const surplusSign = surplus >= 0 ? '+' : '-';
  const surplusColor = surplus >= 0 ? '#065f46' : '#9f1239';
  const surplusWord = surplus >= 0 ? 'SURPLUS' : 'DEFICIT';
  const surplusInWords = surplus >= 0
    ? numberToIndianWords(surplus)
    : `Deficit of ${numberToIndianWords(Math.abs(surplus))}`;

  return `
    <div class="screen-toolbar">
      <div>
        <div class="doc-title">📊 Formal Statement — Preview</div>
        <div class="doc-subtitle">A4 Optimized &bull; ${data.periodLabel} &bull; ${data.startDate} to ${data.endDate}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn-print" style="background:linear-gradient(135deg,#0d9488,#059669);" onclick="window.print()">🖨️&nbsp; Print / Save as PDF</button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>
    </div>
    <div class="paper-wrapper">
      <div class="document">
        <div class="doc-header">
          <div class="doc-badge badge-teal">Religious &amp; Charitable Trust Accounts</div>
          <div class="org-name">${data.orgName}</div>
          <div class="org-sub">${data.orgSubtitle}</div>
          <div class="report-title" style="text-decoration-color:#0d9488;">${data.title}</div>
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

        <div class="ie-grid">
          <div class="ie-col">
            <div class="ie-col-header exp">EXPENDITURE (OUTFLOWS) — Dr</div>
            ${expRows}
            <div class="ie-row total"><span style="text-transform:uppercase;font-size:8.5pt;">TOTAL EXPENDITURE (A)</span><span style="font-family:monospace;color:#9f1239;">₹${data.totalExpenses.toLocaleString('en-IN')}</span></div>
          </div>
          <div class="ie-col">
            <div class="ie-col-header inc">INCOME &amp; RECEIPTS (INFLOWS) — Cr</div>
            ${incRows}
            <div class="ie-row total"><span style="text-transform:uppercase;font-size:8.5pt;">TOTAL INCOME (B)</span><span style="font-family:monospace;color:#065f46;">₹${data.totalIncome.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div style="margin-top:10pt;padding:8pt 12pt;background:#f8fafc;border:1.5pt solid #0f172a;border-radius:4pt;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:9.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;">NET ${surplusWord} CARRIED TO GENERAL RESERVE (B − A):</span>
          <span style="font-family:monospace;font-size:13pt;font-weight:900;color:${surplusColor};">${surplusSign}₹${Math.abs(surplus).toLocaleString('en-IN')}</span>
        </div>

        <div style="margin-top:14pt;padding:10pt 12pt;background:#f8fafc;border:1pt solid #e2e8f0;border-radius:6pt;">
          <div style="font-size:8.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#0f172a;border-bottom:1pt solid #e2e8f0;padding-bottom:6pt;margin-bottom:6pt;">
            SCHEDULE OF BANK &amp; TREASURY CASH BALANCES (CLOSING)
          </div>
          ${balRows}
          <div class="bal-row total">
            <span style="text-transform:uppercase;font-size:8pt;">Total Liquid Treasury Reserves:</span>
            <span style="font-family:monospace;font-size:10.5pt;">₹${data.totalReserves.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="words-box" style="margin-top:8pt;"><span class="words-label">Net ${surplus >= 0 ? 'Surplus' : 'Deficit'} in Words: </span><em>${surplusInWords}</em></div>

        <div class="sig-row">
          <div><div class="sig-line"></div><div class="sig-name">Chief Accountant</div><div class="sig-role">Mutt Finance Section</div></div>
          <div><div class="sig-line"></div><div class="sig-name">Internal Auditor</div><div class="sig-role">Certified Public Auditor</div></div>
          <div><div class="sig-line"></div><div class="sig-name">Managing Trustee / President</div><div class="sig-role">Board of Trustees</div></div>
        </div>
        <div class="doc-footer">
          <span>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting System</span>
          <span>Certified Income &amp; Expenditure Statement</span>
        </div>
      </div>
    </div>`;
}
