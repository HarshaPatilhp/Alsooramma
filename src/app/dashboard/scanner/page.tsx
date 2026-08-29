"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
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
  UserCheck,
  Camera,
  Zap,
  RotateCw,
  Search,
  ChevronDown,
  Phone,
  Mail,
  Building,
  Download
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import { createClient } from '@/lib/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ScannerPage() {
  const { user } = useAuth();
  const scannerName = user?.name || (user?.role === 'admin' ? 'Master Admin' : 'Gate Mobile Scanner');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ 
    status: 'idle' | 'success' | 'volunteer_success' | 'volunteer_confirmed' | 'error', 
    message: string,
    isClaimed?: boolean,
    data?: any 
  }>({ status: 'idle', message: '' });
  
  const [todayLunchStats, setTodayLunchStats] = useState({ totalExpected: 0, claimed: 0, pending: 0 });
  const [volunteerBadgeMark, setVolunteerBadgeMark] = useState(true);
  const [volunteerAttendanceMark, setVolunteerAttendanceMark] = useState(true);
  const [selectedBadgeTier, setSelectedBadgeTier] = useState('🎖️ Active Swayamsevak');
  const [isSavingBadge, setIsSavingBadge] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const isCodeClaimedLocally = (codeKey: string): boolean => {
    try {
      const list = JSON.parse(localStorage.getItem('alsur_claimed_qr_codes') || '[]');
      return Array.isArray(list) && list.includes(codeKey);
    } catch (e) {
      return false;
    }
  };

  const markCodeAsClaimed = (codeKey: string) => {
    try {
      const list = JSON.parse(localStorage.getItem('alsur_claimed_qr_codes') || '[]');
      if (!list.includes(codeKey)) {
        list.push(codeKey);
        localStorage.setItem('alsur_claimed_qr_codes', JSON.stringify(list.slice(-1000)));
      }
    } catch (e) {}
  };

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
          if ((b.status || '').toLowerCase() === 'completed' || (b.status || '').toLowerCase() === 'claimed') {
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
            // Haptic vibration on mobile
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([80, 40, 80]);
            }
            handleScanSuccess(String(data));
          },
          { 
            returnDetailedScanResult: true,
            preferredCamera: 'environment', // Prefer Back Camera on phones
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 60,
          }
        );
      }
      qrScannerRef.current.start().then(() => {
        qrScannerRef.current?.hasFlash().then(has => setHasFlash(has)).catch(() => {});
      }).catch((err) => {
        console.error('Camera start error:', err);
        setScanResult({ status: 'error', message: 'Camera access denied or unavailable. Please check camera permissions in your browser.' });
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
      setFlashOn(false);
    }
  };

  const startScan = () => {
    setScanResult({ status: 'idle', message: '' });
    setVolunteerBadgeMark(true);
    setVolunteerAttendanceMark(true);
    setIsScanning(true);
  };

  const toggleTorch = async () => {
    if (qrScannerRef.current && hasFlash) {
      try {
        await qrScannerRef.current.toggleFlash();
        const isOn = await qrScannerRef.current.isFlashOn();
        setFlashOn(isOn);
      } catch (e) {
        console.warn('Torch toggle error:', e);
      }
    }
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
      const volId = String(volunteerPass.id || volunteerPass.email || `${volunteerPass.name}_${volunteerPass.duty}`);

      // Check 1: Has this volunteer pass already been claimed in localStorage?
      if (isCodeClaimedLocally(volId) || isCodeClaimedLocally(cleanData)) {
        setScanResult({
          status: 'error',
          isClaimed: true,
          message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
        });
        return;
      }

      // Check 2: Has this volunteer pass already been recorded in Supabase scan_history?
      const supabase = createClient();
      try {
        const { data: existingScans } = await supabase
          .from('scan_history')
          .select('id, booking_id, status')
          .or(`booking_id.eq.${volunteerPass.id || '0'},status.ilike.%${volunteerPass.name || '---'}%`)
          .limit(1);

        if (existingScans && existingScans.length > 0) {
          markCodeAsClaimed(volId);
          markCodeAsClaimed(cleanData);
          setScanResult({
            status: 'error',
            isClaimed: true,
            message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
          });
          return;
        }
      } catch (e) {}

      const badge = volunteerPass.badge || '🎖️ Active Swayamsevak';
      setSelectedBadgeTier(badge);
      setVolunteerBadgeMark(true);
      setVolunteerAttendanceMark(true);

      setScanResult({
        status: 'volunteer_success',
        message: 'Swayamsevak Pass Detected!',
        data: {
          id: volunteerPass.id || 'VOL-' + Date.now().toString().slice(-4),
          rawKey: volId,
          name: volunteerPass.name || volunteerPass.volunteer_name || 'Swayamsevak',
          email: volunteerPass.email || volunteerPass.to_email || 'volunteer@vidyaranyapuramutt.org',
          role: volunteerPass.role || 'volunteer',
          duty: volunteerPass.duty || volunteerPass.seva_title || 'Temple Operations & Seva',
          date: volunteerPass.date || volunteerPass.duty_date || new Date().toLocaleDateString('en-IN'),
          time: volunteerPass.time || volunteerPass.shift_timing || 'General Shift',
          location: volunteerPass.location || volunteerPass.assigned_location || 'Main Gate & Sanctum',
          badge: badge,
          issuedAt: volunteerPass.issuedAt || new Date().toISOString()
        }
      });
      return;
    }

    // 2. Devotee Booking QR Verification
    const cleanId = cleanData;
    const supabase = createClient();

    // Check 1: Is this QR code claimed in local storage?
    if (isCodeClaimedLocally(cleanId)) {
      setScanResult({
        status: 'error',
        isClaimed: true,
        message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
      });
      return;
    }

    // Check 2: Is this QR code recorded in Supabase scan_history?
    try {
      const { data: existingScans } = await supabase
        .from('scan_history')
        .select('id, booking_id')
        .eq('booking_id', cleanId)
        .limit(1);

      if (existingScans && existingScans.length > 0) {
        markCodeAsClaimed(cleanId);
        setScanResult({
          status: 'error',
          isClaimed: true,
          message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
        });
        return;
      }
    } catch (e) {}

    // Check 3: Query Supabase bookings table
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

      // If status is completed or claimed, reject 2nd scan
      if (details.status === 'completed' || details.status === 'claimed' || details.status === 'used') {
        markCodeAsClaimed(cleanId);
        setScanResult({ 
          status: 'error', 
          isClaimed: true,
          message: 'This QR code has already been claimed. Please contact admin for any discrepancies.' 
        });
        return;
      }

      // First time scan: Mark as claimed locally and update database
      markCodeAsClaimed(cleanId);

      // Update Booking Status directly in Supabase
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', cleanId);
      
      fetch('/api/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cleanId, status: 'completed' })
      }).catch(() => {});

      // Record Scan in scan_history & API with actual scanner name
      try {
        const newScan = {
          booking_id: cleanId,
          devotee_name: details.devoteeName,
          seva_name: details.sevaName,
          status: 'Completed',
          scanned_at: new Date().toISOString(),
          scanned_by: scannerName
        };
        await supabase.from('scan_history').insert([newScan]);
        fetch('/api/scan-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newScan)
        }).catch(() => {});
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
        isClaimed: false,
        message: 'Invalid or unrecognized QR Code ticket. Please verify QR pass data.'
      });
    }
  };

  const handleConfirmVolunteerBadge = async () => {
    if (!scanResult.data) return;
    setIsSavingBadge(true);

    try {
      const volKey = scanResult.data.rawKey || scanResult.data.id;
      markCodeAsClaimed(volKey);

      const numericId = Date.now();
      const statusStr = `VOLUNTEER_BADGE:${selectedBadgeTier} | ${scanResult.data.name} | ${scanResult.data.duty} | ${volunteerBadgeMark ? 'Badge Awarded' : 'Checked In'}`;
      
      const scanRecord = {
        id: String(numericId),
        booking_id: scanResult.data.id || numericId,
        status: statusStr,
        scanned_at: new Date().toLocaleString('en-IN'),
        scanned_by: scannerName,
      };

      // 1. Direct Supabase Database Insert
      try {
        const supabase = createClient();
        const { error: sbErr } = await supabase.from('scan_history').insert([scanRecord]);
        if (sbErr) console.warn('Supabase direct insert notice:', sbErr);
      } catch (sbErr) {
        console.warn('Supabase direct insert error:', sbErr);
      }

      // 2. Send to server API
      fetch('/api/scan-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanRecord)
      }).catch(() => {});

      // 3. LocalStorage persistence for instant client update
      try {
        const localList = JSON.parse(localStorage.getItem('alsur_scanned_volunteers') || '[]');
        const filtered = localList.filter((item: any) => item.id !== scanRecord.id);
        filtered.unshift(scanRecord);
        localStorage.setItem('alsur_scanned_volunteers', JSON.stringify(filtered.slice(0, 100)));
      } catch (lsErr) {}

      setScanResult({
        status: 'volunteer_confirmed',
        message: 'Volunteer Verified & Badge Awarded Successfully!',
        data: {
          ...scanResult.data,
          confirmedBadge: selectedBadgeTier,
          badgeMarked: volunteerBadgeMark,
          attendanceMarked: volunteerAttendanceMark,
          confirmedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      });
    } catch (err) {
      console.error('Error confirming volunteer badge:', err);
      setScanResult(prev => ({ ...prev, status: 'volunteer_confirmed' }));
    } finally {
      setIsSavingBadge(false);
    }
  };

  const handleExportScannedCSV = async () => {
    try {
      const supabase = createClient();
      const { data: dbRows } = await supabase.from('scan_history').select('*').order('created_at', { ascending: false });
      const localRows = JSON.parse(localStorage.getItem('alsur_scanned_volunteers') || '[]');
      
      const combined = [...(Array.isArray(dbRows) ? dbRows : []), ...localRows];
      const seen = new Set();
      const unique = combined.filter((item: any) => {
        const key = item.id || item.booking_id || item.created_at;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (unique.length === 0) {
        alert('No scanned records found to export.');
        return;
      }

      const headers = [
        'Volunteer Name',
        'Scanned By (Scanner Name)',
        'Scan Date',
        'Scan Time',
        'Badge Awarded (Yes/No)',
        'Awarded Badge Tier',
        'Assigned Seva Duty',
        'Attendance Status'
      ];

      const rows = unique.map((row: any) => {
        let badge = '🎖️ Active Swayamsevak';
        let volunteerName = row.devotee_name || row.volunteer_name || 'Swayamsevak';
        let duty = row.seva_name || 'Temple Operations & Seva';
        let statusText = row.status || 'Verified';

        if (row.status && String(row.status).startsWith('VOLUNTEER_BADGE:')) {
          const raw = String(row.status).replace('VOLUNTEER_BADGE:', '').trim();
          const parts = raw.split('|').map((s: string) => s.trim());
          if (parts[0]) badge = parts[0];
          if (parts[1]) volunteerName = parts[1];
          if (parts[2]) duty = parts[2];
          if (parts[3]) statusText = parts[3];
        }

        let formattedDate = '';
        let formattedTime = '';
        try {
          const dt = row.scanned_at ? new Date(row.scanned_at) : (row.created_at ? new Date(row.created_at) : new Date());
          formattedDate = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          formattedTime = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
          formattedDate = String(row.scanned_at || '');
        }

        const isBadgeAwarded = badge && !badge.includes('None') && !badge.includes('No Badge') ? 'Yes' : 'No';

        return [
          `"${volunteerName.replace(/"/g, '""')}"`,
          `"${(row.scanned_by || 'Gate Scanner').replace(/"/g, '""')}"`,
          `"${formattedDate}"`,
          `"${formattedTime}"`,
          `"${isBadgeAwarded}"`,
          `"${badge.replace(/"/g, '""')}"`,
          `"${duty.replace(/"/g, '""')}"`,
          `"${statusText.replace(/"/g, '""')}"`
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `verified_volunteers_badges_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('CSV Export Error:', e);
      alert('Could not export CSV.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16 px-2 sm:px-4 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <QrCode size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>Gate Scanner & Verification</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Single-use QR validation • Operator: <strong className="text-orange-600 dark:text-orange-400">{scannerName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasFlash && isScanning && (
            <button 
              onClick={toggleTorch}
              className={`p-2.5 rounded-xl border transition-all ${
                flashOn 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg' 
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
              }`}
              title="Toggle Flashlight"
            >
              <Zap size={18} className={flashOn ? "fill-current" : ""} />
            </button>
          )}

          <button 
            onClick={fetchTodayLunch}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
            title="Refresh statistics"
          >
            <RotateCw size={18} />
          </button>

          <button
            onClick={handleExportScannedCSV}
            className="flex items-center gap-1.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-colors cursor-pointer"
            title="Download CSV report with volunteer name, scanner name, time, and badge status"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {!isScanning ? (
            <button
              onClick={startScan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Camera size={16} />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <X size={16} />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Tirtha Prasada Tracker */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black">
            <Utensils size={18} />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Expected</span>
            <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">{todayLunchStats.totalExpected}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Claimed</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{todayLunchStats.claimed}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Pending</span>
            <span className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">{todayLunchStats.pending}</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Box */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-lg relative">
        <div className="relative aspect-video max-h-[380px] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
          
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`} 
            playsInline
            muted
          />

          {!isScanning && scanResult.status === 'idle' && (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-orange-400 border border-slate-700 shadow-lg">
                <Camera size={32} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">Gate Camera Standby</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click the button below to turn on the camera and scan Devotee Seva passes & Swayamsevak QR codes.
                </p>
              </div>
              <button
                onClick={startScan}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer"
              >
                Launch QR Camera
              </button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 sm:w-64 sm:h-64 border-2 border-dashed border-orange-500 rounded-3xl relative animate-pulse shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-xl"></div>
                
                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🎖️ VOLUNTEER PASS DETECTED MODAL                                          */}
          {/* ========================================================================= */}
          {scanResult.status === 'volunteer_success' && (
            <div className="absolute inset-0 bg-slate-950/98 z-30 backdrop-blur-md animate-fade-in overflow-y-auto p-4 flex flex-col justify-center text-center">
              <div className="max-w-sm w-full mx-auto my-auto space-y-3">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce">
                  <Award size={32} className="text-slate-950" />
                </div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Swayamsevak Pass
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                    Volunteer Check-In
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Put a tick mark to award Seva Badge & confirm entry
                  </p>
                </div>

                {/* Volunteer Details Card */}
                <div className="bg-slate-900 border border-amber-500/40 p-4 rounded-2xl text-left space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider block">
                        Volunteer Name
                      </span>
                      <p className="text-white text-base sm:text-lg font-extrabold truncate">{scanResult.data?.name}</p>
                      <p className="text-slate-400 text-xs truncate">{scanResult.data?.email}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shrink-0">
                      {(scanResult.data?.name || 'V').charAt(0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 font-bold block">Seva Duty</span>
                      <strong className="text-white block truncate text-xs">{scanResult.data?.duty}</strong>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 font-bold block">Timing</span>
                      <strong className="text-amber-300 block truncate text-xs">{scanResult.data?.time}</strong>
                    </div>
                  </div>

                  {/* 🎖️ BADGE & ATTENDANCE TICK MARK SECTION */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2.5">
                    {/* Tick Mark Option 1: Issue Seva Badge */}
                    <div 
                      onClick={() => setVolunteerBadgeMark(!volunteerBadgeMark)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        volunteerBadgeMark 
                          ? 'bg-amber-500/25 border-amber-500 text-white' 
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
                        {selectedBadgeTier.slice(0, 14)}...
                      </span>
                    </div>

                    {/* Badge Tier Selector */}
                    {volunteerBadgeMark && (
                      <div>
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
                          ? 'bg-emerald-500/25 border-emerald-500 text-white' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                          volunteerAttendanceMark ? 'bg-emerald-500 text-white shadow-sm' : 'border border-slate-600'
                        }`}>
                          {volunteerAttendanceMark && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold">Confirm Attendance</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">Present</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={startScan}
                      className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmVolunteerBadge}
                      disabled={isSavingBadge}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
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
            <div className="absolute inset-0 bg-slate-950/98 z-30 backdrop-blur-md animate-fade-in overflow-y-auto p-4 flex flex-col justify-center text-center">
              <div className="max-w-sm w-full mx-auto my-auto space-y-3.5">
                <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.6)] animate-bounce">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Seva Badge Awarded!
                  </h2>
                  <p className="text-emerald-400 text-xs font-bold mt-0.5">
                    Attendance recorded at {scanResult.data?.confirmedAt || 'now'}
                  </p>
                </div>

                <div className="bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl text-left space-y-2.5 shadow-2xl">
                  <div className="text-center pb-2.5 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400">Honoring Swayamsevak</span>
                    <h3 className="text-lg font-black text-white mt-0.5">{scanResult.data?.name}</h3>
                    <div className="mt-1.5 inline-block px-3 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-extrabold text-xs">
                      {scanResult.data?.confirmedBadge}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duty Seva:</span>
                      <span className="font-bold text-white truncate max-w-[180px]">{scanResult.data?.duty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attendance:</span>
                      <span className="font-bold text-emerald-400">Present [✓]</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startScan}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                >
                  Scan Next Ticket / Volunteer
                </button>
              </div>
            </div>
          )}

          {/* Devotee Booking Success Dialog */}
          {scanResult.status === 'success' && (
             <div className="absolute inset-0 bg-slate-950/98 z-30 backdrop-blur-md animate-fade-in overflow-y-auto p-4 flex flex-col justify-center text-center">
               <div className="max-w-sm w-full mx-auto my-auto space-y-3">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Devotee Verified</h2>
                  
                  <div className="bg-slate-900 border border-slate-700/60 p-4 rounded-2xl text-left space-y-2.5 shadow-2xl">
                    <div className="border-b border-slate-800 pb-2">
                      <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Devotee Name</p>
                      <p className="text-white text-base font-extrabold">{scanResult.data?.devoteeName || 'Devotee'}</p>
                    </div>

                    <div className="border-b border-slate-800 pb-2">
                      <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Booked Seva</p>
                      <p className="text-orange-400 text-xs font-bold leading-snug">{scanResult.data?.sevaName || 'Standard Entry'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400 text-[9px] uppercase font-bold">Gotra</p>
                        <p className="text-white font-semibold">{scanResult.data?.gotra || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[9px] uppercase font-bold">Meal Tokens</p>
                        <p className="text-emerald-400 font-extrabold">{scanResult.data?.tirthaPrasadaCount || 1} Prasadam</p>
                      </div>
                    </div>

                    <div className="mt-2 bg-gradient-to-r from-amber-600 to-amber-500 text-orange-950 p-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                      <span>📍</span> {scanResult.data?.redirectHall}
                    </div>
                  </div>
                  
                  <button 
                    onClick={startScan}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Scan Next Devotee
                  </button>
               </div>
             </div>
          )}

          {/* ========================================================================= */}
          {/* 🛑 ALREADY CLAIMED / ERROR SCREEN                                         */}
          {/* ========================================================================= */}
          {scanResult.status === 'error' && (
            <div className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center p-5 text-center z-30 backdrop-blur-md animate-fade-in overflow-y-auto">
              <div className="max-w-sm w-full my-auto space-y-4">
                
                {scanResult.isClaimed ? (
                  <>
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(220,38,38,0.7)] animate-pulse">
                      <AlertTriangle size={36} className="text-white" />
                    </div>

                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-wider mb-2 border border-red-500/40">
                        🚫 Already Claimed
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        QR Code Already Claimed
                      </h2>
                    </div>

                    <div className="bg-red-950/40 border border-red-500/50 p-4 rounded-2xl text-left space-y-3 shadow-2xl">
                      <p className="text-red-200 text-xs sm:text-sm font-bold leading-relaxed text-center">
                        {scanResult.message}
                      </p>

                      <div className="pt-3 border-t border-red-900/60 text-xs space-y-2 text-slate-300">
                        <div className="flex items-center gap-2 font-bold text-amber-300">
                          <Building size={14} className="shrink-0" />
                          <span>Temple Office Contacts:</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                          <Phone size={13} className="shrink-0 text-orange-400" />
                          <span>080 4972 3252 / +91 95383 20752</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                          <Mail size={13} className="shrink-0 text-orange-400" />
                          <span className="truncate">vidyaranyapuramutt@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                      <AlertCircle size={32} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Scan Unsuccessful</h2>
                    <p className="text-red-200 text-xs max-w-xs mx-auto">{scanResult.message}</p>
                  </>
                )}

                <button 
                  onClick={startScan}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                >
                  Scan Next Ticket / Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scan Status Indicator & Mobile Quick Action */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {isScanning ? (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              Mobile Gate Scanner Active • Auto-detecting code...
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Camera offline • Tap button above to start</span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex-1 sm:flex-none text-gray-600 dark:text-gray-300 hover:text-orange-600 bg-gray-100 dark:bg-slate-700/60 px-3 py-2 rounded-xl transition-colors font-semibold cursor-pointer text-center"
            >
              {showManualInput ? 'Hide Code Input' : 'Type Code Manually'}
            </button>
          </div>
        </div>

        {/* Manual Code Input Box for backup */}
        {showManualInput && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={manualCodeInput}
              onChange={e => setManualCodeInput(e.target.value)}
              placeholder="Paste or type booking/pass ID or pass string"
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white outline-none"
            />
            <button
              onClick={() => {
                if (manualCodeInput.trim()) {
                  handleScanSuccess(manualCodeInput.trim());
                  setManualCodeInput('');
                  setShowManualInput(false);
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-500 transition-colors cursor-pointer"
            >
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
