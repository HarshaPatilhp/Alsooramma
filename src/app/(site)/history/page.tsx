export default function History() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Heritage & Lineage
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Our History & Sacred Heritage</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Discover the rich spiritual heritage, Dvaita tradition, and divine founding legacy of our Mutt
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">Our Spiritual Heritage</h2>
            <div className="space-y-5 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              <p>
                The Mutt is an integral center of the revered Raghavendra Math tradition, rooted in the timeless philosophy of Jagadguru Sri Madhvacharya.
                The Vidyaranyapura branch is blessed with the holy devotion of <strong>Sri Mathaji Ulsooramma</strong>, carrying forward the divine grace of Sri Raghavendra Swamy.
              </p>
              <p>
                Sri Raghavendra Swamy (1595–1671 CE), revered across the world as Rayaru, took Moola Brindavana Pravesha in Mantralaya on the sacred banks of the Tungabhadra River. His boundless compassion and miracles continue to bless and guide millions of devotees today.
              </p>
              <p>
                Our Mutt in Vidyaranyapura continues this noble tradition, serving as a beacon of devotion, daily Vedic rituals, Annadanam, and community welfare, upholding sacred values passed down through generations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xl mb-4">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Madhvacharya Tradition</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                The foundation of our spiritual lineage rests upon the teachings of Sri Madhvacharya, the great propounder of Dvaita Vedanta philosophy.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl mb-4">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sri Mathaji Ulsooramma</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Our Mutt bears the sacred foundation laid by Mathaji Ulsooramma, whose life of pure devotion and service established this spiritual sanctuary.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl mb-4">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Spiritual Continuity</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Maintaining authentic pooja traditions, Panchamrutha Abhisheka, Stotra chanting, and Rathotsavams connecting devotees to the divine.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center font-black text-xl mb-4">
                04
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community & Annadanam</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Beyond spiritual guidance, our Mutt actively organizes daily Prasadam, Annadanam sevas, and welfare initiatives for the wider society.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
