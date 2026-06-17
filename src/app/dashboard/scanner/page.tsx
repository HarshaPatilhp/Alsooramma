"use client";

import { useState, useEffect, useRef } from 'react';
import { QrCode, X, CheckCircle, AlertCircle } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { createClient } from '@/lib/client';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ status: 'idle' | 'success' | 'error', message: string, data?: any }>({ status: 'idle', message: '' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
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
    // Stop scanning immediately to prevent duplicate scans
    setIsScanning(false);
    
    const supabase = createClient();
    const { data: dbDetails, error } = await supabase.from('bookings').select('*').eq('id', data).single();

    if (dbDetails && !error) {
      const details = {
         id: dbDetails.id,
         devoteeName: dbDetails.devotee_name,
         sevaName: dbDetails.seva_name,
         status: dbDetails.status,
         gotra: dbDetails.gotra,
         date: dbDetails.date,
         tirthaPrasadaCount: dbDetails.tirtha_prasada_count || 0,
         devoteeCategory: '',
         redirectHall: ''
      };

      if (details.status === 'completed') {
        setScanResult({ 
          status: 'error', 
          message: 'Oops! Sorry, this QR code has already been claimed.' 
        });
        return;
      }

      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
      if (details.date && details.date !== today) {
        setScanResult({
          status: 'error',
          message: `Booking rejected. The event is scheduled for ${details.date}, not today.`
        });
        return;
      }

      // 1. Update Booking Status via API
      fetch('/api/bookings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: data, status: 'completed' }),
      }).catch((apiErr: any) => {
        console.error('Failed to sync check-in status:', apiErr.message);
      });

      // 2. Add to scan history in Supabase
      const newScan = {
        id: Date.now().toString(),
        booking_id: details.id,
        scanned_at: new Date().toLocaleString('en-IN'),
        status: 'Verified',
        scanned_by: 'System / Scanner'
      };
      
      await supabase.from('scan_history').insert([newScan]);

      const gotra = String(details.gotra || '').toLowerCase().trim();
      const brahminGotras = [
        'kashyapa', 'kasyapa', 'bharadwaja', 'bhardwaj', 'vasishta', 'vashishta', 'vishwamitra',
        'gautama', 'jamadagni', 'atri', 'agastya', 'kaundinya', 'koundinya', 'srivatsa', 'shrivatsa',
        'harita', 'haritha', 'gargya', 'sandilya', 'shandilya', 'mudgala', 'naidhruva',
        'bhargava', 'kamakayana', 'visvamitra', 'vatsa'
      ];
      
      const isBrahmin = brahminGotras.some(bg => gotra.includes(bg));
      
      let devoteeCategory = "Non-Brahmin";
      let redirectHall = "General Dining / Main Hall";
      
      if (gotra && isBrahmin) {
        devoteeCategory = "Brahmin";
        redirectHall = "Bhojana Shale (Special Hall)";
      } else if (gotra) {
        devoteeCategory = "Non-Brahmin";
        redirectHall = "Annapurna Hall (General Dining)";
      } else {
        devoteeCategory = "Unknown";
        redirectHall = "Enquiry Counter";
      }

      // Attach to details
      details.devoteeCategory = devoteeCategory;
      details.redirectHall = redirectHall;

      setScanResult({ 
        status: 'success', 
        message: 'Devotee Verified!', 
        data: details 
      });
    } else {
      setScanResult({ 
        status: 'error', 
        message: 'Invalid QR Code or Booking not found in database.' 
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent inline-block">LIVE Check-in Module</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 px-4">Position the devotee's QR code within the frame to verify their seva booking.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-6 shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden relative">
        {/* Scanner Viewport */}
        <div className={`relative bg-black rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-video w-full flex items-center justify-center transition-all ${isScanning ? 'ring-2 sm:ring-4 ring-orange-500/50' : ''}`}>
          
          {isScanning && (
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {!isScanning && scanResult.status === 'idle' && (
            <div className="text-center p-8 z-10">
              <div className="w-20 h-20 bg-orange-100/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                <QrCode size={40} className="text-orange-400" />
              </div>
              <h3 className="text-white text-xl font-medium mb-6">Camera is sleeping</h3>
              <button 
                onClick={startScan}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold tracking-wide transition-all hover:scale-105 shadow-[0_0_20px_rgba(5,150,105,0.4)]"
              >
                Scan Target
              </button>
            </div>
          )}

          {isScanning && (
            <>
              {/* Animated scanning bar */}
              <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex justify-center items-center">
                <div className="w-[80%] h-[80%] sm:w-[70%] sm:h-[70%] border border-orange-500/20 rounded-2xl relative bg-orange-500/[0.02]">
                  {/* Laser line using our global animation */}
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-scan" />
                  
                  {/* Thick Neon Corner Brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl -mt-1 -ml-1 shadow-[-2px_-2px_10px_-2px_rgba(249,115,22,0.4)]" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl -mt-1 -mr-1 shadow-[2px_-2px_10px_-2px_rgba(249,115,22,0.4)]" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl -mb-1 -ml-1 shadow-[-2px_2px_10px_-2px_rgba(249,115,22,0.4)]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl -mb-1 -mr-1 shadow-[2px_2px_10px_-2px_rgba(249,115,22,0.4)]" />
                </div>
              </div>
            </>
          )}

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
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Seat/Date Info</p>
                        <p className="text-white font-semibold text-sm">{scanResult.data?.date || 'N/A'}</p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-2 mb-0.5 font-bold">Tirtha Prasada</p>
                        <p className="text-white font-semibold text-sm">{scanResult.data?.tirthaPrasadaCount || 0} People</p>
                      </div>
                    </div>

                    {/* REDIRECTION ALERT BOX */}
                    <div className="mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-orange-950 p-4 rounded-xl border border-amber-400/20 shadow-md">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-amber-950/80 mb-0.5">Dining Redirect Location</p>
                      <p className="font-extrabold text-base flex items-center gap-1.5 animate-pulse">
                        <span>📍</span> {scanResult.data?.redirectHall}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={startScan}
                    className="mt-6 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-orange-600/20 shrink-0 uppercase text-xs tracking-wider"
                  >
                    Scan Next Devotee
                  </button>
               </div>
             </div>
          )}

          {scanResult.status === 'error' && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md animate-fade-in">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                  <AlertCircle size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Scan Failed</h2>
              <p className="text-red-200 text-sm mb-6 max-w-xs">{scanResult.message}</p>
              <button 
                  onClick={startScan}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg uppercase text-xs tracking-wider"
                >
                  Try Again
              </button>
            </div>
          )}
        </div>

        {/* Status indicator bar underneath */}
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
              className="text-gray-500 hover:text-red-500 flex items-center gap-1 font-medium bg-gray-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={16} /> Stop Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
