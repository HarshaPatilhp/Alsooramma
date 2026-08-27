export default function Trustees() {
  const trustees = [
    {
      name: "Mathaji Ulsooramma",
      role: "Founder Trustee",
      description: "Revered founder and patron of our mutt whose devotion, selfless service, and divine vision established this sacred institution in Vidyaranyapura.",
      image: "/images/TRUSTEE/01.Founder%20Trustee%20Mathaji%20Ulsooramma.jpg"
    },
    {
      name: "Sri Badri N Rao",
      role: "Trustee",
      description: "Dedicated trustee guiding the mutt's administration, spiritual observances, and religious development initiatives.",
      image: "/images/TRUSTEE/02.Sri%20Badri%20N%20Rao.jpg"
    },
    {
      name: "Late Sri R Vijendran Rao",
      role: "Trustee",
      description: "Remembered with deep reverence for his invaluable contributions, guidance, and lifelong service to the Mutt and community.",
      image: "/images/TRUSTEE/03.Late%20Sri%20R%20Vijendran%20Rao.JPG"
    },
    {
      name: "Sri Giridhar Rao",
      role: "Trustee",
      description: "Oversees key organizational activities, community seva programs, and infrastructure maintenance of the Mutt.",
      image: "/images/TRUSTEE/04.Sri%20Giridhar%20Rao.JPG"
    },
    {
      name: "Sri Sriram N Rao",
      role: "Trustee",
      description: "Actively supports seva coordination, pooja ceremonies, and cultural enrichment for the devotee congregation.",
      image: "/images/TRUSTEE/05.Sri%20Sriam%20N%20Rao.jpg"
    },
    {
      name: "Smt. Sharada V Kumar",
      role: "Trustee",
      description: "Supports temple welfare initiatives, cultural programs, and community outreach services for devotees and families.",
      image: "/images/TRUSTEE/06.Smt.%20Sharada%20V%20Kumar.jpg"
    },
    {
      name: "Sri Prabhakaran",
      role: "Trustee",
      description: "Guides community relations, event planning, and temple operations with dedicated commitment.",
      image: "/images/TRUSTEE/07.Sri%20Prabhakaran.jpg"
    },
    {
      name: "Sri Srikanth M R",
      role: "Trustee",
      description: "Coordinates youth participation, festival arrangements, and technological advancements for devotee services.",
      image: "/images/TRUSTEE/08.Sri%20Srikanth%20M%20R.JPG"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Board of Trustees</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-orange-100 font-medium">
            Meet the dedicated spiritual leaders and administrators who guide Mathaji Ulsooramma Sri Raghavendra Swamy Mutt
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 mb-12 border border-gray-100 dark:border-slate-700">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6 text-center">Our Guiding Lights</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
              The trustees of Mathaji Ulsooramma Sri Raghavendra Swamy Mutt are dedicated spiritual leaders and administrators
              who work tirelessly to uphold the sacred traditions and serve the community. Under the divine guidance of
              Sri Raghavendra Swami, they ensure that the mutt continues to be a beacon of spiritual wisdom and service.
            </p>
          </div>

          {/* Trustees Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustees.map((trustee, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 group flex flex-col hover:-translate-y-1.5"
              >
                {/* Photo container */}
                <div className="aspect-[4/5] bg-gradient-to-br from-orange-100 to-amber-100 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden flex items-center justify-center">
                  {trustee.image ? (
                    <img 
                      src={trustee.image} 
                      alt={trustee.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const placeholder = parent.querySelector('.fallback-placeholder');
                          if (placeholder) placeholder.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div className={`fallback-placeholder ${trustee.image ? 'hidden' : ''} flex flex-col items-center justify-center text-center p-4`}>
                    <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-md mb-2">
                      <span className="text-2xl font-black">{trustee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Photo Coming Soon</span>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md border border-amber-400/30">
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug mb-1">
                    {trustee.name}
                  </h3>
                  <span className="inline-block text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2.5">
                    {trustee.role}
                  </span>
                  <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mt-auto line-clamp-4">
                    {trustee.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Management Committee */}
          <div className="mt-16 bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-8 text-center">Management Committee</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Paryana Samithi</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">The governing body responsible for the overall administration and decision-making of the mutt.</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <li>• Policy formulation and implementation</li>
                    <li>• Financial management and oversight</li>
                    <li>• Property and asset management</li>
                    <li>• Community relations and outreach</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Bhajana Mandali</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Dedicated group of devotees who organize and conduct devotional music sessions.</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <li>• Weekly bhajana sessions every Thursday</li>
                    <li>• Festival celebrations and Haridasa sahitya</li>
                    <li>• Musical training programs</li>
                    <li>• Community devotional events</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Seva Committee</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Volunteers who coordinate various service activities and religious ceremonies.</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <li>• Daily pooja arrangements</li>
                    <li>• Special ceremony coordination</li>
                    <li>• Guest hospitality and Annadanam</li>
                    <li>• Maintenance and cleanliness</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Education Committee</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Responsible for organizing spiritual education and cultural programs.</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <li>• Scripture classes & Stotra recitation</li>
                    <li>• Spiritual discourses & Pravachana</li>
                    <li>• Youth programs</li>
                    <li>• Cultural activities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Trustees */}
          <div className="mt-12 text-center">
            <div className="bg-orange-50 dark:bg-slate-800/80 rounded-3xl p-8 border border-orange-100 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Get in Touch</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm max-w-xl mx-auto">
                For any queries, suggestions, or to connect with our board of trustees, please reach out to the temple office.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/contact"
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors text-sm shadow-md"
                >
                  Contact Office
                </a>
                <a
                  href="mailto:vidyaranyapuramutt@gmail.com"
                  className="border-2 border-orange-600 text-orange-600 dark:text-orange-400 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  Email: vidyaranyapuramutt@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
