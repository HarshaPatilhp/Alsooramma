/**
 * Opens a pristine new browser window with only the report HTML + inline A4 CSS,
 * then immediately invokes the browser's native print dialog.
 *
 * This approach completely bypasses all Next.js / Tailwind / dashboard CSS conflicts,
 * z-index wars with fixed navbars, and @media print selector leakage.
 */
export function printHtmlInNewWindow(htmlContent: string, title: string): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
    return;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    /* ── Base reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 10pt;
      color: #0f172a;
      background: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Screen toolbar (hidden when printing) ── */
    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #0f172a;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }
    .screen-toolbar .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #94a3b8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
    }
    .screen-toolbar .doc-title {
      color: #f1f5f9;
      font-size: 13px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .screen-toolbar .doc-subtitle {
      color: #64748b;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .btn-print {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #0f172a;
      border: none;
      padding: 9px 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 900;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: opacity 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .btn-print:hover { opacity: 0.88; }
    .btn-close {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
    }
    .btn-close:hover { background: #334155; color: #f1f5f9; }

    /* ── Paper wrapper ── */
    .paper-wrapper {
      padding: 24px 16px 48px;
      display: flex;
      justify-content: center;
    }

    /* ── The A4 document itself ── */
    .document {
      background: #ffffff;
      color: #0f172a;
      width: 210mm;
      max-width: 100%;
      padding: 16mm 14mm;
      box-shadow: 0 4px 32px rgba(0,0,0,0.18);
      border-radius: 6px;
      font-size: 10pt;
      line-height: 1.5;
    }

    /* ── Typography ── */
    h1 { font-size: 16pt; font-weight: 900; letter-spacing: 0.02em; text-transform: uppercase; }
    h2 { font-size: 11pt; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
    p  { font-size: 10pt; }

    /* ── Header section ── */
    .doc-header { text-align: center; padding-bottom: 10pt; border-bottom: 2pt solid #0f172a; }
    .doc-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 7pt;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 6pt;
    }
    .badge-amber { background: #fef3c7; border: 1px solid #d97706; color: #78350f; }
    .badge-emerald { background: #d1fae5; border: 1px solid #059669; color: #064e3b; }
    .badge-teal { background: #ccfbf1; border: 1px solid #0d9488; color: #134e4a; }
    .org-name { font-size: 15pt; font-weight: 900; color: #0f172a; font-family: 'Georgia', serif; }
    .org-sub { font-size: 9pt; color: #475569; margin-top: 3pt; }
    .report-title { font-size: 11pt; font-weight: 900; text-decoration: underline; text-underline-offset: 4pt; margin-top: 8pt; }

    /* ── Metadata row ── */
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; padding: 8pt 0; border-bottom: 1pt solid #cbd5e1; font-size: 9pt; }
    .meta-label { font-size: 7pt; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; display: block; margin-bottom: 2pt; }
    .meta-value { font-weight: 800; color: #0f172a; }
    .text-right { text-align: right; }

    /* ── Summary box ── */
    .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1pt solid #e2e8f0; border-radius: 6pt; margin: 8pt 0; overflow: hidden; }
    .summary-cell { text-align: center; padding: 6pt 4pt; background: #f8fafc; border-right: 1pt solid #e2e8f0; }
    .summary-cell:last-child { border-right: none; }
    .summary-label { font-size: 7pt; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em; display: block; margin-bottom: 2pt; }
    .summary-value { font-size: 10pt; font-weight: 900; font-family: 'Courier New', monospace; color: #0f172a; }
    .val-emerald { color: #065f46; }
    .val-rose { color: #9f1239; }

    /* ── Table ── */
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
    tr.row-closing td { font-size: 9pt; }

    /* ── Amount in words ── */
    .words-box { margin-top: 8pt; padding: 5pt 8pt; background: #f8fafc; border: 0.5pt solid #e2e8f0; border-radius: 4pt; font-size: 8.5pt; }
    .words-label { font-weight: 900; text-transform: uppercase; font-size: 7.5pt; color: #64748b; }

    /* ── Signature section ── */
    .sig-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20pt; margin-top: 40pt; padding-top: 12pt; border-top: 1pt solid #cbd5e1; text-align: center; }
    .sig-line { border-top: 1pt solid #94a3b8; padding-top: 4pt; margin-top: 24pt; }
    .sig-name { font-size: 9pt; font-weight: 700; color: #0f172a; }
    .sig-role { font-size: 7.5pt; color: #64748b; margin-top: 1pt; }

    /* ── Income & Expenditure columns ── */
    .ie-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; margin-top: 10pt; }
    .ie-col { border: 1pt solid #e2e8f0; border-radius: 4pt; overflow: hidden; }
    .ie-col-header { padding: 6pt 8pt; font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
    .ie-col-header.exp { background: #fff1f2; color: #9f1239; border-bottom: 1pt solid #fecdd3; }
    .ie-col-header.inc { background: #f0fdf4; color: #065f46; border-bottom: 1pt solid #bbf7d0; }
    .ie-row { display: flex; justify-content: space-between; padding: 4pt 8pt; border-bottom: 0.5pt solid #f1f5f9; font-size: 9pt; }
    .ie-row:last-child { border-bottom: none; background: #f8fafc; font-weight: 900; border-top: 1pt solid #e2e8f0; }
    .ie-total-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1pt solid #0f172a; border-radius: 4pt; margin-top: 10pt; overflow: hidden; }
    .ie-total-cell { padding: 8pt; text-align: center; font-size: 9pt; font-weight: 900; }
    .ie-total-cell.exp-total { background: #fff1f2; color: #9f1239; border-right: 1pt solid #0f172a; }
    .ie-total-cell.inc-total { background: #f0fdf4; color: #065f46; }
    .ie-total-cell.surplus { background: #eff6ff; color: #1d4ed8; grid-column: 1/-1; border-top: 1pt solid #0f172a; }
    .ie-label { font-size: 8pt; text-transform: uppercase; display: block; margin-bottom: 2pt; }

    /* ── Balance sheet ── */
    .bal-row { display: flex; justify-content: space-between; padding: 4pt 6pt; border-bottom: 0.5pt solid #f1f5f9; font-size: 8.5pt; }
    .bal-row.total { font-weight: 900; background: #f1f5f9; border-top: 1pt solid #cbd5e1; border-bottom: none; }

    /* ── Footer ── */
    .doc-footer { margin-top: 20pt; padding-top: 6pt; border-top: 0.5pt solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #94a3b8; }

    /* ── Print media ── */
    @media print {
      @page { size: A4 portrait; margin: 10mm 10mm 15mm 10mm; }
      body { background: #ffffff; }
      .screen-toolbar { display: none !important; }
      .paper-wrapper { padding: 0; }
      .document { box-shadow: none; border-radius: 0; width: 100%; max-width: 100%; padding: 0; }
      table { page-break-inside: auto; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .sig-row { margin-top: 20pt; }
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
  // Focus the new window so the print button works from within it
  printWindow.focus();
}
