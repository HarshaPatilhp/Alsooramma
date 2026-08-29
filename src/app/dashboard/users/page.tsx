"use client";

import { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  Edit,
  X,
  CheckSquare,
  Square,
  Check,
  LayoutDashboard,
  QrCode,
  Users,
  Clock,
  Calendar,
  Gift,
  Coffee,
  PieChart,
  Settings,
  Lock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Mail,
  Send,
  Award,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  Info,
  Plus,
  AtSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_PERMISSIONS, PermissionKey, RBACUser } from '@/lib/rbac';
import {
  sendVolunteerPassEmail,
  generateVolunteerQRCodeDataURL,
  generateVolunteerPassCode,
  VolunteerPassPayload
} from '@/lib/volunteer-email';

interface Volunteer extends RBACUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'volunteer' | string;
  permissions?: Record<string, boolean>;
}

interface ManualRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isManual?: boolean;
}

const VOLUNTEER_ALLOWED_PERMS: PermissionKey[] = ['qr_checkin', 'devotees', 'activity_log'];

export default function UsersPage() {
  const { user: currentUser, updateUserPermissions } = useAuth();
  const [users, setUsers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'volunteers' | 'admins' | 'scanned_badges'>('all');
  const [scannedVolunteers, setScannedVolunteers] = useState<Array<{
    id: string;
    booking_id: string;
    volunteerName: string;
    email?: string;
    sevaDuty: string;
    badge: string;
    scannedAt: string;
    scannedDate: string;
    scannedTime: string;
    scannedBy: string;
    status: string;
  }>>([]);
  const [scannedSearch, setScannedSearch] = useState('');
  const [scannedBadgeFilter, setScannedBadgeFilter] = useState('All');
  const [isLoadingScans, setIsLoadingScans] = useState(false);
  const [selectedScannedIds, setSelectedScannedIds] = useState<string[]>([]);

  // Selection state for sending emails
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customRecipients, setCustomRecipients] = useState<ManualRecipient[]>([]);
  const [showEmailDispatchModal, setShowEmailDispatchModal] = useState(false);

  // Manual Gmail inputs inside modal
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [manualPhoneInput, setManualPhoneInput] = useState('');

  // Email dispatch form
  const [dispatchDutyTitle, setDispatchDutyTitle] = useState('Maha Aradhana Utsavam & Annadanam Seva');
  const [dispatchDutyDate, setDispatchDutyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dispatchDutyTime, setDispatchDutyTime] = useState('08:00 AM - 02:00 PM');
  const [dispatchDutyLocation, setDispatchDutyLocation] = useState('Main Sanctum & Annapurna Dining Hall');
  const [dispatchBadgeLevel, setDispatchBadgeLevel] = useState('🎖️ Active Swayamsevak');
  const [dispatchInstructions, setDispatchInstructions] = useState('Please arrive 15 minutes before your shift and present this QR pass at the entrance scanner for badge verification.');

  // Dispatch execution state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{ current: number; total: number; activeName: string } | null>(null);
  const [dispatchResults, setDispatchResults] = useState<Array<{ name: string; email: string; success: boolean; message: string; mode: string }>>([]);
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');

  // Invite modal states
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'volunteer' as 'super_admin' | 'admin' | 'volunteer'
  });
  const [invitePermissions, setInvitePermissions] = useState<Record<string, boolean>>({
    qr_checkin: true,
    devotees: true,
    activity_log: true
  });

  // Manage permissions modal states
  const [selectedAdminForPermissions, setSelectedAdminForPermissions] = useState<Volunteer | null>(null);
  const [toggledRole, setToggledRole] = useState<'admin' | 'volunteer'>('volunteer');
  const [toggledPermissions, setToggledPermissions] = useState<Record<string, boolean>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email === 'admin@temple.com';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: {
          'x-user-id': String(currentUser?.id || ''),
          'x-user-email': currentUser?.email || '',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        // Direct Supabase fallback
        const { createClient } = await import('@/lib/client');
        const supabase = createClient();
        const { data: dbUsers, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && dbUsers) {
          setUsers(dbUsers);
        }
      }
    } catch (err) {
      console.error('Failed to fetch users via API, using Supabase fallback:', err);
      try {
        const { createClient } = await import('@/lib/client');
        const supabase = createClient();
        const { data: dbUsers, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && dbUsers) {
          setUsers(dbUsers);
        }
      } catch (fbErr) {
        console.error('Supabase fallback failed:', fbErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScannedVolunteers = async () => {
    setIsLoadingScans(true);
    try {
      let combinedRows: any[] = [];

      // 1. Try fetching from server API route
      try {
        const res = await fetch('/api/scan-history');
        const data = await res.json();
        if (data.success && Array.isArray(data.scans)) {
          combinedRows = [...data.scans];
        }
      } catch (apiErr) {
        console.warn('API scan-history fetch error:', apiErr);
      }

      // 2. Direct Supabase query
      try {
        const { createClient } = await import('@/lib/client');
        const supabase = createClient();
        const { data: dbRows, error } = await supabase
          .from('scan_history')
          .select('*')
          .order('scanned_at', { ascending: false });

        if (!error && Array.isArray(dbRows)) {
          dbRows.forEach(dbItem => {
            if (!combinedRows.some(r => r.id === dbItem.id || (r.booking_id === dbItem.booking_id && r.scanned_at === dbItem.scanned_at))) {
              combinedRows.push(dbItem);
            }
          });
        }
      } catch (sbErr) {
        console.warn('Supabase scan_history fetch fallback:', sbErr);
      }

      // 3. LocalStorage persistence merge
      try {
        if (typeof window !== 'undefined') {
          const localList = JSON.parse(localStorage.getItem('alsur_scanned_volunteers') || '[]');
          if (Array.isArray(localList)) {
            localList.forEach(locItem => {
              if (!combinedRows.some(r => (r.booking_id && r.booking_id === locItem.booking_id) || r.id === locItem.id)) {
                combinedRows.push(locItem);
              }
            });
          }
        }
      } catch (lsErr) { }

      // Parse and format volunteer badge records
      const parsedList = combinedRows
        .filter((row: any) => {
          const bId = String(row.booking_id || '');
          const sName = String(row.seva_name || '');
          const st = String(row.status || '');
          return st.includes('VOLUNTEER_BADGE') || bId.startsWith('VOL-') || sName.includes('[Volunteer Badge:') || st.includes('Badge') || sName.toLowerCase().includes('volunteer');
        })
        .map((row: any) => {
          let badge = '🎖️ Active Swayamsevak';
          let volunteerName = row.devotee_name || row.volunteer_name || '';
          let duty = row.seva_name || 'Temple Operations';
          let statusText = row.status || 'Verified';

          // 1. Handle VOLUNTEER_BADGE:Badge | Name | Duty | Status format
          if (row.status && String(row.status).startsWith('VOLUNTEER_BADGE:')) {
            const raw = String(row.status).replace('VOLUNTEER_BADGE:', '').trim();
            const parts = raw.split('|').map(s => s.trim());
            if (parts[0]) badge = parts[0];
            if (parts[1] && parts[1] !== '' && parts[1] !== 'Swayamsevak') {
              volunteerName = parts[1];
            }
            if (parts[2]) duty = parts[2];
            if (parts[3]) statusText = parts[3];
          } else {
            // 2. Handle [Volunteer Badge: ⭐ Lead] format
            const match = (row.seva_name || '').match(/\[Volunteer Badge:\s*([^\]]+)\]\s*(.*)/i);
            if (match) {
              badge = match[1].trim();
              duty = match[2].trim() || 'Temple Operations & Seva';
            }
          }

          if (!volunteerName || volunteerName === 'Swayamsevak') {
            if (row.devotee_name && row.devotee_name !== 'Swayamsevak') {
              volunteerName = row.devotee_name;
            } else {
              const matchedU = users.find(u => u.id === row.booking_id || u.email === row.booking_id);
              if (matchedU?.name) {
                volunteerName = matchedU.name;
              } else {
                volunteerName = 'Swayamsevak';
              }
            }
          }

          let formattedDate = '';
          let formattedTime = '';
          try {
            if (row.scanned_at && row.scanned_at.includes('/')) {
              formattedDate = row.scanned_at.split(',')[0] || row.scanned_at;
              formattedTime = row.scanned_at.split(',')[1] || '';
            } else {
              const dt = row.scanned_at ? new Date(row.scanned_at) : (row.created_at ? new Date(row.created_at) : new Date());
              formattedDate = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
              formattedTime = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
          } catch (e) {
            formattedDate = String(row.scanned_at || '');
          }

          return {
            id: String(row.id || `scan-${Math.random()}`),
            booking_id: String(row.booking_id || ''),
            volunteerName: volunteerName,
            sevaDuty: duty,
            badge: badge,
            scannedAt: row.scanned_at || row.created_at || new Date().toISOString(),
            scannedDate: formattedDate,
            scannedTime: formattedTime,
            scannedBy: row.scanned_by || 'Gate Scanner',
            status: statusText
          };
        });

      // Deduplicate so each volunteer/pass has only ONE entry (the latest scan)
      const seen = new Set<string>();
      const deduplicatedList = parsedList.filter((item: any) => {
        const normalizedName = item.volunteerName.trim().toLowerCase();
        const normalizedDuty = item.sevaDuty.trim().toLowerCase();
        const primaryKey = item.booking_id && item.booking_id.length > 2 ? `bid_${item.booking_id}` : `combo_${normalizedName}_${normalizedDuty}`;
        
        if (seen.has(primaryKey)) return false;
        if (normalizedName && normalizedName !== 'swayamsevak' && seen.has(`vol_${normalizedName}`)) {
          return false;
        }

        seen.add(primaryKey);
        if (normalizedName && normalizedName !== 'swayamsevak') {
          seen.add(`vol_${normalizedName}`);
        }
        return true;
      });

      setScannedVolunteers(deduplicatedList);
    } catch (e) {
      console.error('Failed to fetch scanned volunteers:', e);
    } finally {
      setIsLoadingScans(false);
    }
  };

  const handleExportScannedCSV = () => {
    const listToExport = filteredScannedVolunteers;
    if (listToExport.length === 0) {
      alert('No scanned volunteer passes found to export.');
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
    const rows = listToExport.map(item => {
      const isBadgeAwarded = item.badge && !item.badge.includes('None') && !item.badge.includes('No Badge') ? 'Yes' : 'No';
      return [
        `"${item.volunteerName.replace(/"/g, '""')}"`,
        `"${(item.scannedBy || 'Gate Mobile Scanner').replace(/"/g, '""')}"`,
        `"${item.scannedDate}"`,
        `"${item.scannedTime}"`,
        `"${isBadgeAwarded}"`,
        `"${item.badge.replace(/"/g, '""')}"`,
        `"${item.sevaDuty.replace(/"/g, '""')}"`,
        `"${item.status.replace(/"/g, '""')}"`
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
  };

  const toggleSelectScanned = (id: string) => {
    setSelectedScannedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllScanned = () => {
    if (selectedScannedIds.length === filteredScannedVolunteers.length && filteredScannedVolunteers.length > 0) {
      setSelectedScannedIds([]);
    } else {
      setSelectedScannedIds(filteredScannedVolunteers.map(u => u.id));
    }
  };

  const handleDeleteSingleScannedPass = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the scanned badge record for "${name}"?`)) {
      return;
    }

    // 1. Optimistic UI update
    setScannedVolunteers(prev => prev.filter(item => item.id !== id));
    setSelectedScannedIds(prev => prev.filter(item => item !== id));

    // 2. Remove from localStorage
    try {
      const localList = JSON.parse(localStorage.getItem('alsur_scanned_volunteers') || '[]');
      const updated = localList.filter((item: any) => String(item.id) !== String(id));
      localStorage.setItem('alsur_scanned_volunteers', JSON.stringify(updated));
    } catch (e) { }

    // 3. Delete from API / Supabase
    try {
      await fetch(`/api/scan-history?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const { createClient } = await import('@/lib/client');
      const supabase = createClient();
      await supabase.from('scan_history').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete scanned pass:', err);
    }
  };

  const handleDeleteSelectedScannedPasses = async () => {
    if (selectedScannedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedScannedIds.length} selected scanned pass records?`)) {
      return;
    }

    const idsToDelete = [...selectedScannedIds];
    // 1. Optimistic UI update
    setScannedVolunteers(prev => prev.filter(item => !idsToDelete.includes(item.id)));
    setSelectedScannedIds([]);

    // 2. Remove from localStorage
    try {
      const localList = JSON.parse(localStorage.getItem('alsur_scanned_volunteers') || '[]');
      const updated = localList.filter((item: any) => !idsToDelete.includes(String(item.id)));
      localStorage.setItem('alsur_scanned_volunteers', JSON.stringify(updated));
    } catch (e) { }

    // 3. Delete from API / Supabase
    try {
      await fetch('/api/scan-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
      const { createClient } = await import('@/lib/client');
      const supabase = createClient();
      await supabase.from('scan_history').delete().in('id', idsToDelete);
    } catch (err) {
      console.error('Failed to delete selected scans:', err);
    }
  };

  const handleClearAllScannedPasses = async () => {
    if (scannedVolunteers.length === 0) return;
    if (!confirm('Are you sure you want to clear ALL scanned volunteer badge records? This cannot be undone.')) {
      return;
    }

    setScannedVolunteers([]);
    setSelectedScannedIds([]);

    try {
      localStorage.removeItem('alsur_scanned_volunteers');
      await fetch('/api/scan-history?all=true', { method: 'DELETE' });
      const { createClient } = await import('@/lib/client');
      const supabase = createClient();
      await supabase.from('scan_history').delete().neq('id', '0');
    } catch (err) {
      console.error('Failed to clear all scan records:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchScannedVolunteers();
  }, [currentUser]);

  // Combined recipient list (from table selection + manually entered Gmails)
  const allTargetRecipients: ManualRecipient[] = [
    ...users.filter(u => selectedUserIds.includes(u.id)).map(u => ({ ...u, isManual: false })),
    ...customRecipients
  ];

  // Update live QR preview when preview modal is opened or form fields change
  useEffect(() => {
    if (showEmailDispatchModal && allTargetRecipients.length > 0) {
      const firstSelected = allTargetRecipients[0];
      if (firstSelected) {
        const samplePass: VolunteerPassPayload = {
          volunteerId: firstSelected.id,
          volunteerName: firstSelected.name,
          volunteerEmail: firstSelected.email,
          role: firstSelected.role || 'volunteer',
          dutyTitle: dispatchDutyTitle,
          dutyDate: dispatchDutyDate,
          dutyTime: dispatchDutyTime,
          dutyLocation: dispatchDutyLocation,
          badgeLevel: dispatchBadgeLevel,
          instructions: dispatchInstructions
        };
        generateVolunteerQRCodeDataURL(samplePass).then(url => setPreviewQrUrl(url)).catch(() => { });
      }
    }
  }, [showEmailDispatchModal, selectedUserIds, customRecipients, dispatchDutyTitle, dispatchDutyDate, dispatchDutyTime, dispatchDutyLocation, dispatchBadgeLevel, dispatchInstructions]);

  const filteredUsers = users.filter(u => {
    if (activeTab === 'volunteers') return u.role === 'volunteer';
    if (activeTab === 'admins') return u.role === 'admin' || u.role === 'super_admin';
    return true;
  });

  const filteredScannedVolunteers = scannedVolunteers.filter(item => {
    const searchLower = scannedSearch.toLowerCase();
    const matchesSearch =
      item.volunteerName.toLowerCase().includes(searchLower) ||
      item.sevaDuty.toLowerCase().includes(searchLower) ||
      item.badge.toLowerCase().includes(searchLower) ||
      item.scannedDate.toLowerCase().includes(searchLower) ||
      item.scannedBy.toLowerCase().includes(searchLower);

    const matchesBadge = scannedBadgeFilter === 'All' || item.badge.includes(scannedBadgeFilter);
    return matchesSearch && matchesBadge;
  });

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleOpenDispatchModal = () => {
    if (selectedUserIds.length === 0 && customRecipients.length === 0) {
      const volunteerIds = users.filter(u => u.role === 'volunteer').map(u => u.id);
      if (volunteerIds.length > 0) {
        setSelectedUserIds(volunteerIds);
      } else if (users.length > 0) {
        setSelectedUserIds([users[0].id]);
      }
    }
    setDispatchResults([]);
    setDispatchProgress(null);
    setShowEmailDispatchModal(true);
  };

  const handleAddManualGmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualEmailInput.trim()) return;

    // Support comma/space/newline separated emails
    const rawEmails = manualEmailInput.split(/[\n,; ]+/).map(em => em.trim()).filter(Boolean);
    const newItems: ManualRecipient[] = [];

    rawEmails.forEach((emailStr, idx) => {
      const cleanEmail = emailStr.trim();
      if (cleanEmail.includes('@')) {
        const derivedName = manualNameInput.trim()
          ? (rawEmails.length === 1 ? manualNameInput.trim() : `${manualNameInput.trim()} (${idx + 1})`)
          : cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        newItems.push({
          id: `manual-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          name: derivedName,
          email: cleanEmail,
          phone: manualPhoneInput.trim(),
          role: 'volunteer',
          isManual: true
        });
      }
    });

    if (newItems.length > 0) {
      setCustomRecipients(prev => [...prev, ...newItems]);
      setManualEmailInput('');
      setManualNameInput('');
      setManualPhoneInput('');
    } else {
      alert('Please enter a valid email address (e.g. name@gmail.com)');
    }
  };

  const handleRemoveRecipient = (recipient: ManualRecipient) => {
    if (recipient.isManual) {
      setCustomRecipients(prev => prev.filter(r => r.id !== recipient.id));
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== recipient.id));
    }
  };

  const handleDispatchEmails = async () => {
    if (allTargetRecipients.length === 0) {
      alert('Please select or add at least one volunteer email recipient.');
      return;
    }

    setIsDispatching(true);
    setDispatchResults([]);
    setDispatchProgress({ current: 0, total: allTargetRecipients.length, activeName: '' });

    const results: Array<{ name: string; email: string; success: boolean; message: string; mode: string }> = [];

    for (let i = 0; i < allTargetRecipients.length; i++) {
      const recipient = allTargetRecipients[i];
      setDispatchProgress({
        current: i + 1,
        total: allTargetRecipients.length,
        activeName: recipient.name,
      });

      const passPayload: VolunteerPassPayload = {
        volunteerId: recipient.id || `VOL-${Date.now()}-${i}`,
        volunteerName: recipient.name,
        volunteerEmail: recipient.email,
        volunteerPhone: recipient.phone,
        role: recipient.role || 'volunteer',
        dutyTitle: dispatchDutyTitle,
        dutyDate: dispatchDutyDate,
        dutyTime: dispatchDutyTime,
        dutyLocation: dispatchDutyLocation,
        badgeLevel: dispatchBadgeLevel,
        instructions: dispatchInstructions,
      };

      try {
        const sendRes = await sendVolunteerPassEmail(passPayload);
        results.push({
          name: recipient.name,
          email: recipient.email,
          success: sendRes.success,
          message: sendRes.message,
          mode: sendRes.mode,
        });
      } catch (err: any) {
        results.push({
          name: recipient.name,
          email: recipient.email,
          success: false,
          message: err.message || 'Failed to dispatch email',
          mode: 'error',
        });
      }
    }

    setDispatchResults(results);
    setIsDispatching(false);
  };

  const handleRoleSwitch = (newRole: 'admin' | 'volunteer') => {
    setToggledRole(newRole);
    if (newRole === 'volunteer') {
      setToggledPermissions(prev => ({
        qr_checkin: prev.qr_checkin !== undefined ? prev.qr_checkin : true,
        devotees: prev.devotees !== undefined ? prev.devotees : true,
        activity_log: prev.activity_log !== undefined ? prev.activity_log : true,
      }));
    }
  };

  const handleInviteRoleSwitch = (newRole: 'admin' | 'volunteer') => {
    setNewUserData(prev => ({ ...prev, role: newRole }));
    if (newRole === 'volunteer') {
      setInvitePermissions({
        qr_checkin: true,
        devotees: true,
        activity_log: true
      });
    }
  };

  const deleteUser = async (id: string, role: string) => {
    if (role === 'super_admin') {
      alert('Access Denied: The Super Admin account cannot be deleted or revoked.');
      return;
    }
    if (confirm('Are you sure you want to revoke administrative/scanner access for this user?')) {
      try {
        const res = await fetch(`/api/users?id=${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': String(currentUser?.id || ''),
            'x-user-email': currentUser?.email || '',
          },
        });
        const data = await res.json();
        if (data.success) {
          await fetchUsers();
        } else {
          // Fallback direct delete if Super Admin
          if (isSuperAdmin) {
            const { createClient } = await import('@/lib/client');
            const supabase = createClient();
            await supabase.from('users').delete().eq('id', id);
            await fetchUsers();
          } else {
            alert(`Failed to remove access: ${data.message}`);
          }
        }
      } catch (err) {
        console.error('Delete error, trying direct Supabase deletion:', err);
        if (isSuperAdmin) {
          try {
            const { createClient } = await import('@/lib/client');
            const supabase = createClient();
            await supabase.from('users').delete().eq('id', id);
            await fetchUsers();
          } catch (fbErr) {
            alert('An unexpected error occurred while revoking access.');
          }
        } else {
          alert('An unexpected error occurred while revoking access.');
        }
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let permissionsToSend = { ...invitePermissions };
      if (newUserData.role === 'volunteer') {
        permissionsToSend = {
          qr_checkin: !!invitePermissions.qr_checkin,
          devotees: !!invitePermissions.devotees,
          activity_log: !!invitePermissions.activity_log,
        };
      }

      const payload = {
        name: newUserData.name.trim(),
        email: newUserData.email.trim(),
        phone: newUserData.phone.trim(),
        password: newUserData.password,
        role: newUserData.role,
        permissions: permissionsToSend,
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUser?.id || ''),
          'x-user-email': currentUser?.email || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setShowInviteModal(false);
        setNewUserData({ name: '', email: '', phone: '', password: '', role: 'volunteer' });
        setInvitePermissions({ qr_checkin: true, devotees: true, activity_log: true });
        await fetchUsers();
      } else {
        // Fallback to direct Supabase insert if Super Admin
        if (isSuperAdmin) {
          const { createClient } = await import('@/lib/client');
          const supabase = createClient();
          const newUser: any = {
            id: Date.now().toString(),
            name: payload.name,
            email: payload.email,
            phone: payload.phone || '',
            password: payload.password,
            role: payload.role,
          };

          let insResult = await supabase.from('users').insert([{
            ...newUser,
            permissions: payload.permissions
          }]).select().single();

          if (insResult.error && (insResult.error.message.includes('permissions') || insResult.error.code === '42703')) {
            insResult = await supabase.from('users').insert([newUser]).select().single();
          }

          if (!insResult.error && insResult.data) {
            setShowInviteModal(false);
            setNewUserData({ name: '', email: '', phone: '', password: '', role: 'volunteer' });
            setInvitePermissions({ qr_checkin: true, devotees: true, activity_log: true });
            await fetchUsers();
            return;
          }
        }
        alert(`Failed to invite colleague: ${data.message}`);
      }
    } catch (err) {
      console.error('Invite error, trying direct Supabase fallback:', err);
      if (isSuperAdmin) {
        try {
          const { createClient } = await import('@/lib/client');
          const supabase = createClient();
          const newUser: any = {
            id: Date.now().toString(),
            name: newUserData.name,
            email: newUserData.email,
            phone: newUserData.phone || '',
            password: newUserData.password,
            role: newUserData.role,
          };

          const defaultVolunteerPerms = { qr_checkin: true, devotees: true, activity_log: true };
          const perms = newUserData.role === 'admin' ? invitePermissions : defaultVolunteerPerms;

          let insResult = await supabase.from('users').insert([{
            ...newUser,
            permissions: perms
          }]).select().single();

          if (insResult.error && (insResult.error.message.includes('permissions') || insResult.error.code === '42703')) {
            insResult = await supabase.from('users').insert([newUser]).select().single();
          }

          if (!insResult.error && insResult.data) {
            setShowInviteModal(false);
            setNewUserData({ name: '', email: '', phone: '', password: '', role: 'volunteer' });
            setInvitePermissions({ qr_checkin: true, devotees: true, activity_log: true });
            await fetchUsers();
            return;
          }
        } catch (fbErr) {
          console.error('Supabase fallback insert failed:', fbErr);
        }
      }
      alert('An unexpected error occurred while inviting user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openManagePermissionsModal = (adminUser: Volunteer) => {
    setSelectedAdminForPermissions(adminUser);
    const initialRole = (adminUser.role === 'admin' ? 'admin' : 'volunteer');
    setToggledRole(initialRole);
    if (initialRole === 'volunteer') {
      setToggledPermissions({
        qr_checkin: adminUser.permissions?.qr_checkin !== undefined ? adminUser.permissions.qr_checkin : true,
        devotees: adminUser.permissions?.devotees !== undefined ? adminUser.permissions.devotees : true,
        activity_log: adminUser.permissions?.activity_log !== undefined ? adminUser.permissions.activity_log : true,
      });
    } else {
      setToggledPermissions(adminUser.permissions || {});
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedAdminForPermissions) return;
    setIsSavingPermissions(true);
    try {
      let permissionsToSend = { ...toggledPermissions };
      if (toggledRole === 'volunteer') {
        permissionsToSend = {
          qr_checkin: !!toggledPermissions.qr_checkin,
          devotees: !!toggledPermissions.devotees,
          activity_log: !!toggledPermissions.activity_log,
        };
      }

      const res = await fetch('/api/users/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUser?.id || ''),
          'x-user-email': currentUser?.email || '',
        },
        body: JSON.stringify({
          userId: selectedAdminForPermissions.id,
          role: toggledRole,
          permissions: permissionsToSend,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (String(currentUser?.id) === String(selectedAdminForPermissions.id)) {
          updateUserPermissions(permissionsToSend);
        }

        setSelectedAdminForPermissions(null);
        await fetchUsers();
      } else {
        // Fallback direct update in Supabase if Super Admin
        if (isSuperAdmin) {
          const { createClient } = await import('@/lib/client');
          const supabase = createClient();

          let updResult = await supabase.from('users').update({
            role: toggledRole,
            permissions: permissionsToSend
          }).eq('id', selectedAdminForPermissions.id);

          if (updResult.error && (updResult.error.message.includes('permissions') || updResult.error.code === '42703')) {
            updResult = await supabase.from('users').update({
              role: toggledRole
            }).eq('id', selectedAdminForPermissions.id);
          }

          if (!updResult.error) {
            if (String(currentUser?.id) === String(selectedAdminForPermissions.id)) {
              updateUserPermissions(permissionsToSend);
            }
            setSelectedAdminForPermissions(null);
            await fetchUsers();
            return;
          }
        }
        alert(`Failed to save access settings: ${data.message}`);
      }
    } catch (err) {
      console.error('Save permissions error, trying direct Supabase fallback:', err);
      if (isSuperAdmin) {
        try {
          const { createClient } = await import('@/lib/client');
          const supabase = createClient();

          let permissionsToSend = { ...toggledPermissions };
          if (toggledRole === 'volunteer') {
            permissionsToSend = {
              qr_checkin: !!toggledPermissions.qr_checkin,
              devotees: !!toggledPermissions.devotees,
              activity_log: !!toggledPermissions.activity_log,
            };
          }

          let updResult = await supabase.from('users').update({
            role: toggledRole,
            permissions: permissionsToSend
          }).eq('id', selectedAdminForPermissions.id);

          if (updResult.error && (updResult.error.message.includes('permissions') || updResult.error.code === '42703')) {
            updResult = await supabase.from('users').update({
              role: toggledRole
            }).eq('id', selectedAdminForPermissions.id);
          }

          if (!updResult.error) {
            if (String(currentUser?.id) === String(selectedAdminForPermissions.id)) {
              updateUserPermissions(permissionsToSend);
            }
            setSelectedAdminForPermissions(null);
            await fetchUsers();
            return;
          }
        } catch (fbErr) {
          console.error('Supabase fallback update failed:', fbErr);
        }
      }
      alert('An unexpected error occurred saving access settings.');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const togglePermissionCheckbox = (permKey: string, isInviteModal = false) => {
    if (isInviteModal) {
      setInvitePermissions(prev => ({ ...prev, [permKey]: !prev[permKey] }));
    } else {
      setToggledPermissions(prev => ({ ...prev, [permKey]: !prev[permKey] }));
    }
  };

  const getPermissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard size={18} />;
      case 'QrCode': return <QrCode size={18} />;
      case 'Users': return <Users size={18} />;
      case 'Clock': return <Clock size={18} />;
      case 'Calendar': return <Calendar size={18} />;
      case 'Gift': return <Gift size={18} />;
      case 'Coffee': return <Coffee size={18} />;
      case 'PieChart': return <PieChart size={18} />;
      case 'Settings': return <Settings size={18} />;
      default: return <Shield size={18} />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Personnel & Volunteer Dispatch
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Master Admin control for personnel access, volunteer roster, and EmailJS QR Badge dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* EmailJS QR Pass Dispatch Button */}
          <button
            onClick={handleOpenDispatchModal}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all duration-200 text-sm transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Mail size={17} />
            <span>Send QR Pass via EmailJS</span>
            {allTargetRecipients.length > 0 && (
              <span className="bg-white text-orange-700 text-xs px-2 py-0.5 rounded-full font-black">
                {allTargetRecipients.length}
              </span>
            )}
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => {
                setNewUserData({ name: '', email: '', phone: '', password: '', role: 'volunteer' });
                setInvitePermissions({ qr_checkin: true, devotees: true, activity_log: true });
                setShowInviteModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 text-sm transform hover:-translate-y-0.5 cursor-pointer"
            >
              <UserPlus size={17} />
              <span>Invite Colleague</span>
            </button>
          )}
        </div>
      </div>
      {/* Filter Tabs & Selection Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/60">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
          >
            All Personnel ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'volunteers'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
          >
            <QrCode size={14} />
            <span>Volunteers ({users.filter(u => u.role === 'volunteer').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'admins'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
          >
            <Shield size={14} />
            <span>Admins ({users.filter(u => u.role === 'admin' || u.role === 'super_admin').length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scanned_badges');
              fetchScannedVolunteers();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'scanned_badges'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm shadow-amber-500/30 font-black'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300/50'
              }`}
          >
            <Award size={14} />
            <span>Scanned Badges ({scannedVolunteers.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {activeTab === 'scanned_badges' ? (
            <div className="flex flex-wrap items-center gap-2">
              {selectedScannedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelectedScannedPasses}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer animate-fade-in"
                  title="Delete selected scanned pass records"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedScannedIds.length})</span>
                </button>
              )}

              {scannedVolunteers.length > 0 && (
                <button
                  onClick={handleClearAllScannedPasses}
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Clear all scanned records"
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              )}

              <button
                onClick={handleExportScannedCSV}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                title="Download CSV report of all scanned volunteers and awarded badges"
              >
                <span>📥 Export CSV / Excel</span>
                <span className="bg-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {filteredScannedVolunteers.length}
                </span>
              </button>

              <button
                onClick={fetchScannedVolunteers}
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-orange-600 cursor-pointer"
                title="Refresh scanned volunteers list"
              >
                <RefreshCw size={14} className={isLoadingScans ? 'animate-spin' : ''} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={selectAllFiltered}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                  <>
                    <CheckSquare size={16} className="text-orange-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square size={16} className="text-gray-400" />
                    <span>Select All ({filteredUsers.length})</span>
                  </>
                )}
              </button>

              {allTargetRecipients.length > 0 && (
                <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800/40">
                  {allTargetRecipients.length} Target{allTargetRecipients.length === 1 ? '' : 's'} Ready
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎖️ SCANNED VOLUNTEERS WITH BADGE DETAILS TAB VIEW                         */}
      {/* ========================================================================= */}
      {activeTab === 'scanned_badges' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-amber-200/80 dark:border-slate-700 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                <Award size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  Total Passes Scanned
                </span>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{scannedVolunteers.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-emerald-200/80 dark:border-slate-700 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Attendance Confirmed
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {scannedVolunteers.filter(v => v.status.includes('Badge') || v.status.includes('Checked') || v.status.includes('Verified')).length}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-blue-200/80 dark:border-slate-700 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                <Sparkles size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                  Badge Tiers Active
                </span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {new Set(scannedVolunteers.map(v => v.badge)).size} Types
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by volunteer name, duty, or badge..."
                value={scannedSearch}
                onChange={e => setScannedSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={scannedBadgeFilter}
                onChange={e => setScannedBadgeFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-gray-300 outline-none font-semibold cursor-pointer"
              >
                <option value="All">All Badge Tiers</option>
                <option value="Active Swayamsevak">Active Swayamsevak</option>
                <option value="Lead">Seva & Utsavam Lead</option>
                <option value="Annadanam">Annadanam & Kitchen Sevak</option>
                <option value="Coordinator">Security & Crowd Coordinator</option>
                <option value="Operations">Operations Lead</option>
              </select>

              <button
                onClick={handleExportScannedCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥 Export CSV</span>
              </button>
            </div>
          </div>

          {/* Scanned Volunteers Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
            {isLoadingScans ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Loading scanned volunteer passes...</span>
              </div>
            ) : filteredScannedVolunteers.length === 0 ? (
              <div className="py-16 text-center text-gray-500 dark:text-gray-400 p-6 space-y-3">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Award size={28} />
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">No Scanned Volunteer Passes Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When gate admins scan volunteer QR passes with the Gate Scanner, the verified volunteers and their awarded badges will appear here automatically.
                </p>
                <a
                  href="/dashboard/scanner"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors mt-2"
                >
                  <QrCode size={15} />
                  <span>Open Gate Scanner</span>
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                      <th className="px-4 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedScannedIds.length === filteredScannedVolunteers.length && filteredScannedVolunteers.length > 0}
                          onChange={selectAllScanned}
                          className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                          title="Select all scanned passes"
                        />
                      </th>
                      <th className="px-6 py-4">Volunteer / Swayamsevak</th>
                      <th className="px-6 py-4">Assigned Seva Duty</th>
                      <th className="px-6 py-4">Awarded Badge Tier</th>
                      <th className="px-6 py-4">Scan Date & Time</th>
                      <th className="px-6 py-4">Verified By</th>
                      <th className="px-6 py-4 text-center">Attendance</th>
                      <th className="px-4 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50 text-xs">
                    {filteredScannedVolunteers.map(item => {
                      const isChecked = selectedScannedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${isChecked
                              ? 'bg-red-50/50 dark:bg-red-950/20'
                              : 'hover:bg-amber-50/40 dark:hover:bg-slate-700/30'
                            }`}
                        >
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectScanned(item.id)}
                              className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-extrabold flex items-center justify-center shadow-sm">
                                {item.volunteerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-extrabold text-gray-900 dark:text-white text-sm">
                                  {item.volunteerName}
                                </p>
                                <span className="text-[10px] font-mono text-gray-400">Pass: {item.booking_id || 'VOL-PASS'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800 dark:text-gray-200">{item.sevaDuty}</p>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shadow-sm">
                              <Award size={13} className="text-amber-600 dark:text-amber-400" />
                              <span>{item.badge}</span>
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.scannedDate}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{item.scannedTime}</p>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-[11px] font-medium">
                              {item.scannedBy}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/40">
                              <CheckCircle2 size={13} />
                              <span>Present [✓]</span>
                            </span>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDeleteSingleScannedPass(item.id, item.volunteerName)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                              title={`Delete scanned record for ${item.volunteerName}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main Personnel Table */
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading personnel and volunteer roster...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                    <th className="px-6 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectAllFiltered}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                        title="Select/Deselect all"
                      />
                    </th>
                    <th className="px-6 py-4">Personnel / Volunteer</th>
                    <th className="px-6 py-4">Email & Phone</th>
                    <th className="px-6 py-4">Assigned Role</th>
                    <th className="px-6 py-4">Module Permissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm font-semibold">No records found in this category.</p>
                        <p className="text-xs text-gray-400 mt-1">Try changing your filter tab or invite new volunteers.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isRowSuperAdmin = u.role === 'super_admin' || u.email === 'admin@temple.com';
                      const isSelected = selectedUserIds.includes(u.id);
                      const activePermCount = u.permissions ? Object.values(u.permissions).filter(Boolean).length : 0;

                      return (
                        <tr
                          key={u.id || Math.random()}
                          className={`transition-colors ${isSelected
                              ? 'bg-orange-50/70 dark:bg-orange-950/20'
                              : 'hover:bg-gray-50/80 dark:hover:bg-slate-700/40'
                            }`}
                        >
                          {/* Checkbox */}
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectUser(u.id)}
                              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                            />
                          </td>

                          {/* User Profile */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm ${u.role === 'super_admin' ? 'bg-gradient-to-tr from-amber-500 to-red-500' :
                                  u.role === 'admin' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' :
                                    'bg-gradient-to-tr from-orange-500 to-amber-500'
                                }`}>
                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isRowSuperAdmin && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                                      Super Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">ID: {u.id?.slice(0, 10) || 'N/A'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Contact info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">{u.email}</div>
                            <div className="text-xs text-gray-400 font-mono">{u.phone || 'No phone'}</div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                                u.role === 'admin'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                                  'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                              }`}>
                              <Shield size={12} />
                              <span className="capitalize">{u.role?.replace('_', ' ')}</span>
                            </span>
                          </td>

                          {/* Permissions count & pills */}
                          <td className="px-6 py-4">
                            {u.role === 'super_admin' ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                                Full System Access
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                                  {activePermCount} Enabled
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              {/* Single Send QR Pass Button */}
                              <button
                                onClick={() => {
                                  setSelectedUserIds([u.id]);
                                  setDispatchResults([]);
                                  setShowEmailDispatchModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-bold transition-colors border border-orange-200/60 dark:border-orange-800/50 cursor-pointer"
                                title="Send QR Duty Pass to this user"
                              >
                                <Mail size={13} />
                                <span className="hidden sm:inline">Send Pass</span>
                              </button>

                              {!isRowSuperAdmin && isSuperAdmin && (
                                <button
                                  onClick={() => openManagePermissionsModal(u)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-200/60 dark:border-blue-800/50 cursor-pointer"
                                  title="Manage Permissions and Role Access"
                                >
                                  <Edit size={13} />
                                  <span className="hidden sm:inline">Access</span>
                                </button>
                              )}

                              {!isRowSuperAdmin && isSuperAdmin && (
                                <button
                                  onClick={() => deleteUser(u.id, u.role)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                  title="Revoke Access"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📧 VOLUNTEER EMAIL & QR BADGE DISPATCH MODAL (EMAILJS & MANUAL GMAIL)       */}
      {showEmailDispatchModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in my-8 border border-orange-200/80 dark:border-slate-700">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight">
                    Volunteer QR Duty Pass Dispatch
                  </h3>
                  <p className="text-xs text-orange-100 mt-0.5">
                    Send high-resolution QR entry passes to {allTargetRecipients.length} volunteer{allTargetRecipients.length === 1 ? '' : 's'} via EmailJS & SMTP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailDispatchModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left">

              {/* 🌟 1. MANUAL GMAIL / EMAIL INPUT SECTION */}
              <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-orange-700 dark:text-orange-400 tracking-wider flex items-center gap-1.5">
                    <AtSign size={14} /> Add Volunteer Gmail / Email Address
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Paste one or multiple Gmails
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={manualEmailInput}
                      onChange={e => setManualEmailInput(e.target.value)}
                      placeholder="e.g. volunteer@gmail.com, volunteer2@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={manualNameInput}
                      onChange={e => setManualNameInput(e.target.value)}
                      placeholder="Volunteer Name (optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddManualGmail}
                      className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Add Gmail</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 🌟 2. TARGET RECIPIENTS PILLS (SELECTED ROSTER + MANUAL GMAIL) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Target Recipients ({allTargetRecipients.length})
                  </label>
                  {allTargetRecipients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserIds([]);
                        setCustomRecipients([]);
                      }}
                      className="text-[11px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700">
                  {allTargetRecipients.map((recipient) => (
                    <span
                      key={recipient.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all ${recipient.isManual
                          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white text-gray-900 dark:bg-slate-700 dark:text-gray-100 border-gray-200 dark:border-slate-600'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${recipient.isManual ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                      <strong>{recipient.name}</strong>
                      <span className="opacity-70 text-[11px]">({recipient.email})</span>
                      {recipient.isManual && (
                        <span className="bg-emerald-200 dark:bg-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">
                          Gmail
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(recipient)}
                        className="ml-1 text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-black/10 cursor-pointer"
                        title="Remove recipient"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}

                  {allTargetRecipients.length === 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium py-1">
                      No recipients selected yet. Type a Gmail address above or select volunteers from the table.
                    </span>
                  )}
                </div>
              </div>

              {/* 🌟 3. DUTY & SCHEDULE CONFIGURATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Seva / Duty Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchDutyTitle}
                    onChange={e => setDispatchDutyTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                    placeholder="e.g. Maha Aradhana Utsavam Seva"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Duty Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dispatchDutyDate}
                    onChange={e => setDispatchDutyDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Shift Timing *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchDutyTime}
                    onChange={e => setDispatchDutyTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                    placeholder="e.g. 08:00 AM - 02:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Assigned Location / Gate
                  </label>
                  <input
                    type="text"
                    value={dispatchDutyLocation}
                    onChange={e => setDispatchDutyLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                    placeholder="e.g. Main Sanctum & Annapurna Hall"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Badge Level / Designation
                  </label>
                  <select
                    value={dispatchBadgeLevel}
                    onChange={e => setDispatchBadgeLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold"
                  >
                    <option value="🎖️ Active Swayamsevak">🎖️ Active Swayamsevak (Standard Duty)</option>
                    <option value="⭐ Seva & Utsavam Lead">⭐ Seva & Utsavam Lead</option>
                    <option value="🍽️ Annadanam & Kitchen Sevak">🍽️ Annadanam & Kitchen Sevak</option>
                    <option value="🛡️ Security & Crowd Coordinator">🛡️ Security & Crowd Coordinator</option>
                    <option value="🚩 Senior Temple Operations Lead">🚩 Senior Temple Operations Lead</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Custom Volunteer Instructions / Message
                  </label>
                  <textarea
                    rows={2}
                    value={dispatchInstructions}
                    onChange={e => setDispatchInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Instructions for reporting time, dress code, and scanner gate..."
                  />
                </div>
              </div>

              {/* 🌟 4. LIVE QR PREVIEW CARD */}
              <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 bg-white p-2 rounded-2xl shadow-md border border-orange-100 flex items-center justify-center shrink-0">
                  {previewQrUrl ? (
                    <img src={previewQrUrl} alt="Live QR Preview" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode size={40} className="text-orange-500 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                      Live Email & QR Pass Preview
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-200 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold text-[10px]">
                      {dispatchBadgeLevel}
                    </span>
                  </div>
                  <p>
                    Every volunteer receives a unique, scannable QR ticket embedded in their email. When scanned at the temple gate, the admin can mark their attendance and issue their digital seva badge.
                  </p>
                </div>
              </div>

              {/* 🌟 5. DISPATCH PROGRESS */}
              {dispatchProgress && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                    <span>
                      {isDispatching
                        ? `Sending email to ${dispatchProgress.activeName}... (${dispatchProgress.current}/${dispatchProgress.total})`
                        : `Dispatch Complete! (${dispatchProgress.current}/${dispatchProgress.total} Processed)`}
                    </span>
                    <span>{Math.round((dispatchProgress.current / dispatchProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(dispatchProgress.current / dispatchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 🌟 6. RESULT SUMMARY */}
              {dispatchResults.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Dispatch Log ({dispatchResults.filter(r => r.success).length} Successful, {dispatchResults.filter(r => !r.success).length} Failed)
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs">
                    {dispatchResults.map((res, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-lg ${res.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {res.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          <span className="font-bold">{res.name}</span>
                          <span className="text-[11px] opacity-75">({res.email})</span>
                        </div>
                        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/50 dark:bg-slate-900/50">
                          {res.mode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailDispatchModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                  {dispatchResults.length > 0 ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDispatchEmails}
                  disabled={isDispatching || allTargetRecipients.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-md shadow-orange-600/30 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDispatching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Emails...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send to {allTargetRecipients.length} Recipient{allTargetRecipients.length === 1 ? '' : 's'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE COLLEAGUE MODAL WITH ROLE UI/UX SWITCHING */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8 border border-gray-100 dark:border-slate-700">
            {/* Modal Dynamic Header */}
            <div className={`flex justify-between items-center p-6 border-b transition-colors ${newUserData.role === 'admin'
                ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white border-blue-800/40'
                : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white border-orange-700/40'
              }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                  {newUserData.role === 'admin' ? <Shield size={22} /> : <QrCode size={22} />}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white leading-tight">Invite Colleague</h3>
                  <p className="text-xs text-white/80">
                    {newUserData.role === 'admin'
                      ? 'Creating Administrator account with custom module access'
                      : 'Creating Volunteer Scanner account with restricted floor operations'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-5 text-left max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                  <input required type="text" value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="e.g. Harsha Patil" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                  <input required type="email" value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="admin@vidyaranyapura-mutt.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <input type="tel" value={newUserData.phone} onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Initial Password *</label>
                  <input required type="text" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Assign secure password" />
                </div>
              </div>

              {/* Dynamic Role Switcher Cards */}
              <div className="pt-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">System Role</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleInviteRoleSwitch('admin')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${newUserData.role === 'admin'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <Shield size={16} />
                    <span>Administrator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInviteRoleSwitch('volunteer')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${newUserData.role === 'volunteer'
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <QrCode size={16} />
                    <span>Volunteer / Scanner</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Callout based on selected role */}
              {newUserData.role === 'admin' ? (
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3 text-xs text-blue-950 dark:text-blue-200">
                  <Shield size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    <strong>Administrator Scope:</strong> You can assign custom access to any of the 9 system modules below.
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center gap-3 text-xs text-orange-950 dark:text-orange-200">
                  <AlertCircle size={18} className="text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <span>
                    <strong>Volunteer Scope:</strong> Permissions are strictly restricted to Front-Desk & Scanner operations (<strong>QR Check-in</strong>, <strong>Devotees</strong>, and <strong>Activity Log</strong>).
                  </span>
                </div>
              )}

              {/* Filtered Permissions section */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${newUserData.role === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                    {newUserData.role === 'admin' ? 'Assign Module Permissions (9 Available)' : 'Assign Volunteer Modules (3 Restricted)'}
                  </label>
                  <span className="text-[11px] font-bold text-gray-400">
                    {newUserData.role === 'volunteer' ? 'Restricted to floor ops' : 'Full access config'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS
                    .filter(perm => newUserData.role === 'admin' || VOLUNTEER_ALLOWED_PERMS.includes(perm.key))
                    .map(perm => {
                      const isChecked = !!invitePermissions[perm.key];
                      const isVolunteer = newUserData.role === 'volunteer';

                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermissionCheckbox(perm.key, true)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${isChecked
                              ? isVolunteer
                                ? 'border-orange-600 bg-orange-50/90 dark:bg-orange-950/50 dark:border-orange-500 shadow-sm'
                                : 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isChecked
                              ? isVolunteer
                                ? 'bg-orange-600 text-white dark:bg-orange-500'
                                : 'bg-blue-600 text-white dark:bg-blue-500'
                              : 'border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800'
                            }`}>
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={isChecked ? (isVolunteer ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400') : 'text-gray-500'}>
                                {getPermissionIcon(perm.iconName)}
                              </span>
                              <span className={`text-sm font-bold truncate ${isChecked
                                  ? (isVolunteer ? 'text-orange-950 dark:text-orange-100' : 'text-blue-950 dark:text-blue-100')
                                  : 'text-gray-800 dark:text-gray-300'
                                }`}>
                                {perm.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-1 line-clamp-2">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 text-sm text-white cursor-pointer ${newUserData.role === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-600/30'
                    }`}
                >
                  {isSubmitting ? 'Inviting...' : 'Create Colleague'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PERMISSIONS & ROLE MODAL (DYNAMIC UI/UX THEME & PERMISSION LIMITS) */}
      {selectedAdminForPermissions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8 border border-gray-100 dark:border-slate-700">
            {/* Dynamic Modal Top Header based on toggledRole */}
            <div className={`flex justify-between items-center p-6 border-b transition-colors ${toggledRole === 'admin'
                ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white border-blue-800/40'
                : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white border-orange-700/40'
              }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                  {toggledRole === 'admin' ? <Shield size={22} /> : <QrCode size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white leading-tight">Manage Access & Role</h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                      {toggledRole === 'admin' ? 'Administrator' : 'Volunteer'}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    Modifying access boundary for <span className="font-bold underline">{selectedAdminForPermissions.name}</span> ({selectedAdminForPermissions.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdminForPermissions(null)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Dynamic Role Switcher Pills */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  System Role
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('admin')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${toggledRole === 'admin'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <Shield size={16} />
                    <span>Administrator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('volunteer')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${toggledRole === 'volunteer'
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <QrCode size={16} />
                    <span>Volunteer / Scanner</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Callout Banner based on Role */}
              {toggledRole === 'admin' ? (
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3 text-xs text-blue-950 dark:text-blue-200">
                  <Shield size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    <strong>Administrator Scope:</strong> All 9 system modules can be individually granted to this administrator.
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center gap-3 text-xs text-orange-950 dark:text-orange-200">
                  <AlertCircle size={18} className="text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <span>
                    <strong>Volunteer Scope:</strong> Permissions are strictly limited to Front-Desk & Scanner operations (<strong>QR Check-in</strong>, <strong>Devotees</strong>, and <strong>Activity Log</strong>).
                  </span>
                </div>
              )}

              {/* Permissions Checkbox Grid Filtered by Role */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${toggledRole === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                    {toggledRole === 'admin' ? 'Module Permissions (All 9 Modules)' : 'Volunteer Permissions (3 Modules Allowed)'}
                  </label>
                  <span className="text-[11px] font-bold text-gray-400">
                    {toggledRole === 'volunteer' ? 'Floor Operations Only' : 'Full System Access'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {AVAILABLE_PERMISSIONS
                    .filter(perm => toggledRole === 'admin' || VOLUNTEER_ALLOWED_PERMS.includes(perm.key))
                    .map(perm => {
                      const isChecked = !!toggledPermissions[perm.key];
                      const isVolunteer = toggledRole === 'volunteer';

                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermissionCheckbox(perm.key, false)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${isChecked
                              ? isVolunteer
                                ? 'border-orange-600 bg-orange-50/90 dark:bg-orange-950/50 dark:border-orange-500 shadow-sm'
                                : 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isChecked
                              ? isVolunteer
                                ? 'bg-orange-600 text-white dark:bg-orange-500'
                                : 'bg-blue-600 text-white dark:bg-blue-500'
                              : 'border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800'
                            }`}>
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={isChecked ? (isVolunteer ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400') : 'text-gray-500'}>
                                {getPermissionIcon(perm.iconName)}
                              </span>
                              <span className={`text-sm font-bold truncate ${isChecked
                                  ? (isVolunteer ? 'text-orange-950 dark:text-orange-100' : 'text-blue-950 dark:text-blue-100')
                                  : 'text-gray-800 dark:text-gray-300'
                                }`}>
                                {perm.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-1 line-clamp-2">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAdminForPermissions(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer ${toggledRole === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-600/30'
                      : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-800 shadow-orange-600/30'
                    }`}
                >
                  {isSavingPermissions ? 'Saving...' : 'Save Access Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
