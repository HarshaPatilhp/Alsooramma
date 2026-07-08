"use client";

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccessDeniedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 p-8 text-center relative overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500" />

        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-50 dark:border-red-900/20 shadow-inner">
          <ShieldAlert size={40} className="text-red-600 dark:text-red-400 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold text-xs uppercase tracking-wider mb-3 border border-red-200 dark:border-red-800/50">
          <AlertTriangle size={14} />
          <span>HTTP 403 • Forbidden</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Access Denied
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
          You do not have the required administrative permissions to view or interact with this restricted module.
        </p>

        <div className="bg-gray-50 dark:bg-slate-900/60 rounded-2xl p-4 text-left border border-gray-150 dark:border-slate-700/60 mb-6 text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200/60 dark:border-slate-700 pb-2">
            <span>Current Account:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{user?.name || 'Authorized Staff'}</span>
          </div>
          <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium pt-1">
            <span>Assigned Role:</span>
            <span className="font-bold text-orange-600 dark:text-amber-400 uppercase tracking-wide">
              {user?.role === 'admin' ? 'Administrator (Restricted)' : 'Volunteer / Staff'}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
          If you require access to this module, please contact the <strong className="text-gray-800 dark:text-gray-200">Super Admin</strong> to enable the corresponding permission checkbox for your profile.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-orange-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
