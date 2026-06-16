"use client";

import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, Users, BookOpen, Gift, ShieldCheck, QrCode, Clock, ArrowRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      let bookings: any[] = [];
      if (typeof window !== 'undefined') {
        const bookingsJson = localStorage.getItem('temple_bookings');
        bookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      }

      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success && data.bookings) {
          bookings = data.bookings;
          if (typeof window !== 'undefined') {
            localStorage.setItem('temple_bookings', JSON.stringify(bookings));
          }
        }
      } catch (apiErr: any) {
        console.error('Failed to sync dashboard bookings with Sheets API:', apiErr.message);
      }

      const historyJson = typeof window !== 'undefined' ? localStorage.getItem('scanHistory') : null;
      const history = historyJson ? JSON.parse(historyJson) : [];

      // Calculate live stats
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      
      const todaysBookings = bookings.filter((b: any) => b.date && b.date.startsWith(todayStr));
      
      // 1. Total Devotees (All Time)
      const totalDevotees = bookings.reduce((sum: number, b: any) => sum + (Number(b.numberOfPeople) || 1), 0);
      const devoteesToday = todaysBookings.reduce((sum: number, b: any) => sum + (Number(b.numberOfPeople) || 1), 0);
      
      // 2. Sevas Completed (All Time)
      const completedTotal = bookings.filter((b: any) => b.status === 'completed').length;
      
      // 3. Total Revenue (All Time)
      const revenueTotal = bookings.reduce((sum: number, b: any) => {
        const costStr = String(b.totalCost || '0').replace('₹', '').replace(',', '').trim();
        return sum + (Number(costStr) || 0);
      }, 0);

      const baseStats = [
        { title: 'Total Devotees', value: totalDevotees.toString(), Icon: Users, subtitle: `${devoteesToday} arriving today` },
        { title: 'Sevas Completed', value: completedTotal.toString(), Icon: BookOpen, subtitle: `Of ${bookings.length} total booked` },
      ];

      if (user?.role === 'admin') {
        baseStats.push({ title: 'Total Revenue', value: `₹${revenueTotal.toLocaleString('en-IN')}`, Icon: Gift, subtitle: 'Total collected' });
      }

      baseStats.push({ title: 'Mutt Status', value: 'Open', Icon: ShieldCheck, subtitle: 'Closes at 9:00 PM' });
      
      setStats(baseStats);

      // Load recent check-ins from history
      const recent = history.slice(0, 5).map((h: any) => ({
        id: h.id,
        name: h.devoteeName || 'Unknown Devotee',
        time: new Date(h.scanTime || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        seva: h.sevaName || 'Seva',
        status: h.status || 'Checked In'
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
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  const quickActions = [
    { title: 'QR Scanner', href: '/dashboard/scanner', description: 'Scan participant QR codes', icon: QrCode, live: true, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Devotees List', href: '/dashboard/devotees', description: 'View and manage participants', icon: Users, live: false, color: 'text-amber-500', bg: 'bg-amber-100' },
    { title: 'Activity Log', href: '/dashboard/activity', description: 'View event activity history', icon: Clock, live: false, color: 'text-red-500', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Vidyaranyapura Mutt Panel
          </h1>
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1 uppercase tracking-wider flex items-center gap-2">
            <span>Role: <span className="text-gray-500 dark:text-gray-400">{user?.role || 'Volunteer'}</span></span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>
        
        <button 
          onClick={loadData}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : `Refresh Data (Last: ${lastRefreshed})`}</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Event Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.length > 0 ? stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          )) : (
            // Loading skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-32 animate-pulse" />
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link 
                key={action.title} 
                href={action.href}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-start gap-5"
              >
                <div className={`p-4 rounded-xl ${action.bg} dark:bg-opacity-20 ${action.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{action.title}</h3>
                    {action.live && (
                      <span className="bg-red-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug pr-4">{action.description}</p>
                </div>
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={20} className="text-gray-300 dark:text-gray-600" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Check-ins</h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {recentCheckins.length > 0 ? recentCheckins.map((checkin) => (
              <div key={checkin.id} className="p-5 hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800/50">
                    {checkin.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{checkin.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {checkin.time} <span className="text-gray-300 dark:text-gray-600 mx-1">•</span> {checkin.seva}
                    </p>
                  </div>
                </div>
                <div>
                   <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    checkin.status === 'Completed' || checkin.status === 'Verified'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {checkin.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No recent activity logged.
              </div>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 border-t border-gray-100 dark:border-slate-700/50 text-center">
            <Link href="/dashboard/activity" className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-amber-500 dark:hover:text-amber-400 uppercase tracking-widest transition-colors">
              View All Activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
