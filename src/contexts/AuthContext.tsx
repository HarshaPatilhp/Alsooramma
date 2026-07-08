'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/client';
import { RBACUser } from '@/lib/rbac';

export interface User extends RBACUser {
  id: string | number;
  name: string;
  role: 'super_admin' | 'admin' | 'volunteer' | string;
  email: string;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserPermissions: (newPermissions: Record<string, boolean>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if the current navigation is a page refresh / reload
    let isReload = false;
    if (typeof window !== 'undefined') {
      const navEntries = window.performance?.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
      } else if ((window.performance as any)?.navigation?.type === 1) {
        isReload = true;
      }
    }

    if (isReload) {
      // Requirement: when the page is refreshed, automatically log out
      sessionStorage.removeItem('temple_auth_user');
      sessionStorage.removeItem('temple_auth_phone');
      if (typeof document !== 'undefined') {
        document.cookie = 'temple_auth_user_id=; path=/; max-age=0';
        document.cookie = 'temple_auth_user_email=; path=/; max-age=0';
      }
      setUser(null);
      return;
    }

    // Check for stored auth in session storage if not a reload
    const storedUser = sessionStorage.getItem('temple_auth_user');
    
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        if (parsed.email === 'admin@temple.com') {
          parsed.role = 'super_admin';
        }
        setUser(parsed);
        // Ensure auth cookies exist for API server verification
        if (typeof document !== 'undefined') {
          document.cookie = `temple_auth_user_id=${parsed.id}; path=/; max-age=86400`;
          document.cookie = `temple_auth_user_email=${encodeURIComponent(parsed.email)}; path=/; max-age=86400`;
        }
      } catch (error) {
        sessionStorage.removeItem('temple_auth_user');
      }
    }
  }, []);



  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      // If user not found (PGRST116 = no rows returned), let's auto-seed the demo users
      if (error && error.code === 'PGRST116') {
         if (email === 'admin@temple.com' || email === 'gururaj@volunteer.com') {
             const role = email === 'admin@temple.com' ? 'super_admin' : 'volunteer';
             const name = role === 'super_admin' ? 'Master Admin' : 'Volunteer 01';
             const phone = role === 'super_admin' ? '9876543210' : '9000000001';
             const permissions = role === 'super_admin' 
               ? { dashboard: true, qr_checkin: true, devotees: true, activity_log: true, seva_dashboard: true, donations: true, annadanam: true, reports: true, user_management: true }
               : { dashboard: true, qr_checkin: true, devotees: true, activity_log: true };
             
             const { data: insertData, error: insertError } = await supabase.from('users').insert([{
                 id: Date.now().toString(),
                 name,
                 email,
                 password,
                 phone,
                 role,
                 permissions
             }]).select().single();
             
             if (insertData && !insertError) {
                 data = insertData;
                 error = null;
             }
         }
      }

      if (data && !error) {
        if (data.email === 'admin@temple.com') {
          data.role = 'super_admin';
        }

        const userData: User = {
          id: data.id,
          name: data.name,
          role: data.role as 'super_admin' | 'admin' | 'volunteer' | string,
          email: data.email,
          permissions: data.permissions || {}
        };

        setUser(userData);
        sessionStorage.setItem('temple_auth_user', JSON.stringify(userData));
        sessionStorage.setItem('temple_auth_phone', data.phone || '');

        if (typeof document !== 'undefined') {
          document.cookie = `temple_auth_user_id=${userData.id}; path=/; max-age=86400`;
          document.cookie = `temple_auth_user_email=${encodeURIComponent(userData.email)}; path=/; max-age=86400`;
        }

        return true;
      }

      // If table doesn't exist
      if (error && error.code === '42P01') {
        alert("The 'users' table does not exist in Supabase. Please run the SQL commands from backend/supabase_schema.sql in your Supabase SQL Editor!");
      }
      
      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('temple_auth_user');
    sessionStorage.removeItem('temple_auth_phone');
    if (typeof document !== 'undefined') {
      document.cookie = 'temple_auth_user_id=; path=/; max-age=0';
      document.cookie = 'temple_auth_user_email=; path=/; max-age=0';
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateUserPermissions = (newPermissions: Record<string, boolean>) => {
    if (user) {
      const updatedUser: User = { ...user, permissions: newPermissions };
      setUser(updatedUser);
      sessionStorage.setItem('temple_auth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUserPermissions,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

