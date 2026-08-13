'use client';

import { useState } from 'react';
import { Phone, Award, ShieldCheck, Clock, X, ExternalLink, CheckCircle2 } from 'lucide-react';

interface VolunteerCardProps {
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  alt: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  category?: string;
  skills?: string[];
  status?: string;
  shiftsServed?: number;
}

export default function VolunteerCard({ 
  name, 
  role, 
  description, 
  imageSrc, 
  alt, 
  phone, 
  instagram, 
  linkedin,
  category = "Temple Operations",
  skills = ["Pooja Rituals", "Crowd Support", "Annadanam"],
  status = "Active Swayamsevak",
  shiftsServed = 42
}: VolunteerCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Generate deterministic gradient background for fallback initials avatar
  const getInitials = (str: string) => {
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between relative">
        {/* Top Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-orange-950/80 backdrop-blur-md text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1 shadow-md">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            {status}
          </span>
        </div>

        <div>
          {/* Image & Header */}
          <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 dark:from-slate-900 dark:to-orange-950/50 relative overflow-hidden">
            {!imageError ? (
              <img
                src={imageSrc}
                alt={alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white/40 mb-2 group-hover:scale-110 transition-transform">
                  {getInitials(name)}
                </div>
                <span className="text-xs font-semibold text-orange-900 dark:text-orange-200 uppercase tracking-widest">{category}</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h4 className="font-extrabold text-xl leading-tight drop-shadow-md text-white">{name}</h4>
              <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mt-0.5 drop-shadow">{role}</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-3">
            <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">
              {description}
            </p>

            {/* Skills & Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-orange-200/60 dark:border-orange-800/40">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 pt-0 border-t border-gray-50 dark:border-slate-700/50 flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            {phone && (
              <a 
                href={`tel:${phone}`} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center shadow-xs" 
                title={`Call ${phone}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {instagram && (
              <a 
                href={instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-pink-600 hover:text-white transition-colors flex items-center justify-center shadow-xs" 
                title="Instagram Profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
            {linkedin && (
              <a 
                href={linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center shadow-xs" 
                title="LinkedIn Profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            )}
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-amber-500 dark:hover:text-amber-300 flex items-center gap-1 uppercase tracking-wider group-hover:translate-x-0.5 transition-transform"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 relative animate-slide-up">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-800 p-6 text-white text-center relative">
              <div className="w-24 h-24 rounded-full bg-white/20 p-1 mx-auto mb-3 backdrop-blur-md shadow-xl">
                {!imageError ? (
                  <img src={imageSrc} alt={alt} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-amber-400 text-orange-950 font-black text-3xl flex items-center justify-center">
                    {getInitials(name)}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-extrabold">{name}</h3>
              <p className="text-amber-200 text-xs font-bold uppercase tracking-widest mt-1">{role}</p>
              <span className="inline-flex items-center gap-1 mt-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                {status}
              </span>
            </div>

            <div className="p-6 space-y-5 text-gray-700 dark:text-gray-300">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">About Swayamsevak</h5>
                <p className="text-sm leading-relaxed">{description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-orange-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-orange-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Shifts Served</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{shiftsServed}+ Hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Seva Recognition</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Gold Badge</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2">Core Competencies</h5>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {phone && (
                <div className="pt-2">
                  <a 
                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact Swayamsevak ({phone})</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

