"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileDown, 
  X, 
  CheckCircle2, 
  HeartHandshake, 
  IndianRupee, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Receipt,
  Sparkles,
  Landmark,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/client';

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  purpose: string;
  paymentMode?: string;
  phone?: string;
  email?: string;
  receiptSent: boolean;
}

const PURPOSE_OPTIONS = [
  "General Mutt Development Fund",
  "Nitya Annadanam Seva",
  "Moola Brindavana Pooja Seva",
  "Goshala & Cow Protection Seva",
  "Veda Pathashala & Vidya Seva",
  "Special Utsavam & Aradhana Fund",
  "Temple Infrastructure & Renovation"
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add Record Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDonorName, setFormDonorName] = useState('');
  const [formAmount, setFormAmount] = useState<number | string>('1000');
  const [formPurpose, setFormPurpose] = useState(PURPOSE_OPTIONS[0]);
  const [formPaymentMode, setFormPaymentMode] = useState('UPI / Online');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formReceiptSent, setFormReceiptSent] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setDonations(data.map((d: any) => ({
          id: String(d.id),
          donorName: d.donor_name || d.donorName || '',
          amount: Number(d.amount) || 0,
          date: d.date || '',
          purpose: d.purpose || 'General Fund',
          paymentMode: d.payment_mode || d.paymentMode || 'Online',
          phone: d.phone || '',
          email: d.email || '',
          receiptSent: !!d.receipt_sent
        })));
      } else if (error) {
        console.error("Error fetching donations:", error.message);
      }
    } catch (err) {
      console.error("Fetch donations exception:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const handleOpenModal = () => {
    setFormDonorName('');
    setFormAmount('1000');
    setFormPurpose(PURPOSE_OPTIONS[0]);
    setFormPaymentMode('UPI / Online');
    setFormPhone('');
    setFormEmail('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormReceiptSent(true);
    setSubmitSuccess(false);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDonorName.trim()) {
      alert("Please enter donor name.");
      return;
    }
    const numAmount = Number(formAmount) || 0;
    if (numAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    setIsSubmitting(true);
    const newId = `DON-${Date.now().toString().slice(-6)}`;
    const formattedDate = formDate || new Date().toISOString().split('T')[0];

    const newRecord = {
      id: newId,
      donor_name: formDonorName.trim(),
      amount: numAmount,
      date: formattedDate,
      purpose: formPurpose,
      payment_mode: formPaymentMode,
      phone: formPhone.trim(),
      email: formEmail.trim(),
      receipt_sent: formReceiptSent,
      created_at: new Date().toISOString()
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from('donations').insert([newRecord]);
      
      if (!error) {
        setDonations([
          {
            id: newRecord.id,
            donorName: newRecord.donor_name,
            amount: newRecord.amount,
            date: newRecord.date,
            purpose: newRecord.purpose,
            paymentMode: newRecord.payment_mode,
            phone: newRecord.phone,
            email: newRecord.email,
            receiptSent: newRecord.receipt_sent
          },
          ...donations
        ]);

        // Auto-sync into Central Finance Ledger
        if (typeof window !== 'undefined') {
          try {
            const existingFinance = JSON.parse(localStorage.getItem('alsur_finance_transactions') || '[]');
            const newFinanceTxn = {
              id: newRecord.id,
              type: 'donation',
              category: 'Donations',
              amount: newRecord.amount,
              date: newRecord.date,
              paymentMethod: (newRecord.payment_mode || 'upi').toLowerCase(),
              accountId: (newRecord.payment_mode && newRecord.payment_mode.toLowerCase().includes('cash')) ? 'cash_in_hand' : 'sbi_main',
              partyName: newRecord.donor_name,
              purpose: newRecord.purpose || 'Temple Seva & Annadanam Donation',
              referenceNo: newRecord.id,
              receiptNumber: `MUM-${new Date().getFullYear()}-${newRecord.id.slice(-5)}`,
              description: `Donation from ${newRecord.donor_name} (${newRecord.purpose})`,
              status: 'approved',
              isReconciled: true,
              createdAt: newRecord.created_at,
              createdBy: 'Donations Portal'
            };
            localStorage.setItem('alsur_finance_transactions', JSON.stringify([newFinanceTxn, ...existingFinance]));
          } catch (syncErr) {
            console.warn('Finance sync notice:', syncErr);
          }
        }

        setSubmitSuccess(true);
        setTimeout(() => {
          setShowAddModal(false);
          setSubmitSuccess(false);
        }, 1200);
      } else {
        alert("Failed to save donation. " + error.message);
      }
    } catch (err: any) {
      console.error("Donation creation error:", err);
      alert("An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    if (donations.length === 0) {
      alert("No donation records to export.");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      "Receipt ID,Donor Name,Purpose,Payment Mode,Phone,Email,Date,Amount,Status\n" +
      donations.map(d => `"${d.id}","${d.donorName}","${d.purpose}","${d.paymentMode || 'Online'}","${d.phone || ''}","${d.email || ''}","${d.date}",${d.amount},"${d.receiptSent ? 'Sent' : 'Pending'}"`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `donations_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReceipt = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('donations').update({ receipt_sent: true }).eq('id', id);
      if (!error) {
        setDonations(donations.map(d => d.id === id ? { ...d, receiptSent: true } : d));
        alert(`Receipt confirmed & recorded as sent for ID: ${id}`);
      } else {
        alert("Failed to update receipt status: " + error.message);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error sending receipt.");
    }
  };

  const filtered = donations.filter(d => {
    const matchesSearch = 
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.phone || '').includes(searchTerm);
    
    const matchesPurpose = purposeFilter === 'All' || d.purpose === purposeFilter;

    return matchesSearch && matchesPurpose;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations Ledger</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Track sacred contributions, issue receipts, and manage seva endowments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/finance"
            className="flex items-center gap-2 px-4 py-2 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors font-bold text-sm cursor-pointer shadow-xs"
          >
            <Landmark size={17} />
            <span>Open Finance Ledger</span>
          </Link>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-800/40 transition-colors font-semibold text-sm cursor-pointer shadow-xs"
          >
            <FileDown size={18} /> 
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all text-sm cursor-pointer"
          >
            <Plus size={18} /> 
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Card */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-orange-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Nidhi & Contribution Ledger
            </span>
          </div>
          <p className="text-orange-100 font-semibold tracking-wide text-xs sm:text-sm">Total Contributions Recorded</p>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 flex items-baseline gap-1 tracking-tight text-white">
            <span className="text-2xl font-bold opacity-90">₹</span>
            {totalAmount.toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-orange-200 mt-2">
            {donations.length} total donors and devotees recorded
          </p>
        </div>
        <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 hidden sm:flex">
          <HeartHandshake className="w-10 h-10 text-amber-200" />
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search donor, ID, purpose, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-900 shadow-sm text-sm"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
            >
              <Filter size={18} />
              <span>{purposeFilter === 'All' ? 'All Purposes' : purposeFilter.slice(0, 20) + '...'}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 py-2">
                <button
                  onClick={() => { setPurposeFilter('All'); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer ${
                    purposeFilter === 'All' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  All Purposes
                </button>
                {PURPOSE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setPurposeFilter(opt); setShowFilterMenu(false); }}
                    className={`block w-full text-left px-4 py-2 text-xs cursor-pointer ${
                      purposeFilter === opt ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Loading contribution records...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                  <th className="px-6 py-4">Receipt ID</th>
                  <th className="px-6 py-4">Donor Details</th>
                  <th className="px-6 py-4">Purpose / Seva</th>
                  <th className="px-6 py-4">Date & Mode</th>
                  <th className="px-6 py-4 text-right">Amount (₹)</th>
                  <th className="px-6 py-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filtered.length > 0 ? (
                  filtered.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400 font-bold">
                        #{donation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 flex items-center justify-center font-extrabold text-xs">
                            {donation.donorName ? donation.donorName.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{donation.donorName}</p>
                            {donation.phone && (
                              <p className="text-xs text-gray-400">{donation.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40">
                          {donation.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                        <p className="font-semibold">{donation.date}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">{donation.paymentMode || 'UPI / Online'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 dark:text-orange-400 text-right">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {donation.receiptSent ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            Issued
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleSendReceipt(donation.id)}
                            className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-800/50 px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer border border-orange-200 dark:border-orange-800/40"
                          >
                            <Receipt className="w-3 h-3" />
                            Issue
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <HeartHandshake className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-base font-bold">No donation records found</p>
                        <p className="text-xs text-gray-400 mt-1">Try clearing filters or click "+ Add Record" to enter a contribution.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Beautiful Add Record Modal Card */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 relative animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-600 p-6 text-white relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Record New Contribution</h3>
                  <p className="text-orange-100 text-xs mt-0.5">Enter donor details and seva endowment information</p>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            {submitSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white">Donation Recorded!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The contribution has been successfully entered into the ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Donor Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Srikanth Raghavan"
                      value={formDonorName}
                      onChange={(e) => setFormDonorName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Donation Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="1000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Preset Amount Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setFormAmount(amt)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          Number(formAmount) === amt 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs' 
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        +₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose / Seva */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Donation Purpose / Seva *
                  </label>
                  <select
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                  >
                    {PURPOSE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Mode & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Payment Mode
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formPaymentMode}
                        onChange={(e) => setFormPaymentMode(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      >
                        <option value="UPI / Online">UPI / QR Code</option>
                        <option value="Cash">Direct Cash (Mutt Counter)</option>
                        <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                        <option value="Cheque / DD">Cheque / Demand Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Contribution Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="devotee@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Send Receipt Option */}
                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer bg-orange-50/60 dark:bg-slate-800/60 p-3 rounded-xl border border-orange-100 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={formReceiptSent}
                      onChange={(e) => setFormReceiptSent(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Mark Official Mutt Seva Receipt as Generated / Sent
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Save Contribution'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
