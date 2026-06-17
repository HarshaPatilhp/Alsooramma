'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { KeyRound, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex text-gray-900 bg-gray-50/50">
      {/* Left side: Beautiful branding / imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 text-white overflow-hidden justify-center items-center">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-400 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 max-w-lg px-12 animate-fade-in text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl mx-auto mb-8">
             <ShieldCheck size={48} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-md">
            Mutt Management Portal
          </h1>
          <p className="text-xl text-orange-100/90 font-medium leading-relaxed drop-shadow-sm mb-10">
            Secure, efficient, and streamlined administration for all temple activities and volunteer coordination.
          </p>
          <div className="flex gap-4 justify-center">
             <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-2">
                <ShieldCheck size={18} className="text-orange-200" />
                <span className="text-sm font-semibold tracking-wide">Secure Access</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] relative z-10 h-screen overflow-y-auto">
        
        <div className="mx-auto w-full max-w-md animate-fade-in-up">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-base font-medium text-gray-500">Sign in to access your volunteer dashboard</p>
          </div>

          <div className="bg-white">
            <LoginForm />
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-xs font-medium text-gray-400">
              &copy; {new Date().getFullYear()} Vidyaranyapura Mutt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
