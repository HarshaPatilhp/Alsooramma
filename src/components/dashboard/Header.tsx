"use client";

import { Menu, Search, Bell, User, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/client';


interface HeaderProps {
  toggleSidebar: () => void;
  user: any;
}

export default function Header({ toggleSidebar, user }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme, toggleTheme } = useTheme();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('scan_history').select('*').order('created_at', { ascending: false }).limit(5);
      if (data && !error) {
        setNotifications(data);
      }
    };
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const updateTime = () => {
      setCurrentDate(new Date().toLocaleString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toUpperCase());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="bg-white/90 dark:bg-[#0f172a]/90 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs backdrop-blur-md transition-colors duration-200 font-sans">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Hamburger & Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            type="button"
            className="md:hidden p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer shrink-0 active:scale-95 transition-transform"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {/* Global Search Bar (Desktop) */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('search') as HTMLInputElement)?.value;
              if (input && input.trim()) {
                window.location.href = `/dashboard/devotees?search=${encodeURIComponent(input.trim())}`;
              }
            }}
            className="hidden sm:flex max-w-md w-full"
          >
            <div className="relative w-72 focus-within:w-96 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-orange-500" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-9 pr-14 py-2 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-inner transition-colors"
                placeholder="Search devotees, sevas, tickets..."
                type="search"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">⌘K</kbd>
              </div>
            </div>
          </form>

          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden p-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Right Side: IST Clock, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          
          {/* Live Indian Standard Time */}
          <div className="hidden lg:flex flex-col items-end pr-4 border-r border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live IST
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">{currentDate}</span>
          </div>

          {/* Notifications Flyout */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              title="Recent Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-orange-600 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-18 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Live Activity Alerts</h3>
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-bold">{notifications.length} Recent</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex gap-3 items-start">
                        <div className="mt-0.5 w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">QR Check-in Verified</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Devotee Booking #{notif.booking_id} verified at gate scanner.</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" /> {notif.scanned_at || new Date(notif.created_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No new gate notifications
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 text-center border-t border-slate-100 dark:border-slate-800">
                  <a href="/dashboard/activity" className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline uppercase tracking-wider">
                    View Complete Audit Log →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Tactile Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-yellow-400 transition-all rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {user?.name || 'Mutt Admin'}
              </p>
              <p className={`text-[9px] font-extrabold tracking-wider uppercase mt-1 ${
                user?.role === 'super_admin' ? 'text-purple-600 dark:text-purple-400' :
                user?.role === 'admin' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Swayamsevak'}
              </p>
            </div>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center border font-bold text-xs shadow-xs transition-transform hover:scale-105 ${
              user?.role === 'super_admin' ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' :
              user?.role === 'admin' ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
              'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] animate-fade-in">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('mobile-search') as HTMLInputElement)?.value;
              if (input && input.trim()) {
                window.location.href = `/dashboard/devotees?search=${encodeURIComponent(input.trim())}`;
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-orange-500" aria-hidden="true" />
              </div>
              <input
                id="mobile-search"
                name="mobile-search"
                autoFocus
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
                placeholder="Search devotees, sevas, tickets..."
                type="search"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
