"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Sparkles, 
  Flame, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Check, 
  FileSpreadsheet, 
  Users, 
  Filter,
  DollarSign,
  Tag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/client';

interface SevaItem {
  id: string;
  name: string;
  description: string;
  time: string;
  cost: number;
  category: string;
  maxDailySlots: number;
}

interface DevoteeProfile {
  name: string;
  email: string;
  phone: string;
  gotra: string;
  nakshatra: string;
  totalBookings: number;
  lastSevaName: string;
  lastBookingDate: string;
}

const SEVA_CATALOG: SevaItem[] = [
  { id: '1', name: "Panchamrutha Abhisheka", description: "Sacred abhisheka with milk, curds, ghee, honey & sugar", time: "06:00 AM - 08:00 AM", cost: 100, category: "Daily Sevas", maxDailySlots: 30 },
  { id: '2', name: "Saamoohika Satyanarayana Pooje", description: "Monthly sacred Satyanarayana vratha & sankalpa", time: "05:00 PM - 07:00 PM", cost: 100, category: "Weekly Sevas", maxDailySlots: 50 },
  { id: '3', name: "Tirtha Prasada (Dwadashi Parane)", description: "Sacred feast & offering on Dwadashi parane", time: "12:00 PM - 02:00 PM", cost: 100, category: "Special Sevas", maxDailySlots: 100 },
  { id: '4', name: "Panchamrutha Abhisheka (Thursday Special)", description: "Special Guruvara Maha Panchamrutha Abhisheka", time: "06:00 AM - 08:00 AM", cost: 200, category: "Special Sevas", maxDailySlots: 40 },
  { id: '5', name: "Kanakabhisheka Seva", description: "Golden coin archana & abhisheka to Rayara Brindavana", time: "08:00 AM - 10:00 AM", cost: 500, category: "Special Sevas", maxDailySlots: 15 },
  { id: '6', name: "Nitya Annadanam Maha Seva", description: "Full day sacred food sponsorship for temple devotees", time: "Full Day Seva", cost: 1000, category: "Daily Sevas", maxDailySlots: 10 },
  { id: '7', name: "Archana & Astottara Pooja", description: "Chanting of 108 sacred names with tulasi & flowers", time: "Morning / Evening", cost: 50, category: "Daily Sevas", maxDailySlots: 80 },
  { id: '8', name: "Maha Pooja & Deepalankara Seva", description: "Evening grand aarti with oil lamps and flower decoration", time: "06:30 PM - 08:30 PM", cost: 350, category: "Special Sevas", maxDailySlots: 20 }
];

export default function SevaDashboardPage() {
  const { user: currentUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Counter Booking & Returning Devotee Search
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [devoteeSearchQuery, setDevoteeSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedReturningDevotee, setSelectedReturningDevotee] = useState<DevoteeProfile | null>(null);

  // Booking Form State
  const [formDevoteeName, setFormDevoteeName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGotra, setFormGotra] = useState('');
  const [formNakshatra, setFormNakshatra] = useState('');
  const [formSeva, setFormSeva] = useState(SEVA_CATALOG[0].name);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState(SEVA_CATALOG[0].time);
  const [formNumPeople, setFormNumPeople] = useState('2');
  const [formPrasada, setFormPrasada] = useState(false);
  const [formPrasadaCount, setFormPrasadaCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Unique Devotee Profiles for Smart Auto-Search
  const uniqueDevoteeProfiles = useMemo<DevoteeProfile[]>(() => {
    const map = new Map<string, DevoteeProfile>();

    bookings.forEach(b => {
      const name = (b.devotee_name || b.devoteeName || '').trim();
      if (!name) return;

      const key = (b.email ? b.email.trim().toLowerCase() : '') || (b.phone ? b.phone.trim() : '') || name.toLowerCase();

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.totalBookings += 1;
        if (!existing.email && b.email) existing.email = b.email;
        if (!existing.phone && b.phone) existing.phone = b.phone;
        if (!existing.gotra && b.gotra) existing.gotra = b.gotra;
        if (!existing.nakshatra && b.nakshatra) existing.nakshatra = b.nakshatra;
      } else {
        map.set(key, {
          name,
          email: b.email || '',
          phone: b.phone || '',
          gotra: b.gotra || '',
          nakshatra: b.nakshatra || '',
          totalBookings: 1,
          lastSevaName: b.seva_name || 'Seva Booking',
          lastBookingDate: b.date || ''
        });
      }
    });

    return Array.from(map.values());
  }, [bookings]);

  // Matching returning devotees for auto-search
  const matchingReturningDevotees = useMemo(() => {
    if (!devoteeSearchQuery.trim()) return [];
    const q = devoteeSearchQuery.toLowerCase().trim();
    return uniqueDevoteeProfiles.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.email && p.email.toLowerCase().includes(q)) || 
      (p.phone && p.phone.includes(q))
    ).slice(0, 5);
  }, [uniqueDevoteeProfiles, devoteeSearchQuery]);

  const handleOpenCounterModal = (prefillSeva?: string) => {
    setBookingSuccess(null);
    setDevoteeSearchQuery('');
    setSelectedReturningDevotee(null);
    setFormDevoteeName('');
    setFormEmail('');
    setFormPhone('');
    setFormGotra('');
    setFormNakshatra('');
    setFormSeva(prefillSeva || SEVA_CATALOG[0].name);
    setFormDate(new Date().toISOString().split('T')[0]);
    
    const matched = SEVA_CATALOG.find(s => s.name === (prefillSeva || SEVA_CATALOG[0].name));
    setFormTime(matched ? matched.time : SEVA_CATALOG[0].time);
    setFormNumPeople('2');
    setFormPrasada(false);
    setFormPrasadaCount(2);
    setShowCounterModal(true);
  };

  const handleSelectDevotee = (p: DevoteeProfile) => {
    setSelectedReturningDevotee(p);
    setFormDevoteeName(p.name);
    setFormEmail(p.email || '');
    setFormPhone(p.phone || '');
    setFormGotra(p.gotra || '');
    setFormNakshatra(p.nakshatra || '');
    setDevoteeSearchQuery(p.name);
    setIsDropdownOpen(false);
  };

  const activeSevaObj = SEVA_CATALOG.find(s => s.name === formSeva) || SEVA_CATALOG[0];
  const computedCost = activeSevaObj.cost + (formPrasada ? formPrasadaCount * 50 : 0);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDevoteeName.trim()) {
      alert("Please enter the devotee name.");
      return;
    }

    setIsSubmitting(true);
    const newId = `BK-${Date.now().toString().slice(-6)}`;
    const newRecord = {
      id: newId,
      devotee_name: formDevoteeName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      gotra: formGotra.trim(),
      nakshatra: formNakshatra.trim(),
      seva_name: formSeva,
      date: formDate,
      time: formTime,
      number_of_people: formNumPeople,
      tirtha_prasada_required: formPrasada,
      tirtha_prasada_count: formPrasada ? formPrasadaCount : 0,
      status: 'confirmed',
      seva_cost: `₹${activeSevaObj.cost}`,
      total_cost: computedCost,
      qr_code: newId,
      created_at: new Date().toISOString()
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from('bookings').insert([newRecord]);
      if (!error) {
        setBookings([newRecord, ...bookings]);
        setBookingSuccess(newRecord);
      } else {
        alert("Failed to create booking: " + error.message);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['All', 'Daily Sevas', 'Weekly Sevas', 'Special Sevas'];
  const filteredCatalog = SEVA_CATALOG.filter(s => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchQ = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Seva Management & Counter Desk</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Rapid counter booking for returning devotees with instant Name / Email ID auto-complete.
          </p>
        </div>

        <button
          onClick={() => handleOpenCounterModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all text-sm cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>+ Express Counter Booking</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-orange-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sevas in catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Seva Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCatalog.map((seva) => (
          <div 
            key={seva.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200/80 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2.5 py-1 rounded-full border border-orange-200/60 dark:border-orange-900/40">
                  {seva.category}
                </span>
                <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                  ₹{seva.cost}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-snug">{seva.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{seva.description}</p>
              
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <Clock size={13} className="text-orange-500" />
                <span className="font-semibold">{seva.time}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenCounterModal(seva.name)}
              className="mt-5 w-full py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-600 hover:text-white text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles size={14} />
              <span>Book For Devotee</span>
            </button>
          </div>
        ))}
      </div>

      {/* EXPRESS COUNTER BOOKING MODAL */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 border border-gray-100 dark:border-slate-800 animate-slide-up">
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Express Counter Seva Booking</h3>
                  <p className="text-orange-100 text-xs mt-0.5">
                    Fast booking for returning & new devotees
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCounterModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle size={36} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white">Seva Booking Confirmed!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receipt <strong>#{bookingSuccess.id}</strong> created for <strong>{bookingSuccess.devotee_name}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowCounterModal(false)}
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-xs hover:bg-orange-700 shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Search Returning Devotee */}
                <div className="relative">
                  <label className="block text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Search Returning Devotee (By Name, Email, or Phone)</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Type name (e.g. Harsha) or email ID to search past records..."
                      value={devoteeSearchQuery}
                      onChange={(e) => {
                        setDevoteeSearchQuery(e.target.value);
                        setFormDevoteeName(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {isDropdownOpen && matchingReturningDevotees.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-orange-200 dark:border-slate-700 z-30 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
                      <div className="px-4 py-2 bg-orange-50 dark:bg-slate-900/80 text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                        Matching Returning Devotees:
                      </div>
                      {matchingReturningDevotees.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectDevotee(p)}
                          className="p-3.5 hover:bg-orange-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900 dark:text-white">{p.name}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {p.totalBookings} Past Sevas
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {p.email && <span>{p.email}</span>}
                              {p.phone && <span>{p.phone}</span>}
                              {p.gotra && <span>Gotra: {p.gotra}</span>}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-orange-600">Select</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedReturningDevotee && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Loaded profile for <strong>{selectedReturningDevotee.name}</strong> ({selectedReturningDevotee.totalBookings} prior bookings).</span>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Devotee Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Rao"
                      value={formDevoteeName}
                      onChange={(e) => setFormDevoteeName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="devotee@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Gotra & Nakshatra
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Gotra"
                        value={formGotra}
                        onChange={(e) => setFormGotra(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Nakshatra"
                        value={formNakshatra}
                        onChange={(e) => setFormNakshatra(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Seva Options */}
                <div className="pt-2 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Seva Offering *
                    </label>
                    <select
                      value={formSeva}
                      onChange={(e) => {
                        setFormSeva(e.target.value);
                        const match = SEVA_CATALOG.find(s => s.name === e.target.value);
                        if (match) setFormTime(match.time);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-bold text-gray-900 dark:text-white"
                    >
                      {SEVA_CATALOG.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} — ₹{s.cost}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Seva Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        No. of Devotees
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formNumPeople}
                        onChange={(e) => setFormNumPeople(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Price & Submit */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Fee:</span>
                    <h4 className="text-2xl font-black text-orange-600">₹{computedCost}</h4>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCounterModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <span>{isSubmitting ? 'Registering...' : 'Confirm Seva'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
