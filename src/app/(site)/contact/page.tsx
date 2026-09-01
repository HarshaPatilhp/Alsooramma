'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Heart, Shield, BookOpen, Star, Building, ArrowRight, IndianRupee, CheckCircle2 } from 'lucide-react';

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
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/mgolrklv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      if (res.ok) {
        setContactSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setContactSubmitted(false), 5000);
      }
    } catch {
      setContactSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setContactSubmitted(false), 5000);
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleDonationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Thank you for your generous donation of ₹${donationAmount}! Your contribution will help support our spiritual activities.`);
    setDonationAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white py-20">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20 shadow-xl">
            <Mail className="w-8 h-8 text-orange-100" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-md">Connect With Us</h1>
          <p className="text-lg md:text-xl text-orange-100/95 max-w-2xl mx-auto font-medium leading-relaxed">
            We welcome your inquiries, seva queries, and generous contributions to our sacred Mutt.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl p-1.5 border border-gray-200 dark:border-slate-800 flex space-x-2">
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === 'contact'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </button>
              <button
                onClick={() => setActiveTab('donate')}
                className={`flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === 'donate'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Make a Donation</span>
              </button>
            </div>
          </div>

          <div>
            {/* Contact Form Tab */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Contact Form */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 md:p-10 h-fit">
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Send us a Message</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Fill out the form below and our team will get back to you promptly.</p>
                  </div>

                  {contactSubmitted && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span>Message sent! We will get back to you soon. 🙏</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleContactSubmit}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="your.email@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Subject</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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

                    <div className="space-y-1.5">
                      <label className="font-bold text-gray-700 dark:text-gray-300">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="How can we help you today?"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider hover:from-orange-700 hover:to-orange-800 transition-all shadow-md mt-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>{contactSubmitting ? 'Sending...' : 'Send Message'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Contact Information Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-7">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Contact Details</h3>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100 dark:border-slate-700 shadow-xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Our Location</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                            CA Site No. 8, 6th Main Road,<br />
                            BEL Layout, 3rd Block,<br />
                            Vidyaranyapura, Bangalore-560097
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100 dark:border-slate-700 shadow-xs">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Email Address</h4>
                          <a href="mailto:vidyaranyapuramutt@gmail.com" className="text-orange-600 dark:text-orange-400 text-xs font-semibold hover:underline break-all">
                            vidyaranyapuramutt@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100 dark:border-slate-700 shadow-xs">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Phone Numbers</h4>
                          <div className="text-gray-600 dark:text-gray-300 text-xs space-y-0.5 font-medium">
                            <p>080 4972 3252</p>
                            <p>+91 95383 20752</p>
                            <p>+91 63661 33799</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Box */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-2 overflow-hidden">
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
                  <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 md:p-10 h-fit">
                    <div className="mb-6">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Make a Contribution</h2>
                      <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                        Your generous contributions help us maintain the temple, support Annadanam, and continue our daily poojas.
                      </p>
                    </div>

                    <form onSubmit={handleDonationSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-700 dark:text-gray-300">Full Name *</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Your Name"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-700 dark:text-gray-300">Email Address *</label>
                          <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="your.email@gmail.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                          <input
                            type="tel"
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-700 dark:text-gray-300">Purpose</label>
                          <select className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <option value="general">General Donation</option>
                            <option value="annadana">Maha Annadanam</option>
                            <option value="seva">Daily Seva Support</option>
                            <option value="maintenance">Temple Maintenance</option>
                            <option value="festival">Aradhana & Festivals</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Donation Amount (₹)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <IndianRupee className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            required
                            min="1"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                            placeholder="Amount in INR"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider hover:from-orange-700 hover:to-orange-800 transition-all shadow-md mt-4 cursor-pointer"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Complete Donation</span>
                      </button>
                    </form>
                  </div>

                  {/* Donation Sidebar */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
                      <h3 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Quick Amount Select</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 2000, 5000, 10000, 25000].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setDonationAmount(amount.toString())}
                            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                              donationAmount === amount.toString()
                                ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                                : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-orange-500'
                            }`}
                          >
                            ₹{amount.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* How donations help */}
                    <div className="bg-gradient-to-br from-slate-900 to-orange-950 rounded-3xl shadow-xl p-6 text-white border border-orange-900/40">
                      <h3 className="text-base font-black mb-4">How Your Support Helps</h3>
                      <div className="space-y-4 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                            <Star className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-0.5">Daily Poojas</h4>
                            <p className="text-slate-300 text-[11px]">Support daily worship, abhisheka, and flowers</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-0.5">Maha Annadanam</h4>
                            <p className="text-slate-300 text-[11px]">Daily consecrated meals for hundreds of devotees</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-0.5">Temple Maintenance</h4>
                            <p className="text-slate-300 text-[11px]">Upkeep and preservation of the sacred Mutt</p>
                          </div>
                        </div>
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
