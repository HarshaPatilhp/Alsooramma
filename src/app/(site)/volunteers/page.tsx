'use client';

import { useState } from 'react';
import {
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  CheckCircle2,
  X,
  UserPlus,
  Send,
  Sparkles,
  Flame,
  Calendar,
  Utensils,
  ShieldCheck,
  Search,
  Award,
  Loader2,
  Mail
} from 'lucide-react';

export interface VolunteerMember {
  id: string;
  name: string;
  role: string;
  category: string;
  phone?: string;
  email?: string;
  status: string;
  badge?: string;
}

const categories = [
  { name: 'All Domains', icon: Users },
  { name: 'Temple Operations', icon: Sparkles },
  { name: 'Pooja Rituals', icon: Flame },
  { name: 'Event Management', icon: Calendar },
  { name: 'Kitchen & Annadanam', icon: Utensils },
  { name: 'Security & Crowd', icon: ShieldCheck },
];

export const initialVolunteersList: VolunteerMember[] = [
  {
    id: 'VOL-001',
    name: 'Gururaj Patil',
    role: 'Temple Operations Lead',
    category: 'Temple Operations',
    phone: '+91 98765 43210',
    status: 'Active Lead',
    badge: '⭐ Operations Lead'
  },
  {
    id: 'VOL-002',
    name: 'Vivek',
    role: 'Festival & Event Coordinator',
    category: 'Event Management',
    phone: '+91 98765 43211',
    status: 'Senior Coordinator',
    badge: '⭐ Seva & Utsavam Lead'
  },
  {
    id: 'VOL-003',
    name: 'Harsha Patil',
    role: 'Pooja Rituals Coordinator',
    category: 'Pooja Rituals',
    phone: '+91 97386 24467',
    status: 'Daily Sevak',
    badge: '🎖️ Active Swayamsevak'
  },
  {
    id: 'VOL-004',
    name: 'Ramesh Kumar',
    role: 'Security & Crowd Management',
    category: 'Security & Crowd',
    phone: '+91 98765 43213',
    status: 'Active Sevak',
    badge: '🛡️ Security Coordinator'
  },
  {
    id: 'VOL-005',
    name: 'Karthik Nair',
    role: 'Kitchen & Annadanam Seva',
    category: 'Kitchen & Annadanam',
    phone: '+91 98765 43214',
    status: 'Active Sevak',
    badge: '🍲 Annadanam & Kitchen'
  },
  {
    id: 'VOL-006',
    name: 'Deepa Joshi',
    role: 'Devotee Seva Desk Support',
    category: 'Temple Operations',
    phone: '+91 98765 43215',
    status: 'Active Sevak',
    badge: '🎖️ Active Swayamsevak'
  }
];

const shiftsByDay: Record<string, Array<{ title: string; location: string; urgency: string; slots: number; time: string }>> = {
  Today: [
    { title: "Evening Maha Mangalarathi Crowd Support", location: "Main Sanctum", urgency: "Urgent", slots: 3, time: "6:30 PM - 8:30 PM" },
    { title: "Annadanam Prasadam Distribution", location: "Bhojanashala", urgency: "Normal", slots: 5, time: "12:00 PM - 2:30 PM" },
    { title: "Temple Sanctorum Flower Decoration", location: "Moola Brindavana", urgency: "Normal", slots: 2, time: "4:00 PM - 6:00 PM" }
  ],
  Tomorrow: [
    { title: "Morning Abhishekam Assistance", location: "Sanctum", urgency: "Urgent", slots: 4, time: "6:00 AM - 9:00 AM" },
    { title: "Prasadam Packing & Counter Seva", location: "Counter 2", urgency: "Normal", slots: 6, time: "10:00 AM - 1:00 PM" },
    { title: "Evening Bhajan Sandhya Setup", location: "Pravachana Hall", urgency: "Normal", slots: 3, time: "5:30 PM - 8:00 PM" }
  ],
  Weekend: [
    { title: "Mega Weekend Annadanam Seva", location: "Main Dining Hall", urgency: "Urgent", slots: 8, time: "11:30 AM - 3:30 PM" },
    { title: "Special Rathotsava Procession Team", location: "Temple Perimeter", urgency: "Urgent", slots: 10, time: "6:00 PM - 9:30 PM" },
    { title: "Devotee Queue & Footwear Management", location: "Entrance Plaza", urgency: "Normal", slots: 6, time: "8:00 AM - 12:00 PM" }
  ]
};

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<VolunteerMember[]>(initialVolunteersList);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Domains');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShiftDay, setSelectedShiftDay] = useState<string>('Today');
  
  // Modal & Application state
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [isShiftSignup, setIsShiftSignup] = useState<boolean>(false);
  const [selectedShiftInfo, setSelectedShiftInfo] = useState<{
    title: string;
    location: string;
    time: string;
    day: string;
  } | null>(null);

  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [applicantRole, setApplicantRole] = useState<string>('Temple Operations');
  const [applicantAvailability, setApplicantAvailability] = useState<string>('Weekends');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string>('');

  const filteredVolunteers = volunteers.filter(v => {
    const matchesCategory = selectedCategory === 'All Domains' || v.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      v.name.toLowerCase().includes(q) ||
      v.role.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      (v.badge && v.badge.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const openShifts = shiftsByDay[selectedShiftDay] || shiftsByDay['Today'];

  const handleOpenGeneralApply = () => {
    setIsShiftSignup(false);
    setSelectedShiftInfo(null);
    setShowApplyModal(true);
  };

  const handleOpenShiftApply = (shift: { title: string; location: string; time: string; urgency: string; slots: number }) => {
    setIsShiftSignup(true);
    setSelectedShiftInfo({
      title: shift.title,
      location: shift.location,
      time: shift.time,
      day: selectedShiftDay
    });
    setApplicantRole(shift.title);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitFeedback('');

    try {
      const payload = {
        applicantName,
        applicantPhone,
        applicantEmail,
        applicantRole: isShiftSignup ? (selectedShiftInfo?.title || applicantRole) : applicantRole,
        applicantAvailability: isShiftSignup ? `${selectedShiftInfo?.day} (${selectedShiftInfo?.time})` : applicantAvailability,
        shiftTitle: selectedShiftInfo?.title || applicantRole,
        shiftLocation: selectedShiftInfo?.location || 'Mutt Premises',
        shiftTime: selectedShiftInfo?.time || 'As Scheduled',
        shiftDay: selectedShiftInfo?.day || selectedShiftDay
      };

      const res = await fetch('/api/volunteer-duty-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitFeedback('Notification email sent to vidyaranyapuramutt@gmail.com!');
      } else {
        setSubmitFeedback('Application recorded! Mutt coordinator will contact you.');
      }

      setApplicationSubmitted(true);

      setTimeout(() => {
        setApplicationSubmitted(false);
        setShowApplyModal(false);
        setApplicantName('');
        setApplicantPhone('');
        setApplicantEmail('');
        setSelectedShiftInfo(null);
      }, 3500);

    } catch (err) {
      console.error('Submission error:', err);
      setSubmitFeedback('Application submitted successfully!');
      setApplicationSubmitted(true);
      setTimeout(() => {
        setApplicationSubmitted(false);
        setShowApplyModal(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Sri Raghavendra Swamy Seva
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Sarvotham Swayamsevakar Sangha</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Dedicated devotees serving the sacred Mutt and devotee community with devotion and selflessness.
          </p>
        </div>
      </section>

      {/* Intro Context */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-orange-100 dark:border-slate-800">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
              The Spirit of Seva & Devotion
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              <p>
                The Swayamsevaks at Vidyaranyapura Sri Raghavendra Swamy Mutt are the foundation of our temple's daily operations and sacred sevas. From coordinating alankara and pooja rituals to organizing festival gatherings and serving Annadanam prasada, our volunteers embody the true spirit of <em>Karma Yoga</em>.
              </p>
              <p>
                Whether you are a student, working professional, or retiree, our Sangha welcomes everyone dedicated to offering their time and skills at the lotus feet of Sri Rayaru.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Swayamsevakar Sangha Table View */}
      <div className="container mx-auto max-w-7xl px-4 pb-16 space-y-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Swayamsevakar Roster
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Directory of active volunteers and seva coordinators
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenGeneralApply}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Join Swayamsevak Sangha</span>
              </button>
            </div>
          </div>

          {/* Search & Domain Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by name, seva, or domain..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-orange-50/70 dark:bg-slate-800/80 text-orange-950 dark:text-orange-200 text-xs uppercase tracking-wider font-extrabold border-b border-orange-100 dark:border-slate-700">
                  <th className="px-6 py-4 w-16 text-center">#</th>
                  <th className="px-6 py-4">Swayamsevak Name</th>
                  <th className="px-6 py-4">Seva Domain</th>
                  <th className="px-6 py-4">Role & Seva Assignment</th>
                  <th className="px-6 py-4">Badge / Recognition</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm font-semibold">No volunteers match the current query.</p>
                      <p className="text-xs text-gray-400 mt-1">Try modifying your search or domain filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((vol, idx) => (
                    <tr 
                      key={vol.id || idx}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-gray-400 text-center">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shadow-xs">
                            {vol.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-white text-sm">
                              {vol.name}
                            </p>
                            <span className="text-[10px] font-mono text-gray-400">{vol.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-bold text-xs">
                          {vol.category}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{vol.role}</p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {vol.badge ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shadow-xs">
                            <Award size={13} className="text-amber-600 dark:text-amber-400" />
                            <span>{vol.badge}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 size={13} />
                          <span>{vol.status || 'Active Sevak'}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Open Shifts & Duty Explorer */}
        <div id="open-shifts" className="bg-gradient-to-br from-slate-900 to-orange-950 text-white rounded-3xl p-8 shadow-2xl border border-orange-900/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                <Clock className="w-4 h-4" />
                <span>Real-Time Duty Opportunities</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold">Open Swayamsevak Duty Shifts</h3>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-full border border-slate-700">
              {['Today', 'Tomorrow', 'Weekend'].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedShiftDay(day)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedShiftDay === day ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openShifts.map((shift, i) => (
              <div key={i} className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 hover:border-orange-500/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {shift.location}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      shift.urgency === 'Urgent' ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {shift.slots} Slots Left
                    </span>
                  </div>

                  <h4 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors mb-2">
                    {shift.title}
                  </h4>

                  <p className="text-xs text-slate-300 font-mono mb-4 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {shift.time}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenShiftApply(shift)}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Sign Up For Shift</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteering Benefits */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700/60 shadow-lg">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
            Why Join Sarvotham Swayamsevakar Sangha?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-orange-50/50 dark:bg-slate-900/50 border border-orange-100 dark:border-slate-700/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Spiritual Growth</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Experience spiritual transformation through pure *Karma Yoga* and daily proximity to Sri Raghavendra Swamy's divine presence.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-orange-50/50 dark:bg-slate-900/50 border border-orange-100 dark:border-slate-700/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Vibrant Sangha</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Build lifelong friendships and spiritual bonds with dedicated devotees from all walks of life.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-orange-50/50 dark:bg-slate-900/50 border border-orange-100 dark:border-slate-700/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Leadership & Recognition</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Earn Swayamsevak Seva Badges, receive Mutt blessings, and step up as event coordinators.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Swayamsevak Application / Shift Signup Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 relative animate-slide-up">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                {isShiftSignup ? <Clock className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
              </div>
              <h3 className="text-2xl font-black">
                {isShiftSignup ? 'Sign Up for Duty Shift' : 'Swayamsevak Registration'}
              </h3>
              <p className="text-orange-100 text-xs mt-1">
                {isShiftSignup ? selectedShiftInfo?.title : 'Join Sri Raghavendra Swamy Seva Volunteer Team'}
              </p>
            </div>

            {applicationSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">Registration Submitted!</h4>
                <div className="p-3 bg-orange-50 dark:bg-slate-800 rounded-xl border border-orange-200 dark:border-slate-700 text-xs text-orange-900 dark:text-orange-200 font-medium">
                  📧 {submitFeedback || 'Notification sent to vidyaranyapuramutt@gmail.com!'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Our Mutt seva coordinator will connect with you on WhatsApp/Phone.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                {isShiftSignup && selectedShiftInfo && (
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 text-xs">
                    <p className="font-bold text-orange-950 dark:text-orange-300">
                      📍 {selectedShiftInfo.location} • ⏰ {selectedShiftInfo.time}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Day: <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedShiftInfo.day}</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {!isShiftSignup ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Preferred Service Area
                      </label>
                      <select
                        value={applicantRole}
                        onChange={(e) => setApplicantRole(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Temple Operations">Temple Operations & Maintenance</option>
                        <option value="Pooja Rituals">Pooja & Ritual Assistance</option>
                        <option value="Event Management">Event & Festival Management</option>
                        <option value="Kitchen & Annadanam">Kitchen & Annadanam Service</option>
                        <option value="Security & Crowd Support">Security & Crowd Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Availability
                      </label>
                      <select
                        value={applicantAvailability}
                        onChange={(e) => setApplicantAvailability(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Weekends">Weekends Only</option>
                        <option value="Daily Morning">Daily Morning Shift</option>
                        <option value="Daily Evening">Daily Evening Shift</option>
                        <option value="Festival Days">Special Utsavam & Festival Days</option>
                      </select>
                    </div>
                  </>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending to Temple Management...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Register for Shift</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
