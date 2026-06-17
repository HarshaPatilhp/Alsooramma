'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode';
import emailjs from '@emailjs/browser';

interface Seva {
  id: number;
  name: string;
  description: string;
  time: string;
  cost: string;
  duration: string;
  category: string;
}

interface Hall {
  id: number;
  name: string;
  description: string;
  capacity: string;
  cost: string;
  features: string[];
  category: string;
}

export default function SevaList() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSeva, setSelectedSeva] = useState<Seva | null>(null);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showHallBookingForm, setShowHallBookingForm] = useState(false);
  const [tirthaPrasadaRequired, setTirthaPrasadaRequired] = useState(false);
  const [tirthaPrasadaCount, setTirthaPrasadaCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Check if current user is admin
  const isAdmin = isAuthenticated && user?.role === 'admin';

    const [activeTab, setActiveTab] = useState<'seva' | 'hall'>('seva');
    const [sevaSearch, setSevaSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const categories = ['All', 'Daily Sevas', 'Weekly Sevas', 'Special Sevas', 'Extended Sevas'];


  const sendBookingEmail = async (bookingData: any) => {
    try {
      console.log('🔍 [DEBUG] sendBookingEmail called using local API:', bookingData);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: bookingData,
          qrCode: bookingData.id.toString()
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send email via API');
      }

      console.log('🔍 [DEBUG] Email sent successfully via local API:', data);
      return true;
    } catch (error: any) {
      console.error('🔍 [DEBUG] Email sending error:', error);
      let errorMessage = 'Email sending failed. Please try again or contact the temple office.';
      
      if (error.message) {
        errorMessage = `Email sending failed: ${error.message}`;
      }
      
      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      }
      
      console.error('🔍 [DEBUG] Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sevas: Seva[] = [
    {
      id: 1,
      name: "Panchamrutha Abhisheka",
      description: "Sacred bathing ceremony with panchamrutha (five sacred items)",
      time: "Morning (6:00 AM - 8:00 AM)",
      cost: "₹100",
      duration: "2 hours",
      category: "Daily Sevas"
    },
    {
      id: 2,
      name: "Saamoohika Satyanarayana Pooje Sankalpa",
      description: "Group Satyanarayana pooja ceremony with sankalpa",
      time: "Evening (5:00 PM - 7:00 PM)",
      cost: "₹100",
      duration: "2 hours",
      category: "Weekly Sevas"
    },
    {
      id: 3,
      name: "Tirtha Prasada (Dwadashi Parane)",
      description: "Sacred food offering on Dwadashi day",
      time: "Afternoon (12:00 PM - 2:00 PM)",
      cost: "₹100",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 4,
      name: "Panchamrutha Abhisheka (Thursday)",
      description: "Special Panchamrutha Abhisheka on Thursday",
      time: "Morning (6:00 AM - 8:00 AM)",
      cost: "₹150",
      duration: "2 hours",
      category: "Weekly Sevas"
    },
    {
      id: 5,
      name: "Tirtha Prasada (One Person)",
      description: "Individual sacred food offering",
      time: "Afternoon (12:00 PM - 1:00 PM)",
      cost: "₹250",
      duration: "1 hour",
      category: "Daily Sevas"
    },
    {
      id: 6,
      name: "Vehicle Pooja 2 Wheeler",
      description: "Vehicle blessing ceremony for two-wheelers",
      time: "Morning (8:00 AM - 9:00 AM)",
      cost: "₹300",
      duration: "1 hour",
      category: "Special Sevas"
    },
    {
      id: 7,
      name: "Gow Graasa 1 Day",
      description: "One day cow feeding service",
      time: "Morning (6:00 AM - 7:00 PM)",
      cost: "₹300",
      duration: "Full day",
      category: "Daily Sevas"
    },
    {
      id: 8,
      name: "Dhanvantari Homa Sankalpa",
      description: "Fire ritual for health with sankalpa",
      time: "Morning (7:00 AM - 9:00 AM)",
      cost: "₹300",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 9,
      name: "Durga Deepa Namaskaara - Sankalpa",
      description: "Durga lamp worship with sankalpa",
      time: "Evening (6:00 PM - 7:00 PM)",
      cost: "₹301",
      duration: "1 hour",
      category: "Special Sevas"
    },
    {
      id: 10,
      name: "Gow Puje",
      description: "Cow worship ceremony",
      time: "Morning (6:00 AM - 7:00 AM)",
      cost: "₹500",
      duration: "1 hour",
      category: "Daily Sevas"
    },
    {
      id: 11,
      name: "Rajatha Kavacha",
      description: "Silver armor offering ceremony",
      time: "Morning (8:00 AM - 10:00 AM)",
      cost: "₹500",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 12,
      name: "Vehicle Pooja -4 Wheeler",
      description: "Vehicle blessing ceremony for four-wheelers",
      time: "Morning (9:00 AM - 10:00 AM)",
      cost: "₹500",
      duration: "1 hour",
      category: "Special Sevas"
    },
    {
      id: 13,
      name: "Pallakki or Ratha Utsava (Thursday Only)",
      description: "Palanquin or chariot festival on Thursday",
      time: "Evening (6:00 PM - 8:00 PM)",
      cost: "₹700",
      duration: "2 hours",
      category: "Weekly Sevas"
    },
    {
      id: 14,
      name: "Swarna Kavacha",
      description: "Golden armor offering ceremony",
      time: "Morning (8:00 AM - 11:00 AM)",
      cost: "₹700",
      duration: "3 hours",
      category: "Special Sevas"
    },
    {
      id: 15,
      name: "Sankalpa Shraaddha (2 TP)",
      description: "Ancestral rites with sankalpa for two people",
      time: "Morning (9:00 AM - 12:00 PM)",
      cost: "₹750",
      duration: "3 hours",
      category: "Special Sevas"
    },
    {
      id: 16,
      name: "Chataka Shraaddha (2 TP)",
      description: "Chataka ancestral rites for two people",
      time: "Morning (9:00 AM - 1:00 PM)",
      cost: "₹900",
      duration: "4 hours",
      category: "Special Sevas"
    },
    {
      id: 17,
      name: "Heavy Vehicle Pooja",
      description: "Vehicle blessing for heavy vehicles",
      time: "Morning (8:00 AM - 10:00 AM)",
      cost: "₹1000",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 18,
      name: "Achaarya Mukhena Sankalpa Shraddha",
      description: "Ancestral rites performed by Acharya with sankalpa",
      time: "Morning (8:00 AM - 2:00 PM)",
      cost: "₹1,750",
      duration: "6 hours",
      category: "Special Sevas"
    },
    {
      id: 19,
      name: "Pratyeka Satyanarayana Pooje - Purnima day (2TP)",
      description: "Individual Satyanarayana pooja on Purnima day for two people",
      time: "Full Day (9:00 AM - 6:00 PM)",
      cost: "₹2,000",
      duration: "9 hours",
      category: "Special Sevas"
    },
    {
      id: 20,
      name: "Pratyeka Dhanvantari Homa - Thursdays (2 TP)",
      description: "Individual Dhanvantari fire ritual on Thursdays for two people",
      time: "Morning (7:00 AM - 11:00 AM)",
      cost: "₹2,000",
      duration: "4 hours",
      category: "Weekly Sevas"
    },
    {
      id: 21,
      name: "Kankaabhisheka",
      description: "Eye abhisheka ceremony",
      time: "Morning (8:00 AM - 10:00 AM)",
      cost: "₹2,000",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 22,
      name: "Achaarya Mukhena Chataka Shraaddha",
      description: "Chataka ancestral rites performed by Acharya",
      time: "Morning (8:00 AM - 3:00 PM)",
      cost: "₹2,900",
      duration: "7 hours",
      category: "Special Sevas"
    },
    {
      id: 23,
      name: "Prathekya Chataka Shraaddha",
      description: "Individual Chataka ancestral rites",
      time: "Morning (9:00 AM - 4:00 PM)",
      cost: "₹2,900",
      duration: "7 hours",
      category: "Special Sevas"
    },
    {
      id: 24,
      name: "Thulabhara Seve (Prahaladha Rajaru)",
      description: "Tulabhara ceremony in honor of Prahaladha Rajaru",
      time: "Morning (8:00 AM - 12:00 PM)",
      cost: "₹3,000",
      duration: "4 hours",
      category: "Special Sevas"
    },
    {
      id: 25,
      name: "Sampoorna Alankaara Seve",
      description: "Complete decoration ceremony",
      time: "Morning (6:00 AM - 12:00 PM)",
      cost: "₹3,000",
      duration: "6 hours",
      category: "Special Sevas"
    },
    {
      id: 26,
      name: "Durga Deepa Namaskaara - Pratyeka",
      description: "Individual Durga lamp worship ceremony",
      time: "Evening (6:00 PM - 8:00 PM)",
      cost: "₹4,000",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 27,
      name: "Pratyeka Satyanarayana Pooje Other days (2 TP)",
      description: "Individual Satyanarayana pooja on other days for two people",
      time: "Full Day (9:00 AM - 6:00 PM)",
      cost: "₹4,000",
      duration: "9 hours",
      category: "Special Sevas"
    },
    {
      id: 28,
      name: "Pratyeka Dhanvantari Homa Other days (2 TP)",
      description: "Individual Dhanvantari fire ritual on other days for two people",
      time: "Morning (7:00 AM - 11:00 AM)",
      cost: "₹4,000",
      duration: "4 hours",
      category: "Special Sevas"
    },
    {
      id: 29,
      name: "Evening Prasada Seva (Thursdays & Special Days)",
      description: "Evening food offering service on Thursdays and special days",
      time: "Evening (6:00 PM - 8:00 PM)",
      cost: "₹4,000",
      duration: "2 hours",
      category: "Weekly Sevas"
    },
    {
      id: 30,
      name: "Srinivasa Kalyana",
      description: "Divine marriage ceremony of Lord Srinivasa",
      time: "Full Day (8:00 AM - 8:00 PM)",
      cost: "₹5,000",
      duration: "12 hours",
      category: "Special Sevas"
    },
    {
      id: 31,
      name: "Sarva Seve",
      description: "Complete all sevas package",
      time: "Full Day (6:00 AM - 8:00 PM)",
      cost: "₹5,000",
      duration: "14 hours",
      category: "Special Sevas"
    },
    {
      id: 32,
      name: "Madhu Abhisheka (48 Days)",
      description: "Honey abhisheka ceremony for 48 consecutive days",
      time: "Daily (6:00 AM - 7:00 AM)",
      cost: "₹5,400",
      duration: "48 days",
      category: "Extended Sevas"
    },
    {
      id: 33,
      name: "Pratyeka Satyanarayana Pooje At Home (2 TP)",
      description: "Individual Satyanarayana pooja at home for two people",
      time: "Flexible timing",
      cost: "₹6,000",
      duration: "3 hours",
      category: "Special Sevas"
    },
    {
      id: 34,
      name: "Gow Graasa 1 Month",
      description: "One month cow feeding service",
      time: "Daily (6:00 AM - 7:00 PM)",
      cost: "₹9,000",
      duration: "1 month",
      category: "Extended Sevas"
    },
    {
      id: 35,
      name: "Gow Daana (10 TP)",
      description: "Cow donation ceremony for ten people",
      time: "Morning (8:00 AM - 12:00 PM)",
      cost: "₹20,000",
      duration: "4 hours",
      category: "Special Sevas"
    },
    {
      id: 36,
      name: "Nutana Vastra Samarpane",
      description: "New clothes offering ceremony",
      time: "Morning (9:00 AM - 11:00 AM)",
      cost: "Contact Office",
      duration: "2 hours",
      category: "Special Sevas"
    },
    {
      id: 37,
      name: "Pratyeka Svayamvara Parvathi Homa",
      description: "Individual Svayamvara Parvathi fire ritual",
      time: "Morning (7:00 AM - 11:00 AM)",
      cost: "Contact Office",
      duration: "4 hours",
      category: "Special Sevas"
    },
    {
      id: 38,
      name: "Any other seva",
      description: "Custom seva as per devotee requirement",
      time: "Flexible timing",
      cost: "Contact Office",
      duration: "Variable",
      category: "Special Sevas"
    }
  ];

  const halls: Hall[] = [
    {
      id: 1,
      name: "Main Prayer Hall",
      description: "Primary worship space with traditional architecture",
      capacity: "200 people",
      cost: "₹5,000",
      features: ["Traditional Architecture", "Air Conditioning", "Audio System", "Stage", "Decorative Lighting"],
      category: "Prayer Halls"
    },
    {
      id: 2,
      name: "Abhisheka Hall",
      description: "Dedicated space for abhisheka ceremonies",
      capacity: "100 people",
      cost: "₹3,000",
      features: ["Marble Flooring", "Drainage System", "Sacred Water Supply", "Altar Space", "Seating Arrangement"],
      category: "Ceremony Halls"
    },
    {
      id: 3,
      name: "Homa Hall",
      description: "Fire ritual hall with proper ventilation",
      capacity: "50 people",
      cost: "₹2,500",
      features: ["Fire Safety System", "Ventilation", "Sacred Fire Pit", "Smoke Extraction", "Traditional Design"],
      category: "Ceremony Halls"
    },
    {
      id: 4,
      name: "Annadana Hall",
      description: "Dining hall for food offerings and meals",
      capacity: "150 people",
      cost: "₹2,000",
      features: ["Kitchen Facility", "Dining Tables", "Serving Area", "Cleaning Area", "Storage Space"],
      category: "Dining Halls"
    },
    {
      id: 5,
      name: "Community Hall",
      description: "Multi-purpose hall for events and gatherings",
      capacity: "300 people",
      cost: "₹4,000",
      features: ["Flexible Seating", "Projector", "Sound System", "Stage", "Parking Space"],
      category: "Event Halls"
    }
  ];

  const filteredSevas = sevas.filter(seva => {
    const matchesSearch = seva.name.toLowerCase().includes(sevaSearch.toLowerCase()) || 
                          seva.description.toLowerCase().includes(sevaSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || seva.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const handleBookSeva = (seva: Seva) => {
    if (!isAdmin) {
      alert('Only administrators can book sevas. Please contact the temple office for booking.');
      return;
    }
    setSelectedSeva(seva);
    setShowBookingForm(true);
    setTirthaPrasadaRequired(false);
  };

  const handleBookHall = (hall: Hall) => {
    if (!isAdmin) {
      alert('Only administrators can book halls. Please contact the temple office for booking.');
      return;
    }
    setSelectedHall(hall);
    setShowHallBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!isAdmin) {
      alert('Only administrators can submit bookings. Please contact the temple office for booking.');
      return;
    }
    
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('🔍 [DEBUG] handleBookingSubmit started');
      console.log('🔍 [DEBUG] selectedSeva:', selectedSeva);
      
      const formData = new FormData(e.currentTarget);
      console.log('🔍 [DEBUG] FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`🔍 [DEBUG]   ${key}: ${value}`);
      }
      
      // Generate booking ID first
      const bookingId = Date.now();
      console.log('🔍 [DEBUG] Generated booking ID:', bookingId);

      const bookingData = {
        id: bookingId,
        sevaName: selectedSeva?.name,
        devoteeName: formData.get('fullName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        date: formData.get('date') as string,
        time: selectedSeva?.time,
        numberOfPeople: formData.get('numberOfPeople') as string,
        gotra: formData.get('gotra') as string,
        nakshatra: formData.get('nakshatra') as string,
        hall: formData.get('hall') as string,
        tirthaPrasadaRequired: formData.get('tirthaPrasadaRequired') === 'yes',
        tirthaPrasadaCount: parseInt(formData.get('tirthaPrasadaCount') as string) || 0,
        lunchRequired: formData.get('tirthaPrasadaRequired') === 'yes',
        lunchCount: parseInt(formData.get('tirthaPrasadaCount') as string) || 0,
        lunchHall: (formData.get('tirthaPrasadaRequired') === 'yes') ? (formData.get('lunchHall') as string) : '',
        specialRequests: formData.get('specialRequests') as string,
        status: 'confirmed' as const,
        sevaCost: selectedSeva?.cost,
        lunchCost: (parseInt(formData.get('tirthaPrasadaCount') as string) || 0) * 250,
        totalCost: (() => {
          const sevaCostStr = selectedSeva?.cost || '₹0';
          const sevaCostNum = parseFloat(sevaCostStr.replace('₹', '').replace(',', '')) || 0;
          const tirthaCostNum = (parseInt(formData.get('tirthaPrasadaCount') as string) || 0) * 250;
          return sevaCostNum + tirthaCostNum;
        })(),
        qrCode: bookingId.toString(), // Use booking ID as QR data
        createdAt: new Date().toISOString()
      };

      console.log('🔍 [DEBUG] Created bookingData:', bookingData);

      // 1. We no longer save to localStorage, it's deprecated.

      // 2. Save to Google Sheets / Supabase DB via API
      try {
        console.log('🔍 [DEBUG] Syncing booking to Google Sheets...');
        const sheetsResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking: bookingData }),
        });
        const sheetsData = await sheetsResponse.json();
        if (sheetsData.success) {
          console.log('✅ Booking synced to Google Sheets successfully');
        } else {
          console.error('❌ Google Sheets sync failed:', sheetsData.message);
        }
      } catch (err: any) {
        console.error('❌ Error calling Google Sheets API:', err.message);
      }


      // Send email with QR code
      try {
        console.log('🔍 [DEBUG] Starting email sending process...');
        const emailSent = await sendBookingEmail(bookingData);
        console.log('🔍 [DEBUG] Email sending result:', emailSent);

        if (emailSent) {
          console.log('🔍 [DEBUG] Email sent successfully, showing success message');
          alert(`Booking submitted for ${selectedSeva?.name}! Your booking ID is ${bookingData.id}. Confirmation email sent successfully.`);
        } else {
          console.log('🔍 [DEBUG] Email failed, showing fallback message');
          alert(`Booking submitted for ${selectedSeva?.name}! Your booking ID is ${bookingData.id}. Email sending failed, but booking is saved.`);
        }
      } catch (error: any) {
        console.error('Error sending email:', error);
        const errMessage = error?.text || error?.message || 'Unknown EmailJS error';
        alert(`Booking submitted for ${selectedSeva?.name}! Your booking ID is ${bookingData.id}. Email sending failed (Reason: ${errMessage}). Please verify your EmailJS keys.`);
      }
    } catch (error) {
      console.error('Error in booking submission:', error);
      alert('An error occurred while submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowBookingForm(false);
      setSelectedSeva(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">Seva & Hall Booking</h1>
          <p className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-8 px-4">
            Participate in divine service and book halls for events and ceremonies
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center space-x-2 md:space-x-4 px-4">
            <button
              onClick={() => setActiveTab('seva')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                activeTab === 'seva'
                  ? 'bg-white text-orange-600'
                  : 'bg-orange-700 text-white hover:bg-orange-600'
              }`}
            >
              Book Seva
            </button>
            <button
              onClick={() => setActiveTab('hall')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                activeTab === 'hall'
                  ? 'bg-white text-orange-600'
                  : 'bg-orange-700 text-white hover:bg-orange-600'
              }`}
            >
              Book Hall
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Admin Notice */}
          {!isAuthenticated && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 md:p-6 mb-6 md:mb-8 rounded-lg">
              <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 mb-3 md:mb-0">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="md:ml-3">
                  <h3 className="text-base md:text-lg font-medium text-yellow-800">Admin Login Required for Booking</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Seva and hall bookings can only be made by authorized administrators. 
                      Please contact the temple office directly to make your booking.
                    </p>
                    <div className="mt-3 md:mt-4 bg-white rounded-lg p-3 md:p-4 border border-yellow-200">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">📞 Temple Office Contact:</h4>
                      <div className="space-y-1 text-xs md:text-sm text-gray-600">
                        <p>Phone: +91-XXXXXXXXXX</p>
                        <p>Email: info@vidyaranyapuramutt.org</p>
                        <p>Address: Mathaji Ulsooramma Raghavendra Swamy Mutt, Vidyaranyapura, Bangalore</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && !isAdmin && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 md:p-6 mb-6 md:mb-8 rounded-lg">
              <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 mb-3 md:mb-0">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="md:ml-3">
                  <h3 className="text-base md:text-lg font-medium text-red-800">Access Denied</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Your account does not have administrator privileges for booking. 
                      Only administrators can make seva and hall bookings.
                    </p>
                    <div className="mt-3 md:mt-4 bg-white rounded-lg p-3 md:p-4 border border-red-200">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">📞 Temple Office Contact:</h4>
                      <div className="space-y-1 text-xs md:text-sm text-gray-600">
                        <p>Phone: +91-XXXXXXXXXX</p>
                        <p>Email: info@vidyaranyapuramutt.org</p>
                        <p>Address: Mathaji Ulsooramma Raghavendra Swamy Mutt, Vidyaranyapura, Bangalore</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
              {activeTab === 'seva' ? 'Divine Services' : 'Hall Booking'}
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              {activeTab === 'seva' 
                ? 'Seva (service) is a sacred opportunity to participate in divine activities and earn spiritual merit. Our mutt offers various forms of seva that allow devotees to contribute to the maintenance of religious traditions and receive blessings. All sevas are performed with devotion and precision.'
                : 'Book our well-equipped halls for your events, ceremonies, and gatherings. We offer various halls with different capacities and facilities to suit your needs. All halls are maintained with traditional values and modern amenities.'
              }
            </p>
          </div>

          {/* Conditional Content */}
          {activeTab === 'seva' ? (
            /* Sevas Grid */
            <>
              {/* Seva Filters & Search */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-slate-700/50 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={sevaSearch}
                    onChange={(e) => setSevaSearch(e.target.value)}
                    placeholder="Search sevas by name or description..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-slate-900 shadow-inner text-sm transition-all text-gray-850 dark:text-gray-100"
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-wider text-black ${
                        selectedCategory === cat
                          ? 'bg-orange-600 shadow-md'
                          : 'bg-gray-100 dark:bg-slate-200 hover:bg-orange-100 dark:hover:bg-orange-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              </div>

              {filteredSevas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  {filteredSevas.map((seva) => (
                    <div key={seva.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 md:p-8 flex flex-col h-full card relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3">{seva.name}</h3>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 flex-grow">{seva.description}</p>
                      <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
                        <p className="flex justify-between items-center"><strong className="text-gray-700 dark:text-gray-300">Time:</strong> <span>{seva.time}</span></p>
                        <p className="flex justify-between items-center"><strong className="text-gray-700 dark:text-gray-300">Duration:</strong> <span>{seva.duration}</span></p>
                        <p className="flex justify-between items-center"><strong className="text-gray-700 dark:text-gray-300">Cost:</strong> <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">{seva.cost}</span></p>
                      </div>
                      <button
                        onClick={() => isAdmin ? handleBookSeva(seva) : null}
                        className={`mt-auto w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 touch-target text-sm md:text-base shadow-md ${
                          isAdmin 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:-translate-y-0.5' 
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isAdmin}
                      >
                        {isAdmin ? 'Book Seva' : 'Contact Office to Book'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-150 dark:border-slate-700/60 shadow-md">
                  <div className="text-5xl mb-4">🔎</div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white">No sevas match your query</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">Try modifying your search keywords or resetting the category filter.</p>
                  <button 
                    onClick={() => { setSevaSearch(''); setSelectedCategory('All'); }}
                    className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-md text-sm uppercase tracking-wider"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          ) : (

            /* Halls Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {halls.map((hall) => (
                <div key={hall.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 md:p-8 flex flex-col h-full card relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3">{hall.name}</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 flex-grow">{hall.description}</p>
                  <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="flex justify-between items-center"><strong className="text-gray-700 dark:text-gray-300">Capacity:</strong> <span>{hall.capacity}</span></p>
                    <p className="flex justify-between items-center"><strong className="text-gray-700 dark:text-gray-300">Cost:</strong> <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">{hall.cost}</span></p>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <strong className="text-gray-700 dark:text-gray-300 mb-2 block">Features:</strong>
                      <ul className="grid grid-cols-2 gap-2 text-xs">
                        {hall.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => isAdmin ? handleBookHall(hall) : null}
                    className={`mt-auto w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 touch-target text-sm md:text-base shadow-md ${
                      isAdmin 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:-translate-y-0.5' 
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!isAdmin}
                  >
                    {isAdmin ? 'Book Hall' : 'Contact Office to Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedSeva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 modal-content">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Book {selectedSeva.name}</h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBookingSubmit(e);
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Preferred Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Number of People</label>
                  <select name="numberOfPeople" className="w-full px-3 py-2 border border-black-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5+ People</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Gotra (Family Lineage)</label>
                  <input
                    type="text"
                    name="gotra"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your gotra (e.g., Kashyapa, Bharadwaja)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Nakshatra (Birth Star)</label>
                  <select name="nakshatra" required className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select your nakshatra</option>
                    <option value="Ashwini">Ashwini</option>
                    <option value="Bharani">Bharani</option>
                    <option value="Krittika">Krittika</option>
                    <option value="Rohini">Rohini</option>
                    <option value="Mrigashira">Mrigashira</option>
                    <option value="Ardra">Ardra</option>
                    <option value="Punarvasu">Punarvasu</option>
                    <option value="Pushya">Pushya</option>
                    <option value="Ashlesha">Ashlesha</option>
                    <option value="Magha">Magha</option>
                    <option value="Purva Phalguni">Purva Phalguni</option>
                    <option value="Uttara Phalguni">Uttara Phalguni</option>
                    <option value="Hasta">Hasta</option>
                    <option value="Chitra">Chitra</option>
                    <option value="Swati">Swati</option>
                    <option value="Vishakha">Vishakha</option>
                    <option value="Anuradha">Anuradha</option>
                    <option value="Jyeshtha">Jyeshtha</option>
                    <option value="Mula">Mula</option>
                    <option value="Purva Ashadha">Purva Ashadha</option>
                    <option value="Uttara Ashadha">Uttara Ashadha</option>
                    <option value="Shravana">Shravana</option>
                    <option value="Dhanishta">Dhanishta</option>
                    <option value="Shatabhisha">Shatabhisha</option>
                    <option value="Purva Bhadrapada">Purva Bhadrapada</option>
                    <option value="Uttara Bhadrapada">Uttara Bhadrapada</option>
                    <option value="Revati">Revati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Hall Location</label>
                  <select name="hall" required className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value=""disabled>Select hall location</option>
                    <option value="Main Prayer Hall">Main Prayer Hall</option>
                    <option value="Abhisheka Hall">Abhisheka Hall</option>
                    <option value="Homa Hall">Homa Hall</option>
                    <option value="Annadana Hall">Annadana Hall</option>
                    <option value="Goshala Area">Goshala Area</option>
                    <option value="Temple Courtyard">Temple Courtyard</option>
                    <option value="Administrative Office">Administrative Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Do you require Tirtha Prasada?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tirthaPrasadaRequired"
                        value="yes"
                        checked={tirthaPrasadaRequired === true}
                        onChange={() => setTirthaPrasadaRequired(true)}
                        className="mr-2"
                      />
                      <span className="text-black">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tirthaPrasadaRequired"
                        value="no"
                        checked={tirthaPrasadaRequired === false}
                        onChange={() => {
                          setTirthaPrasadaRequired(false);
                          setTirthaPrasadaCount(0);
                        }}
                        className="mr-2"
                      />
                      <span className="text-black">No</span>
                    </label>
                  </div>
                </div>

                {tirthaPrasadaRequired && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">How many people will have Tirtha Prasada? (₹250 per person)</label>
                    <input
                      type="number"
                      name="tirthaPrasadaCount"
                      min="1"
                      max="50"
                      value={tirthaPrasadaCount}
                      onChange={(e) => setTirthaPrasadaCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter number of people"
                      required
                    />
                    {tirthaPrasadaCount > 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        Tirtha Prasada cost: ₹{tirthaPrasadaCount * 250} ({tirthaPrasadaCount} × ₹250)
                      </p>
                    )}
                  </div>
                )}

                {tirthaPrasadaRequired && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Tirtha Prasada Hall Location</label>
                    <select name="lunchHall" defaultValue="" className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="" disabled>Select Tirtha Prasada hall location</option>
                      <option value="Main Prayer Hall">Main Prayer Hall</option>
                      <option value="Abhisheka Hall">Abhisheka Hall</option>
                      <option value="Homa Hall">Homa Hall</option>
                      <option value="Annadana Hall">Annadana Hall</option>
                      <option value="Community Hall">Community Hall</option>
                    </select>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Seva Cost:</span>
                      <span className="text-orange-600 font-bold">{selectedSeva?.cost || '0'}</span>
                    </div>
                    {tirthaPrasadaCount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-black">Tirtha Prasada Cost ({tirthaPrasadaCount} × ₹250):</span>
                        <span className="text-orange-600 font-bold">₹{tirthaPrasadaCount * 250}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-bold text-black">Total Cost:</span>
                      <span className="text-orange-600 font-bold text-lg">₹{(parseFloat(selectedSeva?.cost?.replace('₹', '') || '0') || 0) + (tirthaPrasadaCount * 250)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-black mt-2">Payment will be collected at the temple</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hall Booking Modal */}
      {showHallBookingForm && selectedHall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 modal-content">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Book {selectedHall.name}</h3>
                <button
                  onClick={() => setShowHallBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form 
                onSubmit={handleBookingSubmit} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Event Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Event Type</label>
                  <select name="eventType" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select event type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Religious Ceremony">Religious Ceremony</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Number of People</label>
                  <select name="numberOfPeople" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select number of people</option>
                    <option value="1-50">1-50 People</option>
                    <option value="51-100">51-100 People</option>
                    <option value="101-150">101-150 People</option>
                    <option value="151-200">151-200 People</option>
                    <option value="200+">200+ People</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Event Description</label>
                  <textarea
                    name="eventDescription"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe your event requirements"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-black">Hall Cost:</span>
                    <span className="text-orange-600 font-bold">{selectedHall.cost}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-black">Capacity:</span>
                    <span className="text-gray-600">{selectedHall.capacity}</span>
                  </div>
                  <p className="text-sm text-black">Payment will be collected at the temple office</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Hall Booking Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
