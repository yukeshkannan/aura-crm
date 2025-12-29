import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, CheckCircle, XCircle, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, online: 0, absent: 0 });
    const [selectedUser, setSelectedUser] = useState(null); // For detail view
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchAttendance();
        
        // Poll for updates if Admin every 30s to keep dashboard live
        let interval;
        if (user.role === 'Admin') {
            interval = setInterval(fetchAttendance, 5000);
        }
        return () => clearInterval(interval);
    }, [user?.id, user?.role]);

    const fetchAttendance = async () => {
        try {
            // Admin fetches ALL, Employee fetches OWN
            const endpoint = user.role === 'Admin' ? '/api/attendance?limit=100' : `/api/attendance?userId=${user.id}`;
            const res = await axios.get(endpoint);
            const data = res.data.data || [];
            setAttendance(data);

            // Calculate Stats for Admin
            if (user.role === 'Admin') {
                const todayStr = new Date().toDateString();
                const todaysRecords = data.filter(r => new Date(r.date).toDateString() === todayStr);
                
                // Unique users present today
                const uniquePresent = new Set(todaysRecords.map(r => r.userId?._id || r.userId)).size;
                const currentlyOnline = todaysRecords.filter(r => !r.checkOut).length;
                
                setStats({
                    present: uniquePresent,
                    online: currentlyOnline,
                    absent: 0 
                });
            }

            setLoading(false);
        } catch (err) {
            console.error("Attendance fetch error:", err);
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // --- Helper for Admin View (Grouping) ---
    const getGroupedAttendance = () => {
        const groups = {};
        attendance.forEach(record => {
            const uId = record.userId?._id || record.userId;
            if (!uId) return;
            if (!groups[uId]) {
                groups[uId] = {
                    user: record.userId,
                    records: [],
                    latestSession: record, // attendance is sorted by date/time desc already from API
                    totalHoursToday: 0
                };
            }
            groups[uId].records.push(record);
            
            // Calculate total hours for today
            const todayStr = new Date().toDateString();
            if (new Date(record.date).toDateString() === todayStr && record.totalHours) {
                groups[uId].totalHoursToday += parseFloat(record.totalHours);
            }
        });
        return Object.values(groups);
    };

    // --- Guard Clause for Unauthorized Roles (e.g. Clients) ---
    if (user.role === 'Client') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
                <p>Access Denied. Content is for internal staff only.</p>
            </div>
        );
    }

    // --- Admin View ---
    if (user.role === 'Admin') {
        const groupedData = getGroupedAttendance().filter(group => 
            group.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            group.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedUser) {
            const userHistory = attendance.filter(r => (r.userId?._id || r.userId) === selectedUser._id);
            return (
                <div className="bg-slate-50 min-h-screen pb-20">
                    <div className="max-w-7xl mx-auto px-8 py-12">
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="mb-6 flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            Back to Employee List
                        </button>

                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black border border-white/30">
                                        {selectedUser.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black">{selectedUser.name}</h2>
                                        <p className="text-amber-100 font-medium opacity-90">{selectedUser.email} • {selectedUser.department || 'General'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Clock size={20} className="text-amber-500" />
                                    Detailed Log Session History
                                </h3>
                                
                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                                            <tr>
                                                <th className="p-5">Date</th>
                                                <th className="p-5">Login Time</th>
                                                <th className="p-5">Logout Time</th>
                                                <th className="p-5">Duration</th>
                                                <th className="p-5">Status</th>
                                                <th className="p-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {userHistory.map((record) => (
                                                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-5 font-bold text-slate-700">
                                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-5 font-mono text-sm text-slate-600">
                                                        {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </td>
                                                    <td className="p-5 font-mono text-sm text-slate-600">
                                                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                                                    </td>
                                                    <td className="p-5">
                                                        {record.totalHours ? (
                                                            <span className="font-bold text-slate-800 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm">
                                                                {record.totalHours} hrs
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-600 font-black animate-pulse text-sm">Active Now</span>
                                                        )}
                                                    </td>
                                                    <td className="p-5">
                                                        {!record.checkOut ? (
                                                            <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 w-fit">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                Online
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 font-bold text-sm bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 w-fit block">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button 
                                                            onClick={async (e) => {
                                                                if(window.confirm('Delete this specific session?')) {
                                                                    try {
                                                                        await axios.delete(`/api/attendance/${record._id}`);
                                                                        fetchAttendance();
                                                                    } catch (err) { alert('Failed to delete'); }
                                                                }
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-slate-50 min-h-screen pb-20">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Attendance</h1>
                            <p className="text-slate-500 mt-2 text-lg">Grouped employee monitoring and session history.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">Today's Overview</p>
                            <p className="text-2xl font-black text-slate-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                <Users size={28} />
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Currently Online</p>
                                <p className="text-3xl font-black text-slate-800 mt-1">{stats.online}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <CheckCircle size={28} />
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Present</p>
                                <p className="text-3xl font-black text-slate-800 mt-1">{stats.present}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
                             <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Avg Hours/Day</p>
                                <p className="text-3xl font-black text-slate-800 mt-1">8.2</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-72">
                            <input 
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            />
                            <svg className="absolute left-3 top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <button 
                            onClick={async () => {
                                setLoading(true);
                                await fetchAttendance();
                            }}
                            className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                            Refresh Live Data
                        </button>
                    </div>

                    {/* Employee Grid/Table */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="p-6 pl-10">Employee Details</th>
                                        <th className="p-6">Current Status</th>
                                        <th className="p-6">Last Login</th>
                                        <th className="p-6">Today's Work</th>
                                        <th className="p-6 text-right pr-10">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {groupedData.map((group) => {
                                        const { user: empUser, latestSession, totalHoursToday } = group;
                                        const isOnline = !latestSession.checkOut;
                                        
                                        return (
                                            <tr key={empUser?._id} className="hover:bg-amber-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedUser(empUser)}>
                                                <td className="p-6 pl-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm ${
                                                            isOnline ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-slate-300'
                                                        }`}>
                                                            {empUser?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 text-sm group-hover:text-amber-600 transition-colors">{empUser?.name || 'Unknown User'}</p>
                                                            <p className="text-xs text-slate-500 font-medium lowercase tracking-tight">{empUser?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    {isOnline ? (
                                                        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-100 shadow-sm shadow-emerald-100/50">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            ONLINE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                                                            OFFLINE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-6">
                                                    <p className="font-mono text-sm text-slate-700 font-bold">
                                                        {new Date(latestSession.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Logged In</p>
                                                </td>
                                                <td className="p-6">
                                                    <p className="text-lg font-black text-slate-800">
                                                        {totalHoursToday.toFixed(1)} <span className="text-xs font-bold text-slate-400 uppercase">hrs</span>
                                                    </p>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                                                            style={{ width: `${Math.min((totalHoursToday/8)*100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right pr-10">
                                                    <button className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                        View History
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {groupedData.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                        <Users className="text-slate-300" size={32} />
                                                    </div>
                                                    <p className="text-slate-400 font-bold">No attendance records found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Employee View (Keeping it simple but premium) ---
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(r => r.date.startsWith(today));
    
    // --- Manual Actions ---
    const handleCheckIn = async () => {
        try {
            setLoading(true);
            await axios.post('/api/attendance/check-in', { userId: user.id });
            await fetchAttendance(); // Refresh state
        } catch (err) {
            console.error("Check-in failed", err);
            alert("Check-in failed: " + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            await axios.post('/api/attendance/check-out', { userId: user.id });
            await fetchAttendance(); // Refresh state
        } catch (err) {
            console.error("Check-out failed", err);
             alert("Check-out failed: " + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-8 flex flex-col items-center pt-20">
             <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
                    <p className="text-slate-500 mt-2">Manage your work session.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
                    <div className="p-8 text-center bg-gradient-to-b from-blue-50/50 to-white">
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl shadow-lg mb-6 transition-all duration-500 ${
                            !todayRecord ? 'bg-slate-200 text-slate-400' :
                            !todayRecord.checkOut ? 'bg-emerald-500 text-white shadow-emerald-200 scale-110' :
                            'bg-blue-500 text-white shadow-blue-200'
                        }`}>
                            <Clock size={40} />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                             {!todayRecord ? "Not Checked In" : 
                             !todayRecord.checkOut ? "You are Online" : "Session Completed"}
                        </h2>
                        
                        <p className="text-slate-500 font-medium mb-8">
                            {todayRecord && !todayRecord.checkOut ? 
                                `Started at ${new Date(todayRecord.checkIn).toLocaleTimeString()}` : 
                                "Please check in to start your work day."}
                        </p>

                        {/* Manual Buttons - HIDDEN for Automation */}
                        {/* 
                           User requested automatic tracking only. 
                           Status is shown in the text above. 
                        */}
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Attendance is automatically tracked based on your login session.
                             </p>
                        </div>
                    </div>
                </div>

                {/* Simple History for Employee */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-sm uppercase tracking-wide">
                        Recent Activity
                    </div>
                    {attendance.map((record) => (
                        <div key={record._id} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-bold text-slate-800">{new Date(record.date).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(record.checkIn).toLocaleTimeString()} - {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'Active'}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                !record.checkOut ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {record.totalHours ? `${record.totalHours}h` : 'Active'}
                            </span>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default Attendance;
