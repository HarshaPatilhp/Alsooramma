export default function Activities() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Activities</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Explore our diverse range of spiritual and community activities
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Daily Poojas */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-orange-100 p-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Daily Poojas</h3>
                <p className="text-gray-600">Regular morning and evening poojas conducted with devotion and precision</p>
              </div>
            </div>

            {/* Bhajana Sessions */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-100 p-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Bhajana Sessions</h3>
                <p className="text-gray-600">Devotional singing sessions that uplift the soul and bring peace</p>
              </div>
            </div>

            {/* Spiritual Discourses */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-100 p-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Spiritual Discourses</h3>
                <p className="text-gray-600">Enlightening talks on scriptures and spiritual wisdom</p>
              </div>
            </div>

            {/* Aradhana Mahotsava */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-purple-100 p-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Aradhana Mahotsava</h3>
                <p className="text-gray-600">Grand annual celebration of Sri Raghavendra Swami's aradhana</p>
              </div>
            </div>

            {/* Community Service */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-red-100 p-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Community Service</h3>
                <p className="text-gray-600">Various charitable activities and social welfare programs</p>
              </div>
            </div>

            {/* Educational Programs */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-indigo-100 p-6">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Educational Programs</h3>
                <p className="text-gray-600">Scripture classes and spiritual education for all ages</p>
              </div>
            </div>
          </div>

          {/* Detailed Activities Section */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Regular Activities</h2>

            <div className="space-y-8">
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Daily Pooja</h3>
                <p className="text-gray-600">Daily morning worship starting at 6:00 AM, including chanting of vedic hymns and offering prayers</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bhajana Mandali</h3>
                <p className="text-gray-600">Apart from conducting bhajans on all important functions and occasions, the members of the Bhajana mandali regularly perform Dasara Padagalu at our Mutt premises every Thursday.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Spiritual Classes</h3>
                <p className="text-gray-600">Regular classes on Bhagavad Gita, Ramayana, and other sacred texts for spiritual growth</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Festival Celebrations</h3>
                <p className="text-gray-600">Grand celebrations during major festivals like Sri Ramanavami, Gokulashtami, and Aradhana Mahotsava</p>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Charity Programs</h3>
                <p className="text-gray-600">Distribution of food, clothes, and educational materials to the underprivileged community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
