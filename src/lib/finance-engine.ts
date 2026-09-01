import {
  BankAccountInfo,
  FinanceTransaction,
  LedgerEntry,
  PeriodFilter,
  DateRange,
  FinancialSummary,
  AccountId,
  BillInvoice,
  AuditLogEntry
} from '@/types/finance';

export const TEMPLE_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'cash_in_hand',
    name: 'Cash in Hand (Temple Treasury)',
    accountNumber: 'CASH-MAIN-01',
    bankName: 'Temple Treasury Vault',
    ifsc: 'N/A',
    branch: 'Vidyaranyapura Main Sanctum',
    type: 'cash',
    openingBalance: 45000
  },
  {
    id: 'sbi_main',
    name: 'SBI Main Operational A/C',
    accountNumber: '38294719023',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0004128',
    branch: 'Vidyaranyapura Branch, Bengaluru',
    type: 'bank',
    openingBalance: 320000
  },
  {
    id: 'canara_seva',
    name: 'Canara Bank - Seva & Pooja A/C',
    accountNumber: '049110103982',
    bankName: 'Canara Bank',
    ifsc: 'CNRB0000491',
    branch: 'BEL Circle Branch, Bengaluru',
    type: 'bank',
    openingBalance: 185000
  },
  {
    id: 'hdfc_annadanam',
    name: 'HDFC Bank - Annadanam Nidhi',
    accountNumber: '50100481923481',
    bankName: 'HDFC Bank',
    ifsc: 'HDFC0001752',
    branch: 'Yelahanka Satellite Town',
    type: 'bank',
    openingBalance: 240000
  }
];

export function getPeriodDateRange(period: PeriodFilter, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  switch (period) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr, label: 'Today' };

    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      return { startDate: yStr, endDate: yStr, label: 'Yesterday' };
    }

    case 'this_week': {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d.setDate(diff));
      return {
        startDate: monday.toISOString().split('T')[0],
        endDate: todayStr,
        label: 'This Week'
      };
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      return { startDate: start, endDate: todayStr, label: 'This Month' };
    }

    case 'prev_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { startDate: start, endDate: end, label: 'Previous Month' };
    }

    case 'fy_current': {
      // Indian FY: April 1 -> March 31
      const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const start = `${year}-04-01`;
      const end = `${year + 1}-03-31`;
      return { startDate: start, endDate: end, label: `FY ${year}–${(year + 1).toString().slice(2)}` };
    }

    case 'fy_previous': {
      const year = (now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1) - 1;
      const start = `${year}-04-01`;
      const end = `${year + 1}-03-31`;
      return { startDate: start, endDate: end, label: `FY ${year}–${(year + 1).toString().slice(2)}` };
    }

    case 'custom':
    default:
      return {
        startDate: customStart || '2026-01-01',
        endDate: customEnd || todayStr,
        label: 'Custom Range'
      };
  }
}

export function generateTransactionId(type: 'income' | 'expense' | 'donation' | 'payment'): string {
  const prefix = 
    type === 'income' ? 'INC' :
    type === 'expense' ? 'EXP' :
    type === 'donation' ? 'DON' : 'PAY';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `MUM-${year}-${randomNum}`;
}

export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount)) return 'Zero Rupees Only';
  
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (num: number): string => {
    if (num < 10) return single[num];
    if (num >= 10 && num < 20) return double[num - 10];
    const unit = num % 10;
    const ten = Math.floor(num / 10);
    return `${tens[ten]}${unit ? ' ' + single[unit] : ''}`.trim();
  };

  const convertThreeDigits = (num: number): string => {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let res = '';
    if (hundred > 0) res += `${single[hundred]} Hundred`;
    if (rest > 0) res += `${res ? ' and ' : ''}${convertTwoDigits(rest)}`;
    return res;
  };

  let num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  let str = '';
  if (crore > 0) str += `${convertTwoDigits(crore)} Crore `;
  if (lakh > 0) str += `${convertTwoDigits(lakh)} Lakh `;
  if (thousand > 0) str += `${convertTwoDigits(thousand)} Thousand `;
  if (hundred > 0) str += `${convertThreeDigits(hundred)} `;

  return `${str.trim()} Rupees Only`;
}

export function computeLedger(
  transactions: FinanceTransaction[],
  accountIdFilter?: AccountId | 'all'
): LedgerEntry[] {
  // Sort chronologically ascending for running balance calculation
  const sorted = [...transactions]
    .filter(t => t.status === 'approved')
    .filter(t => !accountIdFilter || accountIdFilter === 'all' || t.accountId === accountIdFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalOpening = 0;
  if (accountIdFilter && accountIdFilter !== 'all') {
    const acc = TEMPLE_BANK_ACCOUNTS.find(a => a.id === accountIdFilter);
    totalOpening = acc?.openingBalance || 0;
  } else {
    totalOpening = TEMPLE_BANK_ACCOUNTS.reduce((sum, a) => sum + a.openingBalance, 0);
  }

  let runningBalance = totalOpening;

  const entries: LedgerEntry[] = [];

  sorted.forEach((txn) => {
    const isIncome = txn.type === 'income' || txn.type === 'donation';
    const credit = isIncome ? txn.amount : 0;
    const debit = !isIncome ? txn.amount : 0;
    runningBalance = runningBalance + credit - debit;

    entries.push({
      id: `led-${txn.id}`,
      date: txn.date,
      transactionId: txn.id,
      particulars: `${txn.purpose} — ${txn.partyName}`,
      partyName: txn.partyName,
      refNo: txn.referenceNo || txn.invoiceNo || txn.receiptNumber || txn.id,
      category: txn.category,
      accountId: txn.accountId,
      debit,
      credit,
      balance: runningBalance
    });
  });

  return entries;
}

export function computeFinancialSummary(
  transactions: FinanceTransaction[],
  bills: BillInvoice[],
  dateRange: DateRange
): FinancialSummary {
  const todayStr = new Date().toISOString().split('T')[0];

  const totalOpening = TEMPLE_BANK_ACCOUNTS.reduce((sum, a) => sum + a.openingBalance, 0);

  let totalIncome = 0;
  let totalExpenses = 0;
  let cashInHand = TEMPLE_BANK_ACCOUNTS.find(a => a.id === 'cash_in_hand')?.openingBalance || 0;
  let bankBalance = TEMPLE_BANK_ACCOUNTS.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.openingBalance, 0);

  let incomeToday = 0;
  let expensesToday = 0;
  let txnCountToday = 0;
  let cashReceivedToday = 0;
  let bankReceivedToday = 0;
  let cashPaidToday = 0;
  let bankPaidToday = 0;

  // Filter approved transactions within selected period for period totals
  transactions.forEach((txn) => {
    const isApproved = txn.status === 'approved';
    const isIncome = txn.type === 'income' || txn.type === 'donation';
    const isToday = txn.date === todayStr;

    // Running overall account balances
    if (isApproved) {
      if (txn.accountId === 'cash_in_hand') {
        if (isIncome) cashInHand += txn.amount;
        else cashInHand -= txn.amount;
      } else {
        if (isIncome) bankBalance += txn.amount;
        else bankBalance -= txn.amount;
      }

      // Today's metrics
      if (isToday) {
        txnCountToday++;
        if (isIncome) {
          incomeToday += txn.amount;
          if (txn.accountId === 'cash_in_hand') cashReceivedToday += txn.amount;
          else bankReceivedToday += txn.amount;
        } else {
          expensesToday += txn.amount;
          if (txn.accountId === 'cash_in_hand') cashPaidToday += txn.amount;
          else bankPaidToday += txn.amount;
        }
      }

      // Filtered Date Range Totals
      const inRange = txn.date >= dateRange.startDate && txn.date <= dateRange.endDate;
      if (inRange) {
        if (isIncome) totalIncome += txn.amount;
        else totalExpenses += txn.amount;
      }
    }
  });

  const currentBalance = totalOpening + (cashInHand + bankBalance - totalOpening);

  const pendingPayments = bills
    .filter(b => b.status === 'pending' || b.status === 'due_soon' || b.status === 'overdue')
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingApprovals = transactions.filter(t => t.status === 'pending_approval').length;

  return {
    openingBalance: totalOpening,
    totalIncome,
    totalExpenses,
    currentBalance: cashInHand + bankBalance,
    cashInHand,
    bankBalance,
    pendingPayments,
    pendingApprovals,
    incomeToday,
    expensesToday,
    netToday: incomeToday - expensesToday,
    txnCountToday,
    cashReceivedToday,
    bankReceivedToday,
    cashPaidToday,
    bankPaidToday
  };
}

export const SEED_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: 'DON-2026-0101',
    type: 'donation',
    category: 'Donations',
    amount: 25000,
    date: '2026-08-28',
    paymentMethod: 'upi',
    accountId: 'sbi_main',
    partyName: 'Smt. Gayatri & Sri Venkatesh Rao',
    purpose: 'Maha Annadanam Nitya Seva Sponsorship',
    referenceNo: 'UPI/2839481902/HDFC',
    receiptNumber: 'MUM-2026-78401',
    description: 'Devotee contribution for annual Rayaru Aradhana special Annadanam.',
    status: 'approved',
    isReconciled: true,
    reconciledAt: '2026-08-29',
    createdAt: '2026-08-28T09:30:00Z',
    createdBy: 'Accountant (Raghavendra S)'
  },
  {
    id: 'INC-2026-0102',
    type: 'income',
    category: 'Seva',
    amount: 15000,
    date: '2026-08-29',
    paymentMethod: 'bank_transfer',
    accountId: 'canara_seva',
    partyName: 'Dr. Anand Kulkarni',
    purpose: 'Panchamrutha Abhisheka & Kanakabhisheka',
    referenceNo: 'NEFT-CNRB-92841920',
    receiptNumber: 'MUM-2026-78402',
    description: 'Special pooja seva on Thursday Sravana Masa.',
    status: 'approved',
    isReconciled: true,
    createdAt: '2026-08-29T10:15:00Z',
    createdBy: 'Counter Desk'
  },
  {
    id: 'INC-2026-0103',
    type: 'income',
    category: 'Hundi',
    amount: 48500,
    date: '2026-08-30',
    paymentMethod: 'cash',
    accountId: 'cash_in_hand',
    partyName: 'Main Temple Sanctum Hundi',
    purpose: 'Weekly Hundi Collection & Counting',
    referenceNo: 'HUNDI-WK-35',
    receiptNumber: 'MUM-2026-78403',
    description: 'Counted in presence of Trustees & Senior Accountant.',
    status: 'approved',
    isReconciled: true,
    createdAt: '2026-08-30T17:00:00Z',
    createdBy: 'Trustee Secretary'
  },
  {
    id: 'EXP-2026-0104',
    type: 'expense',
    category: 'Electricity',
    amount: 14250,
    date: '2026-08-31',
    paymentMethod: 'bank_transfer',
    accountId: 'sbi_main',
    partyName: 'BESCOM Vidyaranyapura Sub-division',
    purpose: 'Temple Sanctum & Dining Hall Power Bill',
    invoiceNo: 'BESCOM-AUG26-0912',
    referenceNo: 'TXN-SBIN-8491028',
    description: 'Monthly electricity bill for August 2026.',
    status: 'approved',
    isReconciled: true,
    createdAt: '2026-08-31T11:00:00Z',
    createdBy: 'Accountant'
  },
  {
    id: 'EXP-2026-0105',
    type: 'expense',
    category: 'Purchases',
    amount: 22800,
    date: '2026-09-01',
    paymentMethod: 'bank_transfer',
    accountId: 'hdfc_annadanam',
    partyName: 'Sri Krishna Provision Stores',
    purpose: 'Annadanam Sona Masoori Rice (10 Quintals)',
    invoiceNo: 'INV-SKPS-8841',
    referenceNo: 'IMPS/HDFC/94819028',
    description: 'Pure aged rice bags for daily devotee lunch distribution.',
    status: 'approved',
    isReconciled: false,
    createdAt: '2026-09-01T14:30:00Z',
    createdBy: 'Kitchen Lead'
  },
  {
    id: 'DON-2026-0106',
    type: 'donation',
    category: 'Donations',
    amount: 50000,
    date: '2026-09-01',
    paymentMethod: 'upi',
    accountId: 'sbi_main',
    partyName: 'Sri B. S. Sridhar Murthy',
    purpose: 'Gold Kireeta & Alankara Seva Samarpanam',
    referenceNo: 'UPI/9481029481/SBIN',
    receiptNumber: 'MUM-2026-78404',
    description: 'Devotee endowment donation for holy deities ornamentation.',
    status: 'approved',
    isReconciled: false,
    createdAt: '2026-09-01T16:20:00Z',
    createdBy: 'Accountant'
  },
  {
    id: 'EXP-2026-0107',
    type: 'expense',
    category: 'Maintenance',
    amount: 12000,
    date: '2026-09-02',
    paymentMethod: 'cash',
    accountId: 'cash_in_hand',
    partyName: 'Sri Raghavendra Electricals',
    purpose: 'CCTV & Temple Illumination Repair',
    invoiceNo: 'BILL-SRE-441',
    description: 'Repair of sanctum floodlights and sound amplifier.',
    status: 'pending_approval',
    createdAt: '2026-09-02T09:00:00Z',
    createdBy: 'Temple Supervisor'
  }
];

export const SEED_BILLS_INVOICES: BillInvoice[] = [
  {
    id: 'BILL-001',
    vendor: 'Sri Lakshmi Pure Ghee Suppliers',
    invoiceNumber: 'INV-SLG-2026-401',
    amount: 18500,
    date: '2026-08-25',
    dueDate: '2026-09-10',
    category: 'Purchases',
    description: '5 Tins of Pure Desi Cow Ghee for Deepa & Prasadam',
    status: 'pending',
    createdAt: '2026-08-25'
  },
  {
    id: 'BILL-002',
    vendor: 'Vedic Pooja Bhandar',
    invoiceNumber: 'VPB-0981',
    amount: 8400,
    date: '2026-08-20',
    dueDate: '2026-08-30',
    category: 'Purchases',
    description: 'Kumkum, Chandana paste, Camphor, and Incense sticks',
    status: 'overdue',
    createdAt: '2026-08-20'
  },
  {
    id: 'BILL-003',
    vendor: 'Bengaluru Water Supply & Sewerage Board',
    invoiceNumber: 'BWSSB-AUG-9912',
    amount: 3800,
    date: '2026-09-01',
    dueDate: '2026-09-15',
    category: 'Water',
    description: 'Temple water supply pipeline consumption bill',
    status: 'due_soon',
    createdAt: '2026-09-01'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-09-01 16:20:00',
    actor: 'Accountant (Raghavendra S)',
    action: 'create',
    transactionId: 'DON-2026-0106',
    summary: 'Created Donation receipt MUM-2026-78404 for ₹50,000 from Sri B. S. Sridhar Murthy'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-09-01 14:30:00',
    actor: 'Kitchen Lead',
    action: 'create',
    transactionId: 'EXP-2026-0105',
    summary: 'Recorded Annadanam Sona Masoori Rice purchase expense ₹22,800'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-08-31 11:05:00',
    actor: 'Trustee Treasurer',
    action: 'approve',
    transactionId: 'EXP-2026-0104',
    summary: 'Approved Electricity expense payment of ₹14,250 via SBI Main Account'
  }
];
