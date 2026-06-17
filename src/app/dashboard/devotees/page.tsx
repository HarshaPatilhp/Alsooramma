"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MoreVertical, CheckCircle, Trash2, Users, Clock } from 'lucide-react';


interface Booking {
  id: number;
  devoteeName: string;
  sevaName: string;
  phone: string;
  date: string;
  status: string;
}

export default function DevoteesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const deleteBooking = async (id: number) => {
    if(confirm('Are you sure you want to delete this booking?')) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);

      try {
        await fetch('/api/bookings/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, status: 'deleted' }),
        });
      } catch (err: any) {
        console.error('Failed to sync deletion with Google Sheets:', err.message);
      }
    }
  }

  const markCompleted = async (id: number) => {
    if(confirm('Mark this seva booking as completed?')) {
      const updated = bookings.map(b => b.id === id ? { ...b, status: 'completed' } : b);
      setBookings(updated);

      try {
        await fetch('/api/bookings/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, status: 'completed' }),
        });
      } catch (err: any) {
        console.error('Failed to sync status:', err.message);
      }
    }
  }


  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-amber-100 text-orange-950 dark:bg-orange-500/30 dark:text-white px-0.5 rounded font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No devotee bookings to export.');
      return;
    }
    const headers = ['Booking ID', 'Devotee Name', 'Phone', 'Seva Name', 'Date', 'Status'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.devoteeName || (b as any).fullName || '',
      b.phone || '',
      b.sevaName || '',
      b.date || '',
      b.status || ''
    ]);
    
    // Add BOM for Excel compatibility
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
       
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `devotees_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredBookings = bookings.filter(b => {
    const name = b.devoteeName || (b as any).fullName || '';
    const seva = b.sevaName || '';
    const id = b.id ? String(b.id) : '';
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = name.toLowerCase().includes(term) ||
                          seva.toLowerCase().includes(term) ||
                          id.includes(term);

    const matchesStatus = statusFilter === 'all' || (b.status || '').toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Devotee Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage all registered devotees and their sevas.</p>
        </div>
      </div>

      {/* Top Stats Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{bookings.length}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider font-semibold">Total Bookings</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{bookings.filter(b => (b.status || '').toLowerCase() === 'pending').length}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider font-semibold">Pending Sevas</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider font-semibold">Completed Sevas</p>
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or seva..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-900 shadow-sm"
            />
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-sm text-gray-700 dark:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-medium text-gray-700 dark:text-gray-300"
              >
                <Filter size={18} />
                {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </button>

            
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 z-10 py-1">
                {['all', 'pending', 'confirmed', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setShowStatusMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === status ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-medium text-gray-700 dark:text-gray-300"
              >
                <Calendar size={18} />
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 z-10 py-1">
                  <button
                    onClick={() => { setSortOrder('newest'); setShowSortMenu(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === 'newest' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => { setSortOrder('oldest'); setShowSortMenu(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === 'oldest' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                    Oldest First
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700/50">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Devotee Name</th>
                <th className="px-6 py-4">Seva Info</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                      #{highlightText(String(booking.id).slice(-8), searchTerm)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center font-bold text-orange-700 dark:text-orange-400">
                          {((booking as any).fullName || booking.devoteeName)?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white leading-tight">{highlightText((booking as any).fullName || booking.devoteeName || 'Unknown Devotee', searchTerm)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{highlightText(booking.phone || 'No phone', searchTerm)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{highlightText(booking.sevaName, searchTerm)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {highlightText(booking.date, searchTerm)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusColor(booking.status || 'pending')}`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {booking.status !== 'completed' && (
                        <button onClick={() => markCompleted(booking.id)} className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors ml-2" title="Mark Completed">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteBooking(booking.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors ml-2" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No devotees found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Status */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-800/30">
          <span>Showing 1 to {Math.min(filteredBookings.length, 10)} of {filteredBookings.length} entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded bg-orange-600 text-white">1</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
