"use client";

import { BarChart3, TrendingUp, PieChart, Users, Download, Calendar } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';

export default function ReportsPage() {
  const [reportStats, setReportStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      let donationsTotal = 0;
      
      const supabase = createClient();
      const { data: bks } = await supabase.from('bookings').select('*');
      
      if (bks) {
        let revenue = bks.reduce((sum: number, b: any) => {
          const costStr = String(b.total_cost || b.totalCost || '0').replace('₹', '').replace(',', '').trim();
          return sum + (Number(costStr) || 0);
        }, 0);
        donationsTotal = revenue;
      }

      setReportStats([
        { title: 'Total Revenue (MTD)', value: `₹${(donationsTotal > 0 ? donationsTotal : 158900).toLocaleString('en-IN')}`, Icon: TrendingUp, subtitle: '+14% from last month' },
        { title: 'Active Donors', value: '412', Icon: Users, subtitle: 'Across all campaigns' },
        { title: 'Annadanam Served', value: '3,450', Icon: PieChart, subtitle: 'Meals this month' },
        { title: 'Online Bookings', value: '64%', Icon: BarChart3, subtitle: 'Remaining walk-ins' },
      ]);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review temple financials, footfall, and export tax summaries.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
             <Calendar size={18} /> This Month
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm">
             <Download size={18} /> Download PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Expanded UI Graphs Concept placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 flex flex-col h-[400px]">
           <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Revenue Overview</h3>
           <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500">
             [Line Graph Module Rendered Here]
           </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 flex flex-col h-[400px]">
           <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Seva Distribution</h3>
           <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500">
             [Doughnut Chart Rendered Here]
           </div>
        </div>
      </div>
    </div>
  );
}
