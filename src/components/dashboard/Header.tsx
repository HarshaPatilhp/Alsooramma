"use client";

import { Menu, Search, Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';


interface HeaderProps {
  toggleSidebar: () => void;
  user: any;
}

export default function Header({ toggleSidebar, user }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState('');
  const { theme, toggleTheme } = useTheme();


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
          <button className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

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
