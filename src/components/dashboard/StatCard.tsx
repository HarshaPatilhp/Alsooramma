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
    <div className="group relative bg-white dark:bg-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700/60 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm">
      {/* Decorative gradient glow top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-80 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/20 dark:from-orange-500/20 dark:to-amber-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {value}
        </h3>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
