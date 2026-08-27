'use client';

import { useState } from 'react';
import { Newspaper, Calendar, Clock, ArrowRight, Bell, Sparkles } from 'lucide-react';

export default function LatestNews() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const news = [
    {
      id: 1,
      title: "Annual Rayaru Aradhana Mahotsava Celebrations",
      date: "August 2024",
      category: "Festival",
      excerpt: "The grand Aradhana Mahotsava concluded with overwhelming participation from devotees across the city with daily Rathotsava and Annadanam.",
      content: "The annual Aradhana Mahotsava of Sri Raghavendra Swami was celebrated with great devotion. Thousands of devotees participated in the three-day event featuring special poojas, spiritual discourses, and cultural programs.",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "Daily Maha Annadanam & Seva Kitchen Expansion",
      date: "Recent Update",
      category: "Charity",
      excerpt: "Temple kitchen expands sacred Prasada and Annadanam capacity to serve nutritious meals to all visiting devotees.",
      content: "In a continuous effort to serve visiting devotees and community members, the Mutt provides fresh Tirtha Prasada daily, upholding the revered tradition of Annadana that is sacred to Sri Raghavendra Swamy.",
      readTime: "2 min read"
    },
    {
      id: 3,
      title: "Youth Sanskrit & Stotra Chanting Classes",
      date: "Ongoing",
      category: "Education",
      excerpt: "Weekly classes on Sri Raghavendra Stotra, Vishnu Sahasranama, and Bhagavad Gita for children and youth.",
      content: "A spiritual learning initiative organized by the Mutt to teach children Vedic chanting, Stotras, and ethical values in a peaceful temple environment.",
      readTime: "3 min read"
    },
    {
      id: 4,
      title: "Thursday Bhajana Mandali Dasara Padagalu Sessions",
      date: "Weekly",
      category: "Community",
      excerpt: "Sri Sushameendra Bhajana Mandali performs soulful Haridasa devotional compositions every Thursday.",
      content: "Devotees gather every Thursday evening after Maha Mangalarathi to sing divine compositions of Sri Purandara Dasaru, Sri Kanaka Dasaru, and Sri Vijayadasaru.",
      readTime: "2 min read"
    },
    {
      id: 5,
      title: "Historical Photo Archives Digitized on Temple Website",
      date: "New Feature",
      category: "Heritage",
      excerpt: "Rare 1970s and 1980s photographs with revered Swamijis and Mathaji Ulsooramma now available online.",
      content: "The Mutt has preserved and digitized historic moments from 1976 onwards, highlighting the foundational journey and blessings from revered peetadhipathis.",
      readTime: "3 min read"
    },
    {
      id: 6,
      title: "Free Healthcare & Eye Checkup Camp",
      date: "Community Seva",
      category: "Health",
      excerpt: "Monthly healthcare camp organized in association with doctors for senior citizens and local residents.",
      content: "Free general health consultations and medicine distribution organized on temple premises as part of social welfare seva.",
      readTime: "2 min read"
    }
  ];

  const categories = ['All', 'Festival', 'Charity', 'Education', 'Heritage', 'Community', 'Health'];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Festival: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
      Charity: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40',
      Education: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
      Heritage: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
      Health: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/40',
      Community: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
    };
    return colors[category] || 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200';
  };

  const filteredNews = selectedCategory === 'All' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Mutt Announcements
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Latest News & Updates</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Stay connected with the latest developments, festival schedules, and community initiatives
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-12">
        {/* Category Filter */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20 scale-105'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Featured News Card */}
        {news.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-800">
            <div className="md:flex">
              <div className="md:w-5/12 bg-gradient-to-br from-orange-500 to-amber-600 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider mb-4 backdrop-blur-md">
                    Featured Announcement
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black leading-snug mb-3">
                    {news[0].title}
                  </h3>
                  <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
                    {news[0].excerpt}
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-4 text-xs text-orange-200 font-medium mt-6 pt-4 border-t border-white/20">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {news[0].date}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {news[0].readTime}</span>
                </div>
              </div>

              <div className="md:w-7/12 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(news[0].category)}`}>
                      {news[0].category}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About this Event</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                    {news[0].content}
                  </p>
                </div>
                <a
                  href="/upcoming-events"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all w-fit shadow-md"
                >
                  <span>View All Upcoming Events</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <article 
              key={item.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col hover:-translate-y-1"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">{item.date}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-4 line-clamp-3">
                  {item.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                    <Clock size={12} /> {item.readTime}
                  </span>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    Mathaji Mutt
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
