import {
  BankAccountInfo,
  FinanceTransaction,
  LedgerEntry,
  PeriodFilter,
  DateRange,
  FinancialSummary,
  AccountId,
  BillInvoice,
  CashBookEntry,
  CashBookReportData,
  LedgerReportData,
  FormalStatementData
} from '@/types/finance';

export const TEMPLE_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'cash_in_hand',
    name: 'Cash in Hand (Temple Treasury Vault)',
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

/**
 * Compute the dynamic opening balance for a specific account or all accounts
 * at the start of a given date period (Base Opening + inflows before start - outflows before start).
 */
export function computePeriodOpeningBalance(
  transactions: FinanceTransaction[],
  accountIdFilter: AccountId | 'all',
  startDate: string,
  customAccounts?: BankAccountInfo[]
): number {
  const accounts = customAccounts && customAccounts.length > 0 ? customAccounts : TEMPLE_BANK_ACCOUNTS;
  let baseOpening = 0;
  if (accountIdFilter && accountIdFilter !== 'all') {
    const acc = accounts.find(a => a.id === accountIdFilter);
    baseOpening = acc?.openingBalance || 0;
  } else {
    baseOpening = accounts.reduce((sum, a) => sum + a.openingBalance, 0);
  }

  // Transactions before startDate
  let delta = 0;
  transactions.forEach(t => {
    if (t.status === 'approved' && t.date < startDate) {
      if (!accountIdFilter || accountIdFilter === 'all' || t.accountId === accountIdFilter) {
        const isIncome = t.type === 'income' || t.type === 'donation';
        if (isIncome) delta += t.amount;
        else delta -= t.amount;
      }
    }
  });

  return baseOpening + delta;
}

/**
 * Compute the Ledger with strict double-entry running balance mathematics:
 * Opening Balance + Inflows (Credits) - Outflows (Debits) = Closing Balance
 */
export function computeLedger(
  transactions: FinanceTransaction[],
  accountIdFilter: AccountId | 'all' = 'all',
  dateRange?: DateRange,
  customAccounts?: BankAccountInfo[]
): {
  entries: LedgerEntry[];
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
} {
  const accounts = customAccounts && customAccounts.length > 0 ? customAccounts : TEMPLE_BANK_ACCOUNTS;
  const startDate = dateRange?.startDate || '1970-01-01';
  const endDate = dateRange?.endDate || '2099-12-31';

  // Dynamic Opening Balance as of startDate
  const openingBalance = computePeriodOpeningBalance(transactions, accountIdFilter, startDate, accounts);

  // Filter approved transactions for the selected period and account
  const inPeriodTransactions = transactions
    .filter(t => t.status === 'approved')
    .filter(t => !accountIdFilter || accountIdFilter === 'all' || t.accountId === accountIdFilter)
    .filter(t => t.date >= startDate && t.date <= endDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id));

  let runningBalance = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;
  const entries: LedgerEntry[] = [];

  inPeriodTransactions.forEach((txn) => {
    const isIncome = txn.type === 'income' || txn.type === 'donation';
    const credit = isIncome ? txn.amount : 0;
    const debit = !isIncome ? txn.amount : 0;

    totalCredits += credit;
    totalDebits += debit;
    runningBalance = runningBalance + credit - debit;

    entries.push({
      id: `led-${txn.id}`,
      date: txn.date,
      transactionId: txn.id,
      particulars: `${txn.purpose}${txn.partyName ? ` — ${txn.partyName}` : ''}`,
      partyName: txn.partyName,
      refNo: txn.referenceNo || txn.invoiceNo || txn.receiptNumber || txn.id,
      category: txn.category,
      accountId: txn.accountId,
      debit,
      credit,
      balance: runningBalance
    });
  });

  return {
    entries,
    openingBalance,
    totalDebits,
    totalCredits,
    closingBalance: runningBalance
  };
}

/**
 * Compute the Cash Book (Physical Treasury)
 * Opening Cash + Cash Inflows (+) - Cash Outflows (-) = Closing Cash Balance
 */
export function computeCashBook(
  transactions: FinanceTransaction[],
  dateRange?: DateRange,
  customAccounts?: BankAccountInfo[]
): {
  entries: CashBookEntry[];
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  closingBalance: number;
} {
  const accounts = customAccounts && customAccounts.length > 0 ? customAccounts : TEMPLE_BANK_ACCOUNTS;
  const startDate = dateRange?.startDate || '1970-01-01';
  const endDate = dateRange?.endDate || '2099-12-31';

  // Opening balance of cash as of startDate
  const openingBalance = computePeriodOpeningBalance(transactions, 'cash_in_hand', startDate, accounts);

  const cashTxns = transactions
    .filter(t => t.status === 'approved' && t.accountId === 'cash_in_hand')
    .filter(t => t.date >= startDate && t.date <= endDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id));

  let runningBalance = openingBalance;
  let totalInflows = 0;
  let totalOutflows = 0;
  const entries: CashBookEntry[] = [];

  cashTxns.forEach((txn) => {
    const isIncome = txn.type === 'income' || txn.type === 'donation';
    const inflow = isIncome ? txn.amount : 0;
    const outflow = !isIncome ? txn.amount : 0;

    totalInflows += inflow;
    totalOutflows += outflow;
    runningBalance = runningBalance + inflow - outflow;

    entries.push({
      id: `cb-${txn.id}`,
      transactionId: txn.id,
      date: txn.date,
      refNo: txn.referenceNo || txn.receiptNumber || txn.invoiceNo || txn.id,
      particulars: `${txn.purpose}${txn.partyName ? ` (${txn.partyName})` : ''}`,
      category: txn.category,
      outflow,
      inflow,
      balance: runningBalance
    });
  });

  return {
    entries,
    openingBalance,
    totalInflows,
    totalOutflows,
    closingBalance: runningBalance
  };
}

/**
 * Compute the Financial Summary & KPIs from live data
 */
export function computeFinancialSummary(
  transactions: FinanceTransaction[],
  bills: BillInvoice[],
  dateRange: DateRange,
  customAccounts?: BankAccountInfo[]
): FinancialSummary {
  const accounts = customAccounts && customAccounts.length > 0 ? customAccounts : TEMPLE_BANK_ACCOUNTS;
  const todayStr = new Date().toISOString().split('T')[0];

  const totalOpening = accounts.reduce((sum, a) => sum + a.openingBalance, 0);

  let totalIncome = 0;
  let totalExpenses = 0;

  // Running balances from base opening
  let cashInHand = accounts.find(a => a.id === 'cash_in_hand')?.openingBalance || 0;
  let bankBalance = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.openingBalance, 0);

  let incomeToday = 0;
  let expensesToday = 0;
  let txnCountToday = 0;
  let cashReceivedToday = 0;
  let bankReceivedToday = 0;
  let cashPaidToday = 0;
  let bankPaidToday = 0;

  // Calculate live cumulative balances & period metrics
  transactions.forEach((txn) => {
    const isApproved = txn.status === 'approved';
    const isIncome = txn.type === 'income' || txn.type === 'donation';
    const isToday = txn.date === todayStr;

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

/**
 * Compute the Income & Expenditure schedule by category for the formal financial statement
 */
export function computeIncomeAndExpenditure(
  transactions: FinanceTransaction[],
  dateRange: DateRange
): {
  incomeCategories: { category: string; amount: number }[];
  totalIncome: number;
  expenseCategories: { category: string; amount: number }[];
  totalExpenses: number;
  netSurplus: number;
} {
  const incMap: Record<string, number> = {};
  const expMap: Record<string, number> = {};

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((txn) => {
    if (txn.status === 'approved' && txn.date >= dateRange.startDate && txn.date <= dateRange.endDate) {
      const isIncome = txn.type === 'income' || txn.type === 'donation';
      const cat = txn.category || (isIncome ? 'General Receipts' : 'General Expenses');

      if (isIncome) {
        incMap[cat] = (incMap[cat] || 0) + txn.amount;
        totalIncome += txn.amount;
      } else {
        expMap[cat] = (expMap[cat] || 0) + txn.amount;
        totalExpenses += txn.amount;
      }
    }
  });

  const incomeCategories = Object.entries(incMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const expenseCategories = Object.entries(expMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    incomeCategories,
    totalIncome,
    expenseCategories,
    totalExpenses,
    netSurplus: totalIncome - totalExpenses
  };
}

/**
 * Fetch and harmonize all live data from Supabase into unified FinanceTransaction objects:
 * - Bookings (Seva pooja receipts)
 * - Donations (General donations & operating expenses)
 * - Annadanam (Sacred food sponsorships)
 * - Persisted custom finance records
 */
export async function fetchLiveFinanceData(supabase: any): Promise<FinanceTransaction[]> {
  try {
    const [
      { data: bksData, error: bksErr },
      { data: donData, error: donErr },
      { data: annData, error: annErr }
    ] = await Promise.all([
      supabase.from('bookings').select('*'),
      supabase.from('donations').select('*'),
      supabase.from('annadanam').select('*')
    ]);

    if (bksErr) console.warn("Notice: bookings fetch error:", bksErr.message);
    if (donErr) console.warn("Notice: donations fetch error:", donErr.message);
    if (annErr) console.warn("Notice: annadanam fetch error:", annErr.message);

    const unifiedList: FinanceTransaction[] = [];

    // 1. Map Live Seva Bookings (exclude explicitly deleted bookings)
    if (Array.isArray(bksData)) {
      bksData
        .filter((b: any) => b.status !== 'deleted')
        .forEach((b: any) => {
          const rawCost = Number(
            typeof b.total_cost === 'string' 
              ? b.total_cost.replace(/[^0-9.]/g, '') 
              : (b.total_cost || b.seva_cost || 0)
          );
          if (rawCost > 0) {
            unifiedList.push({
            id: `SEVA-${b.id}`,
            type: 'income',
            category: 'Seva',
            amount: rawCost,
            date: b.date || (b.created_at ? b.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            paymentMethod: 'upi',
            accountId: 'canara_seva',
            partyName: b.devotee_name || 'Devotee',
            purpose: `Seva Pooja: ${b.seva_name || 'Daily Pooja'}`,
            referenceNo: b.id,
            receiptNumber: `RCP-${String(b.id).slice(-6)}`,
            description: `Devotee Seva Booking (${b.seva_name || 'Seva'}). Gotra: ${b.gotra || 'N/A'}. Slot: ${b.time || 'Morning'}.`,
            status: 'approved',
            isReconciled: true,
            createdAt: b.created_at || new Date().toISOString(),
            createdBy: 'Devotee Portal'
          });
        }
      });
    }

    // 2. Map Live Donations (Income & Expenses)
    if (Array.isArray(donData)) {
      donData.forEach((d: any) => {
        const amt = Number(d.amount || 0);
        const isExpense = amt < 0 || (d.purpose && d.purpose.toLowerCase().includes('expense'));
        const positiveAmount = Math.abs(amt);

        if (positiveAmount > 0) {
          if (isExpense) {
            // Expense / Outflow
            let cat = 'Maintenance';
            const purp = (d.purpose || '').toLowerCase();
            if (purp.includes('electricity') || purp.includes('power')) cat = 'Electricity';
            else if (purp.includes('water')) cat = 'Water';
            else if (purp.includes('salary') || purp.includes('salaries')) cat = 'Salaries';
            else if (purp.includes('annadanam') || purp.includes('food') || purp.includes('rice') || purp.includes('grocery')) cat = 'Annadanam';
            else if (purp.includes('purchase') || purp.includes('samagri') || purp.includes('ghee')) cat = 'Purchases';
            else if (purp.includes('repair')) cat = 'Repairs';
            else if (purp.includes('event')) cat = 'Events';

            unifiedList.push({
              id: d.id,
              type: 'expense',
              category: cat,
              amount: positiveAmount,
              date: d.date || (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
              paymentMethod: d.payment_mode || (d.donor_name?.toLowerCase().includes('cash') ? 'cash' : 'bank_transfer'),
              accountId: d.account_id || (cat === 'Annadanam' ? 'hdfc_annadanam' : d.payment_mode === 'cash' ? 'cash_in_hand' : 'sbi_main'),
              partyName: d.donor_name || 'Vendor / Payee',
              purpose: d.purpose || 'Temple Operating Expense',
              invoiceNo: d.invoice_no || d.id,
              referenceNo: d.reference_no || d.id,
              description: d.description || `Temple expense payment: ${d.purpose}`,
              status: 'approved',
              isReconciled: true,
              createdAt: d.created_at || new Date().toISOString(),
              createdBy: d.created_by || 'Treasury Accountant'
            });
          } else {
            // Donation / Inflow
            unifiedList.push({
              id: d.id,
              type: 'donation',
              category: 'Donations',
              amount: positiveAmount,
              date: d.date || (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
              paymentMethod: d.payment_mode || 'upi',
              accountId: d.account_id || 'sbi_main',
              partyName: d.donor_name || 'Donor Devotee',
              purpose: d.purpose || 'General Temple Donation',
              receiptNumber: `DON-${String(d.id).slice(-6)}`,
              referenceNo: d.id,
              description: `Sacred contribution for ${d.purpose}`,
              status: 'approved',
              isReconciled: Boolean(d.receipt_sent),
              createdAt: d.created_at || new Date().toISOString(),
              createdBy: 'Counter Desk'
            });
          }
        }
      });
    }

    // 3. Map Live Annadanam Sponsorships
    if (Array.isArray(annData)) {
      annData.forEach((a: any) => {
        const amt = Number(a.amount || 0);
        if (amt > 0) {
          unifiedList.push({
            id: `ANN-${a.id}`,
            type: 'income',
            category: 'Annadanam',
            amount: amt,
            date: a.date || (a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            paymentMethod: 'bank_transfer',
            accountId: 'hdfc_annadanam',
            partyName: a.sponsor_name || 'Annadatha Patron',
            purpose: `Annadanam Sponsorship (${a.meal_type || 'Mahaprasada'})`,
            receiptNumber: `ANN-${String(a.id).slice(-6)}`,
            referenceNo: a.id,
            description: `Devotee sponsored holy food distribution: ${a.meal_type}. Contact: ${a.contact || 'N/A'}.`,
            status: 'approved',
            isReconciled: true,
            createdAt: a.created_at || new Date().toISOString(),
            createdBy: 'Annadanam Desk'
          });
        }
      });
    }

    // 4. Merge any additional manually recorded transactions from local cache that are pending sync
    if (typeof window !== 'undefined') {
      try {
        const localCustom = localStorage.getItem('alsur_custom_finance_txns');
        if (localCustom) {
          const parsed = JSON.parse(localCustom);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: FinanceTransaction) => {
              if (!unifiedList.some(u => u.id === item.id)) {
                unifiedList.push(item);
              }
            });
          }
        }
      } catch (e) {
        console.error("Local custom txns parse error:", e);
      }
    }

    // Sort all records chronologically ascending
    return unifiedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id));
  } catch (err) {
    console.error("fetchLiveFinanceData exception:", err);
    return [];
  }
}

/**
 * Empty baseline arrays — absolutely no mock/seed data
 */
export const SEED_FINANCE_TRANSACTIONS: FinanceTransaction[] = [];
export const SEED_BILLS_INVOICES: BillInvoice[] = [];
export const SEED_AUDIT_LOGS: any[] = [];
