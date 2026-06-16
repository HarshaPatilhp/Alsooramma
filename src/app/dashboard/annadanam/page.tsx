"use client";

import { useState, useEffect } from 'react';
import { Search, Utensils, Calendar } from 'lucide-react';
import { createClient } from '@/lib/client';

interface AnnadanamSponsor {
  id: string;
  sponsorName: string;
  contact: string;
  date: string;
  mealType: string;
  amount: number;
}

export default function AnnadanamPage() {
  const [sponsors, setSponsors] = useState<AnnadanamSponsor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSponsors = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('annadanam').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setSponsors(data.map((s: any) => ({
          id: s.id,
          sponsorName: s.sponsor_name,
          contact: s.contact,
          date: s.date,
          mealType: s.meal_type,
          amount: s.amount
        })));
      }
    };
    fetchSponsors();
  }, []);

  const handleScheduleSponsor = async () => {
    const name = window.prompt("Enter sponsor name:");
    if (!name) return;
    const amountStr = window.prompt("Enter donation amount (e.g. 5000):", "5000");
    const amount = Number(amountStr) || 5000;
    
    const newSponsor = {
      id: `ANN-${Math.floor(Math.random() * 1000)}`,
      sponsor_name: name,
      contact: 'N/A',
      date: new Date().toLocaleDateString('en-IN'),
      meal_type: 'Special Annadanam',
      amount
    };
    
    const supabase = createClient();
    const { error } = await supabase.from('annadanam').insert([newSponsor]);
    
    if (!error) {
      setSponsors([{
        id: newSponsor.id,
        sponsorName: newSponsor.sponsor_name,
        contact: newSponsor.contact,
        date: newSponsor.date,
        mealType: newSponsor.meal_type,
        amount: newSponsor.amount
      }, ...sponsors]);
    } else {
      alert("Failed to schedule sponsor. Please try again.");
      console.error(error);
    }
  };

  const filtered = sponsors.filter(s => 
    s.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.mealType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <Utensils className="text-orange-500" />
             Annadanam Sponsoring
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and view the daily food sponsorship records.</p>
        </div>
        <button 
          onClick={handleScheduleSponsor}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          + Schedule Sponsor
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sponsors by name or meal type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-slate-900 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/30 dark:bg-slate-900/40">
           {filtered.length > 0 ? (
             filtered.map((sponsor) => (
                <div key={sponsor.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center font-bold text-xl">
                        {sponsor.sponsorName.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                         {sponsor.mealType}
                      </span>
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">{sponsor.sponsorName}</h3>
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 gap-2">
                     <Calendar size={14} /> {sponsor.date}
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                     <span className="text-sm font-medium text-gray-500">Donation Amt:</span>
                     <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">₹{sponsor.amount.toLocaleString('en-IN')}</span>
                   </div>
                </div>
             ))
           ) : (
             <div className="col-span-full py-12 text-center text-gray-500">
               No annadanam records match your query.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
