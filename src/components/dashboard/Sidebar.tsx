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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole?: string;
}

export default function Sidebar({ isOpen, setIsOpen, userRole }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isAdmin = userRole === 'admin';

  type NavLink = { name: string; href: string; icon: any; highlight?: boolean; };

  const volunteerLinks: NavLink[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'QR Check-in', href: '/dashboard/scanner', icon: QrCode, highlight: true },
    { name: 'Devotees', href: '/dashboard/devotees', icon: Users },
    { name: 'Activity Log', href: '/dashboard/activity', icon: Clock },
  ];

  const adminAdditions: NavLink[] = [
    { name: 'Donations', href: '/dashboard/donations', icon: Gift },
    { name: 'Annadanam', href: '/dashboard/annadanam', icon: Coffee },
    { name: 'Reports', href: '/dashboard/reports', icon: PieChart },
    { name: 'User Management', href: '/dashboard/users', icon: Settings },
  ];

  const links = isAdmin ? [...volunteerLinks, ...adminAdditions] : volunteerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-orange-900 text-orange-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between p-6 px-6 bg-orange-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-orange-950 shadow-lg">
              <span className="font-bold text-xl">M</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-none">Mutt Panel</h2>
              <p className="text-xs text-amber-400 font-medium tracking-wider uppercase mt-1">
                {isAdmin ? 'Administrator' : 'Staff / Volunteer'}
              </p>
            </div>
          </div>
          <button 
            className="md:hidden text-orange-200 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-orange-700">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-orange-800 text-white shadow-inner font-semibold' 
                    : 'text-orange-100/80 hover:bg-orange-800/50 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-amber-400' : 'text-orange-300 group-hover:text-amber-300'} />
                <span>{link.name}</span>
                {link.highlight && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-orange-800/50 mt-auto">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-orange-200 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
