"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Trash2, 
  Users, 
  Clock, 
  Plus, 
  Sparkles, 
  UserCheck, 
  X, 
  Check, 
  ArrowRight, 
  Phone, 
  Mail, 
  Flame, 
  FileSpreadsheet,
  QrCode,
  History
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/client';

interface Booking {
  id: number | string;
  devoteeName: string;
  email?: string;
  sevaName: string;
  phone: string;
  date: string;
  time?: string;
  status: string;
  fullName?: string;
  gotra?: string;
  nakshatra?: string;
  numberOfPeople?: string | number;
  totalCost?: number | string;
  sevaCost?: string;
  tirthaPrasadaRequired?: boolean;
  tirthaPrasadaCount?: number;
  lunchRequired?: boolean;
  lunchCount?: number;
  createdAt?: string;
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

const AVAILABLE_SEVAS = [
  { id: '1', name: "Panchamrutha Abhisheka", cost: 100, time: "Morning (6:00 AM - 8:00 AM)", category: "Daily Sevas" },
  { id: '2', name: "Saamoohika Satyanarayana Pooje Sankalpa", cost: 100, time: "Evening (5:00 PM - 7:00 PM)", category: "Weekly Sevas" },
  { id: '3', name: "Tirtha Prasada (Dwadashi Parane)", cost: 100, time: "Afternoon (12:00 PM - 2:00 PM)", category: "Special Sevas" },
  { id: '4', name: "Panchamrutha Abhisheka (Thursday)", cost: 200, time: "Morning (6:00 AM - 8:00 AM)", category: "Special Sevas" },
  { id: '5', name: "Kanakabhisheka Seva", cost: 500, time: "Morning (8:00 AM - 10:00 AM)", category: "Special Sevas" },
  { id: '6', name: "Nitya Annadanam Seva", cost: 1000, time: "Full Day Seva", category: "Daily Sevas" },
  { id: '7', name: "Archana & Astottara Pooja", cost: 50, time: "Morning / Evening", category: "Daily Sevas" },
  { id: '8', name: "Maha Pooja & Deepalankara Seva", cost: 350, time: "Evening (6:30 PM - 8:30 PM)", category: "Special Sevas" },
];

export default function DevoteesPage() {
  const { user: currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Quick Seva Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [devoteeSearchQuery, setDevoteeSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedReturningDevotee, setSelectedReturningDevotee] = useState<DevoteeProfile | null>(null);

  // Form Fields
  const [formDevoteeName, setFormDevoteeName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGotra, setFormGotra] = useState('');
  const [formNakshatra, setFormNakshatra] = useState('');
  const [formSeva, setFormSeva] = useState(AVAILABLE_SEVAS[0].name);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState(AVAILABLE_SEVAS[0].time);
  const [formNumPeople, setFormNumPeople] = useState('2');
  const [formTirthaPrasada, setFormTirthaPrasada] = useState(false);
  const [formTirthaCount, setFormTirthaCount] = useState(2);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  const getAuthHeaders = () => {
    let id = currentUser?.id;
    let email = currentUser?.email;
    if (!id || !email) {
      try {
        const stored = sessionStorage.getItem('temple_auth_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          id = id || parsed.id;
          email = email || parsed.email;
        }
      } catch (e) {}
    }
    return {
      'x-user-id': String(id || ''),
      'x-user-email': email || '',
    };
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      
      if (data && data.success && Array.isArray(data.bookings)) {
        const validBookings = data.bookings.filter((b: any) => (b.status || '').toLowerCase() !== 'deleted');
        setBookings(validBookings);
      } else {
        const supabase = createClient();
        const { data: dbRows, error: dbErr } = await supabase
          .from('bookings')
          .select('*')
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
          
        if (!dbErr && dbRows) {
          const mapped = dbRows
            .filter((row: any) => (row.status || '').toLowerCase() !== 'deleted')
            .map((row: any) => ({
              id: row.id,
              devoteeName: row.devotee_name || row.devoteeName || '',
              email: row.email || '',
              sevaName: row.seva_name || row.sevaName || '',
              phone: row.phone || '',
              date: row.date || '',
              time: row.time || '',
              status: row.status || 'confirmed',
              fullName: row.devotee_name || row.devoteeName || '',
              gotra: row.gotra || '',
              nakshatra: row.nakshatra || '',
              numberOfPeople: row.number_of_people || '1',
              totalCost: row.total_cost || row.seva_cost || 0,
              createdAt: row.created_at
            }));
          setBookings(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchTerm(q);
    }
  }, [currentUser]);

  // Aggregate Unique Devotee Profiles for Smart Search (Returning Devotees)
  const uniqueDevoteeProfiles = useMemo<DevoteeProfile[]>(() => {
    const map = new Map<string, DevoteeProfile>();

    bookings.forEach(b => {
      const name = (b.devoteeName || b.fullName || '').trim();
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
          lastSevaName: b.sevaName || 'Seva Booking',
          lastBookingDate: b.date || ''
        });
      }
    });

    return Array.from(map.values());
  }, [bookings]);

  // Filtered returning devotee candidates based on search input
  const matchingReturningDevotees = useMemo(() => {
    if (!devoteeSearchQuery.trim()) return [];
    const q = devoteeSearchQuery.toLowerCase().trim();
    return uniqueDevoteeProfiles.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.email && p.email.toLowerCase().includes(q)) || 
      (p.phone && p.phone.includes(q))
    ).slice(0, 6);
  }, [uniqueDevoteeProfiles, devoteeSearchQuery]);

  // Open booking modal pre-loaded for a specific devotee
  const handleOpenBookingModal = (presetDevotee?: Booking | DevoteeProfile) => {
    setBookingSuccessData(null);
    if (presetDevotee) {
      const p = presetDevotee as any;
      const name = p.devoteeName || p.fullName || p.name || '';
      setFormDevoteeName(name);
      setFormEmail(p.email || '');
      setFormPhone(p.phone || '');
      setFormGotra(p.gotra || '');
      setFormNakshatra(p.nakshatra || '');
      setDevoteeSearchQuery(name);
      
      const foundProfile = uniqueDevoteeProfiles.find(item => 
        (item.email && p.email && item.email === p.email) || 
        (item.phone && p.phone && item.phone === p.phone) || 
        item.name.toLowerCase() === name.toLowerCase()
      );
      setSelectedReturningDevotee(foundProfile || {
        name,
        email: p.email || '',
        phone: p.phone || '',
        gotra: p.gotra || '',
        nakshatra: p.nakshatra || '',
        totalBookings: 1,
        lastSevaName: p.sevaName || 'Previous Seva',
        lastBookingDate: p.date || ''
      });
    } else {
      setFormDevoteeName('');
      setFormEmail('');
      setFormPhone('');
      setFormGotra('');
      setFormNakshatra('');
      setDevoteeSearchQuery('');
      setSelectedReturningDevotee(null);
    }

    setFormSeva(AVAILABLE_SEVAS[0].name);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime(AVAILABLE_SEVAS[0].time);
    setFormNumPeople('2');
    setFormTirthaPrasada(false);
    setFormTirthaCount(2);
    setShowBookingModal(true);
  };

  // Select returning devotee from dropdown
  const handleSelectDevoteeProfile = (devotee: DevoteeProfile) => {
    setSelectedReturningDevotee(devotee);
    setFormDevoteeName(devotee.name);
    setFormEmail(devotee.email || '');
    setFormPhone(devotee.phone || '');
    setFormGotra(devotee.gotra || '');
    setFormNakshatra(devotee.nakshatra || '');
    setDevoteeSearchQuery(devotee.name);
    setIsSearchDropdownOpen(false);
  };

  // Calculate current selected seva cost
  const currentSevaObj = AVAILABLE_SEVAS.find(s => s.name === formSeva) || AVAILABLE_SEVAS[0];
  const calculatedTotalCost = currentSevaObj.cost + (formTirthaPrasada ? formTirthaCount * 50 : 0);

  // Submit new booking
  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDevoteeName.trim()) {
      alert("Please enter the devotee's full name.");
      return;
    }

    setIsSubmittingBooking(true);
    const newBookingId = `BK-${Date.now().toString().slice(-6)}`;

    const newBookingPayload = {
      id: newBookingId,
      devoteeName: formDevoteeName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      gotra: formGotra.trim(),
      nakshatra: formNakshatra.trim(),
      sevaName: formSeva,
      date: formDate,
      time: formTime,
      numberOfPeople: formNumPeople,
      tirthaPrasadaRequired: formTirthaPrasada,
      tirthaPrasadaCount: formTirthaPrasada ? formTirthaCount : 0,
      lunchRequired: false,
      lunchCount: 0,
      specialRequests: selectedReturningDevotee ? `Returning Devotee (${selectedReturningDevotee.totalBookings + 1}th visit)` : '',
      status: 'confirmed',
      sevaCost: `₹${currentSevaObj.cost}`,
      totalCost: calculatedTotalCost,
      qrCode: newBookingId,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Submit to API
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ booking: newBookingPayload })
      });

      const data = await res.json().catch(() => ({}));
      
      // Direct Supabase fallback if API errored
      if (!res.ok || !data.success) {
        const supabase = createClient();
        await supabase.from('bookings').insert([{
          id: newBookingPayload.id,
          devotee_name: newBookingPayload.devoteeName,
          email: newBookingPayload.email,
          phone: newBookingPayload.phone,
          gotra: newBookingPayload.gotra,
          nakshatra: newBookingPayload.nakshatra,
          seva_name: newBookingPayload.sevaName,
          date: newBookingPayload.date,
          time: newBookingPayload.time,
          number_of_people: newBookingPayload.numberOfPeople,
          tirtha_prasada_required: newBookingPayload.tirthaPrasadaRequired,
          tirtha_prasada_count: newBookingPayload.tirthaPrasadaCount,
          status: 'confirmed',
          seva_cost: newBookingPayload.sevaCost,
          total_cost: newBookingPayload.totalCost,
          qr_code: newBookingPayload.qrCode,
          created_at: newBookingPayload.createdAt
        }]);
      }

      // Optimistic UI update
      setBookings([
        {
          id: newBookingPayload.id,
          devoteeName: newBookingPayload.devoteeName,
          email: newBookingPayload.email,
          sevaName: newBookingPayload.sevaName,
          phone: newBookingPayload.phone,
          date: newBookingPayload.date,
          time: newBookingPayload.time,
          status: 'confirmed',
          fullName: newBookingPayload.devoteeName,
          gotra: newBookingPayload.gotra,
          nakshatra: newBookingPayload.nakshatra,
          numberOfPeople: newBookingPayload.numberOfPeople,
          totalCost: newBookingPayload.totalCost
        },
        ...bookings
      ]);

      setBookingSuccessData(newBookingPayload);
    } catch (err: any) {
      console.error("Booking creation error:", err);
      alert("An unexpected error occurred while booking seva.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const deleteBooking = async (id: number | string) => {
    if (confirm('Are you sure you want to permanently delete this booking?')) {
      const originalBookings = [...bookings];
      const updated = bookings.filter(b => String(b.id) !== String(id));
      setBookings(updated);

      try {
        const res = await fetch(`/api/bookings?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ id: String(id) }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          const supabase = createClient();
          const { error: delErr } = await supabase.from('bookings').delete().eq('id', String(id));
          if (delErr) {
            await supabase.from('bookings').update({ status: 'deleted' }).eq('id', String(id));
          }
        }
      } catch (err: any) {
        console.error('Failed to sync deletion:', err);
        const supabase = createClient();
        await supabase.from('bookings').update({ status: 'deleted' }).eq('id', String(id));
      }
    }
  };

  const markCompleted = async (id: number | string) => {
    if (confirm('Mark this seva booking as completed?')) {
      const updated = bookings.map(b => String(b.id) === String(id) ? { ...b, status: 'completed' } : b);
      setBookings(updated);

      try {
        const res = await fetch('/api/bookings/update', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ id: String(id), status: 'completed' }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          const supabase = createClient();
          await supabase.from('bookings').update({ status: 'completed' }).eq('id', String(id));
        }
      } catch (err: any) {
        console.error('Failed to sync status:', err.message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40';
      case 'confirmed': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40';
      case 'pending': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No devotee bookings to export.');
      return;
    }
    const headers = ['Booking ID', 'Devotee Name', 'Email', 'Phone', 'Seva Name', 'Date', 'Status', 'Total Cost'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.devoteeName || b.fullName || '',
      b.email || '',
      b.phone || '',
      b.sevaName || '',
      b.date || '',
      b.status || '',
      b.totalCost || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
       
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `devotees_bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter((b) => {
    const name = (b.devoteeName || b.fullName || '').toLowerCase();
    const seva = (b.sevaName || '').toLowerCase();
    const phone = (b.phone || '').toLowerCase();
    const email = (b.email || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchesSearch = name.includes(q) || seva.includes(q) || phone.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === 'all' || (b.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span>Devotee Management & Seva Hub</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Search returning devotees by Name or Email ID, give repeat sevas instantly, and manage records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/60 font-semibold text-sm transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => handleOpenBookingModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all text-sm cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>+ Book Seva for Devotee</span>
          </button>
        </div>
      </div>

      {/* Quick Returning Devotee Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Registered Devotees</span>
            <h3 className="text-3xl font-black mt-1 text-white">{uniqueDevoteeProfiles.length}</h3>
            <p className="text-xs text-orange-200 mt-1">Unique Devotee Profiles</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Seva Bookings</span>
            <h3 className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{bookings.length}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active Pooja Reservations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Returning Devotee Rate</span>
            <h3 className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">
              {uniqueDevoteeProfiles.length > 0 
                ? Math.round((uniqueDevoteeProfiles.filter(p => p.totalBookings > 1).length / uniqueDevoteeProfiles.length) * 100)
                : 0}%
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">Repeat Visits & Sevas</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden">
        {/* Table Search and Filters */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-700/60 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-gray-50/50 dark:bg-slate-800/40">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Devotee Name, Email, Phone, or Seva..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-900 text-sm shadow-xs"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'confirmed', 'completed', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-orange-600 text-white shadow-xs' 
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Display Container */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading devotee records...</span>
            </div>
          ) : filteredBookings.length > 0 ? (
            <>
              {/* Mobile Devotee Cards (< md) */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700/60">
                {filteredBookings.map((booking) => {
                  const devoteeName = booking.devoteeName || booking.fullName || 'Devotee';
                  const isReturning = uniqueDevoteeProfiles.find(p => p.name.toLowerCase() === devoteeName.toLowerCase() && p.totalBookings > 1);

                  return (
                    <div key={booking.id} className="p-4 space-y-3 hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-base shadow-inner shrink-0">
                            {devoteeName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-gray-900 dark:text-white text-sm truncate">
                                {devoteeName}
                              </span>
                              {isReturning && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                  <Sparkles size={9} /> Repeat
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-gray-400">ID: #{String(booking.id).slice(-8)}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-[11px]">Seva Offering:</span>
                          <span className="font-extrabold text-orange-600 dark:text-orange-400 truncate max-w-[200px] text-right">{booking.sevaName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Date & Slot:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{booking.date} ({booking.time || 'General'})</span>
                        </div>
                        {(booking.gotra || booking.nakshatra) && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Gotra / Nakshatra:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {booking.gotra ? `Gotra: ${booking.gotra}` : ''} {booking.nakshatra ? `• ${booking.nakshatra}` : ''}
                            </span>
                          </div>
                        )}
                        {Boolean(booking.tirthaPrasadaRequired) && (
                          <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Tirtha Prasada:</span>
                            <span>{booking.tirthaPrasadaCount || 1} Meal Tokens</span>
                          </div>
                        )}
                        {Boolean(booking.totalCost) && (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100 dark:border-slate-800 font-bold">
                            <span className="text-gray-500">Seva Amount:</span>
                            <span className="text-gray-900 dark:text-white">₹{booking.totalCost}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact & Actions Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        {booking.phone ? (
                          <a 
                            href={`tel:${booking.phone}`}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Phone size={13} />
                            <span>{booking.phone}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400">No phone recorded</span>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => handleOpenBookingModal(booking)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800/50 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Sparkles size={12} />
                            <span>Book Again</span>
                          </button>

                          {booking.status.toLowerCase() !== 'completed' && (
                            <button 
                              onClick={() => markCompleted(booking.id)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                              title="Mark Seva Completed"
                              aria-label="Mark completed"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}

                          <button 
                            onClick={() => deleteBooking(booking.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete Record"
                            aria-label="Delete booking"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Devotee Table (>= md) */}
              <table className="hidden md:table w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-bold border-b border-gray-100 dark:border-slate-700/60">
                    <th className="px-6 py-4">Devotee Profile</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Seva Offering</th>
                    <th className="px-6 py-4">Schedule Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {filteredBookings.map((booking) => {
                    const devoteeName = booking.devoteeName || booking.fullName || 'Devotee';
                    const isReturning = uniqueDevoteeProfiles.find(p => p.name.toLowerCase() === devoteeName.toLowerCase() && p.totalBookings > 1);

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-base shadow-inner">
                            {devoteeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                                {devoteeName}
                              </span>
                              {isReturning && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                  <Sparkles size={10} /> Repeat
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">ID: #{String(booking.id).slice(-8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-xs">
                          {booking.email && (
                            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                              <Mail size={12} className="text-gray-400" />
                              <span>{booking.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Phone size={12} className="text-gray-400" />
                            <span>{booking.phone || '—'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {booking.sevaName}
                        </span>
                        {booking.totalCost && (
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                            ₹{Number(String(booking.totalCost).replace(/[^\d.-]/g, '')).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-orange-500" />
                          <span>{booking.date}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {/* ⚡ BOOK SEVA AGAIN 1-CLICK BUTTON */}
                          <button
                            onClick={() => handleOpenBookingModal(booking)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/60 font-bold text-xs border border-orange-200 dark:border-orange-800/50 transition-all cursor-pointer shadow-xs hover:scale-105"
                            title="Book another seva for this devotee with pre-filled details"
                          >
                            <Sparkles size={13} />
                            <span>Book Again</span>
                          </button>

                          {booking.status.toLowerCase() !== 'completed' && (
                            <button 
                              onClick={() => markCompleted(booking.id)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                              title="Mark Seva Completed"
                            >
                              <CheckCircle size={17} />
                            </button>
                          )}

                          <button 
                            onClick={() => deleteBooking(booking.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </>
          ) : (
            <div className="py-20 text-center text-gray-500">
              <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-base">No devotee bookings found matching query</p>
              <p className="text-xs text-gray-400 mt-1">Click "+ Book Seva for Devotee" to register a new seva offering.</p>
            </div>
          )}
        </div>
      </div>

      {/* QUICK SEVA BOOKING MODAL WITH SMART RETURNING DEVOTEE SEARCH */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-4 sm:my-8 border border-gray-100 dark:border-slate-800 animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Book Seva for Devotee</h3>
                  <p className="text-orange-100 text-xs mt-0.5">
                    Search by Name or Email ID to prefill returning devotee info instantly
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            {bookingSuccessData ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle size={36} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white">Seva Successfully Booked!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Booking <strong>#{bookingSuccessData.id}</strong> has been registered for <strong>{bookingSuccessData.devoteeName}</strong>.
                </p>

                <div className="p-4 bg-orange-50 dark:bg-slate-800 rounded-2xl border border-orange-200 dark:border-slate-700 text-left text-xs space-y-1.5 max-w-md mx-auto">
                  <p><strong>Seva:</strong> {bookingSuccessData.sevaName}</p>
                  <p><strong>Date & Slot:</strong> {bookingSuccessData.date} ({bookingSuccessData.time})</p>
                  <p><strong>Total Amount:</strong> ₹{bookingSuccessData.totalCost}</p>
                  {bookingSuccessData.email && <p><strong>Email Confirmation:</strong> Sent to {bookingSuccessData.email}</p>}
                </div>

                <div className="flex gap-3 max-w-md mx-auto pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSuccessData(null);
                      handleOpenBookingModal();
                    }}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                    Book Another Seva
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs hover:from-orange-500 hover:to-amber-500 shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBookingSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* SMART SEARCH BAR FOR RETURNING DEVOTEES */}
                <div className="relative">
                  <label className="block text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Search Returning Devotee (By Name, Email, or Phone)</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Type name (e.g. Ramesh) or email ID to search past devotees..."
                      value={devoteeSearchQuery}
                      onChange={(e) => {
                        setDevoteeSearchQuery(e.target.value);
                        setFormDevoteeName(e.target.value);
                        setIsSearchDropdownOpen(true);
                      }}
                      onFocus={() => setIsSearchDropdownOpen(true)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isSearchDropdownOpen && matchingReturningDevotees.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-orange-200 dark:border-slate-700 z-30 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
                      <div className="px-4 py-2 bg-orange-50 dark:bg-slate-900/80 text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                        Found {matchingReturningDevotees.length} Returning Devotees (Click to Auto-fill):
                      </div>
                      {matchingReturningDevotees.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectDevoteeProfile(p)}
                          className="p-3.5 hover:bg-orange-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900 dark:text-white">{p.name}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                {p.totalBookings} Past Sevas
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {p.email && <span>{p.email}</span>}
                              {p.phone && <span>{p.phone}</span>}
                              {p.gotra && <span>Gotra: {p.gotra}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 cursor-pointer shadow-xs"
                          >
                            Prefill Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Returning Devotee Badge Callout */}
                {selectedReturningDevotee && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-amber-200 dark:border-slate-700 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold text-amber-950 dark:text-amber-200">
                        ✨ Returning Devotee Profile Loaded: {selectedReturningDevotee.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Total past visits: <strong>{selectedReturningDevotee.totalBookings}</strong> • Previous Seva: <em>{selectedReturningDevotee.lastSevaName}</em>
                      </p>
                    </div>
                  </div>
                )}

                {/* Devotee Personal Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Devotee Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kulkarni"
                      value={formDevoteeName}
                      onChange={(e) => setFormDevoteeName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="devotee@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Mobile / WhatsApp Number
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
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="Nakshatra"
                        value={formNakshatra}
                        onChange={(e) => setFormNakshatra(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seva Selection & Schedule */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Select Seva Offering *
                    </label>
                    <select
                      value={formSeva}
                      onChange={(e) => {
                        setFormSeva(e.target.value);
                        const match = AVAILABLE_SEVAS.find(s => s.name === e.target.value);
                        if (match) setFormTime(match.time);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    >
                      {AVAILABLE_SEVAS.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} — ₹{s.cost} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Seva Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Time Slot
                      </label>
                      <input
                        type="text"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Prasadam Checkbox */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">Tirtha Prasada Required?</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Include lunch / parane prasada tokens (+₹50/person)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formTirthaPrasada}
                        onChange={(e) => setFormTirthaPrasada(e.target.checked)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                      />
                      {formTirthaPrasada && (
                        <input
                          type="number"
                          min="1"
                          value={formTirthaCount}
                          onChange={(e) => setFormTirthaCount(Number(e.target.value) || 1)}
                          className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-900 text-center font-bold"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Price Banner & Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Seva Amount:</span>
                    <h4 className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{calculatedTotalCost}</h4>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmittingBooking ? 'Booking...' : 'Confirm Seva'}</span>
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
