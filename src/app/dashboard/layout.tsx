"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { hasPermission, ROUTE_PERMISSIONS_MAP } from '@/lib/rbac';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Requirement 4: If admin manually enters exact or sub-path of restricted page, redirect to 403 page
    if (pathname && pathname !== '/dashboard/access-denied') {
      const matchedRoute = Object.keys(ROUTE_PERMISSIONS_MAP).find(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      if (matchedRoute) {
        const requiredPerm = ROUTE_PERMISSIONS_MAP[matchedRoute];
        if (!hasPermission(user, requiredPerm)) {
          router.replace('/dashboard/access-denied');
        }
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        userRole={user?.role} 
      />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          user={user} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/70 dark:bg-[#090d16] p-4 md:p-6 lg:p-8 transition-colors duration-200">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
