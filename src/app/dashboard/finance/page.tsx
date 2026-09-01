"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Landmark,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Eye,
  Check,
  X,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  PieChart as PieChartIcon,
  RefreshCw,
  Upload,
  Paperclip,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  FinanceTransaction,
  BillInvoice,
  AuditLogEntry,
  PeriodFilter,
  AccountId,
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentMethod
} from '@/types/finance';
import {
  TEMPLE_BANK_ACCOUNTS,
  getPeriodDateRange,
  computeLedger,
  computeFinancialSummary,
  generateTransactionId,
  generateReceiptNumber,
  numberToIndianWords,
  SEED_FINANCE_TRANSACTIONS,
  SEED_BILLS_INVOICES,
  SEED_AUDIT_LOGS
} from '@/lib/finance-engine';

export default function FinancePage() {
  const { user } = useAuth();

  // Internal Navigation Sub-sections
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transactions' | 'ledger' | 'accounts' | 'bills' | 'pending_payments' | 'reports' | 'audit_log'
  >('dashboard');

  // Sub-tab for Transactions ('all' | 'income' | 'expenses' | 'donations')
  const [transactionSubTab, setTransactionSubTab] = useState<'all' | 'income' | 'expenses' | 'donations'>('all');

  // Sub-tab for Accounts ('cash_book' | 'bank_book' | 'reconciliation')
  const [accountsSubTab, setAccountsSubTab] = useState<'cash_book' | 'bank_book' | 'reconciliation'>('cash_book');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<AccountId>('sbi_main');

  // Period / Financial Year filter
  const [period, setPeriod] = useState<PeriodFilter>('fy_current');
  const [customStartDate, setCustomStartDate] = useState(() => new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Global Search State
  const [globalSearch, setGlobalSearch] = useState('');

  // Primary Data State
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alsur_finance_transactions');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return SEED_FINANCE_TRANSACTIONS;
  });

  const [bills, setBills] = useState<BillInvoice[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alsur_finance_bills');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return SEED_BILLS_INVOICES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alsur_finance_audit_logs');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return SEED_AUDIT_LOGS;
  });

  // Reconciled Bank Statement Balance for Reconciliation tool
  const [bankStatementBalance, setBankStatementBalance] = useState<number>(385000);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alsur_finance_transactions', JSON.stringify(transactions));
      localStorage.setItem('alsur_finance_bills', JSON.stringify(bills));
      localStorage.setItem('alsur_finance_audit_logs', JSON.stringify(auditLogs));
    }
  }, [transactions, bills, auditLogs]);

  // Date Range calculation
  const dateRange = useMemo(() => {
    return getPeriodDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  // Computed Financial Metrics
  const summary = useMemo(() => {
    return computeFinancialSummary(transactions, bills, dateRange);
  }, [transactions, bills, dateRange]);

  // Computed Ledger
  const ledgerEntries = useMemo(() => {
    return computeLedger(transactions, 'all');
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Date filter
      const inDate = t.date >= dateRange.startDate && t.date <= dateRange.endDate;
      if (!inDate && period !== 'custom') return false;

      // Sub-tab filter
      if (transactionSubTab === 'income' && t.type !== 'income' && t.type !== 'donation') return false;
      if (transactionSubTab === 'expenses' && t.type !== 'expense' && t.type !== 'payment') return false;
      if (transactionSubTab === 'donations' && t.type !== 'donation') return false;

      // Global Search
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matches = 
          t.id.toLowerCase().includes(q) ||
          t.partyName.toLowerCase().includes(q) ||
          t.purpose.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.referenceNo && t.referenceNo.toLowerCase().includes(q)) ||
          (t.invoiceNo && t.invoiceNo.toLowerCase().includes(q)) ||
          (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [transactions, dateRange, transactionSubTab, globalSearch, period]);

  // Modals State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<FinanceTransaction | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<FinanceTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Selected Bill to Pay
  const [payingBill, setPayingBill] = useState<BillInvoice | null>(null);

  // Form State for Income / Donation
  const [incomeForm, setIncomeForm] = useState({
    type: 'income' as TransactionType,
    category: 'Donations' as IncomeCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi' as PaymentMethod,
    accountId: 'sbi_main' as AccountId,
    partyName: '',
    purpose: '',
    referenceNo: '',
    description: '',
    notes: ''
  });

  // Form State for Expense
  const [expenseForm, setExpenseForm] = useState({
    category: 'Maintenance' as ExpenseCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer' as PaymentMethod,
    accountId: 'sbi_main' as AccountId,
    partyName: '',
    purpose: '',
    invoiceNo: '',
    dueDate: '',
    description: '',
    notes: '',
    attachmentName: ''
  });

  // Form State for Bill Upload
  const [billForm, setBillForm] = useState({
    vendor: '',
    invoiceNumber: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    category: 'Purchases' as ExpenseCategory,
    description: '',
    attachmentName: '',
    attachmentUrl: ''
  });

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{ name: string; size: string } | null>(null);

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKB} KB`;
    setSelectedFileMeta({ name: file.name, size: sizeStr });

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setBillForm(prev => ({
        ...prev,
        attachmentName: file.name,
        attachmentUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Sync Supabase Donations & Seva Bookings directly into Finance Ledger on Mount
  useEffect(() => {
    const syncDatabaseRecords = async () => {
      try {
        const { createClient } = await import('@/lib/client');
        const supabase = createClient();

        // 1. Query Donations Table
        const { data: dbDonations } = await supabase.from('donations').select('*').order('created_at', { ascending: false });

        if (Array.isArray(dbDonations) && dbDonations.length > 0) {
          setTransactions(prev => {
            const merged = [...prev];
            dbDonations.forEach((d: any) => {
              const dId = d.id || `DON-DB-${d.created_at || Date.now()}`;
              const exists = merged.some(t => t.id === dId || (t.referenceNo && t.referenceNo === d.id) || (t.partyName === d.donor_name && t.amount === Number(d.amount)));
              if (!exists) {
                merged.unshift({
                  id: dId,
                  type: 'donation',
                  category: 'Donations',
                  amount: Number(d.amount) || 0,
                  date: d.date || (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
                  paymentMethod: (d.payment_mode || 'upi').toLowerCase() as PaymentMethod,
                  accountId: (d.payment_mode && String(d.payment_mode).toLowerCase().includes('cash')) ? 'cash_in_hand' : 'sbi_main',
                  partyName: d.donor_name || 'Anonymous Seva Seeker',
                  purpose: d.purpose || 'Temple Seva & Annadanam Donation',
                  referenceNo: d.id,
                  receiptNumber: d.receipt_sent ? `REC-${dId.slice(-6)}` : undefined,
                  description: `Online/Counter Donation from ${d.donor_name || 'Devotee'} (${d.purpose || 'General'})`,
                  status: 'approved',
                  isReconciled: true,
                  createdAt: d.created_at || new Date().toISOString(),
                  createdBy: 'Devotee Seva Portal / Counter'
                });
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn('Finance Supabase auto-sync notice:', err);
      }
    };

    syncDatabaseRecords();
  }, []);

  // =========================================================================
  // HANDLERS FOR UNIFIED ACCOUNTING (ENTER ONCE, AUTO-PROPAGATE TO ALL)
  // =========================================================================

  const handleRecordIncomeOrDonation = (isDonation = false) => {
    if (!incomeForm.amount || isNaN(Number(incomeForm.amount)) || Number(incomeForm.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!incomeForm.partyName.trim()) {
      alert(isDonation ? 'Please enter donor name.' : 'Please enter payer / source name.');
      return;
    }

    const type: TransactionType = isDonation ? 'donation' : incomeForm.type;
    const newTxnId = generateTransactionId(type);
    const receiptNum = isDonation || incomeForm.paymentMethod !== 'cash' ? generateReceiptNumber() : undefined;

    const newTxn: FinanceTransaction = {
      id: newTxnId,
      type,
      category: isDonation ? 'Donations' : incomeForm.category,
      amount: Number(incomeForm.amount),
      date: incomeForm.date,
      paymentMethod: incomeForm.paymentMethod,
      accountId: incomeForm.accountId,
      partyName: incomeForm.partyName.trim(),
      purpose: incomeForm.purpose.trim() || (isDonation ? 'Temple Seva & Annadanam Donation' : 'Temple General Income'),
      referenceNo: incomeForm.referenceNo.trim(),
      receiptNumber: receiptNum,
      description: incomeForm.description.trim() || `${incomeForm.category} received from ${incomeForm.partyName}`,
      notes: incomeForm.notes.trim(),
      status: 'approved',
      isReconciled: false,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Accountant'
    };

    // 1. Add to Transactions
    setTransactions(prev => [newTxn, ...prev]);

    // 2. Add to Audit Log
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: user?.name || 'Accountant',
      action: 'create',
      transactionId: newTxnId,
      summary: `Recorded ${isDonation ? 'Donation' : 'Income'} of ₹${Number(incomeForm.amount).toLocaleString('en-IN')} from ${incomeForm.partyName}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Reset Form & Close Modal
    setShowIncomeModal(false);
    setShowDonationModal(false);
    setIncomeForm({
      type: 'income',
      category: 'Donations',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'upi',
      accountId: 'sbi_main',
      partyName: '',
      purpose: '',
      referenceNo: '',
      description: '',
      notes: ''
    });

    if (isDonation) {
      setShowReceiptModal(newTxn);
    }
  };

  const handleRecordExpense = () => {
    if (!expenseForm.amount || isNaN(Number(expenseForm.amount)) || Number(expenseForm.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!expenseForm.partyName.trim()) {
      alert('Please enter vendor or payee name.');
      return;
    }

    const newTxnId = generateTransactionId('expense');

    const newTxn: FinanceTransaction = {
      id: newTxnId,
      type: 'expense',
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      paymentMethod: expenseForm.paymentMethod,
      accountId: expenseForm.accountId,
      partyName: expenseForm.partyName.trim(),
      purpose: expenseForm.purpose.trim() || `${expenseForm.category} expense`,
      invoiceNo: expenseForm.invoiceNo.trim(),
      dueDate: expenseForm.dueDate,
      description: expenseForm.description.trim() || `Payment for ${expenseForm.category} to ${expenseForm.partyName}`,
      notes: expenseForm.notes.trim(),
      attachmentName: expenseForm.attachmentName,
      status: 'approved',
      isReconciled: false,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Accountant'
    };

    // 1. Add to Transactions
    setTransactions(prev => [newTxn, ...prev]);

    // 2. Add to Audit Log
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: user?.name || 'Accountant',
      action: 'create',
      transactionId: newTxnId,
      summary: `Recorded Expense of ₹${Number(expenseForm.amount).toLocaleString('en-IN')} paid to ${expenseForm.partyName}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setShowExpenseModal(false);
    setExpenseForm({
      category: 'Maintenance',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      accountId: 'sbi_main',
      partyName: '',
      purpose: '',
      invoiceNo: '',
      dueDate: '',
      description: '',
      notes: '',
      attachmentName: ''
    });
  };

  const handleUploadBill = () => {
    if (!billForm.amount || isNaN(Number(billForm.amount)) || Number(billForm.amount) <= 0) {
      alert('Please enter a valid bill amount.');
      return;
    }
    if (!billForm.vendor.trim()) {
      alert('Please enter vendor name.');
      return;
    }

    const newBill: BillInvoice = {
      id: `BILL-${Date.now().toString().slice(-4)}`,
      vendor: billForm.vendor.trim(),
      invoiceNumber: billForm.invoiceNumber.trim() || `INV-${Date.now().toString().slice(-6)}`,
      amount: Number(billForm.amount),
      date: billForm.date,
      dueDate: billForm.dueDate,
      category: billForm.category,
      description: billForm.description.trim() || `Invoice from ${billForm.vendor}`,
      status: 'pending',
      attachmentName: billForm.attachmentName || 'Invoice_Document.pdf',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBills(prev => [newBill, ...prev]);

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: user?.name || 'Accountant',
      action: 'create',
      transactionId: newBill.id,
      summary: `Uploaded Vendor Invoice ${newBill.invoiceNumber} for ₹${newBill.amount.toLocaleString('en-IN')} from ${newBill.vendor}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setSelectedFileMeta(null);
    setShowBillModal(false);
    setBillForm({
      vendor: '',
      invoiceNumber: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      category: 'Purchases',
      description: '',
      attachmentName: '',
      attachmentUrl: ''
    });
  };

  const handleMarkBillAsPaid = (bill: BillInvoice, paymentAccount: AccountId = 'sbi_main', paymentMethod: PaymentMethod = 'bank_transfer') => {
    const txnId = generateTransactionId('payment');

    const paymentTxn: FinanceTransaction = {
      id: txnId,
      type: 'expense',
      category: bill.category,
      amount: bill.amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      accountId: paymentAccount,
      partyName: bill.vendor,
      purpose: `Payment for Invoice ${bill.invoiceNumber} (${bill.description})`,
      invoiceNo: bill.invoiceNumber,
      description: `Settlement of bill ${bill.invoiceNumber}`,
      status: 'approved',
      isReconciled: false,
      relatedBillId: bill.id,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Accountant'
    };

    // Update bill status to 'paid'
    setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'paid', relatedExpenseId: txnId } : b));

    // Append to transactions ledger
    setTransactions(prev => [paymentTxn, ...prev]);

    // Audit log
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: user?.name || 'Accountant',
      action: 'pay',
      transactionId: txnId,
      summary: `Cleared Invoice ${bill.invoiceNumber} for ₹${bill.amount.toLocaleString('en-IN')} to ${bill.vendor} via ${paymentAccount}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setPayingBill(null);
  };

  const handleApproveTransaction = (txn: FinanceTransaction) => {
    setTransactions(prev => prev.map(t => t.id === txn.id ? {
      ...t,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: user?.name || 'Master Admin'
    } : t));

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: user?.name || 'Master Admin',
      action: 'approve',
      transactionId: txn.id,
      summary: `Approved voucher ${txn.id} for ₹${txn.amount.toLocaleString('en-IN')}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setShowApprovalModal(null);
  };

  const handleRejectTransaction = (txn: FinanceTransaction) => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setTransactions(prev => prev.map(t => t.id === txn.id ? {
      ...t,
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      approvedAt: new Date().toISOString(),
      approvedBy: user?.name || 'Master Admin'
    } : t));

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: user?.name || 'Master Admin',
      action: 'reject',
      transactionId: txn.id,
      summary: `Rejected voucher ${txn.id}: ${rejectionReason.trim()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setShowApprovalModal(null);
    setRejectionReason('');
  };

  const handleToggleReconciliation = (txnId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        const nextState = !t.isReconciled;
        return {
          ...t,
          isReconciled: nextState,
          reconciledAt: nextState ? new Date().toISOString().split('T')[0] : undefined,
          reconciledBy: nextState ? user?.name || 'Accountant' : undefined
        };
      }
      return t;
    }));
  };

  // Export CSV Helper
  const exportLedgerCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Particulars', 'Party Name', 'Reference No', 'Account', 'Category', 'Debit (Outflow ₹)', 'Credit (Inflow ₹)', 'Running Balance (₹)'];
    const rows = ledgerEntries.map(e => [
      e.date,
      e.transactionId,
      `"${e.particulars.replace(/"/g, '""')}"`,
      `"${e.partyName.replace(/"/g, '""')}"`,
      e.refNo,
      e.accountId,
      e.category,
      e.debit > 0 ? e.debit : '',
      e.credit > 0 ? e.credit : '',
      e.balance
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mutt_General_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in font-sans">
      
      {/* ========================================================================= */}
      {/* 🏛️ TOP CONTROL BAR & PERIOD SELECTOR                                      */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl text-white shadow-md">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Finance & Treasury Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                Mathaji Ulsooramma Sri Raghavendra Swamy Mutt Central Accounting & Multi-Book Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Global Search & Financial Period Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search ID, donor, vendor, ref..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-emerald-600 ml-2" />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as PeriodFilter)}
              className="bg-transparent text-xs font-bold text-gray-800 dark:text-gray-200 py-1.5 pr-2 outline-none cursor-pointer"
            >
              <option value="today">Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month ({new Date().toLocaleDateString('en-IN', { month: 'short' })})</option>
              <option value="prev_month">Previous Month</option>
              <option value="fy_current">FY 2026–27 (Current)</option>
              <option value="fy_previous">FY 2025–26 (Previous)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-gray-200 outline-none"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-gray-200 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ QUICK ACTIONS TOOLBAR                                                  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-4 rounded-2xl shadow-md border border-emerald-800/40 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
          <Sparkles size={16} />
          <span>Accountant Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowIncomeModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus size={14} />
            <span>+ Record Income</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus size={14} />
            <span>+ Record Expense</span>
          </button>

          <button
            onClick={() => setShowDonationModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus size={14} />
            <span>+ Record Donation</span>
          </button>

          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload Bill</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <FileText size={14} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧭 INTERNAL FINANCE NAVIGATION TABS                                       */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200 dark:border-slate-800">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Layers },
          { id: 'transactions', label: `Transactions (${transactions.length})`, icon: DollarSign },
          { id: 'ledger', label: 'General Ledger', icon: FileText },
          { id: 'accounts', label: 'Cash & Bank Books', icon: Building2 },
          { id: 'bills', label: `Bills & Invoices (${bills.length})`, icon: Paperclip },
          { id: 'pending_payments', label: `Pending Payables (${bills.filter(b => b.status !== 'paid').length})`, icon: Clock },
          { id: 'reports', label: 'Financial Reports', icon: PieChartIcon },
          { id: 'audit_log', label: 'Audit Trail', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1️⃣ SECTION: FINANCE DASHBOARD                                             */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Smart Finance Alerts */}
          {(summary.pendingPayments > 0 || summary.pendingApprovals > 0 || summary.cashInHand < 20000) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {summary.pendingPayments > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-3.5 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Pending Invoices: ₹{summary.pendingPayments.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {bills.filter(b => b.status === 'overdue' || b.status === 'due_soon').length} vendor bills require immediate clearance.
                    </p>
                  </div>
                </div>
              )}

              {summary.pendingApprovals > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-3.5 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      {summary.pendingApprovals} Vouchers Awaiting Approval
                    </span>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400">
                      Review & sign off draft expense vouchers.
                    </p>
                  </div>
                </div>
              )}

              {summary.cashInHand < 20000 && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-3.5 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Low Treasury Cash: ₹{summary.cashInHand.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400">
                      Replenish petty cash from SBI Main Account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Income */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Total Income ({dateRange.label})
                </span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <ArrowDownLeft size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  ₹{summary.totalIncome.toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp size={13} /> Includes Online & Seva Receipts
                </span>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-rose-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Total Expenses ({dateRange.label})
                </span>
                <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  ₹{summary.totalExpenses.toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <TrendingDown size={13} /> Outflows & Vendor Settled Bills
                </span>
              </div>
            </div>

            {/* Cash in Hand */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-amber-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Cash in Treasury
                </span>
                <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl">
                  <Wallet size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  ₹{summary.cashInHand.toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-amber-600 mt-1 block">
                  Vault & Counter Petty Cash
                </span>
              </div>
            </div>

            {/* Total Bank Balance */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-blue-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Total Bank Balance
                </span>
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-xl">
                  <Building2 size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  ₹{summary.bankBalance.toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 mt-1 block">
                  3 Active Bank Accounts (SBI, Canara, HDFC)
                </span>
              </div>
            </div>
          </div>

          {/* Today's Activity Strip */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  Today's Live Treasury Activity ({new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })})
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {summary.txnCountToday} Transactions Logged Today
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Income Today</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">₹{summary.incomeToday.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">Cash: ₹{summary.cashReceivedToday} | Bank: ₹{summary.bankReceivedToday}</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Expenses Today</span>
                <p className="text-xl font-black text-rose-400 mt-0.5">₹{summary.expensesToday.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">Cash: ₹{summary.cashPaidToday} | Bank: ₹{summary.bankPaidToday}</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Day Surplus</span>
                <p className={`text-xl font-black mt-0.5 ${summary.netToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{summary.netToday.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">Day Cash Flow</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Net Balance</span>
                <p className="text-xl font-black text-white mt-0.5">₹{summary.currentBalance.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">Cash + Bank Combined</span>
              </div>
            </div>
          </div>

          {/* Visual Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Income vs Expense Comparison & Split */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Income vs. Expenditure Ratio</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-700 dark:text-emerald-400">Total Income: ₹{summary.totalIncome.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500">
                      {summary.totalIncome + summary.totalExpenses > 0 ? Math.round((summary.totalIncome / (summary.totalIncome + summary.totalExpenses)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary.totalIncome + summary.totalExpenses > 0 ? (summary.totalIncome / (summary.totalIncome + summary.totalExpenses)) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-700 dark:text-rose-400">Total Expenditure: ₹{summary.totalExpenses.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500">
                      {summary.totalIncome + summary.totalExpenses > 0 ? Math.round((summary.totalExpenses / (summary.totalIncome + summary.totalExpenses)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary.totalIncome + summary.totalExpenses > 0 ? (summary.totalExpenses / (summary.totalIncome + summary.totalExpenses)) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 dark:bg-slate-900/60 rounded-2xl border border-emerald-100 dark:border-slate-700 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">Net Surplus for Selected Period:</span>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ₹{(summary.totalIncome - summary.totalExpenses).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-black rounded-full">
                    Healthy Reserve
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Accounts Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Account Balance Allocations</span>
              </h3>

              <div className="space-y-3">
                {TEMPLE_BANK_ACCOUNTS.map(acc => {
                  let bal = acc.openingBalance;
                  transactions.filter(t => t.status === 'approved' && t.accountId === acc.id).forEach(t => {
                    if (t.type === 'income' || t.type === 'donation') bal += t.amount;
                    else bal -= t.amount;
                  });

                  return (
                    <div key={acc.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white font-bold text-xs ${acc.type === 'cash' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                          {acc.type === 'cash' ? <Wallet size={16} /> : <Building2 size={16} />}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{acc.name}</h4>
                          <span className="text-[10px] font-mono text-gray-400">{acc.accountNumber} • {acc.bankName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-gray-900 dark:text-white">₹{bal.toLocaleString('en-IN')}</p>
                        <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Executive Management Summary Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">
              Temple Executive Financial Summary ({dateRange.label})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <th className="py-3 px-4">Financial Component</th>
                    <th className="py-3 px-4">Accounting Head</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 font-medium text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Opening Cash & Bank Reserves</td>
                    <td className="py-3 px-4">FY Baseline Reserves</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">₹{summary.openingBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center"><span className="text-emerald-600 font-bold">Verified</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Total Inflows (Donations, Seva, Hundi)</td>
                    <td className="py-3 px-4">Direct Charitable Receipts</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">+ ₹{summary.totalIncome.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center"><span className="text-emerald-600 font-bold">Audited</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Total Outflows (Maintenance, Bills, Kitchen)</td>
                    <td className="py-3 px-4">Operating & Seva Expenses</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">- ₹{summary.totalExpenses.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center"><span className="text-rose-600 font-bold">Settled</span></td>
                  </tr>
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-950 dark:text-emerald-200">
                    <td className="py-3 px-4 text-sm font-black">Net Closing Position (Cash + Bank Combined)</td>
                    <td className="py-3 px-4">Total Net Available Liquid Funds</td>
                    <td className="py-3 px-4 text-right font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ₹{summary.currentBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">Balanced</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2️⃣ SECTION: TRANSACTIONS (INCOME, EXPENSES, DONATIONS)                    */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Sub-tabs & Action Toolbar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: `All (${transactions.length})` },
                { id: 'income', label: `Income (${transactions.filter(t => t.type === 'income' || t.type === 'donation').length})` },
                { id: 'expenses', label: `Expenses (${transactions.filter(t => t.type === 'expense' || t.type === 'payment').length})` },
                { id: 'donations', label: `Donations (${transactions.filter(t => t.type === 'donation').length})` }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setTransactionSubTab(sub.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    transactionSubTab === sub.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportLedgerCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Txn ID / Ref</th>
                    <th className="py-3.5 px-4">Donor / Vendor</th>
                    <th className="py-3.5 px-4">Purpose & Category</th>
                    <th className="py-3.5 px-4">Account / Method</th>
                    <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 font-medium text-gray-700 dark:text-gray-300">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                        No transactions found matching the query.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(txn => {
                      const isIncome = txn.type === 'income' || txn.type === 'donation';
                      return (
                        <tr key={txn.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-gray-500 dark:text-gray-400">
                            {txn.date}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-gray-900 dark:text-white block">{txn.id}</span>
                            {txn.receiptNumber && (
                              <span className="text-[10px] font-mono text-emerald-600 block">{txn.receiptNumber}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {txn.partyName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="block text-gray-900 dark:text-white">{txn.purpose}</span>
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 mt-0.5">
                              {txn.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="block text-gray-800 dark:text-gray-200 uppercase text-[11px] font-bold">
                              {txn.paymentMethod}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {txn.accountId === 'cash_in_hand' ? 'Cash Vault' : txn.accountId.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black font-mono text-sm whitespace-nowrap ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {isIncome ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              txn.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                              txn.status === 'pending_approval' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}>
                              {txn.status === 'approved' ? 'Approved ✓' : txn.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {(txn.type === 'donation' || txn.receiptNumber) && (
                                <button
                                  onClick={() => setShowReceiptModal(txn)}
                                  className="p-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  title="View & Print Official Temple Receipt"
                                >
                                  <FileText size={14} />
                                </button>
                              )}

                              {txn.status === 'pending_approval' && (
                                <button
                                  onClick={() => setShowApprovalModal(txn)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] cursor-pointer"
                                  title="Approve or Reject Voucher"
                                >
                                  Review
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3️⃣ SECTION: GENERAL LEDGER (ACCOUNTING FORMAT)                             */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Temple General Ledger Book</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Continuous double-entry running balance ledger for all approved transactions.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Ledger</span>
              </button>
              <button
                onClick={exportLedgerCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Particulars & Description</th>
                    <th className="py-3 px-4">Voucher / Ref</th>
                    <th className="py-3 px-4">Account Head</th>
                    <th className="py-3 px-4 text-right">Debit (Outflow ₹)</th>
                    <th className="py-3 px-4 text-right">Credit (Inflow ₹)</th>
                    <th className="py-3 px-4 text-right">Running Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                  {/* Opening Balance Row */}
                  <tr className="bg-gray-50 dark:bg-slate-900/60 font-bold text-gray-900 dark:text-white">
                    <td className="py-3 px-4 font-mono">{dateRange.startDate}</td>
                    <td className="py-3 px-4" colSpan={3}>OPENING BALANCE BROUGHT FORWARD (B/F)</td>
                    <td className="py-3 px-4 text-right font-mono">—</td>
                    <td className="py-3 px-4 text-right font-mono">—</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-black">
                      ₹{summary.openingBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {ledgerEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-gray-500">{entry.date}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {entry.particulars}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400 text-[11px] whitespace-nowrap">{entry.refNo}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{entry.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-gray-900 dark:text-white">
                        ₹{entry.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4️⃣ SECTION: ACCOUNTS (CASH BOOK, BANK BOOK, BANK RECONCILIATION)           */}
      {/* ========================================================================= */}
      {activeTab === 'accounts' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Sub-tabs for Accounts */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 pb-2">
            {[
              { id: 'cash_book', label: 'Cash Book (Treasury)', icon: Wallet },
              { id: 'bank_book', label: 'Bank Book (Accounts)', icon: Building2 },
              { id: 'reconciliation', label: 'Bank Reconciliation (BRS)', icon: CheckSquare }
            ].map(sub => {
              const Icon = sub.icon;
              const isActive = accountsSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setAccountsSubTab(sub.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* 4A: CASH BOOK */}
          {accountsSubTab === 'cash_book' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 dark:bg-amber-950/40 p-5 rounded-3xl border border-amber-200 dark:border-amber-800/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Temple Cash Book (Physical Treasury)
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                    Closing Cash Balance: ₹{summary.cashInHand.toLocaleString('en-IN')}
                  </h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Print Cash Book
                </button>
              </div>

              {/* Cash Transactions Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-extrabold uppercase border-b border-gray-200 dark:border-slate-700">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Particulars</th>
                      <th className="py-3 px-4">Ref No</th>
                      <th className="py-3 px-4 text-right">Cash Outflow (-)</th>
                      <th className="py-3 px-4 text-right">Cash Inflow (+)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                    {transactions.filter(t => t.accountId === 'cash_in_hand').map(txn => {
                      const isInc = txn.type === 'income' || txn.type === 'donation';
                      return (
                        <tr key={txn.id}>
                          <td className="py-3 px-4 font-mono">{txn.date}</td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{txn.purpose} ({txn.partyName})</td>
                          <td className="py-3 px-4 font-mono text-gray-400">{txn.referenceNo || txn.id}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">{!isInc ? `₹${txn.amount.toLocaleString('en-IN')}` : '—'}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{isInc ? `₹${txn.amount.toLocaleString('en-IN')}` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4B: BANK BOOK */}
          {accountsSubTab === 'bank_book' && (
            <div className="space-y-4">
              {/* Account Selector */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {TEMPLE_BANK_ACCOUNTS.filter(a => a.type === 'bank').map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedBankAccountId(acc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shrink-0 w-64 ${
                      selectedBankAccountId === acc.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase opacity-80 block">{acc.bankName}</span>
                    <h4 className="text-sm font-black mt-0.5">{acc.name}</h4>
                    <span className="text-xs font-mono opacity-90 block mt-2">{acc.accountNumber}</span>
                  </button>
                ))}
              </div>

              {/* Bank Book Transactions */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-extrabold uppercase border-b border-gray-200 dark:border-slate-700">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Particulars</th>
                      <th className="py-3 px-4">UTR / Ref</th>
                      <th className="py-3 px-4 text-right">Debit (-)</th>
                      <th className="py-3 px-4 text-right">Credit (+)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                    {transactions.filter(t => t.accountId === selectedBankAccountId).map(txn => {
                      const isInc = txn.type === 'income' || txn.type === 'donation';
                      return (
                        <tr key={txn.id}>
                          <td className="py-3 px-4 font-mono">{txn.date}</td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{txn.purpose} ({txn.partyName})</td>
                          <td className="py-3 px-4 font-mono text-gray-400">{txn.referenceNo || txn.id}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">{!isInc ? `₹${txn.amount.toLocaleString('en-IN')}` : '—'}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{isInc ? `₹${txn.amount.toLocaleString('en-IN')}` : '—'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${txn.isReconciled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {txn.isReconciled ? 'Reconciled ✓' : 'Unreconciled'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4C: BANK RECONCILIATION */}
          {accountsSubTab === 'reconciliation' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Bank Reconciliation Statement (BRS)</h3>
                    <p className="text-xs text-gray-500">Compare temple system bank ledger with official bank passbook / statement.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">Bank Statement Balance:</span>
                    <input
                      type="number"
                      value={bankStatementBalance}
                      onChange={e => setBankStatementBalance(Number(e.target.value))}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white w-32 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">System Ledger Balance</span>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-0.5">
                      ₹{summary.bankBalance.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Bank Statement Balance</span>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                      ₹{bankStatementBalance.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Net BRS Difference</span>
                    <p className={`text-2xl font-black mt-0.5 ${Math.abs(summary.bankBalance - bankStatementBalance) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      ₹{Math.abs(summary.bankBalance - bankStatementBalance).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Click checkbox to reconcile transactions matching bank passbook:
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-700">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-extrabold uppercase">
                        <th className="py-3 px-4 text-center">Cleared</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Txn ID / Ref</th>
                        <th className="py-3 px-4">Party & Purpose</th>
                        <th className="py-3 px-4 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                      {transactions.filter(t => t.accountId !== 'cash_in_hand').map(txn => (
                        <tr key={txn.id} className={txn.isReconciled ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleReconciliation(txn.id)}
                              className="text-emerald-600 cursor-pointer"
                            >
                              {txn.isReconciled ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-400" />}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-mono">{txn.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">{txn.referenceNo || txn.id}</td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{txn.partyName} — {txn.purpose}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            ₹{txn.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5️⃣ SECTION: BILLS & INVOICES                                              */}
      {/* ========================================================================= */}
      {activeTab === 'bills' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Vendor Bills & Invoices</h3>
              <p className="text-xs text-gray-500">Track and upload vendor invoices for purchases, electricity, water, and pooja materials.</p>
            </div>
            <button
              onClick={() => setShowBillModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Upload New Bill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bills.map(bill => (
              <div key={bill.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-400 font-bold">{bill.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      bill.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      bill.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{bill.vendor}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{bill.description}</p>
                  {bill.attachmentName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mb-3">
                      <Paperclip size={13} />
                      {bill.attachmentUrl ? (
                        <a href={bill.attachmentUrl} download={bill.attachmentName} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-500 cursor-pointer">
                          {bill.attachmentName} (View File)
                        </a>
                      ) : (
                        <span>{bill.attachmentName}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">Bill Amount</span>
                    <p className="text-base font-black text-gray-900 dark:text-white">₹{bill.amount.toLocaleString('en-IN')}</p>
                  </div>

                  {bill.status !== 'paid' ? (
                    <button
                      onClick={() => setPayingBill(bill)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Pay Bill
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6️⃣ SECTION: PENDING PAYMENTS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'pending_payments' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1">Outstanding Vendor Payables</h3>
            <p className="text-xs text-gray-500 mb-6">Review pending invoices and clear payments with 1-click automatic ledger & bank update.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-extrabold uppercase">
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Particulars</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Amount Due (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                  {bills.filter(b => b.status !== 'paid').length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-emerald-600 font-bold">
                        All vendor bills and temple payables are completely cleared! ✓
                      </td>
                    </tr>
                  ) : (
                    bills.filter(b => b.status !== 'paid').map(bill => (
                      <tr key={bill.id}>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{bill.vendor}</td>
                        <td className="py-3 px-4 font-mono font-bold">{bill.invoiceNumber}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{bill.description}</td>
                        <td className="py-3 px-4 font-mono text-gray-500">{bill.dueDate}</td>
                        <td className="py-3 px-4 text-right font-black font-mono text-rose-600">
                          ₹{bill.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            bill.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setPayingBill(bill)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Mark as Paid
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7️⃣ SECTION: FINANCIAL REPORTS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Official Income & Expenditure Statement</h3>
                <p className="text-xs text-gray-500">Statement of Religious & Charitable Accounts for {dateRange.label}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Formal Statement</span>
                </button>
                <button
                  onClick={exportLedgerCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={14} />
                  <span>Download Excel Report</span>
                </button>
              </div>
            </div>

            {/* Side-by-side Accounting Income & Expenditure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expenditure Column */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-700 dark:text-rose-400 border-b pb-2">
                  Expenditure (Outflow)
                </h4>
                <div className="space-y-2 text-xs">
                  {['Maintenance', 'Electricity', 'Water', 'Purchases', 'Annadanam'].map(cat => {
                    const sum = transactions
                      .filter(t => t.status === 'approved' && t.category === cat && (t.type === 'expense' || t.type === 'payment'))
                      .reduce((s, t) => s + t.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                        <span className="text-gray-600 dark:text-gray-300">To {cat} Expenses</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">₹{sum.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-2 font-bold text-rose-600 pt-3 border-t">
                    <span>Total Expenditure:</span>
                    <span className="font-mono font-black">₹{summary.totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Income Column */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b pb-2">
                  Income (Inflow)
                </h4>
                <div className="space-y-2 text-xs">
                  {['Donations', 'Seva', 'Hundi', 'Annadanam', 'Events'].map(cat => {
                    const sum = transactions
                      .filter(t => t.status === 'approved' && t.category === cat && (t.type === 'income' || t.type === 'donation'))
                      .reduce((s, t) => s + t.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                        <span className="text-gray-600 dark:text-gray-300">By {cat} Receipts</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">₹{sum.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-2 font-bold text-emerald-600 pt-3 border-t">
                    <span>Total Income:</span>
                    <span className="font-mono font-black">₹{summary.totalIncome.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8️⃣ SECTION: AUDIT LOG                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'audit_log' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm animate-fade-in space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Financial Audit & Activity Trail</h3>
          <p className="text-xs text-gray-500">Immutable chronological log of all ledger additions, payment settlements, and approvals.</p>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5">
                  <Shield size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{log.actor}</span>
                    <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{log.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧾 MODAL: PRINTABLE OFFICIAL TEMPLE RECEIPT                                */}
      {/* ========================================================================= */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-orange-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReceiptModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800"
            >
              <X size={18} />
            </button>

            {/* Receipt Printable Container */}
            <div id="temple-receipt-print" className="p-6 border-2 border-orange-400 rounded-2xl space-y-6">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-orange-300 pb-4">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                  || ಶ್ರೀ ಗುರುರಾಜೋ ವಿಜಯತೇ ||
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-orange-900">
                  Mathaji Ulsooramma Sri Raghavendra Swamy Mutt
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  Vidyaranyapura Main Road, Bengaluru, Karnataka - 560097
                </p>
                <div className="inline-block px-3 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-extrabold uppercase rounded-full">
                  Official Charitable Seva Receipt
                </div>
              </div>

              {/* Receipt Metadata */}
              <div className="flex justify-between text-xs font-mono font-bold text-gray-700">
                <span>Receipt No: <strong className="text-orange-900 font-black">{showReceiptModal.receiptNumber || showReceiptModal.id}</strong></span>
                <span>Date: {showReceiptModal.date}</span>
              </div>

              {/* Donor Details */}
              <div className="space-y-2 text-xs leading-relaxed">
                <p>
                  Received with thanks from: <strong className="text-sm font-extrabold text-gray-950">{showReceiptModal.partyName}</strong>
                </p>
                <p>
                  The sacred sum of: <strong className="font-mono text-base font-black text-emerald-800">₹{showReceiptModal.amount.toLocaleString('en-IN')}</strong>
                </p>
                <p className="italic text-gray-700 bg-orange-50/60 p-2.5 rounded-xl border border-orange-100 font-serif">
                  Amount in Words: <strong>{numberToIndianWords(showReceiptModal.amount)}</strong>
                </p>
                <p>
                  Towards Seva / Purpose: <strong className="font-bold">{showReceiptModal.purpose}</strong>
                </p>
                <p>
                  Payment Mode: <span className="uppercase font-bold">{showReceiptModal.paymentMethod}</span> ({showReceiptModal.referenceNo || 'Counter Ref'})
                </p>
              </div>

              {/* Signature Area */}
              <div className="pt-8 flex justify-between items-end text-xs font-bold text-gray-700">
                <div className="text-center">
                  <div className="w-20 h-10 border-b border-gray-300 mb-1" />
                  <span>Devotee Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-28 h-10 border-b border-gray-300 mb-1 flex items-center justify-center text-[10px] text-orange-600 font-serif">
                    || ರಾಯರ ಕೃಪೆ ||
                  </div>
                  <span>Authorized Signatory</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📥 MODALS: RECORD INCOME / DONATION                                       */}
      {/* ========================================================================= */}
      {(showIncomeModal || showDonationModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {showDonationModal ? 'Record Devotee Donation' : 'Record Temple Income'}
              </h3>
              <button onClick={() => { setShowIncomeModal(false); setShowDonationModal(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  {showDonationModal ? 'Donor Full Name *' : 'Payer / Source Name *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sri Venkatesh Rao"
                  value={incomeForm.partyName}
                  onChange={e => setIncomeForm({ ...incomeForm, partyName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={incomeForm.amount}
                    onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    value={incomeForm.date}
                    onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Payment Method</label>
                  <select
                    value={incomeForm.paymentMethod}
                    onChange={e => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    <option value="upi">UPI (GPay / PhonePe)</option>
                    <option value="cash">Cash (Counter)</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Deposit Account</label>
                  <select
                    value={incomeForm.accountId}
                    onChange={e => setIncomeForm({ ...incomeForm, accountId: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    {TEMPLE_BANK_ACCOUNTS.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Purpose / Seva Name</label>
                <input
                  type="text"
                  placeholder="e.g. Annadanam Seva / Panchamrutha Abhisheka"
                  value={incomeForm.purpose}
                  onChange={e => setIncomeForm({ ...incomeForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Reference / UTR / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/2839481920/HDFC"
                  value={incomeForm.referenceNo}
                  onChange={e => setIncomeForm({ ...incomeForm, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => { setShowIncomeModal(false); setShowDonationModal(false); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecordIncomeOrDonation(showDonationModal)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save & Update Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📤 MODAL: RECORD EXPENSE                                                  */}
      {/* ========================================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Record Temple Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Vendor / Payee *</label>
                <input
                  type="text"
                  placeholder="e.g. BESCOM / Provision Store"
                  value={expenseForm.partyName}
                  onChange={e => setExpenseForm({ ...expenseForm, partyName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="14500"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Expense Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    {['Maintenance', 'Electricity', 'Water', 'Salaries', 'Purchases', 'Annadanam', 'Events', 'Repairs', 'Other Expenses'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Payment Account</label>
                  <select
                    value={expenseForm.accountId}
                    onChange={e => setExpenseForm({ ...expenseForm, accountId: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    {TEMPLE_BANK_ACCOUNTS.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Payment Mode</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Purpose / Item Details</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Power Bill / Annadanam Rice"
                  value={expenseForm.purpose}
                  onChange={e => setExpenseForm({ ...expenseForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordExpense}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save & Update Books
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 MODAL: UPLOAD BILL                                                     */}
      {/* ========================================================================= */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Upload Vendor Bill / Invoice</h3>
              <button onClick={() => setShowBillModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Vendor Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Lakshmi Pure Ghee Suppliers"
                  value={billForm.vendor}
                  onChange={e => setBillForm({ ...billForm, vendor: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    placeholder="INV-2026-401"
                    value={billForm.invoiceNumber}
                    onChange={e => setBillForm({ ...billForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="18500"
                    value={billForm.amount}
                    onChange={e => setBillForm({ ...billForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={billForm.date}
                    onChange={e => setBillForm({ ...billForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={billForm.dueDate}
                    onChange={e => setBillForm({ ...billForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Attachment (PDF / JPG / PNG)</label>
                <input
                  type="file"
                  id="bill-file-upload-input"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFileMeta ? (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-gray-900 dark:text-white text-xs truncate block">{selectedFileMeta.name}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{selectedFileMeta.size} • Ready for upload</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFileMeta(null);
                        setBillForm(prev => ({ ...prev, attachmentName: '', attachmentUrl: '' }));
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById('bill-file-upload-input')?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleFileDrop}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-1.5 cursor-pointer transition-all ${
                      isDraggingFile
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'border-gray-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Upload className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="text-gray-800 dark:text-gray-200 font-bold text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 underline">Click to upload</span> or drag bill file here
                    </p>
                    <span className="text-[10px] text-gray-400 block">Supports PDF, JPEG, PNG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
              <button onClick={() => setShowBillModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button
                onClick={handleUploadBill}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Upload & Add to Payables
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💳 MODAL: PAY PENDING BILL                                                */}
      {/* ========================================================================= */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Clear Vendor Invoice</h3>
            
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 space-y-1 text-xs">
              <p>Vendor: <strong className="text-gray-900 dark:text-white">{payingBill.vendor}</strong></p>
              <p>Invoice No: <strong className="font-mono">{payingBill.invoiceNumber}</strong></p>
              <p>Amount to Settle: <strong className="text-rose-600 text-sm font-black font-mono">₹{payingBill.amount.toLocaleString('en-IN')}</strong></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Disburse From Account</label>
                <select
                  id="pay-account-select"
                  defaultValue="sbi_main"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                >
                  {TEMPLE_BANK_ACCOUNTS.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.openingBalance.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
              <button onClick={() => setPayingBill(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  const accEl = document.getElementById('pay-account-select') as HTMLSelectElement;
                  handleMarkBillAsPaid(payingBill, (accEl?.value as AccountId) || 'sbi_main');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm Payment & Update Books
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✍️ MODAL: REVIEW & APPROVAL                                              */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Review Transaction Voucher</h3>
            
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 space-y-1.5 text-xs">
              <p>Txn ID: <strong className="font-mono">{showApprovalModal.id}</strong></p>
              <p>Party Name: <strong className="text-gray-900 dark:text-white">{showApprovalModal.partyName}</strong></p>
              <p>Category: <strong>{showApprovalModal.category}</strong></p>
              <p>Purpose: <strong>{showApprovalModal.purpose}</strong></p>
              <p>Amount: <strong className="text-base font-black font-mono text-emerald-600">₹{showApprovalModal.amount.toLocaleString('en-IN')}</strong></p>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1 text-xs">Rejection Reason (if declining)</label>
              <input
                type="text"
                placeholder="Reason for rejecting voucher..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setShowApprovalModal(null)}
                className="px-3.5 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleRejectTransaction(showApprovalModal)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Reject Voucher
              </button>
              <button
                onClick={() => handleApproveTransaction(showApprovalModal)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Approve & Post to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
