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

  type NavLink = { 
    name: string; 
    href: string; 
    icon: any; 
    key: PermissionKey; 
    group: 'Operations' | 'Records & Registry' | 'Finance' | 'Administration';
    badge?: string; 
  };

  const allLinks: NavLink[] = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, key: 'dashboard', group: 'Operations' },
    { name: 'Live QR Scanner', href: '/dashboard/scanner', icon: QrCode, key: 'qr_checkin', group: 'Operations', badge: 'Live Gate' },
    { name: 'Activity Feed', href: '/dashboard/activity', icon: Clock, key: 'activity_log', group: 'Operations' },
    { name: 'Devotee Roster', href: '/dashboard/devotees', icon: Users, key: 'devotees', group: 'Records & Registry' },
    { name: 'Seva Offerings', href: '/seva-list', icon: Calendar, key: 'seva_dashboard', group: 'Records & Registry' },
    { name: 'Sacred Donations', href: '/dashboard/donations', icon: Gift, key: 'donations', group: 'Records & Registry' },
    { name: 'Annadanam Nidhi', href: '/dashboard/annadanam', icon: Coffee, key: 'annadanam', group: 'Records & Registry' },
    { name: 'Central Finance', href: '/dashboard/finance', icon: Landmark, key: 'finance', group: 'Finance', badge: 'Treasury' },
    { name: 'Financial Reports', href: '/dashboard/reports', icon: PieChart, key: 'reports', group: 'Finance' },
    { name: 'User Management', href: '/dashboard/users', icon: Settings, key: 'user_management', group: 'Administration' },
  ];

  // Dynamically filter menu items according to permissions
  const links = allLinks.filter(link => hasPermission(user, link.key));

  // Group links
  const groups: Array<'Operations' | 'Records & Registry' | 'Finance' | 'Administration'> = [
    'Operations',
    'Records & Registry',
    'Finance',
    'Administration'
  ];

  const roleBadgeText = 
    user?.role === 'super_admin' ? 'Super Admin' :
    user?.role === 'admin' ? 'Administrator' : 'Swayamsevak / Scanner';

  const roleBadgeBg =
    user?.role === 'super_admin' ? 'bg-purple-950/90 text-purple-200 border-purple-400/40' :
    user?.role === 'admin' ? 'bg-amber-950/90 text-amber-200 border-amber-400/40' : 
    'bg-emerald-950/90 text-emerald-200 border-emerald-400/40';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#180e04] via-[#120a03] to-[#0a0f1d] text-orange-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl border-r border-orange-900/30 font-sans`}
      >
        {/* Brand Header */}
        <div className="p-5 px-6 bg-black/30 border-b border-orange-900/40 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-950/60 border border-amber-300/40">
              <Sparkles className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">Sri Mutt Portal</h2>
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 shadow-xs ${roleBadgeBg}`}>
                <Shield className="w-2.5 h-2.5" />
                {roleBadgeText}
              </span>
            </div>
          </div>
          <button 
            className="md:hidden text-orange-200 hover:text-white p-1.5 rounded-xl hover:bg-orange-900/50 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6 scrollbar-thin scrollbar-thumb-orange-900">
          {groups.map(group => {
            const groupLinks = links.filter(l => l.group === group);
            if (groupLinks.length === 0) return null;

            return (
              <div key={group} className="space-y-1">
                <div className="px-3 pb-1.5">
                  <span className="text-[10px] font-extrabold text-orange-400/50 uppercase tracking-widest block">
                    {group}
                  </span>
                </div>

                {groupLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => {
                        if (window.innerWidth < 768) setIsOpen(false);
                      }}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg shadow-orange-950/60' 
                          : 'text-orange-100/75 hover:bg-orange-900/30 hover:text-white font-medium'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
                      )}
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'text-orange-300/80 group-hover:text-amber-300 group-hover:bg-white/5'
                      }`}>
                        <Icon size={17} />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">{link.name}</span>
                      {link.badge && (
                        <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isActive 
                            ? 'bg-white/25 text-white' 
                            : 'bg-orange-950/80 text-orange-300 border border-orange-800/50'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Session Footer */}
        <div className="p-4 border-t border-orange-900/30 bg-black/40 mt-auto space-y-2.5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-orange-950/40 border border-orange-900/40">
            <div className="w-8 h-8 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Vidyaranyapura Mutt'}</p>
              <p className="text-[10px] text-orange-300/60 truncate font-mono mt-0.5">{user?.email || 'admin@alsur-mutt.org'}</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-900/40 font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

