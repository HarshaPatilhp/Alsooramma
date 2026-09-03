export type TransactionType = 'income' | 'expense' | 'donation' | 'payment';

export type IncomeCategory = 
  | 'Donations'
  | 'Seva'
  | 'Annadanam'
  | 'Hundi'
  | 'Events'
  | 'Publications'
  | 'Other Income';

export type ExpenseCategory = 
  | 'Maintenance'
  | 'Electricity'
  | 'Water'
  | 'Salaries'
  | 'Purchases'
  | 'Annadanam'
  | 'Events'
  | 'Repairs'
  | 'Travel'
  | 'Office Expenses'
  | 'Utilities'
  | 'Other Expenses';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'dd' | 'card';

export type AccountId = 'cash_in_hand' | 'sbi_main' | 'canara_seva' | 'hdfc_annadanam';

export interface BankAccountInfo {
  id: AccountId;
  name: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  branch: string;
  type: 'cash' | 'bank';
  openingBalance: number;
}

export type TransactionStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory | string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  accountId: AccountId;
  partyName: string; // Donor or Vendor name
  purpose: string;
  referenceNo?: string;
  invoiceNo?: string;
  dueDate?: string;
  description: string;
  notes?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  receiptNumber?: string;
  status: TransactionStatus;
  isReconciled?: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  // Linkage
  relatedDonationId?: string;
  relatedBillId?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  transactionId: string;
  particulars: string;
  partyName: string;
  refNo: string;
  category: string;
  accountId: AccountId;
  debit: number; // Outflow / Expense
  credit: number; // Inflow / Income
  balance: number; // Running balance
}

export interface BillInvoice {
  id: string;
  vendor: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  dueDate: string;
  category: ExpenseCategory;
  description: string;
  status: 'pending' | 'due_soon' | 'overdue' | 'paid';
  attachmentUrl?: string;
  attachmentName?: string;
  relatedExpenseId?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'create' | 'update' | 'approve' | 'reject' | 'delete' | 'reconcile' | 'pay';
  transactionId: string;
  summary: string;
  details?: Record<string, any>;
}

export type PeriodFilter = 
  | 'today' 
  | 'yesterday' 
  | 'this_week' 
  | 'this_month' 
  | 'prev_month' 
  | 'fy_current' 
  | 'fy_previous' 
  | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface FinancialSummary {
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  cashInHand: number;
  bankBalance: number;
  pendingPayments: number;
  pendingApprovals: number;
  // Today's metrics
  incomeToday: number;
  expensesToday: number;
  netToday: number;
  txnCountToday: number;
  cashReceivedToday: number;
  bankReceivedToday: number;
  cashPaidToday: number;
  bankPaidToday: number;
}

export type PrintReportType = 'cash_book' | 'ledger' | 'statement' | 'receipt' | null;

export interface CashBookEntry {
  id: string;
  date: string;
  refNo: string;
  particulars: string;
  category: string;
  outflow: number; // payment (-)
  inflow: number;  // receipt (+)
  balance: number; // running cash balance
}

export interface CashBookReportData {
  orgName: string;
  orgSubtitle: string;
  title: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  accountName: string;
  openingBalance: number;
  entries: CashBookEntry[];
  totalInflows: number;
  totalOutflows: number;
  closingBalance: number;
  generatedAt: string;
}

export interface LedgerReportData {
  orgName: string;
  orgSubtitle: string;
  title: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  accountName: string;
  openingBalance: number;
  entries: LedgerEntry[];
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  generatedAt: string;
}

export interface FormalStatementData {
  orgName: string;
  orgSubtitle: string;
  title: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  incomeCategories: { category: string; amount: number }[];
  totalIncome: number;
  expenseCategories: { category: string; amount: number }[];
  totalExpenses: number;
  netSurplus: number;
  accountBalances: { name: string; type: 'cash' | 'bank'; balance: number }[];
  totalReserves: number;
  generatedAt: string;
}
