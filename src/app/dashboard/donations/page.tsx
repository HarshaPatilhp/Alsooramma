"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileDown } from 'lucide-react';
import { createClient } from '@/lib/client';

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  purpose: string;
  receiptSent: boolean;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setDonations(data.map((d: any) => ({
          id: d.id,
          donorName: d.donor_name,
          amount: d.amount,
          date: d.date,
          purpose: d.purpose,
          receiptSent: d.receipt_sent
        })));
      }
    };
    fetchDonations();
  }, []);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const handleAddRecord = async () => {
    const name = window.prompt("Enter donor name:");
    if (!name) return;
    const amountStr = window.prompt("Enter donation amount (e.g. 1000):", "1000");
    const amount = Number(amountStr) || 1000;
    const purpose = window.prompt("Enter purpose (e.g. General Fund):", "General Fund") || "General Fund";

    const newRecord = {
      id: `DON-${Math.floor(Math.random() * 100000)}`,
      donor_name: name,
      amount,
      date: new Date().toLocaleDateString('en-IN'),
      purpose,
      receipt_sent: false
    };
    
    const supabase = createClient();
    const { error } = await supabase.from('donations').insert([newRecord]);
    
    if (!error) {
       setDonations([{
          id: newRecord.id,
          donorName: newRecord.donor_name,
          amount: newRecord.amount,
          date: newRecord.date,
          purpose: newRecord.purpose,
          receiptSent: newRecord.receipt_sent
       }, ...donations]);
    } else {
       alert("Failed to add donation. Please try again.");
       console.error(error);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Receipt ID,Donor Name,Purpose,Date,Amount,Status\n" +
      donations.map(d => `${d.id},"${d.donorName}","${d.purpose}",${d.date},${d.amount},${d.receiptSent ? 'Sent' : 'Pending'}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "donations_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilter = () => {
    alert("Advanced filter panel will open here. Currently filtering by search term only.");
  };

  const handleSendReceipt = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('donations').update({ receipt_sent: true }).eq('id', id);
    if (!error) {
       setDonations(donations.map(d => d.id === id ? { ...d, receiptSent: true } : d));
       alert(`Receipt sent for ID: ${id}`);
    } else {
       alert("Failed to send receipt.");
       console.error(error);
    }
  };

  const filtered = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations Ledger</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track financial contributions and issue receipts.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800/40 transition-colors font-medium text-sm"
          >
            <FileDown size={18} /> Export
          </button>
          <button 
            onClick={handleAddRecord}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Overview Stat */}
      <div className="bg-gradient-to-r from-orange-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
         <div>
            <p className="text-orange-100 font-medium tracking-wide uppercase text-sm mb-1">Total Contributions Generated</p>
            <h2 className="text-4xl font-extrabold flex items-baseline gap-1">
              <span className="text-2xl opacity-80">₹</span> {totalAmount.toLocaleString('en-IN')}
            </h2>
         </div>
         <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm hidden sm:block">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
         </div>
      </div>

      {/* Interactive Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search donor, ID, or purpose..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-900 shadow-sm text-sm"
            />
          </div>
          <button 
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-medium text-gray-700 dark:text-gray-300 text-sm"
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                <th className="px-6 py-4">Receipt ID</th>
                <th className="px-6 py-4">Donor Name</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount (₹)</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filtered.length > 0 ? (
                filtered.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                      {donation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                      {donation.donorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {donation.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {donation.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-orange-400 text-right">
                      {donation.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {donation.receiptSent ? (
                        <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400 px-2 py-1 rounded text-xs font-semibold">Sent</span>
                      ) : (
                        <button 
                          onClick={() => handleSendReceipt(donation.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
                        >
                          Send Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No donations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
