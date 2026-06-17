'use client';

import { useState } from 'react';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [donationAmount, setDonationAmount] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Don't prevent default - let Formspree handle the submission
    // Formspree will redirect to a success page automatically
    // We can add a small delay to reset form if needed
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  const handleDonationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically process the donation
    alert(`Thank you for your generous donation of ₹${donationAmount}! Your contribution will help support our spiritual activities.`);
    setDonationAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Contact Us</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Get in touch with us for spiritual guidance, donations, or any inquiries
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Contact Form
              </button>
              <button
                onClick={() => setActiveTab('donate')}
                className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                  activeTab === 'donate'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Donate
              </button>
            </div>
          </div>

          {/* Contact Form Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                <form 
  action="https://formspree.io/f/mgolrklv" 
  method="POST"
  onSubmit={handleContactSubmit} 
  className="space-y-6"
>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-black-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-black-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-black-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-black-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="seva">Seva Booking</option>
                        <option value="donation">Donation</option>
                        <option value="event">Event Information</option>
                        <option value="spiritual">Spiritual Guidance</option>
                        <option value="general">General Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-black-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Please enter your message here..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Contact Details */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Address</h4>
                        <p className="text-gray-600">
                          CA Site No. 8, 6th Main Road,<br />
                          BEL Layout, 3rd Block,<br />
                          Vidyaranyapura, Bangalore-560097
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Email</h4>
                        <p className="text-gray-600">vidyaranyapura@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Phone</h4>
                        <div className="text-gray-600 space-y-1">
                          <p>+91 9823260156</p>
                          <p>080 4972 3252</p>
                          <p>9538320752</p>
                          <p>6366133799</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Location</h3>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                    <iframe 
                      src="https://maps.google.com/maps?q=Mathaji%20Ulsooramma%20Raghavendra%20Swamy%20Mutt,%20Vidyaranyapura,%20Bangalore&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Temple Location Map"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donation Tab */}
          {activeTab === 'donate' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Donation Form */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Make a Donation</h2>
                  <p className="text-gray-600 mb-6">
                    Your generous contributions help us maintain the temple, support charitable activities,
                    and continue our spiritual services.
                  </p>

                  <form onSubmit={handleDonationSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (₹)</label>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter amount in rupees"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose (Optional)</label>
                      <select className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                        <option value="">Select purpose</option>
                        <option value="general">General Donation</option>
                        <option value="seva">Seva Support</option>
                        <option value="education">Education</option>
                        <option value="charity">Charity</option>
                        <option value="maintenance">Temple Maintenance</option>
                        <option value="festival">Festival Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Any special message or dedication..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Donate Now
                    </button>
                  </form>
                </div>

                {/* Donation Information */}
                <div className="space-y-8">
                  {/* Quick Amount Buttons */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Donate</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[100, 500, 1000, 2000, 5000, 10000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDonationAmount(amount.toString())}
                          className="bg-orange-100 text-orange-700 py-3 px-4 rounded-lg font-semibold hover:bg-orange-200 transition-colors"
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* How Donations Help */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">How Your Donation Helps</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Daily Poojas</h4>
                          <p className="text-sm text-gray-600">Support daily worship and maintenance of sacred rituals</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Education</h4>
                          <p className="text-sm text-gray-600">Fund spiritual education and scripture classes</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Charity</h4>
                          <p className="text-sm text-gray-600">Support community welfare and charitable activities</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Temple Maintenance</h4>
                          <p className="text-sm text-gray-600">Maintain and preserve the sacred temple premises</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Benefits */}
                  <div className="bg-orange-50 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Tax Benefits</h3>
                    <p className="text-gray-700 mb-4">
                      Donations to religious institutions are eligible for tax deductions under Section 80G of the Income Tax Act.
                    </p>
                    <p className="text-sm text-gray-600">
                      Please consult your tax advisor for specific tax benefits applicable to your situation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
