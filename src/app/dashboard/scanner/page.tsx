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
  Download,
  Smartphone
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

  // Persistent client-side claim tracker to prevent double-scanning
  const isLocallyClaimed = (key: string): boolean => {
    if (!key || key.length < 2) return false;
    try {
      const list = JSON.parse(localStorage.getItem('alsur_claimed_qr_codes') || '[]');
      return Array.isArray(list) && list.includes(key);
    } catch (e) {
      return false;
    }
  };

  const markLocallyClaimed = (key: string) => {
    if (!key || key.length < 2) return;
    try {
      const list = JSON.parse(localStorage.getItem('alsur_claimed_qr_codes') || '[]');
      if (!list.includes(key)) {
        list.push(key);
        localStorage.setItem('alsur_claimed_qr_codes', JSON.stringify(list.slice(-500)));
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
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([80, 40, 80]);
            }
            handleScanSuccess(String(data));
          },
          { 
            returnDetailedScanResult: true,
            preferredCamera: 'environment',
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
    const supabase = createClient();

    // 1. Volunteer Pass Detection
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
        if (parsed.type === 'VOLUNTEER_PASS' || parsed.type === 'volunteer_pass' || parsed.volunteerName || parsed.volunteer_name || (parsed.name && parsed.duty)) {
          volunteerPass = parsed;
        }
      } catch (e) {}
    }

    if (volunteerPass) {
      // Robust extraction of volunteer name
      let extractedName = 
        volunteerPass.volunteerName || 
        volunteerPass.volunteer_name || 
        volunteerPass.name || 
        volunteerPass.to_name || 
        volunteerPass.devotee_name || 
        volunteerPass.devoteeName || 
        volunteerPass.userName || 
        '';

      const volDuty = 
        volunteerPass.dutyTitle || 
        volunteerPass.duty_title || 
        volunteerPass.duty || 
        volunteerPass.seva_title || 
        volunteerPass.sevaTitle || 
        volunteerPass.seva_name || 
        'Temple Operations & Seva';

      const volEmail = 
        volunteerPass.volunteerEmail || 
        volunteerPass.volunteer_email || 
        volunteerPass.email || 
        volunteerPass.to_email || 
        '';

      // If name wasn't explicitly set in JSON, resolve it by email
      if (!extractedName && volEmail) {
        try {
          const { data: matchedUser } = await supabase
            .from('users')
            .select('name')
            .eq('email', volEmail)
            .limit(1)
            .maybeSingle();
          if (matchedUser?.name) extractedName = matchedUser.name;
        } catch (e) {}
      }

      if (!extractedName) {
        extractedName = volEmail ? volEmail.split('@')[0] : 'Swayamsevak';
      }

      // Deterministic unique key for this volunteer pass
      const uniquePassKey = String(
        volunteerPass.id || 
        volunteerPass.volunteerId || 
        (volEmail && volDuty ? `${volEmail}_${volDuty}` : '') ||
        (extractedName && volEmail ? `${extractedName}_${volEmail}` : '') ||
        cleanData
      ).trim();

      // Check 1: Has this volunteer pass already been claimed locally?
      if (isLocallyClaimed(uniquePassKey) || isLocallyClaimed(cleanData)) {
        setScanResult({
          status: 'error',
          isClaimed: true,
          message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
        });
        return;
      }

      // Check 2: Has this specific pass ID or cleanData already been recorded in Supabase scan_history?
      try {
        const { data: existingScans } = await supabase
          .from('scan_history')
          .select('id, booking_id')
          .or(`booking_id.eq.${uniquePassKey},booking_id.eq.${cleanData}`)
          .limit(1);

        if (existingScans && existingScans.length > 0) {
          markLocallyClaimed(uniquePassKey);
          markLocallyClaimed(cleanData);
          setScanResult({
            status: 'error',
            isClaimed: true,
            message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
          });
          return;
        }
      } catch (e) {}

      const badge = volunteerPass.badgeLevel || volunteerPass.badge_level || volunteerPass.badge || '🎖️ Active Swayamsevak';
      setSelectedBadgeTier(badge);
      setVolunteerBadgeMark(true);
      setVolunteerAttendanceMark(true);

      setScanResult({
        status: 'volunteer_success',
        message: 'Swayamsevak Pass Detected!',
        data: {
          id: uniquePassKey,
          uniqueKey: uniquePassKey,
          rawCode: cleanData,
          name: extractedName,
          email: volEmail || 'volunteer@vidyaranyapuramutt.org',
          role: volunteerPass.role || 'volunteer',
          duty: volDuty,
          date: volunteerPass.dutyDate || volunteerPass.date || volunteerPass.duty_date || new Date().toLocaleDateString('en-IN'),
          time: volunteerPass.dutyTime || volunteerPass.time || volunteerPass.shift_timing || 'General Shift',
          location: volunteerPass.dutyLocation || volunteerPass.location || volunteerPass.assigned_location || 'Main Gate & Sanctum',
          badge: badge,
          issuedAt: volunteerPass.issuedAt || new Date().toISOString()
        }
      });
      return;
    }

    // 2. Devotee Booking QR Verification
    const cleanId = cleanData;

    // Check 1: Is this booking ID claimed locally?
    if (isLocallyClaimed(cleanId)) {
      setScanResult({
        status: 'error',
        isClaimed: true,
        message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
      });
      return;
    }

    try {
      // Find booking by ID or QR code text
      const { data: bks, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`id.eq.${cleanId},qr_code.eq.${cleanId}`)
        .limit(1);

      const dbDetails = (bks && bks.length > 0) ? bks[0] : null;

      if (dbDetails && !error) {
        const statusLower = (dbDetails.status || '').toLowerCase();
        const isAlreadyClaimed = 
          statusLower === 'completed' || 
          statusLower === 'claimed' || 
          statusLower === 'used';

        if (isAlreadyClaimed) {
          markLocallyClaimed(String(dbDetails.id));
          markLocallyClaimed(cleanId);
          setScanResult({ 
            status: 'error', 
            isClaimed: true,
            message: 'This QR code has already been claimed. Please contact admin for any discrepancies.' 
          });
          return;
        }

        // First time scan: Mark booking as completed and claimed locally
        markLocallyClaimed(String(dbDetails.id));
        markLocallyClaimed(cleanId);

        await supabase.from('bookings').update({ status: 'completed' }).eq('id', dbDetails.id);
        
        fetch('/api/bookings/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbDetails.id, status: 'completed' })
        }).catch(() => {});

        // Insert scan record into scan_history
        try {
          const newScan = {
            booking_id: String(dbDetails.id),
            devotee_name: dbDetails.devotee_name || 'Devotee',
            seva_name: dbDetails.seva_name || 'Seva Booking',
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
          data: {
            id: dbDetails.id,
            devoteeName: dbDetails.devotee_name || 'Devotee',
            sevaName: dbDetails.seva_name || 'Seva Booking',
            status: 'Completed',
            gotra: dbDetails.gotra || '—',
            date: dbDetails.date,
            tirthaPrasadaCount: dbDetails.tirtha_prasada_count || dbDetails.lunch_count || 1,
            devoteeCategory: 'Registered Devotee',
            redirectHall: dbDetails.lunch_hall || 'Annapurna Dining Hall (Ground Floor)'
          }
        });

        fetchTodayLunch();
        return;
      }

      // Check if ticket ID was already completed in scan_history
      const { data: scanHistoryCheck } = await supabase
        .from('scan_history')
        .select('id, booking_id')
        .eq('booking_id', cleanId)
        .limit(1);

      if (scanHistoryCheck && scanHistoryCheck.length > 0) {
        markLocallyClaimed(cleanId);
        setScanResult({
          status: 'error',
          isClaimed: true,
          message: 'This QR code has already been claimed. Please contact admin for any discrepancies.'
        });
        return;
      }

      // Unrecognized code
      setScanResult({
        status: 'error',
        isClaimed: false,
        message: 'Unrecognized QR Code. Please ensure the devotee has a valid booking pass from the temple.'
      });
    } catch (err: any) {
      console.error('Scan processing error:', err);
      setScanResult({
        status: 'error',
        isClaimed: false,
        message: 'Verification check failed. Please check network connection and try again.'
      });
    }
  };

  const handleConfirmVolunteerBadge = async () => {
    if (!scanResult.data) return;
    setIsSavingBadge(true);

    try {
      const volKey = String(scanResult.data.uniqueKey || scanResult.data.id);
      const rawCode = String(scanResult.data.rawCode || '');
      const volActualName = scanResult.data.name || 'Swayamsevak';
      const volDuty = scanResult.data.duty || 'Temple Operations';
      const statusStr = `VOLUNTEER_BADGE:${selectedBadgeTier} | ${volActualName} | ${volDuty} | ${volunteerBadgeMark ? 'Badge Awarded' : 'Checked In'}`;
      
      // Mark as claimed immediately so duplicate scan is impossible
      markLocallyClaimed(volKey);
      if (rawCode) markLocallyClaimed(rawCode);

      const scanRecord = {
        booking_id: volKey,
        devotee_name: volActualName,
        seva_name: `[Volunteer Badge: ${selectedBadgeTier}] ${volDuty}`,
        status: statusStr,
        scanned_at: new Date().toISOString(),
        scanned_by: scannerName,
      };

      // 1. Insert into Supabase
      try {
        const supabase = createClient();
        await supabase.from('scan_history').insert([scanRecord]);
      } catch (sbErr) {
        console.warn('Supabase direct insert error:', sbErr);
      }

      // 2. Send to server API
      fetch('/api/scan-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanRecord)
      }).catch(() => {});

      // 3. Local storage backup
      try {
        const localList = JSON.parse(localStorage.getItem('alsur_scanned_volunteers') || '[]');
        localList.unshift(scanRecord);
        localStorage.setItem('alsur_scanned_volunteers', JSON.stringify(localList.slice(0, 100)));
      } catch (lsErr) {}

      setScanResult({
        status: 'volunteer_confirmed',
        message: 'Volunteer Verified & Badge Awarded Successfully!',
        data: {
          ...scanResult.data,
          name: volActualName,
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
        let volunteerName = row.devotee_name || row.volunteer_name || '';
        let duty = row.seva_name || 'Temple Operations & Seva';
        let statusText = row.status || 'Verified';

        if (row.status && String(row.status).startsWith('VOLUNTEER_BADGE:')) {
          const raw = String(row.status).replace('VOLUNTEER_BADGE:', '').trim();
          const parts = raw.split('|').map((s: string) => s.trim());
          if (parts[0]) badge = parts[0];
          if (parts[1] && parts[1] !== '') {
            volunteerName = parts[1];
          }
          if (parts[2]) duty = parts[2];
          if (parts[3]) statusText = parts[3];
        }

        if (!volunteerName || volunteerName === 'Swayamsevak') {
          if (row.devotee_name && row.devotee_name !== 'Swayamsevak') {
            volunteerName = row.devotee_name;
          } else {
            volunteerName = 'Swayamsevak';
          }
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
    <div className="space-y-4 max-w-4xl mx-auto pb-20 px-3 sm:px-6 animate-fade-in text-gray-900 dark:text-white">
      
      {/* Mobile-Optimized Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
            <QrCode size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">
              Gate Scanner & Verification
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
              Operator: <span className="text-orange-600 dark:text-orange-400 font-bold">{scannerName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
          {hasFlash && isScanning && (
            <button 
              onClick={toggleTorch}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                flashOn 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' 
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
              }`}
              title="Toggle Flashlight"
            >
              <Zap size={16} className={flashOn ? "fill-current" : ""} />
            </button>
          )}

          <button 
            onClick={fetchTodayLunch}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh statistics"
          >
            <RotateCw size={16} />
          </button>

          <button
            onClick={handleExportScannedCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-colors cursor-pointer"
            title="Export CSV with Volunteer name, Scanner name, Time, and Badge"
          >
            <Download size={15} />
            <span className="text-[11px] sm:text-xs">CSV</span>
          </button>

          {!isScanning ? (
            <button
              onClick={startScan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Camera size={15} />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <X size={15} />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Tirtha Prasada Tracker (3 Mobile Pills) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black shrink-0">
            <Utensils size={15} />
          </div>
          <div>
            <span className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Expected</span>
            <span className="text-base sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{todayLunchStats.totalExpected}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0">
            <CheckCircle2 size={15} />
          </div>
          <div>
            <span className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Claimed</span>
            <span className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">{todayLunchStats.claimed}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0">
            <Users size={15} />
          </div>
          <div>
            <span className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Pending</span>
            <span className="text-base sm:text-2xl font-black text-blue-600 dark:text-blue-400 leading-tight">{todayLunchStats.pending}</span>
          </div>
        </div>
      </div>

      {/* Camera Viewport Container */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-md relative">
        <div className="relative aspect-[4/3] sm:aspect-video max-h-[420px] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
          
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`} 
            playsInline
            muted
          />

          {!isScanning && scanResult.status === 'idle' && (
            <div className="text-center p-4 sm:p-6 space-y-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-orange-400 border border-slate-700 shadow-lg">
                <Camera size={28} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white mb-1">Gate Camera Standby</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Tap below to open camera and scan Devotee Seva passes or Volunteer QR codes.
                </p>
              </div>
              <button
                onClick={startScan}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
              >
                Launch QR Camera
              </button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-orange-500 rounded-3xl relative animate-pulse shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-xl"></div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🎖️ VOLUNTEER PASS MODAL                                                    */}
          {/* ========================================================================= */}
          {scanResult.status === 'volunteer_success' && (
            <div className="absolute inset-0 bg-slate-950/98 z-30 backdrop-blur-md animate-fade-in overflow-y-auto p-3 sm:p-4 flex flex-col justify-center text-center">
              <div className="max-w-sm w-full mx-auto my-auto space-y-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                  <Award size={26} className="text-slate-950" />
                </div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Swayamsevak Pass
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">
                    Volunteer Check-In
                  </h2>
                </div>

                <div className="bg-slate-900 border border-amber-500/40 p-3.5 rounded-2xl text-left space-y-2.5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider block">
                        Volunteer Name
                      </span>
                      <p className="text-white text-base font-extrabold truncate">{scanResult.data?.name}</p>
                      <p className="text-slate-400 text-xs truncate">{scanResult.data?.email}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shrink-0">
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

                  {/* Badge & Attendance Options */}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                    <div 
                      onClick={() => setVolunteerBadgeMark(!volunteerBadgeMark)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        volunteerBadgeMark 
                          ? 'bg-amber-500/25 border-amber-500 text-white' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${
                          volunteerBadgeMark ? 'bg-amber-500 text-slate-950 shadow-xs' : 'border border-slate-600'
                        }`}>
                          {volunteerBadgeMark && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold">Award Seva Badge</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold truncate max-w-[120px]">
                        {selectedBadgeTier}
                      </span>
                    </div>

                    {volunteerBadgeMark && (
                      <select
                        value={selectedBadgeTier}
                        onChange={e => setSelectedBadgeTier(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-amber-500/40 text-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="🎖️ Active Swayamsevak">🎖️ Active Swayamsevak Badge</option>
                        <option value="⭐ Seva & Utsavam Lead">⭐ Seva & Utsavam Lead Badge</option>
                        <option value="🍽️ Annadanam & Kitchen Sevak">🍽️ Annadanam & Kitchen Sevak Badge</option>
                        <option value="🛡️ Security & Crowd Coordinator">🛡️ Security & Crowd Coordinator Badge</option>
                        <option value="🚩 Senior Temple Operations Lead">🚩 Senior Temple Operations Lead Badge</option>
                      </select>
                    )}

                    <div 
                      onClick={() => setVolunteerAttendanceMark(!volunteerAttendanceMark)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        volunteerAttendanceMark 
                          ? 'bg-emerald-500/25 border-emerald-500 text-white' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${
                          volunteerAttendanceMark ? 'bg-emerald-500 text-white shadow-xs' : 'border border-slate-600'
                        }`}>
                          {volunteerAttendanceMark && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold">Confirm Attendance</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">Present</span>
                    </div>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={startScan}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmVolunteerBadge}
                      disabled={isSavingBadge}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSavingBadge ? 'Recording...' : '✓ Award & Check-In'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Devotee Booking Success Dialog */}
          {scanResult.status === 'success' && (
             <div className="absolute inset-0 bg-slate-950/98 z-30 backdrop-blur-md animate-fade-in overflow-y-auto p-3 sm:p-4 flex flex-col justify-center text-center">
               <div className="max-w-sm w-full mx-auto my-auto space-y-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-bounce">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <h2 className="text-lg font-black text-white">Devotee Verified</h2>
                  
                  <div className="bg-slate-900 border border-slate-700/60 p-3.5 rounded-2xl text-left space-y-2 shadow-2xl text-xs">
                    <div className="border-b border-slate-800 pb-1.5">
                      <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Devotee Name</p>
                      <p className="text-white text-base font-extrabold">{scanResult.data?.devoteeName || 'Devotee'}</p>
                    </div>

                    <div className="border-b border-slate-800 pb-1.5">
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

                    <div className="mt-2 bg-gradient-to-r from-amber-600 to-amber-500 text-orange-950 p-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                      <span>📍</span> <span className="truncate">{scanResult.data?.redirectHall}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={startScan}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-xl font-bold transition-all shadow-md uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Scan Next Devotee
                  </button>
               </div>
             </div>
          )}

          {/* Volunteer Badge Confirmed Screen */}
          {scanResult.status === 'volunteer_confirmed' && (
            <div className="absolute inset-0 bg-slate-950/98 z-30 backdrop-blur-md animate-fade-in overflow-y-auto p-3 sm:p-4 flex flex-col justify-center text-center">
              <div className="max-w-sm w-full mx-auto my-auto space-y-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <CheckCircle size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Badge & Entry Awarded!
                  </h2>
                  <p className="text-emerald-400 text-xs font-bold">
                    Recorded at {scanResult.data?.confirmedAt || 'now'}
                  </p>
                </div>

                <div className="bg-slate-900 border border-emerald-500/40 p-3 rounded-2xl text-left space-y-2 shadow-2xl text-xs">
                  <div className="text-center pb-2 border-b border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Swayamsevak</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{scanResult.data?.name}</h3>
                    <div className="mt-1 inline-block px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-extrabold text-xs">
                      {scanResult.data?.confirmedBadge}
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duty:</span>
                      <span className="font-bold text-white truncate max-w-[170px]">{scanResult.data?.duty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attendance:</span>
                      <span className="font-bold text-emerald-400">Present [✓]</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startScan}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-2.5 rounded-xl font-bold transition-all shadow-md uppercase text-xs tracking-wider cursor-pointer"
                >
                  Scan Next Ticket / Volunteer
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🛑 ALREADY CLAIMED / ERROR DIALOG                                         */}
          {/* ========================================================================= */}
          {scanResult.status === 'error' && (
            <div className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center p-4 text-center z-30 backdrop-blur-md animate-fade-in overflow-y-auto">
              <div className="max-w-sm w-full my-auto space-y-3.5">
                
                {scanResult.isClaimed ? (
                  <>
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(220,38,38,0.7)] animate-pulse">
                      <AlertTriangle size={30} className="text-white" />
                    </div>

                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1 border border-red-500/40">
                        🚫 Already Claimed
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        QR Code Already Claimed
                      </h2>
                    </div>

                    <div className="bg-red-950/40 border border-red-500/50 p-3.5 rounded-2xl text-left space-y-2.5 shadow-2xl">
                      <p className="text-red-200 text-xs sm:text-sm font-bold leading-relaxed text-center">
                        {scanResult.message}
                      </p>

                      <div className="pt-2.5 border-t border-red-900/60 text-xs space-y-1.5 text-slate-300">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Building size={13} className="shrink-0" />
                          <span>Temple Office Contacts:</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                          <Phone size={12} className="shrink-0 text-orange-400" />
                          <span>080 4972 3252 / +91 95383 20752</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                          <Mail size={12} className="shrink-0 text-orange-400" />
                          <span className="truncate">vidyaranyapuramutt@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                      <AlertCircle size={26} className="text-white" />
                    </div>
                    <h2 className="text-base font-bold text-white">Scan Unsuccessful</h2>
                    <p className="text-red-200 text-xs max-w-xs mx-auto">{scanResult.message}</p>
                  </>
                )}

                <button 
                  onClick={startScan}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-2.5 rounded-xl font-bold transition-all shadow-md uppercase text-xs tracking-wider cursor-pointer"
                >
                  Scan Next Ticket / Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          {isScanning ? (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Camera Active • Point camera at devotee/volunteer QR code
            </div>
          ) : (
            <span className="text-gray-400 text-[11px]">Camera Standby • Tap "Start Camera" above</span>
          )}

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-gray-600 dark:text-gray-300 hover:text-orange-600 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors font-semibold text-[11px] cursor-pointer"
          >
            {showManualInput ? 'Hide Manual Input' : 'Type Code Manually'}
          </button>
        </div>

        {/* Manual Code Input Box */}
        {showManualInput && (
          <div className="mt-2.5 p-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={manualCodeInput}
              onChange={e => setManualCodeInput(e.target.value)}
              placeholder="Paste or type booking/pass ID..."
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white outline-none"
            />
            <button
              onClick={() => {
                if (manualCodeInput.trim()) {
                  handleScanSuccess(manualCodeInput.trim());
                  setManualCodeInput('');
                  setShowManualInput(false);
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-500 transition-colors cursor-pointer shrink-0"
            >
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
