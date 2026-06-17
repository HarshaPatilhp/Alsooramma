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

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Global Search */}
          <div className="hidden lg:flex max-w-md w-full ml-4">
            <div className="relative w-64 focus-within:w-80 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-orange-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-full leading-5 bg-gray-50 dark:bg-slate-800 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent sm:text-sm shadow-inner transition-colors"
                placeholder="Search devotees, bookings..."
                type="search"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 ml-auto">
          {/* Date & Time display */}
          <div className="hidden sm:flex flex-col items-end mr-4 border-r border-gray-200 dark:border-slate-700 pr-6">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 tracking-wider">TODAY</span>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{currentDate}</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">{notifications.length} New</span>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 items-start">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">QR Checked-in Verified</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">Booking ID #{notif.booking_id} was scanned and verified successfully.</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {notif.scanned_at || new Date(notif.created_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 text-center border-t border-gray-100 dark:border-slate-700">
                  <a href="/dashboard/activity" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 uppercase tracking-wider">
                    View All Activity
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-2">

            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none mb-1">
                {user?.name || 'Vidyaranyapura Mutt'}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium tracking-wide uppercase">
                {user?.role === 'admin' ? 'Super Admin' : 'Staff Member'}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500/20 shadow-sm overflow-hidden">
               <User className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
