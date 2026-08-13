'use client';

import VolunteerCard from '@/components/VolunteerCard';
import { useRouter } from 'next/navigation';

export default function Volunteers() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Sarvotham Swayamsevakar Sangha</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Dedicated devotees serving the temple and community
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Main Section */}
          <div className="bg-orange-50 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Volunteers
            </h2>

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                The volunteers at Vidyaranyapura Sri Raghavendra Swamy Mutt are the backbone of our temple's
                daily operations and community services. These dedicated devotees contribute their time, skills,
                and energy to ensure that the temple functions smoothly and serves the community effectively.
                From maintaining the temple premises to organizing events and helping with various activities,
                our volunteers play a crucial role in preserving our spiritual heritage and traditions.
              </p>

              <p>
                Our volunteers come from diverse backgrounds and professions, united by their devotion to
                Sri Raghavendra Swami and their commitment to serving the community. Their selfless service
                reflects the true spirit of Karma Yoga and devotion, inspiring others to follow the path
                of righteousness and service.
              </p>

              <p>
                We are always grateful for the time and effort our volunteers put into making our temple
                a vibrant center of spiritual and cultural activities. Their dedication ensures that the
                teachings and traditions of our Gurus are preserved and passed on to future generations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-16">
        
        {/* Category Filter Tabs */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Meet Our Swayamsevaks
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Filtering by service domain and active volunteer coordinators
              </p>
            </div>

            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider bg-orange-100 dark:bg-orange-950/50 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/40 w-fit">
              {filteredVolunteers.length} Volunteers Available
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shadow-xs ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20 scale-105'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Volunteer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredVolunteers.map((vol, idx) => (
              <VolunteerCard
                key={idx}
                name={vol.name}
                role={vol.role}
                description={vol.description}
                imageSrc={vol.imageSrc}
                alt={vol.alt}
                phone={vol.phone}
                instagram={vol.instagram}
                linkedin={vol.linkedin}
                category={vol.category}
                skills={vol.skills}
                status={vol.status}
                shiftsServed={vol.shiftsServed}
              />
            ))}
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
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
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
                  onClick={() => {
                    setApplicantRole(shift.title);
                    setShowApplyModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
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

      {/* Swayamsevak Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 relative animate-slide-up">
            <button 
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black">Swayamsevak Registration</h3>
              <p className="text-orange-100 text-xs mt-1">Join Sri Raghavendra Swamy Seva Volunteer Team</p>
            </div>

            {applicationSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">Registration Submitted!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Thank you for stepping forward! Our Mutt volunteer coordinator will reach out to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
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

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
