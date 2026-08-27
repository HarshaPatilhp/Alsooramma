export default function Trustees() {
  const trustees = [
    {
      name: "Sri Raghavendra Swami",
      role: "Spiritual Head",
      description: "The divine incarnation and guiding light of our mutt, whose teachings continue to inspire millions.",
      image: "/trustee-1.jpg"
    },
    {
      name: "Sri Mathaji Ulsooramma",
      role: "Patron Saint",
      description: "The revered saint associated with our mutt, whose devotion and service set the foundation for our spiritual journey.",
      image: "/trustee-2.jpg"
    },
    {
      name: "Sri Vidyaranya Swami",
      role: "Honorary Trustee",
      description: "Leading spiritual guide and scholar who provides wisdom and direction to our community.",
      image: "/trustee-3.jpg"
    },
    {
      name: "Sri Madhava Swami",
      role: "Administrative Trustee",
      description: "Oversees the day-to-day operations and management of the mutt's activities and services.",
      image: "/trustee-4.jpg"
    },
    {
      name: "Sri Krishna Swami",
      role: "Educational Trustee",
      description: "Manages educational programs, scripture classes, and spiritual learning initiatives.",
      image: "/trustee-5.jpg"
    },
    {
      name: "Sri Rama Swami",
      role: "Charity Trustee",
      description: "Coordinates community service, charitable activities, and welfare programs for the needy.",
      image: "/trustee-6.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Trustees</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Meet the dedicated spiritual leaders and administrators who guide our mutt
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Guiding Lights</h2>
            <p className="text-lg text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              The trustees of Mathaji Ulsooramma Sri Raghavendra Swamy Mutt are dedicated spiritual leaders and administrators
              who work tirelessly to uphold the sacred traditions and serve the community. Under the divine guidance of
              Sri Raghavendra Swami, they ensure that the mutt continues to be a beacon of spiritual wisdom and service.
            </p>
          </div>

          {/* Trustees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustees.map((trustee, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 group flex flex-col">
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-100 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden flex items-center justify-center">
                  {trustee.image ? (
                    <img 
                      src={trustee.image} 
                      alt={trustee.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // If image not found, fallback to placeholder avatar
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
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1.5">{trustee.name}</h3>
                  <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold mb-3">{trustee.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-auto">{trustee.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Management Committee */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Management Committee</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Paryana Samithi</h3>
                  <p className="text-gray-600">The governing body responsible for the overall administration and decision-making of the mutt.</p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    <li>• Policy formulation and implementation</li>
                    <li>• Financial management and oversight</li>
                    <li>• Property and asset management</li>
                    <li>• Community relations and outreach</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Bhajana Mandali</h3>
                  <p className="text-gray-600">Dedicated group of devotees who organize and conduct devotional music sessions.</p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    <li>• Weekly bhajana sessions</li>
                    <li>• Festival celebrations</li>
                    <li>• Musical training programs</li>
                    <li>• Community devotional events</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Seva Committee</h3>
                  <p className="text-gray-600">Volunteers who coordinate various service activities and religious ceremonies.</p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    <li>• Daily pooja arrangements</li>
                    <li>• Special ceremony coordination</li>
                    <li>• Guest hospitality</li>
                    <li>• Maintenance and cleanliness</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Education Committee</h3>
                  <p className="text-gray-600">Responsible for organizing spiritual education and cultural programs.</p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    <li>• Scripture classes</li>
                    <li>• Spiritual discourses</li>
                    <li>• Youth programs</li>
                    <li>• Cultural activities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Trustees */}
          <div className="mt-12 text-center">
            <div className="bg-orange-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Get in Touch</h3>
              <p className="text-gray-600 mb-6">
                For any queries or to connect with our trustees, please reach out to us.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/contact"
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="mailto:vidyaranyapura@gmail.com"
                  className="border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Email Trustees
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
