"use client";

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, Edit } from 'lucide-react';
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
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
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
    </div>
  );
}
