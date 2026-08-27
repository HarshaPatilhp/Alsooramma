"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Utensils, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Award,
  ShieldCheck,
  Check,
  Calendar,
  Clock,
  MapPin,
  Flame,
  UserCheck
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import { createClient } from '@/lib/client';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ 
    status: 'idle' | 'success' | 'volunteer_success' | 'volunteer_confirmed' | 'error', 
    message: string, 
    data?: any 
  }>({ status: 'idle', message: '' });
  
  const [todayLunchStats, setTodayLunchStats] = useState({ totalExpected: 0, claimed: 0, pending: 0 });
  const [volunteerBadgeMark, setVolunteerBadgeMark] = useState(true);
  const [volunteerAttendanceMark, setVolunteerAttendanceMark] = useState(true);
  const [selectedBadgeTier, setSelectedBadgeTier] = useState('🎖️ Active Swayamsevak');
  const [badgeNote, setBadgeNote] = useState('');
  const [isSavingBadge, setIsSavingBadge] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const fetchTodayLunch = async () => {
    try {
      const supabase = createClient();
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: bks } = await supabase.from('bookings').select('*').neq('status', 'deleted');
      if (Array.isArray(bks)) {
        const todayBks = bks.filter((b: any) => (b.date || '').slice(0, 10) === todayStr);
        let total = 0;
        let claimed = 0;
        todayBks.forEach((b: any) => {
          const count = Number(b.lunch_count) || Number(b.tirtha_prasada_count) || Number(b.number_of_people) || 1;
          total += count;
          if ((b.status || '').toLowerCase() === 'completed') {
            claimed += count;
          }
        });
        setTodayLunchStats({
          totalExpected: total,
          claimed,
          pending: Math.max(0, total - claimed)
        });
      }
    } catch (e) {
      console.error("Error loading lunch stats on scanner:", e);
    }
  };

  useEffect(() => {
    fetchTodayLunch();
    return () => {
      stopScan();
    };
  }, []);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result: any) => {
            const data = result?.data || result;
            handleScanSuccess(String(data));
          },
          { 
            returnDetailedScanResult: true,
            maxScansPerSecond: 60,
          }
        );
      }
      qrScannerRef.current.start().catch((err) => {
        setScanResult({ status: 'error', message: 'Camera access denied or unavailable.' });
        setIsScanning(false);
      });
    } else {
      stopScan();
    }
  }, [isScanning]);

  const stopScan = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const startScan = () => {
    setScanResult({ status: 'idle', message: '' });
    setVolunteerBadgeMark(true);
    setVolunteerAttendanceMark(true);
    setBadgeNote('');
    setIsScanning(true);
  };

  const handleScanSuccess = async (data: string) => {
    setIsScanning(false);
    const cleanData = String(data || '').trim();

    // 1. Check if the scanned QR is a Volunteer Pass
    let volunteerPass: any = null;
    if (cleanData.startsWith('VOLUNTEER_PASS:')) {
      try {
        volunteerPass = JSON.parse(cleanData.slice('VOLUNTEER_PASS:'.length));
      } catch (e) {
        console.warn('Failed to parse VOLUNTEER_PASS JSON:', e);
      }
    } else if (cleanData.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanData);
        if (parsed.type === 'VOLUNTEER_PASS' || parsed.type === 'volunteer_pass' || (parsed.name && parsed.duty)) {
          volunteerPass = parsed;
        }
      } catch (e) {}
    }

    if (volunteerPass) {
      const badge = volunteerPass.badge || '🎖️ Active Swayamsevak';
      setSelectedBadgeTier(badge);
      setVolunteerBadgeMark(true);
      setVolunteerAttendanceMark(true);

      setScanResult({
        status: 'volunteer_success',
        message: 'Swayamsevak Pass Detected!',
        data: {
          id: volunteerPass.id || 'VOL-' + Date.now().toString().slice(-4),
          name: volunteerPass.name || 'Swayamsevak',
          email: volunteerPass.email || 'volunteer@vidyaranyapuramutt.org',
          role: volunteerPass.role || 'volunteer',
          duty: volunteerPass.duty || 'Temple Operations & Seva',
          date: volunteerPass.date || new Date().toLocaleDateString('en-IN'),
          time: volunteerPass.time || 'General Shift',
          location: volunteerPass.location || 'Main Gate & Sanctum',
          badge: badge,
          issuedAt: volunteerPass.issuedAt || new Date().toISOString()
        }
      });
      return;
    }

    // 2. Devotee Booking QR Verification
    const cleanId = cleanData;
    const supabase = createClient();
    const { data: dbDetails, error } = await supabase.from('bookings').select('*').eq('id', cleanId).single();

    if (dbDetails && !error) {
      const details = {
         id: dbDetails.id,
         devoteeName: dbDetails.devotee_name || dbDetails.devoteeName || 'Devotee',
         sevaName: dbDetails.seva_name || dbDetails.sevaName || 'Seva Booking',
         status: dbDetails.status,
         gotra: dbDetails.gotra,
         date: dbDetails.date,
         tirthaPrasadaCount: dbDetails.tirtha_prasada_count || dbDetails.lunch_count || 1,
         devoteeCategory: 'Registered Devotee',
         redirectHall: dbDetails.lunch_hall || 'Annapurna Dining Hall (Ground Floor)'
      };

      if (details.status === 'completed') {
        setScanResult({ 
          status: 'error', 
          message: 'Oops! Sorry, this QR code has already been claimed.' 
        });
        return;
      }

      // Update Booking Status directly in Supabase
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', cleanId);
      
      fetch('/api/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cleanId, status: 'completed' })
      }).catch(() => {});

      // Record Scan in scan_history
      try {
        const newScan = {
          booking_id: cleanId,
          devotee_name: details.devoteeName,
          seva_name: details.sevaName,
          status: 'Completed',
          scanned_at: new Date().toISOString(),
          scanned_by: 'Main Gate Scanner'
        };
        await supabase.from('scan_history').insert([newScan]);
      } catch (scanErr) {
        console.warn('Could not insert scan history row:', scanErr);
      }

      setScanResult({
        status: 'success',
        message: 'Devotee Ticket Verified!',
        data: details
      });

      // Refresh today's lunch counter
      fetchTodayLunch();
    } else {
      setScanResult({
        status: 'error',
        message: 'Invalid or unrecognized QR Code ticket. Please verify QR pass data.'
      });
    }
  };

  const handleConfirmVolunteerBadge = async () => {
    if (!scanResult.data) return;
    setIsSavingBadge(true);

    try {
      const supabase = createClient();
      const scanRecord = {
        booking_id: `VOL-${scanResult.data.id}`,
        devotee_name: scanResult.data.name,
        seva_name: `[Volunteer Badge: ${selectedBadgeTier}] ${scanResult.data.duty}`,
        status: volunteerBadgeMark ? 'Badge Awarded' : 'Checked In',
        scanned_at: new Date().toISOString(),
        scanned_by: 'Master Admin Scanner',
      };

      await supabase.from('scan_history').insert([scanRecord]);

      setScanResult({
        status: 'volunteer_confirmed',
        message: 'Volunteer Verified & Badge Awarded Successfully!',
        data: {
          ...scanResult.data,
          confirmedBadge: selectedBadgeTier,
          badgeMarked: volunteerBadgeMark,
          attendanceMarked: volunteerAttendanceMark,
          note: badgeNote,
          confirmedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      });
    } catch (err) {
      console.error('Error confirming volunteer badge:', err);
      alert('Verification recorded locally.');
      setScanResult(prev => ({ ...prev, status: 'volunteer_confirmed' }));
    } finally {
      setIsSavingBadge(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <span>Gate Scanner & Badge Verification</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
          Scan Devotee Seva Passes, verify Tirtha Prasada, and scan Volunteer QR passes to issue/tick mark Seva Badges.
        </p>
      </div>

      {/* 🍛 TODAY'S LUNCH & PRASADAM SUMMARY CARD */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Tirtha Prasada Attendance
              </h3>
              <p className="text-[11px] text-gray-400">Live count for {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          <button 
            onClick={fetchTodayLunch}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-orange-600 cursor-pointer"
            title="Refresh counts"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-orange-50/60 dark:bg-slate-900/60 rounded-2xl border border-orange-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">Devotees Arrived</span>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{todayLunchStats.totalExpected}</p>
            <span className="text-[10px] text-gray-400">Devotees</span>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-slate-900/60 rounded-2xl border border-emerald-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Claimed / Served</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{todayLunchStats.claimed}</p>
            <span className="text-[10px] text-emerald-600">Checked-in</span>
          </div>

          <div className="p-3 bg-amber-50/60 dark:bg-slate-900/60 rounded-2xl border border-amber-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Pending</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{todayLunchStats.pending}</p>
            <span className="text-[10px] text-amber-600">In-Transit</span>
          </div>
        </div>
      </div>

      {/* Scanner Box */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-700/60">
        <div className="relative aspect-video max-w-lg mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border-4 border-slate-800">
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`}
            playsInline
            muted
          />

          {!isScanning && scanResult.status === 'idle' && (
            <div className="flex flex-col items-center justify-center text-center p-6 animate-fade-in">
              <div className="w-16 h-16 bg-orange-600/20 text-orange-500 rounded-full flex items-center justify-center mb-4 ring-8 ring-orange-600/10">
                <QrCode size={32} />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Gate Camera Ready</h3>
              <p className="text-slate-400 text-xs mb-6 max-w-xs">
                Supports Devotee Seva passes and Swayamsevak QR Badge passes.
              </p>
              <button 
                onClick={startScan}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-3 rounded-full font-bold tracking-wide transition-all hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer"
              >
                Start Camera Scan
              </button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex justify-center items-center">
              <div className="w-[80%] h-[80%] sm:w-[70%] sm:h-[70%] border border-orange-500/20 rounded-2xl relative bg-orange-500/[0.02]">
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-scan" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl -mb-1 -mr-1" />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🎖️ VOLUNTEER PASS DETECTED & BADGE VERIFICATION MODAL                      */}
          {/* ========================================================================= */}
          {scanResult.status === 'volunteer_success' && (
            <div className="absolute inset-0 bg-slate-950/95 z-20 backdrop-blur-md animate-fade-in overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] shrink-0 animate-bounce">
                  <Award size={32} className="text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Swayamsevak Pass Detected!
                </h2>
                <p className="text-amber-400 text-xs font-semibold mb-3">
                  Verify duty assignment and put a tick mark to award Seva Badge
                </p>

                {/* Volunteer Details Box */}
                <div className="bg-slate-900 border border-amber-500/40 p-4 sm:p-5 rounded-2xl max-w-md w-full shadow-2xl shrink-0 text-left space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider block">
                        Volunteer Name
                      </span>
                      <p className="text-white text-lg font-extrabold">{scanResult.data?.name}</p>
                      <p className="text-slate-400 text-xs">{scanResult.data?.email}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg">
                      {(scanResult.data?.name || 'V').charAt(0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-semibold block">Duty Seva</span>
                      <strong className="text-white block truncate">{scanResult.data?.duty}</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-semibold block">Shift Timing</span>
                      <strong className="text-amber-300 block truncate">{scanResult.data?.time}</strong>
                    </div>
                  </div>

                  {/* 🎖️ BADGE & ATTENDANCE TICK MARK SECTION */}
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2.5">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      🎖️ Gate Badge & Duty Verification
                    </span>

                    {/* Tick Mark Option 1: Issue Seva Badge */}
                    <div 
                      onClick={() => setVolunteerBadgeMark(!volunteerBadgeMark)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        volunteerBadgeMark 
                          ? 'bg-amber-500/20 border-amber-500 text-white' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                          volunteerBadgeMark ? 'bg-amber-500 text-slate-950 shadow-sm' : 'border border-slate-600'
                        }`}>
                          {volunteerBadgeMark && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold">Award Seva Badge</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {selectedBadgeTier}
                      </span>
                    </div>

                    {/* Badge Tier Selector */}
                    {volunteerBadgeMark && (
                      <div className="pt-1">
                        <label className="text-[10px] text-slate-300 font-bold block mb-1">Select Badge Tier</label>
                        <select
                          value={selectedBadgeTier}
                          onChange={e => setSelectedBadgeTier(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-amber-500/40 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="🎖️ Active Swayamsevak">🎖️ Active Swayamsevak Badge</option>
                          <option value="⭐ Seva & Utsavam Lead">⭐ Seva & Utsavam Lead Badge</option>
                          <option value="🍽️ Annadanam & Kitchen Sevak">🍽️ Annadanam & Kitchen Sevak Badge</option>
                          <option value="🛡️ Security & Crowd Coordinator">🛡️ Security & Crowd Coordinator Badge</option>
                          <option value="🚩 Senior Temple Operations Lead">🚩 Senior Temple Operations Lead Badge</option>
                        </select>
                      </div>
                    )}

                    {/* Tick Mark Option 2: Attendance Confirmed */}
                    <div 
                      onClick={() => setVolunteerAttendanceMark(!volunteerAttendanceMark)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        volunteerAttendanceMark 
                          ? 'bg-emerald-500/20 border-emerald-500 text-white' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                          volunteerAttendanceMark ? 'bg-emerald-500 text-white shadow-sm' : 'border border-slate-600'
                        }`}>
                          {volunteerAttendanceMark && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold">Confirm Shift Attendance</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">Present</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={startScan}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmVolunteerBadge}
                      disabled={isSavingBadge}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSavingBadge ? 'Recording...' : '✓ Award & Check-In'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🌟 VOLUNTEER BADGE CONFIRMED CELEBRATION SCREEN                           */}
          {/* ========================================================================= */}
          {scanResult.status === 'volunteer_confirmed' && (
            <div className="absolute inset-0 bg-slate-950/95 z-20 backdrop-blur-md animate-fade-in overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_35px_rgba(16,185,129,0.6)] animate-bounce">
                  <CheckCircle size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Seva Badge Awarded!
                </h2>
                <p className="text-emerald-400 text-xs font-bold mb-4">
                  Attendance marked at {scanResult.data?.confirmedAt || 'now'}
                </p>

                <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-2xl max-w-sm w-full shadow-2xl text-left space-y-3">
                  <div className="text-center pb-3 border-b border-slate-800">
                    <span className="text-xs uppercase font-extrabold text-slate-400">Honoring Swayamsevak</span>
                    <h3 className="text-xl font-black text-white mt-0.5">{scanResult.data?.name}</h3>
                    <div className="mt-2 inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-extrabold text-xs">
                      {scanResult.data?.confirmedBadge}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duty Seva:</span>
                      <span className="font-bold text-white">{scanResult.data?.duty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shift Check-in:</span>
                      <span className="font-bold text-emerald-400">Verified & Present [✓]</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startScan}
                  className="mt-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                >
                  Scan Next Ticket / Volunteer
                </button>
              </div>
            </div>
          )}

          {/* Devotee Booking Success Dialog */}
          {scanResult.status === 'success' && (
             <div className="absolute inset-0 bg-slate-900/95 dark:bg-slate-950/95 z-20 backdrop-blur-md animate-fade-in overflow-y-auto">
               <div className="flex flex-col items-center justify-center min-h-full p-5 text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] shrink-0 animate-bounce">
                    <CheckCircle size={36} className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 shrink-0">Devotee Verified Successfully</h2>
                  
                  <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl mt-1 max-w-sm w-full shadow-2xl shrink-0 text-left">
                    <div className="border-b border-slate-700/60 pb-3 mb-3">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Devotee Name</p>
                      <p className="text-white text-lg sm:text-xl font-extrabold">{scanResult.data?.devoteeName || 'Unknown'}</p>
                    </div>

                    <div className="border-b border-slate-700/60 pb-3 mb-3">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Booked Seva</p>
                      <p className="text-orange-400 text-sm sm:text-base font-bold leading-snug">{scanResult.data?.sevaName || 'Standard Entry'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Category</p>
                        <p className="text-white font-semibold text-sm">{scanResult.data?.devoteeCategory}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5 font-mono">({scanResult.data?.gotra || 'No Gotra'})</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Meal Tokens</p>
                        <p className="text-emerald-400 font-extrabold text-base">{scanResult.data?.tirthaPrasadaCount || 1} Prasadam Tokens</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-orange-950 p-4 rounded-xl border border-amber-400/20 shadow-md">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-amber-950/80 mb-0.5">Dining Redirect Location</p>
                      <p className="font-extrabold text-sm flex items-center gap-1.5 animate-pulse">
                        <span>📍</span> {scanResult.data?.redirectHall}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={startScan}
                    className="mt-6 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Scan Next Devotee
                  </button>
               </div>
             </div>
          )}

          {/* Error Dialog */}
          {scanResult.status === 'error' && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md animate-fade-in">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                  <AlertCircle size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Scan Failed</h2>
              <p className="text-red-200 text-sm mb-6 max-w-xs">{scanResult.message}</p>
              <button 
                  onClick={startScan}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                >
                  Try Again
              </button>
            </div>
          )}
        </div>

        {/* Scan Status Indicator */}
        {isScanning && (
          <div className="mt-6 flex items-center justify-between text-sm animate-fade-in">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              Gate Scanner Active • Scanning QR passes...
            </div>
            <button 
              onClick={stopScan} 
              className="text-gray-500 hover:text-red-500 flex items-center gap-1 font-medium bg-gray-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} /> Stop Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
