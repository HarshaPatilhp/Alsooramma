'use client';

import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Sri Raghavendra Swamy Aradhana Mahotsava",
      date: "August (Sravana Masa)",
      time: "6:00 AM - 9:30 PM",
      category: "Festival",
      description: "Annual grand celebration of Sri Raghavendra Swamy Aradhana featuring continuous Panchamrutha Abhisheka, Rathotsava procession, Haridasa sangeetha, and Maha Annadanam.",
      location: "Main Temple Sanctum & Grounds",
      highlights: ["Panchamrutha Abhisheka", "Grand Rathotsava", "Bhajana & Dasara Padagalu", "Maha Annadanam Prasadam"],
      registration: true
    },
    {
      id: 2,
      title: "Sri Ramanavami Mahotsava",
      date: "Chaitra Masa",
      time: "5:30 AM - 8:30 PM",
      category: "Festival",
      description: "Celebration of Lord Sri Rama's birth with Sita Rama Kalyana Utsava, special alankaras, and Panaka/Kosambari prasada distribution.",
      location: "Temple Premises",
      highlights: ["Sita Rama Kalyana", "Vishesha Alankara", "Bhajana Sandhya", "Panaka Prasada"],
      registration: false
    },
    {
      id: 3,
      title: "Sri Krishna Janmashtami & Gokulashtami",
      date: "Bhadrapada Masa",
      time: "6:00 AM - 10:00 PM",
      category: "Festival",
      description: "Midnight aradhana, special butter alankara for Lord Krishna, and devotional stotra chanting.",
      location: "Sanctum Sanctorum",
      highlights: ["Navaneeta Alankara", "Midnight Mangalarathi", "Stotra Parayana", "Prasadam"],
      registration: false
    },
    {
      id: 4,
      title: "Weekly Thursday Bhajana Sandhya",
      date: "Every Thursday",
      time: "6:30 PM - 8:30 PM",
      category: "Weekly Seva",
      description: "Sri Sushameendra Bhajana Mandali presents soulful Dasara Padagalu in praise of Sri Hari, Vayu, and Rayaru.",
      location: "Pravachana Hall",
      highlights: ["Haridasa Sahitya", "Harmonium & Mridanga", "Community Singing", "Mangalarathi"],
      registration: false
    },
    {
      id: 5,
      title: "Vedic Grantha Pravachana Series",
      date: "Monthly Weekends",
      time: "10:00 AM - 12:00 PM",
      category: "Education",
      description: "Enlightening discourses by learned scholars on Bhagavad Gita, Upanishads, and teachings of Sri Madhvacharya.",
      location: "Temple Auditorium",
      highlights: ["Scripture Study", "Q&A Session", "Sanskrit Chanting", "Devotee Gathering"],
      registration: true
    },
    {
      id: 6,
      title: "Maha Annadanam Seva Camp",
      date: "Every Sunday",
      time: "12:00 PM - 3:00 PM",
      category: "Charity",
      description: "Special weekend community Annadanam serving hot Tirtha Prasada meals to hundreds of visiting devotees.",
      location: "Mutt Bhojanashala",
      highlights: ["Fresh Prasadam", "Swayamsevak Seva", "Devotee Hospitality", "Charity"],
      registration: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Festival: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
      'Weekly Seva': 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
      Education: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
      Charity: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
    };
    return colors[category] || 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Temple Calendar
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Upcoming Events & Utsavams</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Join us in celebrating faith, sacred festivals, and spiritual programs at our Mutt
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-16 space-y-12">
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="p-7">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  {event.registration && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 size={12} /> Seva Open
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-5 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Highlights */}
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 mb-2.5">
                    Highlights:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.highlights.map((highlight, index) => (
                      <span 
                        key={index} 
                        className="bg-orange-50 dark:bg-slate-800 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-xl text-xs font-semibold border border-orange-100 dark:border-slate-700"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                <a
                  href="/seva-list"
                  className="flex-1 text-center bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Book Seva Online
                </a>
                <a
                  href="/contact"
                  className="text-center bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Contact Office
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
