"use client";

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, Edit, X } from 'lucide-react';
import { createClient } from '@/lib/client';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'volunteer';
}

export default function UsersPage() {
  const [users, setUsers] = useState<Volunteer[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', phone: '', password: '', role: 'volunteer' as 'admin' | 'volunteer' });

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (data && !error) {
         setUsers(data.map((u: any) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role
         })));
      }
    };
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if(confirm('Are you sure you want to remove this user access?')) {
       const supabase = createClient();
       const { error } = await supabase.from('users').delete().eq('id', id);
       if (!error) {
         setUsers(users.filter(x => x.id !== id));
       } else {
         alert("Failed to remove user access.");
         console.error(error);
       }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = createClient();
    const newUser = {
      id: Date.now().toString(),
      ...newUserData
    };
    
    const { error } = await supabase.from('users').insert([newUser]);
    if (!error) {
      setUsers([newUser as unknown as Volunteer, ...users]);
      setShowInviteModal(false);
      setNewUserData({ name: '', email: '', phone: '', password: '', role: 'volunteer' });
    } else {
      alert("Failed to invite user: " + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <Shield className="text-blue-500" />
             Access & Personnel Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Control administrative boundaries and assign volunteer scanner permissions.</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
          <UserPlus size={18} /> Invite Colleague
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
               <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                  <th className="px-6 py-4">Personnel</th>
                  <th className="px-6 py-4">Contact & Creds</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4 text-right">Settings</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
               {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg ${u.role === 'admin' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                             {u.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{u.name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{u.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.phone}</p>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        {u.role === 'admin' ? (
                           <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-200 dark:border-blue-800">Administrator</span>
                        ) : (
                           <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-orange-200 dark:border-orange-800">Scanner / Vol</span>
                        )}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit Permissions">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-1" title="Revoke Access">
                          <Trash2 size={16} />
                        </button>
                     </td>
                  </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invite Colleague</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Gururaj" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input required type="email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="colleague@temple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input required type="tel" value={newUserData.phone} onChange={e => setNewUserData({...newUserData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                <input required type="text" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Set an initial password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Role</label>
                <select value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value as 'admin'|'volunteer'})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="volunteer">Scanner / Volunteer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 mt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
