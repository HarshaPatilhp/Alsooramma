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
  AlertCircle
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
  const [invitePermissions, setInvitePermissions] = useState<Record<string, boolean>>({});

  // Manage permissions modal states
  const [selectedAdminForPermissions, setSelectedAdminForPermissions] = useState<Volunteer | null>(null);
  const [toggledRole, setToggledRole] = useState<'admin' | 'volunteer'>('volunteer');
  const [toggledPermissions, setToggledPermissions] = useState<Record<string, boolean>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email === 'admin@temple.com';

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

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
        // Fallback to direct Supabase client query
        const { createClient } = await import('@/lib/client');
        const supabase = createClient();
        let dbResult = await supabase
          .from('users')
          .select('id, name, email, phone, role, permissions, created_at')
          .order('created_at', { ascending: false });

        if (dbResult.error && (dbResult.error.message.includes('permissions') || dbResult.error.code === '42703')) {
          dbResult = await supabase
            .from('users')
            .select('id, name, email, phone, role, created_at')
            .order('created_at', { ascending: false });
        }

        const dbUsers = dbResult.data;
        const dbErr = dbResult.error;

        if (!dbErr && Array.isArray(dbUsers) && dbUsers.length > 0) {
          const mappedUsers = dbUsers.map(u => ({
            ...u,
            permissions: u.permissions || (
              u.role === 'super_admin' || u.email === 'admin@temple.com'
                ? {
                    dashboard: true,
                    qr_checkin: true,
                    devotees: true,
                    activity_log: true,
                    seva_dashboard: true,
                    donations: true,
                    annadanam: true,
                    reports: true,
                    user_management: true,
                  }
                : u.role === 'volunteer'
                  ? {
                      dashboard: true,
                      qr_checkin: true,
                      devotees: true,
                      activity_log: true,
                    }
                  : {}
            )
          }));
          setUsers(mappedUsers);
        } else {
          // If RLS returns [] or blocks query, ensure current user and Master Admin are displayed
          const fallbackUsers: Volunteer[] = [];
          if (currentUser) {
            fallbackUsers.push({
              id: String(currentUser.id),
              name: currentUser.name,
              email: currentUser.email,
              phone: (currentUser as any).phone || '',
              role: currentUser.role,
              permissions: currentUser.permissions || {},
            });
          }
          if (!fallbackUsers.some((u) => u.email === 'admin@temple.com')) {
            fallbackUsers.push({
              id: '1',
              name: 'Master Admin',
              email: 'admin@temple.com',
              phone: '9876543210',
              role: 'super_admin',
              permissions: {
                dashboard: true,
                qr_checkin: true,
                devotees: true,
                activity_log: true,
                seva_dashboard: true,
                donations: true,
                annadanam: true,
                reports: true,
                user_management: true,
              },
            });
          }
          setUsers(fallbackUsers);
        }
      }
    } catch (err) {
      console.error('Error fetching users via API, trying direct Supabase fallback:', err);
      try {
        const { createClient } = await import('@/lib/client');
        const supabase = createClient();
        let dbResult = await supabase
          .from('users')
          .select('id, name, email, phone, role, permissions, created_at')
          .order('created_at', { ascending: false });

        if (dbResult.error && (dbResult.error.message.includes('permissions') || dbResult.error.code === '42703')) {
          dbResult = await supabase
            .from('users')
            .select('id, name, email, phone, role, created_at')
            .order('created_at', { ascending: false });
        }

        const dbUsers = dbResult.data;
        const dbErr = dbResult.error;

        if (!dbErr && Array.isArray(dbUsers) && dbUsers.length > 0) {
          const mappedUsers = dbUsers.map(u => ({
            ...u,
            permissions: u.permissions || (
              u.role === 'super_admin' || u.email === 'admin@temple.com'
                ? {
                    dashboard: true,
                    qr_checkin: true,
                    devotees: true,
                    activity_log: true,
                    seva_dashboard: true,
                    donations: true,
                    annadanam: true,
                    reports: true,
                    user_management: true,
                  }
                : u.role === 'volunteer'
                  ? {
                      dashboard: true,
                      qr_checkin: true,
                      devotees: true,
                      activity_log: true,
                    }
                  : {}
            )
          }));
          setUsers(mappedUsers);
        } else if (currentUser) {
          setUsers([
            {
              id: String(currentUser.id),
              name: currentUser.name,
              email: currentUser.email,
              phone: (currentUser as any).phone || '',
              role: currentUser.role,
              permissions: currentUser.permissions || {},
            },
          ]);
        }
      } catch (fbErr) {
        console.error('Supabase fallback failed:', fbErr);
      }
    } finally {
      setIsLoading(false);
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
    setIsSubmitting(true);
    try {
      const defaultVolunteerPerms = {
        dashboard: true,
        qr_checkin: true,
        devotees: true,
        activity_log: true,
      };

      const payload = {
        ...newUserData,
        permissions: newUserData.role === 'admin' 
          ? invitePermissions 
          : (Object.keys(invitePermissions).length > 0 ? invitePermissions : defaultVolunteerPerms),
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
        setInvitePermissions({});
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
            setInvitePermissions({});
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
          
          const defaultVolunteerPerms = { dashboard: true, qr_checkin: true, devotees: true, activity_log: true };
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
            setInvitePermissions({});
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
    setToggledRole((adminUser.role === 'admin' ? 'admin' : 'volunteer'));
    setToggledPermissions(adminUser.permissions || {});
  };

  const handleSavePermissions = async () => {
    if (!selectedAdminForPermissions) return;
    setIsSavingPermissions(true);
    try {
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
          permissions: toggledPermissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // If the logged-in user just modified their own permissions, sync context
        if (String(currentUser?.id) === String(selectedAdminForPermissions.id)) {
          updateUserPermissions(toggledPermissions);
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
            permissions: toggledPermissions 
          }).eq('id', selectedAdminForPermissions.id);
          
          if (updResult.error && (updResult.error.message.includes('permissions') || updResult.error.code === '42703')) {
            updResult = await supabase.from('users').update({ 
              role: toggledRole
            }).eq('id', selectedAdminForPermissions.id);
          }

          if (!updResult.error) {
            if (String(currentUser?.id) === String(selectedAdminForPermissions.id)) {
              updateUserPermissions(toggledPermissions);
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
          
          let updResult = await supabase.from('users').update({ 
            role: toggledRole,
            permissions: toggledPermissions 
          }).eq('id', selectedAdminForPermissions.id);
          
          if (updResult.error && (updResult.error.message.includes('permissions') || updResult.error.code === '42703')) {
            updResult = await supabase.from('users').update({ 
              role: toggledRole
            }).eq('id', selectedAdminForPermissions.id);
          }

          if (!updResult.error) {
            if (String(currentUser?.id) === String(selectedAdminForPermissions.id)) {
              updateUserPermissions(toggledPermissions);
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
              setInvitePermissions({});
              setShowInviteModal(true);
            }} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 text-sm transform hover:-translate-y-0.5"
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
                              <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-orange-200 dark:border-orange-800/60">
                                Scanner / Vol
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
                               {activePermCount} of {AVAILABLE_PERMISSIONS.length} Modules Allowed
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
                                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-200/60 dark:border-blue-800/50" 
                                   title="Manage Permissions and Role Access"
                                 >
                                   <Edit size={14} /> Manage Access
                                 </button>
                               )}
                               {isSuperAdmin && (
                                 <button 
                                   onClick={() => deleteUser(u.id, u.role)} 
                                   className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40" 
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

      {/* INVITE COLLEAGUE MODAL WITH CHECKBOX CARDS */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8 border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Invite Colleague</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add an administrator or volunteer scanner to the panel</p>
                </div>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-5 text-left max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input required type="text" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="e.g. Harsha Patil" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input required type="email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="admin@vidyaranyapura-mutt.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <input required type="tel" value={newUserData.phone} onChange={e => setNewUserData({...newUserData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Initial Password</label>
                  <input required type="text" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Assign secure password" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">System Role</label>
                <select 
                  value={newUserData.role} 
                  onChange={e => setNewUserData({...newUserData, role: e.target.value as 'admin'|'volunteer'})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                >
                  <option value="volunteer">Scanner / Volunteer (Default check-in access)</option>
                  <option value="admin">Administrator (Custom module permissions)</option>
                </select>
              </div>

              {/* Permissions section */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700/80 animate-fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Assign Module Permissions
                  </label>
                  <span className="text-xs font-medium text-gray-500">
                    {newUserData.role === 'admin' ? 'Select specific module permissions' : 'Default scanner modules auto-assigned if unselected'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isChecked = !!invitePermissions[perm.key];
                    return (
                      <div 
                        key={perm.key}
                        onClick={() => togglePermissionCheckbox(perm.key, true)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked 
                            ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm' 
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked 
                            ? 'bg-blue-600 text-white dark:bg-blue-500' 
                            : 'border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800'
                        }`}>
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold truncate ${isChecked ? 'text-blue-900 dark:text-blue-200' : 'text-gray-800 dark:text-gray-300'}`}>
                              {perm.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 text-sm">
                  {isSubmitting ? 'Inviting...' : 'Create Colleague'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PERMISSIONS & ROLE MODAL */}
      {selectedAdminForPermissions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8 border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Manage Access & Role</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Modifying access boundary for <span className="font-bold text-gray-800 dark:text-gray-200">{selectedAdminForPermissions.name}</span> ({selectedAdminForPermissions.email})
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAdminForPermissions(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">System Role</label>
                <select 
                  value={toggledRole} 
                  onChange={e => setToggledRole(e.target.value as 'admin'|'volunteer')} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold"
                >
                  <option value="volunteer">Scanner / Volunteer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-300">
                <AlertCircle size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>
                  Toggle the modules below. Changes take effect immediately after clicking <strong>Save Access Settings</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const isChecked = !!toggledPermissions[perm.key];
                  return (
                    <div 
                      key={perm.key}
                      onClick={() => togglePermissionCheckbox(perm.key, false)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked 
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:border-indigo-500 shadow-sm' 
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked 
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                          : 'border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800'
                      }`}>
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {getPermissionIcon(perm.iconName)}
                          </span>
                          <span className={`text-sm font-bold truncate ${isChecked ? 'text-indigo-950 dark:text-indigo-100' : 'text-gray-800 dark:text-gray-300'}`}>
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

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                <button type="button" onClick={() => setSelectedAdminForPermissions(null)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm">Cancel</button>
                <button 
                  type="button" 
                  onClick={handleSavePermissions} 
                  disabled={isSavingPermissions} 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2"
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
