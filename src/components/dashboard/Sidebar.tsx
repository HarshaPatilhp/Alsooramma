"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  Clock, 
  LogOut, 
  Calendar,
  Gift,
  Coffee,
  PieChart,
  Settings,
  Shield,
  Sparkles,
  Landmark,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole?: string;
}

import { hasPermission, PermissionKey } from '@/lib/rbac';

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  type NavLink = { name: string; href: string; icon: any; key: PermissionKey; highlight?: boolean; badge?: string; };

  const allLinks: NavLink[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Finance', href: '/dashboard/finance', icon: Landmark, key: 'finance' },
    { name: 'QR Check-in', href: '/dashboard/scanner', icon: QrCode, key: 'qr_checkin', highlight: true, badge: 'Live' },
    { name: 'Devotees', href: '/dashboard/devotees', icon: Users, key: 'devotees' },
    { name: 'Activity Log', href: '/dashboard/activity', icon: Clock, key: 'activity_log' },
    { name: 'Seva List', href: '/seva-list', icon: Calendar, key: 'seva_dashboard' },
    { name: 'Donations', href: '/dashboard/donations', icon: Gift, key: 'donations' },
    { name: 'Annadanam', href: '/dashboard/annadanam', icon: Coffee, key: 'annadanam' },
    { name: 'Reports', href: '/dashboard/reports', icon: PieChart, key: 'reports' },
    { name: 'User Management', href: '/dashboard/users', icon: Settings, key: 'user_management' },
  ];

  // Dynamically filter menu items according to permissions
  const links = allLinks.filter(link => hasPermission(user, link.key));

  const roleBadgeText = 
    user?.role === 'super_admin' ? 'Super Admin' :
    user?.role === 'admin' ? 'Administrator' : 'Swayamsevak / Scanner';

  const roleBadgeBg =
    user?.role === 'super_admin' ? 'bg-purple-950/80 text-purple-200 border-purple-400/30' :
    user?.role === 'admin' ? 'bg-amber-950/80 text-amber-200 border-amber-400/30' : 
    'bg-emerald-950/80 text-emerald-200 border-emerald-400/30';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-orange-950 via-orange-900 to-slate-950 text-orange-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl border-r border-orange-800/30`}
      >
        {/* Brand Header */}
        <div className="p-5 px-6 bg-orange-950/80 border-b border-orange-800/40 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-orange-950 shadow-lg shadow-orange-950/50 border border-amber-300/30">
              <Sparkles className="w-5 h-5 text-amber-950 fill-amber-950" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white leading-none">Mutt Portal</h2>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1.5 shadow-xs ${roleBadgeBg}`}>
                <Shield className="w-2.5 h-2.5" />
                {roleBadgeText}
              </span>
            </div>
          </div>
          <button 
            className="md:hidden text-orange-200 hover:text-white p-1 rounded-lg hover:bg-orange-800/50"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-orange-700">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-orange-300/60 uppercase tracking-widest">
              Navigation Menu
            </span>
          </div>

          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg shadow-orange-950/50' 
                    : 'text-orange-100/70 hover:bg-orange-800/40 hover:text-white font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                )}
                <Icon size={19} className={isActive ? 'text-white' : 'text-orange-300/80 group-hover:text-amber-300 transition-colors'} />
                <span className="text-sm tracking-wide">{link.name}</span>
                {link.badge && (
                  <span className="ml-auto bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse shadow-sm">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-orange-800/30 bg-orange-950/40 mt-auto space-y-2">
          <div className="px-3 py-2 rounded-xl bg-orange-900/30 border border-orange-800/20 text-center">
            <p className="text-[10px] font-bold text-orange-200/80 uppercase tracking-wider">Vidyaranyapura Mutt</p>
            <p className="text-[9px] text-orange-300/60 mt-0.5">Sri Raghavendra Swamy Seva</p>
          </div>

          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2.5 px-4 py-2.5 w-full rounded-xl bg-red-950/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-800/30 font-bold text-xs transition-all duration-200 shadow-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

