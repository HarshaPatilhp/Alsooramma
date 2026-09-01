import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  Icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export default function StatCard({ title, value, subtitle, Icon, trend }: StatCardProps) {
  return (
    <div className="group relative bg-white dark:bg-[#111827] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/40 dark:hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden font-sans">
      {/* Subtle top accent highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-70 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/40 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform duration-300 shadow-xs">
          <Icon className="w-5 h-5" />
        </div>
        
        {trend && (
          <div className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-xs ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' 
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {value}
        </h3>
        <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 inline-block" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
}
