'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Heart, Shield, BookOpen, Star, Building, ArrowRight, IndianRupee } from 'lucide-react';

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
    alert(`Thank you for your generous donation of ₹${donationAmount}! Your contribution will help support our spiritual activities.`);
    setDonationAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 text-white py-24">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 mix-blend-overlay"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20 shadow-xl">
            <Mail className="w-8 h-8 text-orange-100" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">Connect With Us</h1>
          <p className="text-xl md:text-2xl text-orange-100/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
            We welcome your inquiries, spiritual seeking, and generous contributions to our sacred community.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-2 border border-gray-100 flex space-x-2">
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'contact'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-100'
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab('donate')}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'donate'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-100'
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Heart className="w-5 h-5" />
                Make a Donation
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up">
            {/* Contact Form Tab */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Contact Form */}
                <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 h-fit">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Send us a Message</h2>
                    <p className="text-gray-500 font-medium">Fill out the form below and our team will get back to you promptly.</p>
                  </div>
                  
                  <form 
                    action="https://formspree.io/f/mgolrklv" 
                    method="POST"
                    onSubmit={handleContactSubmit} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium appearance-none"
                        >
                          <option value="">Select a topic...</option>
                          <option value="seva">Seva Booking</option>
                          <option value="donation">Donation</option>
                          <option value="event">Event Information</option>
                          <option value="spiritual">Spiritual Guidance</option>
                          <option value="general">General Inquiry</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium resize-none"
                        placeholder="How can we help you today?"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-orange-500/25"
                    >
                      Send Message
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Contact Information Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Details */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-8 relative z-10">Contact Info</h3>

                    <div className="space-y-8 relative z-10">
                      <div className="flex items-start gap-4 group">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-orange-100">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Our Location</h4>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            CA Site No. 8, 6th Main Road,<br />
                            BEL Layout, 3rd Block,<br />
                            Vidyaranyapura, Bangalore-560097
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-orange-100">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Email Address</h4>
                          <a href="mailto:vidyaranyapura@gmail.com" className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
                            vidyaranyapura@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-orange-100">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Phone Numbers</h4>
                          <div className="text-gray-600 font-medium space-y-1">
                            <p>+91 9823260156</p>
                            <p>080 4972 3252</p>
                            <p>9538320752</p>
                            <p>6366133799</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Box */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-3 relative overflow-hidden">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-inner">
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
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Donation Form */}
                  <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
                    
                    <div className="mb-8 relative z-10">
                      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Make a Contribution</h2>
                      <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                        Your generous contributions help us maintain the temple, support charitable activities,
                        and continue our spiritual services.
                      </p>
                    </div>

                    <form onSubmit={handleDonationSubmit} className="space-y-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                          <input
                            type="text"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                          <input
                            type="email"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Purpose (Optional)</label>
                          <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium appearance-none">
                            <option value="">Select purpose</option>
                            <option value="general">General Donation</option>
                            <option value="seva">Seva Support</option>
                            <option value="education">Education</option>
                            <option value="charity">Charity</option>
                            <option value="maintenance">Temple Maintenance</option>
                            <option value="festival">Festival Support</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Donation Amount</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <IndianRupee className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            required
                            min="1"
                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-bold text-lg"
                            placeholder="Amount in Rupees"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Message (Optional)</label>
                        <textarea
                          rows={3}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium resize-none"
                          placeholder="Any special message or dedication..."
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-orange-500/25 mt-4"
                      >
                        <Heart className="w-5 h-5" />
                        Complete Donation
                      </button>
                    </form>
                  </div>

                  {/* Donation Information Sidebar */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Quick Amount Buttons */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Quick Select
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[100, 500, 1000, 2000, 5000, 10000].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setDonationAmount(amount.toString())}
                            className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 border ${
                              donationAmount === amount.toString()
                                ? 'bg-orange-600 border-orange-600 text-white shadow-md'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600'
                            }`}
                          >
                            ₹{amount.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* How Donations Help */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      <h3 className="text-xl font-extrabold mb-6 relative z-10">How Your Support Helps</h3>
                      
                      <div className="space-y-6 relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                            <Star className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-orange-50 mb-1">Daily Poojas</h4>
                            <p className="text-sm text-gray-400 font-medium">Support daily worship and maintenance of sacred rituals</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-orange-50 mb-1">Education</h4>
                            <p className="text-sm text-gray-400 font-medium">Fund spiritual education and scripture classes</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-500/30">
                            <Heart className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-orange-50 mb-1">Charity</h4>
                            <p className="text-sm text-gray-400 font-medium">Support community welfare and charitable activities</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-orange-50 mb-1">Temple Maintenance</h4>
                            <p className="text-sm text-gray-400 font-medium">Maintain and preserve the sacred temple premises</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tax Benefits */}
                    <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900 mb-1">Tax Benefits</h4>
                        <p className="text-sm text-emerald-700/80 font-medium leading-relaxed">
                          Donations to religious institutions are eligible for tax deductions under Section 80G. Please consult your tax advisor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
