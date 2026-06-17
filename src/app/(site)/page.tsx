'use client';
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax Effect and Gradient Overlay */}
      <section className="relative flex items-center justify-center py-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-amber-500/80 z-10" />
        <div 
          className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-50 z-0"
        />
        <div className="container relative z-20 mx-auto px-4 text-center animate-slide-up">
          <div className="inline-block mb-6 px-6 py-2 rounded-full glassmorphism text-orange-100 text-sm font-semibold tracking-widest uppercase">
            A Sacred Journey
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
           Hari Sarvothama! 
           <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">Vayu Jeevothama !!</span>
          </h1>
          <h2 className="text-lg md:text-2xl lg:text-3xl text-orange-50 font-medium mb-12 drop-shadow-md max-w-4xl mx-auto">
            Mathaji Ulsooramma Raghavendra Swamy Mutt, Vidyaranyapura, Bangalore
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link
              href="/seva-list"
              className="bg-white text-orange-600 px-6 py-3 md:px-10 md:py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 w-full md:w-auto"
            >
              Book a Seva Online
            </Link>
            <Link
              href="/contact"
              className="glassmorphism text-white px-6 py-3 md:px-10 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-white/20 transition-all duration-300 border border-white/40 w-full md:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </div>
        
        {/* Decorative divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
          <svg className="relative block w-full h-[50px] md:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,137.45,123.6,204.6,108.57,255.45,97.2,305.67,79.54,321.39,56.44Z" className="fill-white dark:fill-slate-900"></path>
          </svg>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 py-20 relative z-10 dark:bg-slate-900">
        
        {/* About Section */}
        <section className="mb-24 flex flex-col lg:flex-row items-center gap-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-bold mb-4">About the Mutt</div>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
              A Spiritual Haven in Vidyaranyapura
            </h2>
            <div className="space-y-6 text-lg text-gray-600 dark:text-slate-300">
              <p>
                Mathaji Ulsooramma Raghavendra Swamy Mutt is a revered religious organization
                dedicated to the teachings and service of Sri Raghavendra Swamy, a saint known for his unwavering devotion
                and miracles.
              </p>
              <p>
                We serve as a sacred place of worship, offering devotees an opportunity to participate
                in daily poojas, sevas, and various religious rituals that uphold rich spiritual traditions.
                Our focus is on fostering community, devotion, and continuity of faith.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-lg"></div>
            <div className="relative bg-orange-50 dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-orange-100 dark:border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Divine Activities</h3>
              <ul className="space-y-4">
                {[
                  "Daily Poojas & Sevas",
                  "Religious Celebrations",
                  "Spiritual Discourses",
                  "Sri Raghavendra Swamy Aradhana"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-slate-200">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 mr-4">
                      ✓
                    </span>
                    <span className="font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Action Sections Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Book Online Section */}
          <section className="relative overflow-hidden rounded-3xl shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 transition-transform duration-500 group-hover:scale-105" />
            <div className="relative p-10 h-full flex flex-col justify-center items-start text-white">
              <h2 className="text-3xl font-bold mb-4 drop-shadow-md">Online Booking</h2>
              <p className="text-lg opacity-90 mb-8 max-w-sm">
                Experience the convenience of booking parayanas, sevas, and ceremonies from anywhere.
              </p>
              <Link
                href="/seva-list"
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md transform group-hover:translate-x-2"
              >
                Explore Sevas →
              </Link>
            </div>
          </section>

          {/* Contact & Location Section */}
          <section className="relative overflow-hidden rounded-3xl shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 transition-transform duration-500 group-hover:scale-105" />
            <div className="relative p-10 h-full flex flex-col justify-center items-start text-white">
              <h2 className="text-3xl font-bold mb-4 drop-shadow-md">Visit the Mutt</h2>
              <p className="text-lg opacity-90 mb-8 max-w-sm">
                CA Site No. 8, 6th Main Road, BEL Layout, 3rd Block, Vidyaranyapura, Bangalore-560097
              </p>
              <Link
                href="/contact"
                className="glassmorphism text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/20 transform group-hover:translate-x-2"
              >
                Get Directions →
              </Link>
            </div>
          </section>
        </div>

        {/* Newsletter Signup */}
        <section className="bg-orange-50 dark:bg-slate-800 py-16 px-6 rounded-[3rem] shadow-inner mb-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              Stay Connected
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Register your WhatsApp number or Email ID to receive updates on upcoming events and divine discourses.
            </p>
            <form className="max-w-md mx-auto" onSubmit={handleSubscribe}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  disabled={subscribing || subscribed}
                  placeholder="WhatsApp Number or Email"
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-orange-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-orange-500 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={subscribing || subscribed}
                  className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md whitespace-nowrap ${
                    subscribed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {subscribing ? 'Subscribing...' : subscribed ? '✓ Subscribed' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
