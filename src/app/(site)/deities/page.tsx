'use client';

import { useState } from 'react';
import { Calendar, Clock, Award, Star, BookOpen, Sun, Moon } from 'lucide-react';

type TabType = 'raghavendra' | 'other' | 'schedule' | 'festivals';

export default function Deities() {
  const [activeTab, setActiveTab] = useState<TabType>('raghavendra');

  const tabs = [
    { id: 'raghavendra' as const, name: 'Sri Raghavendra Swami', icon: Star },
    { id: 'other' as const, name: 'Other Deities', icon: Award },
    { id: 'schedule' as const, name: 'Daily Schedule', icon: Clock },
    { id: 'festivals' as const, name: 'Special Poojas & Festivals', icon: Calendar },
  ];

  const otherDeities = [
    {
      name: "Lord Hanuman",
      desc: "The devoted servant of Lord Rama, symbol of strength, humility, and infinite devotion.",
      gradient: "from-orange-500/20 to-amber-500/10",
      border: "border-orange-500/30",
      iconColor: "text-orange-500",
    },
    {
      name: "Lord Venkateshwara",
      desc: "The supreme form of Lord Vishnu worshipped at Tirumala, bestower of abundance and boons.",
      gradient: "from-blue-500/20 to-indigo-500/10",
      border: "border-blue-500/30",
      iconColor: "text-blue-500",
    },
    {
      name: "Goddess Lakshmi",
      desc: "Goddess of wealth, fortune, beauty, and prosperity, the eternal consort of Lord Vishnu.",
      gradient: "from-pink-500/20 to-rose-500/10",
      border: "border-pink-500/30",
      iconColor: "text-pink-500",
    },
    {
      name: "Lord Ganesha",
      desc: "The remover of obstacles, patron of arts and sciences, and the lord of wisdom and beginnings.",
      gradient: "from-red-500/20 to-orange-500/10",
      border: "border-red-500/30",
      iconColor: "text-red-500",
    },
    {
      name: "Lord Shiva",
      desc: "The destroyer of evil and transformer, the supreme yogi representing pure consciousness.",
      gradient: "from-cyan-500/20 to-blue-500/10",
      border: "border-cyan-500/30",
      iconColor: "text-cyan-500",
    },
    {
      name: "Navagrahas",
      desc: "Nine celestial bodies and planetary deities that guide human destiny and karma.",
      gradient: "from-purple-500/20 to-indigo-500/10",
      border: "border-purple-500/30",
      iconColor: "text-purple-500",
    }
  ];

  const schedule = [
    { time: "5:30 AM", title: "Suprabhata Seva", desc: "Morning awakening ceremony and prayers to start the day.", icon: Sun },
    { time: "7:00 AM", title: "Abhisheka", desc: "Sacred bathing ceremony of the deities with milk, honey, and water.", icon: BookOpen },
    { time: "8:00 AM", title: "Archana", desc: "Flower offerings and chanting of sacred names for devotees' wellbeing.", icon: Star },
    { time: "12:00 PM", title: "Madhyahna Pooja", desc: "Main afternoon worship ceremony followed by Maha Mangalarathi.", icon: Sun },
    { time: "6:00 PM", title: "Deeparadhana", desc: "Evening lamp worship filling the mutt with divine light.", icon: Moon },
    { time: "8:00 PM", title: "Ratri Pooja", desc: "Night worship ceremony and prayers before the deities retire.", icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-20 overflow-hidden shadow-lg">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#fff_0,transparent_60%)] pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-orange-50 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Divine Atmosphere
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-md">Divine Presences</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-2xl mx-auto font-medium">
            Explore the deities, daily timings, and holy celebrations at Mathaji Ulsooramma Raghavendra Swamy Mutt.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Custom Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 text-sm md:text-base border shadow-sm ${
                    isActive
                      ? 'bg-orange-600 border-orange-600 text-white shadow-orange-500/20 scale-105'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-700 hover:border-orange-200'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'animate-pulse' : 'text-gray-400 dark:text-gray-500'} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Content */}
          <div className="transition-all duration-300">
            
            {/* 1. Sri Raghavendra Swami */}
            {activeTab === 'raghavendra' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-slate-700/50 shadow-xl animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  
                  {/* Styled Image Card Container */}
                  <div className="lg:col-span-5 relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-3xl transform rotate-2 scale-102 opacity-40 blur-xl group-hover:rotate-3 transition-transform duration-300"></div>
                    <div className="relative aspect-square bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 rounded-3xl flex items-center justify-center p-8 border border-white/20 shadow-2xl overflow-hidden">
                      {/* Decorative elements representing shrine */}
                      <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none" />
                      <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl" />
                      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-orange-600/20 rounded-full blur-2xl" />
                      
                      <div className="text-center z-10">
                        <span className="text-6xl md:text-8xl drop-shadow-lg block mb-4">🙏</span>
                        <h4 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-md">Guru Raghavendra</h4>
                        <p className="text-orange-100 text-sm mt-1 uppercase tracking-widest font-semibold">Moola Brindavana</p>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-block px-3.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                      Supreme Saint of Mantralaya
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                      Sri Raghavendra Swami
                    </h2>
                    <div className="space-y-4 text-base md:text-lg text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                      <p>
                        Sri Raghavendra Swami, also affectionately known as <span className="font-semibold text-orange-600 dark:text-orange-400">Rayaru</span>, was a prominent 17th-century Hindu saint, scholar, and theologian. He is venerated as the messenger of Dvaita Vedanta philosophy and is believed to be the incarnation of Prahlada.
                      </p>
                      <p>
                        Born in 1595 CE in Tamil Nadu, he made immense contributions to Sanskrit literature and commentary. Devotees across the globe experience his benevolence and divine guidance, centered around the main Brindavana at Mantralayam.
                      </p>
                      <p>
                        Our Mutt in Vidyaranyapura serves as a sacred sanctum of Rayaru, carrying forward his message of devotion, humility, and selfless service. Devotees visit daily to seek spiritual peace and blessings.
                      </p>
                    </div>
                    
                    {/* Key Attributes Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                      <div className="bg-orange-50/55 dark:bg-slate-700/30 p-4 rounded-2xl">
                        <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider font-bold mb-1">Mantra</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Sri Raghavendraya Namaha</p>
                      </div>
                      <div className="bg-amber-50/55 dark:bg-slate-700/30 p-4 rounded-2xl">
                        <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold mb-1">Guru Lineage</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Madhvacharya Parampara</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Other Deities */}
            {activeTab === 'other' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {otherDeities.map((deity, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col justify-between group overflow-hidden relative"
                  >
                    {/* Visual Card Accent Background */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br ${deity.gradient} opacity-40 group-hover:scale-110 transition-transform duration-300 pointer-events-none`} />
                    
                    <div>
                      {/* Custom Icon Circle */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${deity.gradient} ${deity.border} border flex items-center justify-center mb-6`}>
                        <span className="text-2xl">🕉️</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {deity.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                        {deity.desc}
                      </p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-gray-50 dark:border-slate-700/40 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400 tracking-wider">
                      <span>DEVOTION & WORSHIP</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Daily Schedule Timeline */}
            {activeTab === 'schedule' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-slate-700/50 shadow-xl animate-fade-in">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Daily Rituals and Puja Timings</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-2">Devotees are welcome to participate and receive the sacred blessings during these hours.</p>
                </div>
                
                {/* Vertical Timeline stepper */}
                <div className="relative max-w-3xl mx-auto pl-4 sm:pl-8 py-4">
                  {/* Vertical line connector */}
                  <div className="absolute left-7 sm:left-11 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 via-amber-500 to-orange-600 rounded-full opacity-30" />
                  
                  <div className="space-y-8">
                    {schedule.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="relative flex gap-6 sm:gap-10 items-start group">
                          {/* Stepper Node */}
                          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-600 border-4 border-orange-100 dark:border-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0">
                            <Icon size={14} />
                          </div>
                          
                          {/* Timeline Card */}
                          <div className="flex-1 bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/40 shadow-sm hover:shadow-md transition-shadow group-hover:-translate-x-1 duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {item.title}
                              </h4>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 shrink-0 uppercase tracking-wider">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Special Poojas and Festivals */}
            {activeTab === 'festivals' && (
              <div className="space-y-8 animate-fade-in">
                {/* Intro block */}
                <div className="bg-orange-600 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15)_0,transparent_60%)] pointer-events-none" />
                  <div className="max-w-2xl">
                    <h3 className="text-3xl font-extrabold mb-4">Auspicious Occasions</h3>
                    <p className="text-orange-100 text-base md:text-lg leading-relaxed font-normal">
                      We celebrate major Hindu festivals and monthly special lunar days with absolute spiritual fervor and traditional rites. Learn more about monthly events and annual festivals.
                    </p>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Card 1: Monthly Pujas */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-orange-600" />
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
                      Monthly Celebrations
                    </h4>
                    <ul className="space-y-4">
                      {[
                        { day: "Ekadashi", desc: "Special prayers, reading of sacred scriptures, and fasting rituals." },
                        { day: "Poornima", desc: "Grand Satyanarayana Pooja and special evening deepotsava." },
                        { day: "Amavasya", desc: "Ancestral prayers and special tarpanam services." },
                        { day: "Sankashti Chaturthi", desc: "Evening Ganapathi Abhisheka and modak offerings." },
                        { day: "Pradosha Pooja", desc: "Evening Shiva worship ceremonies." }
                      ].map((item, i) => (
                        <li key={i} className="flex gap-4 items-start pb-4 border-b border-gray-50 dark:border-slate-700/40 last:border-b-0 last:pb-0">
                          <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                          <div>
                            <strong className="text-gray-800 dark:text-white text-base font-semibold">{item.day}</strong>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card 2: Annual Celebrations */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Annual Festivals
                    </h4>
                    <ul className="space-y-4">
                      {[
                        { festival: "Sri Raghavendra Aradhana Mahotsava", desc: "Three-day grand celebration of Rayaru's entry into Brindavana." },
                        { festival: "Sri Ramanavami", desc: "Special pooja for Lord Rama with Panaka and Kosambari prasada distribution." },
                        { festival: "Sri Krishna Janmashtami", desc: "Midnight prayers, baby Krishna cradle ceremony, and sports." },
                        { festival: "Ganesh Chaturthi", desc: "Pratishthapana of Clay Ganesha, daily modular poojas, and Visarjan." },
                        { festival: "Deepavali", desc: "Special Lakshmi Kubera Pooja and mutt lightings." }
                      ].map((item, i) => (
                        <li key={i} className="flex gap-4 items-start pb-4 border-b border-gray-50 dark:border-slate-700/40 last:border-b-0 last:pb-0">
                          <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                          <div>
                            <strong className="text-gray-800 dark:text-white text-base font-semibold">{item.festival}</strong>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
