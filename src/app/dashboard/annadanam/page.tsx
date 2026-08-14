"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Utensils, 
  Calendar, 
  Plus, 
  FileDown, 
  X, 
  CheckCircle2, 
  User, 
  Phone, 
  Sparkles, 
  ArrowRight,
  Heart,
  Filter
} from 'lucide-react';
import { createClient } from '@/lib/client';

interface AnnadanamSponsor {
  id: string;
  sponsorName: string;
  contact: string;
  date: string;
  mealType: string;
  amount: number;
  occasion?: string;
  gotra?: string;
}

const MEAL_TYPES = [
  "Nitya Maha Annadanam (Full Day)",
  "Afternoon Maha Prasadam (Lunch)",
  "Evening Tirtha Prasadam (Dinner)",
  "Ekadashi / Dwadashi Special Feast",
  "Utsavam & Festival Maha Prasadam",
  "Annadanam Raw Groceries & Rice Seva"
];

const PRESET_AMOUNTS = [2500, 5000, 10000, 25000, 50000];

export default function AnnadanamPage() {
  const [sponsors, setSponsors] = useState<AnnadanamSponsor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealFilter, setMealFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formMealType, setFormMealType] = useState(MEAL_TYPES[0]);
  const [formAmount, setFormAmount] = useState<number | string>(5000);
  const [formOccasion, setFormOccasion] = useState('');
  const [formGotra, setFormGotra] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('annadanam')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && Array.isArray(data)) {
        setSponsors(data.map((s: any) => ({
          id: String(s.id),
          sponsorName: s.sponsor_name || s.sponsorName || '',
          contact: s.contact || s.phone || '',
          date: s.date || '',
          mealType: s.meal_type || s.mealType || 'Maha Annadanam',
          amount: Number(s.amount) || 0,
          occasion: s.occasion || '',
          gotra: s.gotra || ''
        })));
      } else if (error) {
        console.error("Error fetching annadanam sponsors:", error.message);
      }
    } catch (err) {
      console.error("Annadanam fetch exception:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalFunds = sponsors.reduce((sum, s) => sum + Number(s.amount), 0);
  // Estimate meals provided (~₹35 per sacred meal)
  const estimatedMeals = Math.round(totalFunds / 35);

  const handleOpenModal = () => {
    setFormName('');
    setFormContact('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMealType(MEAL_TYPES[0]);
    setFormAmount(5000);
    setFormOccasion('');
    setFormGotra('');
    setSubmitSuccess(false);
    setShowModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter the sponsor name.");
      return;
    }
    const numAmount = Number(formAmount) || 0;
    if (numAmount <= 0) {
      alert("Please enter a valid sponsorship amount.");
      return;
    }

    setIsSubmitting(true);
    const newId = `ANN-${Date.now().toString().slice(-6)}`;
    const formattedDate = formDate || new Date().toISOString().split('T')[0];

    const newSponsorRecord = {
      id: newId,
      sponsor_name: formName.trim(),
      contact: formContact.trim() || 'N/A',
      date: formattedDate,
      meal_type: formMealType,
      amount: numAmount,
      occasion: formOccasion.trim(),
      gotra: formGotra.trim(),
      created_at: new Date().toISOString()
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from('annadanam').insert([newSponsorRecord]);
      
      if (!error) {
        setSponsors([
          {
            id: newSponsorRecord.id,
            sponsorName: newSponsorRecord.sponsor_name,
            contact: newSponsorRecord.contact,
            date: newSponsorRecord.date,
            mealType: newSponsorRecord.meal_type,
            amount: newSponsorRecord.amount,
            occasion: newSponsorRecord.occasion,
            gotra: newSponsorRecord.gotra
          },
          ...sponsors
        ]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitSuccess(false);
        }, 1200);
      } else {
        alert("Failed to schedule sponsor: " + error.message);
      }
    } catch (err: any) {
      console.error("Annadanam insert exception:", err);
      alert("An unexpected error occurred while scheduling.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (sponsors.length === 0) {
      alert("No Annadanam records to export.");
      return;
    }
    const headers = ["Sponsor ID", "Sponsor Name", "Contact", "Date", "Meal / Seva Type", "Occasion", "Amount"];
    const rows = sponsors.map(s => [
      s.id,
      `"${s.sponsorName}"`,
      `"${s.contact}"`,
      `"${s.date}"`,
      `"${s.mealType}"`,
      `"${s.occasion || 'General Seva'}"`,
      s.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `annadanam_sponsors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = sponsors.filter(s => {
    const matchesSearch = 
      s.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.mealType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact.includes(searchTerm) ||
      (s.occasion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMeal = mealFilter === 'All' || s.mealType === mealFilter;

    return matchesSearch && matchesMeal;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
               <Utensils className="w-5 h-5" />
             </div>
             <span>Annadanam Sponsoring</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage daily sacred food sponsorship, devotee sankalpas, and Prasadam distribution.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
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
            <span>Schedule Sponsor</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Total Sponsored Funds</span>
            <h3 className="text-3xl font-black mt-1 text-white">₹{totalFunds.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-orange-200 mt-1">All time contributions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Sponsors</span>
            <h3 className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{sponsors.length}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active Seva Patrons</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Est. Meals Supported</span>
            <h3 className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">~{estimatedMeals.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">Sacred Annadanam Servings</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sponsors by name, meal type, phone, or occasion..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-900 text-sm shadow-sm"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
            >
              <Filter size={18} />
              <span>{mealFilter === 'All' ? 'All Meal Types' : mealFilter.slice(0, 22) + '...'}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 py-2">
                <button
                  onClick={() => { setMealFilter('All'); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer ${
                    mealFilter === 'All' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  All Meal Types
                </button>
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMealFilter(m); setShowFilterMenu(false); }}
                    className={`block w-full text-left px-4 py-2 text-xs cursor-pointer ${
                      mealFilter === m ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sponsors Card Grid */}
        <div className="p-6 bg-gray-50/40 dark:bg-slate-900/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Loading Annadanam sponsors...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-80" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xl shadow-inner">
                        {sponsor.sponsorName ? sponsor.sponsorName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/40 px-3 py-1 rounded-full">
                        {sponsor.mealType.split('(')[0].trim()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{sponsor.sponsorName}</h3>
                    
                    {sponsor.occasion && (
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 italic">
                        Sankalpa: {sponsor.occasion}
                      </p>
                    )}

                    <div className="space-y-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500" />
                        <span className="font-semibold">{sponsor.date}</span>
                      </div>
                      {sponsor.contact && sponsor.contact !== 'N/A' && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{sponsor.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Sponsorship Amt:</span>
                    <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                      ₹{sponsor.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-center justify-center">
                <Utensils className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-base font-bold">No Annadanam records match your query</p>
                <p className="text-xs text-gray-400 mt-1">Click "+ Schedule Sponsor" above to record a new food sponsorship.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Sponsor Modal Card */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 relative animate-slide-up">
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-600 p-6 text-white relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Schedule Annadanam Sponsor</h3>
                  <p className="text-orange-100 text-xs mt-0.5">Enter donor and seva sankalpa details for sacred food offering</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            {submitSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white">Annadanam Sponsor Scheduled!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The food seva sponsorship has been recorded into the Mutt ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Sponsor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Sponsor / Devotee Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kulkarni & Family"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Sponsorship Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="5000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Preset Amount Chips */}
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

                {/* Meal / Seva Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Meal / Seva Category *
                  </label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                  >
                    {MEAL_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Sponsorship Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Mobile / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Sankalpa / Occasion & Gotra Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Occasion / Sankalpa (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Birthday, Anniversary, Smarana"
                      value={formOccasion}
                      onChange={(e) => setFormOccasion(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Gotra & Nakshatra (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kashyapa / Rohini"
                      value={formGotra}
                      onChange={(e) => setFormGotra(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}</span>
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
