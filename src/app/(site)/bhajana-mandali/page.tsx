export default function BhajanaMandali() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Haridasa Sahitya & Sangeetha
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Sri Sushameendra Bhajana Mandali</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Devotional singing, Dasara Padagalu, and spiritual gatherings at our temple
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Sri Sushameendra Bhajana Mandali Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-gray-100 dark:border-slate-800">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">
              Sri Sushameendra Bhajana Mandali
            </h2>
            
            <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              <p>
                Sri Sushameendra Bhajana Mandali was formed in the year 2014 with the divine blessings of Sri Sri 1008 
                Sushameendra Teertha Swamiji of Sri Uttaradi Mutt. The Bhajana Mandali is a group of dedicated devotees 
                who assemble to sing devotional songs and bhajans in praise of Lord Sri Hari, Sri Vayu, and Sri Guru Raghavendra Swamy.
              </p>

              <p>
                Apart from conducting bhajans on all important functions and festivals, the members of the Bhajana Mandali 
                regularly perform Dasara Padagalu at our Mutt premises every Thursday evening.
              </p>

              <p>
                The Bhajana Mandali participates in religious and cultural events across Bengaluru and other sacred institutions, 
                representing the Mutt in devotional music assemblies and competitions.
              </p>

              <p>
                Members pursue learning under reputed musical and cultural institutions, guided by seasoned musicians and spiritual 
                teachers who provide continuous training.
              </p>
            </div>
          </div>

          {/* Quote Section */}
          <div className="bg-orange-50 dark:bg-slate-900/80 rounded-3xl shadow-sm p-8 border border-orange-100 dark:border-slate-800 text-center">
            <h3 className="text-2xl font-extrabold text-orange-950 dark:text-amber-300 mb-3">
              "Nāma Saṅkīrtanam"
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 italic mb-4 max-w-2xl mx-auto leading-relaxed">
              "The chanting of the holy names of the Lord is the most effective means of spiritual 
              realization in this age of Kali. It purifies the mind and awakens supreme devotion."
            </p>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              — Inspired by the teachings of Sri Sushameendra Teertha Swamiji
            </p>
          </div>

          {/* Activities Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-8 border border-gray-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center">
              Our Regular Activities
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Weekly Thursday Bhajans</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Regular devotional singing sessions every Thursday evening at the Mutt premises.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Festival Utsavams</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Special devotional concerts and programs during Rayaru Aradhana and major festivals.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                <div className="w-14 h-14 bg-gradient-to-tr from-green-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Dasara Sahitya Training</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Guidance and learning for young devotees in classical Haridasa compositions.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Community Outreach</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Spreading devotional music, bhajana sandhya, and sacred chanting in the community.
                </p>
              </div>
            </div>
          </div>

          {/* Join Us Section */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-black mb-3">Join Our Bhajana Mandali</h3>
            <p className="text-orange-100 text-sm max-w-xl mx-auto mb-6">
              If you have a passion for devotional music and wish to offer your sangeetha seva at the lotus feet of Sri Rayaru, we warmly welcome you!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/contact"
                className="bg-white text-orange-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-md"
              >
                Contact Mandali
              </a>
              <a 
                href="/volunteers"
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Join as Volunteer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
