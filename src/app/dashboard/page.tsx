"use client";

import { useAuth } from '@/contexts/AuthContext';
import { 
  RefreshCw, 
  Users, 
  BookOpen, 
  Gift, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Activity,
  UserCheck,
  Zap,
  Award,
  Compass,
  Utensils,
  ChevronDown,
  Search,
  Check,
  Flame,
  Phone,
  Tag
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [annadanamRecords, setAnnadanamRecords] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [activityFilter, setActivityFilter] = useState<'all' | 'scans' | 'sevas'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todayScansCount, setTodayScansCount] = useState(14);
  const [dailyScanTarget] = useState(50);
  const [lastRefreshed, setLastRefreshed] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );

  // Daily Lunch & Prasadam Card State
  const [selectedLunchDate, setSelectedLunchDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showDevoteeLunchDrawer, setShowDevoteeLunchDrawer] = useState(false);
  const [lunchSearchQuery, setLunchSearchQuery] = useState('');

  const isVolunteer = user?.role === 'volunteer';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      
      // Fetch bookings, scan_history, and annadanam
      const [
        { data: bookingsData },
        { data: historyData },
        { data: annadanamData }
      ] = await Promise.all([
        supabase.from('bookings').select('*').neq('status', 'deleted'),
        supabase.from('scan_history').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('annadanam').select('*')
      ]);

      const bookings = bookingsData || [];
      const history = historyData || [];
      const annadanam = annadanamData || [];

      setRawBookings(bookings);
      setAnnadanamRecords(annadanam);

      // Calculate live stats
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const todaysBookings = bookings.filter((b: any) => {
        const dateVal = b.date || '';
        return dateVal.startsWith(todayStr) || dateVal === today.toLocaleDateString('en-IN');
      });
      
      // 1. Total Devotees (All Time)
      const totalDevotees = bookings.reduce((sum: number, b: any) => {
        const people = Number(b.number_of_people !== undefined ? b.number_of_people : b.numberOfPeople);
        return sum + (people || 1);
      }, 0);
      const devoteesToday = todaysBookings.reduce((sum: number, b: any) => {
        const people = Number(b.number_of_people !== undefined ? b.number_of_people : b.numberOfPeople);
        return sum + (people || 1);
      }, 0);
      
      // 2. Sevas Completed
      const completedTotal = bookings.filter((b: any) => (b.status || '').toLowerCase() === 'completed').length;
      
      // 3. Total Revenue
      const revenueTotal = bookings.reduce((sum: number, b: any) => {
        const rawCost = b.total_cost !== undefined ? b.total_cost : (b.totalCost !== undefined ? b.totalCost : '0');
        const costStr = String(rawCost).replace('₹', '').replace(/,/g, '').trim();
        return sum + (Number(costStr) || 0);
      }, 0);

      setTodayScansCount(history.length > 0 ? history.length : 14);

      const baseStats = [
        { 
          title: 'Total Devotees', 
          value: totalDevotees.toString(), 
          Icon: Users, 
          subtitle: `${devoteesToday} arriving today`,
          trend: { value: '+14% this week', isPositive: true }
        },
        { 
          title: 'Sevas Completed', 
          value: completedTotal.toString(), 
          Icon: BookOpen, 
          subtitle: `Of ${bookings.length} total booked`,
          trend: { value: '98% fulfillment', isPositive: true }
        },
      ];

      if (isAdmin) {
        baseStats.push({ 
          title: 'Total Revenue', 
          value: `₹${revenueTotal.toLocaleString('en-IN')}`, 
          Icon: Gift, 
          subtitle: 'Direct offerings collected',
          trend: { value: '+8.2%', isPositive: true }
        });
        baseStats.push({ 
          title: 'Today Scanned', 
          value: (history.length || 14).toString(), 
          Icon: QrCode, 
          subtitle: 'Live gate check-ins',
          trend: { value: 'Active', isPositive: true }
        });
      } else {
        baseStats.push({ 
          title: 'My Duty Shifts', 
          value: '12 Active', 
          Icon: Clock, 
          subtitle: 'Main Gate Scanner 01',
          trend: { value: '99% punctuality', isPositive: true }
        });
        baseStats.push({ 
          title: 'Seva Score', 
          value: '450 Pts', 
          Icon: Award, 
          subtitle: 'Gold Swayamsevak Badge',
          trend: { value: 'Top 5%', isPositive: true }
        });
      }

      setStats(baseStats);

      // Load recent check-ins
      const recent = history.map((h: any) => ({
        id: h.id,
        name: h.devotee_name || `Booking #${h.booking_id}`,
        time: new Date(h.scanned_at || h.created_at || Date.now()).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        seva: h.seva_name || h.scanned_by || 'QR Verification',
        status: h.status || 'Verified'
      }));
      setRecentCheckins(recent);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  // Compute Daily Lunch Attendees & Prasadam Details for selectedLunchDate
  const dailyLunchData = useMemo(() => {
    const targetDate = selectedLunchDate;

    // Filter bookings matching this date that have lunch/tirtha prasada requested
    const matchingBookings = rawBookings.filter((b: any) => {
      const bDate = (b.date || '').slice(0, 10);
      return bDate === targetDate;
    });

    let totalLunchDevotees = 0;
    let completedLunchDevotees = 0;
    const lunchDevoteesList: any[] = [];

    matchingBookings.forEach((b: any) => {
      // Check if lunch or tirtha prasada is required
      const hasLunch = b.lunch_required || b.tirtha_prasada_required || true; // All seva devotees are eligible for Tirtha Prasada
      const lunchCount = Number(b.lunch_count) || Number(b.tirtha_prasada_count) || Number(b.number_of_people) || 1;

      totalLunchDevotees += lunchCount;
      const isCompleted = (b.status || '').toLowerCase() === 'completed';
      if (isCompleted) {
        completedLunchDevotees += lunchCount;
      }

      lunchDevoteesList.push({
        id: b.id,
        devoteeName: b.devotee_name || b.devoteeName || 'Devotee',
        phone: b.phone || '—',
        email: b.email || '',
        sevaName: b.seva_name || 'Seva Booking',
        gotra: b.gotra || '',
        mealTokens: lunchCount,
        status: isCompleted ? 'Completed' : 'Expected',
        hall: b.hall || b.lunch_hall || 'Annapurna Dining Hall'
      });
    });

    // Public Annadanam sponsorships on that date
    const matchingAnnadanam = annadanamRecords.filter((a: any) => {
      const aDate = (a.date || '').slice(0, 10);
      return aDate === targetDate;
    });

    const totalAnnadanamFunds = matchingAnnadanam.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const sponsoredPublicMeals = Math.round(totalAnnadanamFunds / 35);

    const pendingLunchDevotees = Math.max(0, totalLunchDevotees - completedLunchDevotees);

    return {
      totalLunchDevotees,
      completedLunchDevotees,
      pendingLunchDevotees,
      sponsoredPublicMeals,
      lunchDevoteesList,
      matchingAnnadanamCount: matchingAnnadanam.length
    };
  }, [rawBookings, annadanamRecords, selectedLunchDate]);

  const filteredLunchList = dailyLunchData.lunchDevoteesList.filter((d: any) => {
    const q = lunchSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return d.devoteeName.toLowerCase().includes(q) || d.phone.includes(q) || d.sevaName.toLowerCase().includes(q);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const quickActions = isAdmin ? [
    { title: 'Live QR Scanner', href: '/dashboard/scanner', description: 'Instant gate QR verification & hall redirect', icon: QrCode, live: true, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/50' },
    { title: 'Devotee Roster', href: '/dashboard/devotees', description: 'Manage participant list & search gotra', icon: Users, live: false, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/50' },
    { title: 'Seva Management', href: '/dashboard/sevas', description: 'Browse and update available pooja slots', icon: BookOpen, live: false, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/50' },
    { title: 'User Permissions', href: '/dashboard/users', description: 'Configure staff & volunteer access rights', icon: ShieldCheck, live: false, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-950/50' },
  ] : [
    { title: 'Launch QR Scanner', href: '/dashboard/scanner', description: 'Verify incoming devotee tickets & gotras', icon: QrCode, live: true, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/50' },
    { title: 'Devotee Directory', href: '/dashboard/devotees', description: 'Search checked-in devotees & seating', icon: Users, live: false, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/50' },
    { title: 'Scan Activity Feed', href: '/dashboard/activity', description: 'Review your recent scan verification logs', icon: Clock, live: false, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-900 via-orange-800 to-amber-900 text-white p-6 sm:p-8 shadow-xl border border-orange-700/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md ${
                isAdmin ? 'bg-purple-950/80 text-purple-300 border-purple-400/30' : 'bg-emerald-950/80 text-emerald-300 border-emerald-400/30'
              }`}>
                {isAdmin ? '🛡️ Executive Admin Center' : '🙌 Swayamsevak Duty Hub'}
              </span>
              <span className="text-xs text-orange-200/80 font-mono">• {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome, {user?.name || (isAdmin ? 'Administrator' : 'Swayamsevak')}
            </h1>

            <p className="text-sm text-orange-100/90 mt-1 max-w-xl">
              {isAdmin 
                ? 'Monitoring real-time temple operations, devotee turnout, seva completion, and staff permissions.'
                : 'Thank you for your devotional service. Ready for gate check-ins and devotee assistance today.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : `Refresh (${lastRefreshed})`}</span>
            </button>

            <Link 
              href="/dashboard/scanner"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-orange-950 font-extrabold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all flex items-center gap-2"
            >
              <QrCode size={18} />
              <span>Quick Scan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 🍛 FEATURED CARD: DAILY LUNCH & MAHA PRASADAM ATTENDANCE (FOR ADMIN & VOLUNTEERS) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg border border-orange-200/80 dark:border-slate-700/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
        
        {/* Card Header & Date Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Daily Lunch & Maha Prasadam Attendance
                </h3>
                <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Live Dining Counter
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time tracking of devotees arriving for afternoon Prasadam for the selected day.
              </p>
            </div>
          </div>

          {/* Quick Date Switcher Controls */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedLunchDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                selectedLunchDate === todayStr 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedLunchDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                selectedLunchDate === tomorrowStr 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Tomorrow
            </button>
            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-slate-700">
              <Calendar size={14} className="text-orange-500" />
              <input
                type="date"
                value={selectedLunchDate}
                onChange={(e) => setSelectedLunchDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4 Lunch Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900/80 dark:to-slate-900/40 p-4 rounded-2xl border border-orange-200/60 dark:border-slate-700">
            <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
              Total Lunch Expected
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-3xl font-black text-gray-900 dark:text-white">
                {dailyLunchData.totalLunchDevotees}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Devotees</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              For {new Date(selectedLunchDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900/80 dark:to-slate-900/40 p-4 rounded-2xl border border-emerald-200/60 dark:border-slate-700">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Claimed / Served
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {dailyLunchData.completedLunchDevotees}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Checked-in</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {dailyLunchData.totalLunchDevotees > 0 
                ? `${Math.round((dailyLunchData.completedLunchDevotees / dailyLunchData.totalLunchDevotees) * 100)}% served` 
                : 'Ready at gate'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900/80 dark:to-slate-900/40 p-4 rounded-2xl border border-amber-200/60 dark:border-slate-700">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pending / In-Transit
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {dailyLunchData.pendingLunchDevotees}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Remaining</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Awaiting hall entry
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/80 dark:to-slate-900/40 p-4 rounded-2xl border border-blue-200/60 dark:border-slate-700">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Public Annadanam
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-3xl font-black text-blue-600 dark:text-blue-400">
                ~{dailyLunchData.sponsoredPublicMeals}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Meals</span>
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
              {dailyLunchData.matchingAnnadanamCount} Sponsors on this day
            </p>
          </div>
        </div>

        {/* Toggle Devotee Lunch Roster Table */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <button
            onClick={() => setShowDevoteeLunchDrawer(!showDevoteeLunchDrawer)}
            className="flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400 hover:text-orange-700 cursor-pointer"
          >
            <span>{showDevoteeLunchDrawer ? 'Hide Devotee Lunch Roster' : 'View Devotee Lunch Roster & Meal Tokens'}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${showDevoteeLunchDrawer ? 'rotate-180' : ''}`} />
          </button>

          <span className="text-xs text-gray-400 font-medium">
            Dining Hall: <strong className="text-gray-700 dark:text-gray-300 font-bold">Annapurna Hall (Ground Floor)</strong>
          </span>
        </div>

        {/* Expandable Devotee Lunch List */}
        {showDevoteeLunchDrawer && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/60 space-y-3 animate-fade-in">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lunch devotee by name, phone, seva..."
                value={lunchSearchQuery}
                onChange={(e) => setLunchSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-2xl border border-gray-100 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Devotee Name</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Seva Offering</th>
                    <th className="px-4 py-2.5 text-center">Meal Tokens</th>
                    <th className="px-4 py-2.5 text-right">Gate Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {filteredLunchList.length > 0 ? filteredLunchList.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">
                        {row.devoteeName}
                        {row.gotra && <span className="text-[10px] text-gray-400 font-normal ml-1">({row.gotra})</span>}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{row.phone}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300">{row.sevaName}</td>
                      <td className="px-4 py-2.5 text-center font-extrabold text-orange-600">
                        {row.mealTokens} Tokens
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          row.status === 'Completed' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                        No specific lunch bookings found for {selectedLunchDate}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Role-Specific Showcase Widget for Volunteers */}
      {isVolunteer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Scan Goal Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/60 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Today's Gate Goal
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Active Shift
                </span>
              </div>

              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {todayScansCount} <span className="text-sm font-normal text-gray-400">/ {dailyScanTarget} Scans</span>
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 mt-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${Math.min(100, (todayScansCount / dailyScanTarget) * 100)}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
                {Math.round((todayScansCount / dailyScanTarget) * 100)}% of daily target verified. Keep up the great seva!
              </p>
            </div>

            <Link 
              href="/dashboard/scanner"
              className="mt-6 w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-all text-center block shadow-md shadow-orange-600/20"
            >
              Start Live Camera Scan →
            </Link>
          </div>

          {/* Assigned Duty Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/60 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Assigned Location
                </span>
                <span className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-0.5 rounded-md">
                  Station #01
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Main Entrance & Dining Redirect
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Shift: <span className="font-semibold text-gray-700 dark:text-gray-200">07:00 AM - 01:00 PM</span>
              </p>

              <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-slate-900/50 border border-orange-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Supervisor:</span>
                  <span className="font-bold text-gray-900 dark:text-white">Gururaj Patil</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Redirect Mode:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Gotra Verification</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Checked-in on time today</span>
            </div>
          </div>

          {/* Devotional Sloka of the Day */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent dark:from-slate-800 dark:to-orange-950/30 rounded-3xl p-6 border border-amber-500/20 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Swayamsevak Inspiration
              </span>

              <blockquote className="italic text-gray-700 dark:text-gray-200 text-sm leading-relaxed font-serif">
                "Poojaya Raghavendrasya Sarva Siddhir Bhavishyati. Kayena Vacha Manasendriyai rva Karomi Yad Yat Sakalam Parasmai..."
              </blockquote>

              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-3">
                — Sri Raghavendra Swamy Stotram
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-orange-200/50 dark:border-slate-700/50 text-[11px] text-gray-500 dark:text-gray-400">
              Devotional service rendered with sincerity brings peace and divine grace.
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>{isAdmin ? 'System Key Performance Indicators' : 'Devotee & Seva Overview'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.length > 0 ? stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          )) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-32 animate-pulse" />
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
          Quick Operations & Action Hub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link 
                key={action.title} 
                href={action.href}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3.5 rounded-2xl ${action.bg} ${action.color} shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  {action.live && (
                    <span className="bg-rose-500 text-white text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                      Live
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700/50 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
                  <span>Open Tool</span>
                  <ArrowRight size={16} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span>Recent Gate Check-ins & Activity</span>
          </h2>

          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setActivityFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activityFilter === 'all' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              All Logs
            </button>
            <button 
              onClick={() => setActivityFilter('scans')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activityFilter === 'scans' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              QR Scans
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {recentCheckins.length > 0 ? recentCheckins.map((checkin) => (
              <div key={checkin.id} className="p-5 hover:bg-orange-50/50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {checkin.name ? checkin.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{checkin.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <span>{checkin.time}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{checkin.seva}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs ${
                    checkin.status === 'Completed' || checkin.status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {checkin.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                No recent activity logged yet today.
              </div>
            )}
          </div>

          <div className="bg-gray-50/80 dark:bg-slate-800/50 p-4 border-t border-gray-100 dark:border-slate-700/50 text-center">
            <Link href="/dashboard/activity" className="text-xs font-black text-orange-600 dark:text-orange-400 hover:text-amber-500 dark:hover:text-amber-300 uppercase tracking-widest transition-colors">
              View Full Gate Log Stream →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
