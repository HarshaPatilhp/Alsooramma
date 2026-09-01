import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mathaji Ulsooramma Sri Raghavendra Swamy Mutt</h3>
            <p className="text-gray-400 text-sm">
              CA Site No. 8, 6th Main Road, BEL Layout, 3rd Block, Vidyaranyapura, Bangalore-560097
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/history" className="text-gray-400 hover:text-white transition-colors">History</Link></li>
              <li><Link href="/activities" className="text-gray-400 hover:text-white transition-colors">Activities</Link></li>
              <li><Link href="/seva-list" className="text-gray-400 hover:text-white transition-colors">Sevas</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/seva-list" className="text-gray-400 hover:text-white transition-colors">Book Seva</Link></li>
              <li><Link href="/upcoming-events" className="text-gray-400 hover:text-white transition-colors">Upcoming Events</Link></li>
              <li><Link href="/photos" className="text-gray-400 hover:text-white transition-colors">Photo Gallery</Link></li>
              <li><Link href="/videos" className="text-gray-400 hover:text-white transition-colors">Video Gallery</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Donations</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                <span className="font-semibold">Email:</span><br />
                <a href="mailto:vidyaranyapuramutt@gmail.com" className="hover:text-white">vidyaranyapuramutt@gmail.com</a>
              </p>
              <p className="text-gray-400">
                <span className="font-semibold">Phone:</span><br />
                <a href="tel:+918049723252" className="block hover:text-white">080 4972 3252</a>
                <a href="tel:+919538320752" className="block hover:text-white">9538320752</a>
                <a href="tel:+916366133799" className="block hover:text-white">6366133799</a>
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="tel:+919823260156" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/sri_raghavendra_swamy_muttvrp/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2a3.6 3.6 0 0 0-3.6 3.6v8.4c0 2 1.6 3.6 3.6 3.6h8.4a3.6 3.6 0 0 0 3.6-3.6V7.8c0-2-1.6-3.6-3.6-3.6H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 9a1.25 1.25 0 0 1-1.25-1.25A1.25 1.25 0 0 1 17.25 5.5M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/@vidyaranyapuramutt8314" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2026 Mathaji Ulsooramma Sri Raghavendra Swamy Mutt. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
