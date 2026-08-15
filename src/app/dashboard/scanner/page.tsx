"use client";

import { useState, useEffect, useRef } from 'react';
import { QrCode, X, CheckCircle, AlertCircle, Utensils, Users, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { createClient } from '@/lib/client';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ status: 'idle' | 'success' | 'error', message: string, data?: any }>({ status: 'idle', message: '' });
  const [todayLunchStats, setTodayLunchStats] = useState({ totalExpected: 0, claimed: 0, pending: 0 });
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
    setIsScanning(true);
  };

  const handleScanSuccess = async (data: string) => {
    setIsScanning(false);
    
    const cleanId = String(data || '').trim();
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
        message: 'Invalid or unrecognized QR Code ticket. Please verify booking ID manually.'
      });
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
          <span>Gate Scanner & Verification</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
          Scan devotee booking pass, verify Tirtha Prasada meal tokens, and direct to dining hall.
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
              <h3 className="text-white text-xl font-bold mb-6">Camera is ready</h3>
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

          {/* Success Dialog */}
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
              System Active • Awaiting code...
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
