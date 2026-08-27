export default function ParayanaSamithi() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Veda & Grantha Parayana
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Sri Sushameendra Parayana Samithi</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Spiritual study, Stotra recitation, and chanting of sacred Vedic scriptures dedicated to Sri Hari, Vayu, and Rayaru
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-10">
        {/* Main Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-gray-100 dark:border-slate-800">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">
            Sri Sushameendra Parayana Samithi
          </h2>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>
              The Parayana Samithi of Vidyaranyapura Sri Raghavendra Swamy Mutt is a devoted group of sadhakas engaged in the regular and occasion-based recitation of sacred granthas, stotras, and scriptures in praise of Sri Hari, Vayu, Gurugalu, and Dasavarenyaru. With deep shraddha and discipline, the Samithi regularly performs collective Parayana on Thursday mornings and on all important religious events in the Mutt.
            </p>

            <div className="p-6 rounded-2xl bg-orange-50 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 text-center space-y-3">
              <p className="font-serif font-black text-lg sm:text-xl text-orange-950 dark:text-amber-300">
                सत्यं वद । धर्मं चर । स्वाध्यायान्मा प्रमदः ॥
              </p>
              <p className="text-xs sm:text-sm font-mono text-orange-800 dark:text-orange-400">
                [Satyaṁ vada. Dharmaṁ cara. Svādhyāyān mā pramadaḥ]
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 italic pt-2">
                "Speak the truth. Walk the path of righteousness. Do not neglect the daily recitation and study of sacred texts." — Taittiriya Upanishad
              </p>
            </div>

            <p>
              Parayana is both Vedic command and devotional adornment — a daily offering at the feet of Hari, Vayu, and Gurugalu.
            </p>
          </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Weekly Parayana Sessions</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                Collective chanting of Sri Raghavendra Stotra, Sri Hari Vayu Stuti, and Venkatesha Stotra.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Recitation Programs</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                Occasion-based recitation of Vishnu Sahasranama and Bhagavata Purana during sacred festivals.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-green-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Spiritual Pravachanas</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                Monthly discourses and insights on Dvaita granthas by learned Vidwans and scholars.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Sanskrit & Stotra Learning</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                Guidance on correct Sanskrit pronunciation, meter, and meaning for seekers of all age groups.
              </p>
            </div>
          </div>
        </div>

        {/* Study Materials Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-8 border border-gray-100 dark:border-slate-800">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">
            Sacred Texts for Parayana
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-orange-50/70 dark:bg-slate-800/70 p-5 rounded-2xl border border-orange-100 dark:border-slate-700">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 text-sm mb-2">Vedic Stotras</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Sri Raghavendra Stotra</li>
                <li>• Sri Hari Vayu Stuti</li>
                <li>• Sri Venkatesha Stotra</li>
                <li>• Vishnu Sahasranama</li>
              </ul>
            </div>

            <div className="bg-orange-50/70 dark:bg-slate-800/70 p-5 rounded-2xl border border-orange-100 dark:border-slate-700">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 text-sm mb-2">Dvaita Granthas</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Sri Madhva Vijaya</li>
                <li>• Gita Tatparya Nirnaya</li>
                <li>• Bhagavata Tatparya</li>
                <li>• Sarvamoola Granthas</li>
              </ul>
            </div>

            <div className="bg-orange-50/70 dark:bg-slate-800/70 p-5 rounded-2xl border border-orange-100 dark:border-slate-700">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 text-sm mb-2">Works of Rayaru</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Gita Vivruti</li>
                <li>• Pramana Paddhati Teeka</li>
                <li>• Chandogya Mantraartha</li>
                <li>• Nyaya Sudha Parimala</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Membership Section */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-black mb-3">Join Sri Sushameendra Parayana Samithi</h3>
          <p className="text-orange-100 text-sm max-w-xl mx-auto mb-6">
            If you wish to deepen your spiritual practice through daily chanting and scriptural study, we welcome you to join our Parayana group!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/contact"
              className="bg-white text-orange-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-md"
            >
              Contact Office
            </a>
            <a 
              href="/slokas"
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Read Sacred Slokas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
