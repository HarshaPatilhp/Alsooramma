'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/client';

interface User {
  id: string | number;
  name: string;
  role: 'volunteer' | 'admin';
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored auth in session storage on mount
    const storedUser = sessionStorage.getItem('temple_auth_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
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
             const role = email === 'admin@temple.com' ? 'admin' : 'volunteer';
             const name = role === 'admin' ? 'Master Admin' : 'Volunteer 01';
             const phone = role === 'admin' ? '9876543210' : '9000000001';
             
             const { data: insertData, error: insertError } = await supabase.from('users').insert([{
                 id: Date.now().toString(),
                 name,
                 email,
                 password,
                 phone,
                 role
             }]).select().single();
             
             if (insertData && !insertError) {
                 data = insertData;
                 error = null;
             }
         }
      }

      if (data && !error) {
        const userData: User = {
          id: data.id,
          name: data.name,
          role: data.role as 'admin' | 'volunteer',
          email: data.email
        };

        setUser(userData);
        sessionStorage.setItem('temple_auth_user', JSON.stringify(userData));
        sessionStorage.setItem('temple_auth_phone', data.phone || '');
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
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
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
