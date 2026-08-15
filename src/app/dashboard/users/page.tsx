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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_PERMISSIONS, PermissionKey, RBACUser } from '@/lib/rbac';

interface Volunteer extends RBACUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'volunteer' | string;
  permissions?: Record<string, boolean>;
}

const VOLUNTEER_ALLOWED_PERMS: PermissionKey[] = ['qr_checkin', 'devotees', 'activity_log'];

export default function UsersPage() {
  const { user: currentUser, updateUserPermissions } = useAuth();
  const [users, setUsers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Shield size={22} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Access & Personnel Management
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Control administrative boundaries, granular module permissions, and volunteer scanner access.
          </p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={() => {
              setNewUserData({ name: '', email: '', phone: '', password: '', role: 'volunteer' });
              setInvitePermissions({ qr_checkin: true, devotees: true, activity_log: true });
              setShowInviteModal(true);
            }} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 text-sm transform hover:-translate-y-0.5 cursor-pointer"
          >
            <UserPlus size={18} /> Invite Colleague
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading personnel and access control table...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
               <thead>
                 <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                    <th className="px-6 py-4">Personnel</th>
                    <th className="px-6 py-4">Contact & Creds</th>
                    <th className="px-6 py-4">Assigned Role</th>
                    <th className="px-6 py-4">Module Permissions</th>
                    <th className="px-6 py-4 text-right">Settings</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                 {users.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                       <p className="text-sm font-semibold">No personnel records found.</p>
                       <p className="text-xs text-gray-400 mt-1">If you just added a user, try refreshing the page or check your database connection.</p>
                     </td>
                   </tr>
                 ) : (
                   users.map(u => {
                     const isRowSuperAdmin = u.role === 'super_admin' || u.email === 'admin@temple.com';
                     const activePermCount = u.permissions ? Object.values(u.permissions).filter(Boolean).length : 0;

                     return (
                       <tr key={u.id || Math.random()} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-sm ${
                                 isRowSuperAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' :
                                 u.role === 'admin' ? 'bg-blue-600' : 'bg-orange-500'
                               }`}>
                                  {(u.name || 'User').charAt(0)}
                               </div>
                             <div>
                               <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                 {u.name}
                                 {isRowSuperAdmin && <span title="Protected Super Admin"><Lock size={13} className="text-purple-500 inline" /></span>}
                               </span>
                               <span className="text-xs text-gray-400 block sm:hidden">{u.email}</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{u.email}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{u.phone || '—'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {isRowSuperAdmin ? (
                              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-purple-200 dark:border-purple-800/60 inline-flex items-center gap-1.5">
                                <Shield size={12} /> Super Admin
                              </span>
                           ) : u.role === 'admin' ? (
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-200 dark:border-blue-800/60 inline-flex items-center gap-1.5">
                                <CheckSquare size={12} /> Administrator
                              </span>
                           ) : (
                              <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-orange-200 dark:border-orange-800/60 inline-flex items-center gap-1.5">
                                <QrCode size={12} /> Scanner / Vol
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {isRowSuperAdmin ? (
                             <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/30">
                               All Modules (Unrestricted)
                             </span>
                           ) : (
                             <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-600">
                               {activePermCount} Allowed
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                           {isRowSuperAdmin ? (
                             <span className="text-xs text-gray-400 dark:text-gray-500 font-medium italic">
                               Protected
                             </span>
                           ) : (
                             <div className="flex items-center justify-end gap-2">
                               {isSuperAdmin && (
                                 <button 
                                   onClick={() => openManagePermissionsModal(u)} 
                                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-200/60 dark:border-blue-800/50 cursor-pointer" 
                                   title="Manage Permissions and Role Access"
                                 >
                                   <Edit size={14} /> Manage Access
                                 </button>
                               )}
                               {isSuperAdmin && (
                                 <button 
                                   onClick={() => deleteUser(u.id, u.role)} 
                                   className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer" 
                                   title="Revoke Access"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               )}
                             </div>
                           )}
                        </td>
                     </tr>
                   );
                 }))}
               </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVITE COLLEAGUE MODAL WITH ROLE UI/UX SWITCHING */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8 border border-gray-100 dark:border-slate-700">
            {/* Modal Dynamic Header */}
            <div className={`flex justify-between items-center p-6 border-b transition-colors ${
              newUserData.role === 'admin'
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
                  <input required type="text" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="e.g. Harsha Patil" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                  <input required type="email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="admin@vidyaranyapura-mutt.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <input type="tel" value={newUserData.phone} onChange={e => setNewUserData({...newUserData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Initial Password *</label>
                  <input required type="text" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Assign secure password" />
                </div>
              </div>

              {/* Dynamic Role Switcher Cards */}
              <div className="pt-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">System Role</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleInviteRoleSwitch('admin')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      newUserData.role === 'admin'
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
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      newUserData.role === 'volunteer'
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
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    newUserData.role === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
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
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked 
                              ? isVolunteer 
                                ? 'border-orange-600 bg-orange-50/90 dark:bg-orange-950/50 dark:border-orange-500 shadow-sm' 
                                : 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked 
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
                              <span className={`text-sm font-bold truncate ${
                                isChecked 
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
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 text-sm text-white cursor-pointer ${
                    newUserData.role === 'admin'
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
            <div className={`flex justify-between items-center p-6 border-b transition-colors ${
              toggledRole === 'admin'
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
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      toggledRole === 'admin'
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
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      toggledRole === 'volunteer'
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
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    toggledRole === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
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
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked 
                              ? isVolunteer
                                ? 'border-orange-600 bg-orange-50/90 dark:bg-orange-950/50 dark:border-orange-500 shadow-sm'
                                : 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked 
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
                              <span className={`text-sm font-bold truncate ${
                                isChecked 
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
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer ${
                    toggledRole === 'admin'
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
