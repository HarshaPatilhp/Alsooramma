'use client';

import { useState } from 'react';
import { Play, Eye, Clock, Film, Sparkles } from 'lucide-react';

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Videos', count: 6 },
    { id: 'festivals', name: 'Festivals & Utsavam', count: 2 },
    { id: 'discourses', name: 'Pravachana', count: 2 },
    { id: 'sevas', name: 'Daily Sevas & Bhajans', count: 2 }
  ];

  const videos = [
    {
      id: 1,
      title: 'Sri Raghavendra Swamy Aradhana Mahotsava & Rathotsava',
      category: 'festivals',
      duration: '45:32',
      views: '4.8K',
      date: 'Aug 2024',
      description: 'Grand festive celebrations with special Panchamrutha Abhisheka, Rathotsava procession, and bhajans.',
    },
    {
      id: 2,
      title: 'Significance of Sri Raghavendra Stotra & Mangalashtaka',
      category: 'discourses',
      duration: '52:18',
      views: '3.2K',
      date: 'Jul 2024',
      description: 'Enlightening discourse on the sacred power and meaning behind Sri Raghavendra Stotra chanting.',
    },
    {
      id: 3,
      title: 'Morning Suprabhata Seva & Nirmalya Visarjana',
      category: 'sevas',
      duration: '28:45',
      views: '5.1K',
      date: 'Daily Archive',
      description: 'Serene morning Suprabhata chanting and Nirmalya Visarjana rituals inside the Sanctum.',
    },
    {
      id: 4,
      title: 'Sri Sushameendra Bhajana Mandali - Dasara Padagalu',
      category: 'sevas',
      duration: '38:21',
      views: '3.8K',
      date: 'Weekly',
      description: 'Soulful live rendition of Sri Purandara Dasara Padagalu by our Bhajana Mandali members.',
    },
    {
      id: 5,
      title: 'Sita Rama Kalyana Utsava Celebrations',
      category: 'festivals',
      duration: '42:15',
      views: '2.9K',
      date: 'Apr 2024',
      description: 'Divine Sita Rama Kalyana ceremony and special flower alankara at our Mutt.',
    },
    {
      id: 6,
      title: 'Pravachana on Dvaita Philosophy & Bhakti Marga',
      category: 'discourses',
      duration: '58:40',
      views: '2.4K',
      date: 'May 2024',
      description: 'Scholarly insights on the eternal relevance of Dvaita Vedanta for modern daily living.',
    }
  ];

  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(video => video.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Mutt Video Archives
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Video Gallery & Discourses</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Experience sacred moments, pravachanas, bhajans, and festival celebrations through our curated video archive
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-10">
        {/* Category Filter */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20 scale-105'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
                }`}
              >
                {category.name} ({category.count})
              </button>
            );
          })}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col group hover:-translate-y-1"
            >
              {/* Video Thumbnail Container */}
              <div className="aspect-video bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden flex items-center justify-center cursor-pointer">
                <div className="text-center p-4">
                  <Film className="w-12 h-12 text-orange-400 dark:text-orange-500/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Devotional Recording</p>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                  {video.duration}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40">
                      {video.category}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{video.date}</span>
                  </div>

                  <h3 className="font-black text-gray-900 dark:text-white text-base leading-snug mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed line-clamp-2 mb-4">
                    {video.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Eye size={13} /> {video.views} Views
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold font-sans text-xs">
                    Watch Darshan →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
