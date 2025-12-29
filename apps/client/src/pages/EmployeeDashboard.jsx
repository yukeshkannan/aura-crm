import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, CheckCircle2, Ticket, Calendar as CalendarIcon, 
    ArrowRight, Briefcase, ChevronRight, Zap, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingTasks: 0,
        activeTickets: 0,
        attendanceDays: 0,
        nextPayDate: 'Calculating...'
    });
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const [tasksRes, ticketsRes, attendanceRes] = await Promise.all([
                    axios.get('/api/tasks'),
                    axios.get('/api/tickets'),
                    axios.get(`/api/attendance?userId=${user.id || user._id}`)
                ]);

                const currentUserId = user?.id || user?._id;

                // Filter data for current user
                const filteredTasks = (tasksRes.data.data || []).filter(t => {
                    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
                    return assignedId === currentUserId && t.status !== 'Completed';
                });
                const filteredTickets = (ticketsRes.data.data || []).filter(t => {
                    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
                    return assignedId === currentUserId && t.status !== 'Resolved';
                });
                
                // Calculate monthly attendance
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const monthlyAttendance = attendanceRes.data.data.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
                }).length;

                // Calculate next pay date (Last day of current month)
                const lastDay = new Date(currentYear, currentMonth + 1, 0);
                const nextPayDate = lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                setStats({
                    pendingTasks: filteredTasks.length,
                    activeTickets: filteredTickets.length,
                    attendanceDays: monthlyAttendance,
                    nextPayDate: nextPayDate
                });
                setMyTasks(filteredTasks.slice(0, 5)); // Show top 5 tasks
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch employee dashboard data", err);
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchEmployeeData();
        }
    }, [user?._id]);

    const dashboardCards = [
        { label: 'Pending Tasks', value: stats.pendingTasks, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', path: '/app/tasks' },
        { label: 'Active Support', value: stats.activeTickets, icon: Ticket, color: 'text-stone-900', bg: 'bg-stone-50', path: '/app/tickets' },
        { label: 'Monthly Attendance', value: `${stats.attendanceDays} Days`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/app/attendance' },
        { label: 'Next Disbursement', value: stats.nextPayDate, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', path: '/app/payroll' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 h-full overflow-y-auto font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-2">
                        <Briefcase size={12} />
                        Professional Workspace
                    </div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight text-nowrap">
                        Welcome, {user.name.split(' ')[0]} ⚡
                    </h1>
                    <p className="text-stone-400 font-medium mt-1">Managed workflow for your daily operations.</p>
                </div>
                <div className="bg-stone-900 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg shadow-stone-200">
                    <div className="text-right border-r border-stone-700 pr-4">
                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest text-nowrap">Local Time</p>
                        <p className="text-sm font-bold font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                        <CalendarIcon size={20} />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        onClick={() => card.path && navigate(card.path)}
                        className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col justify-between hover:border-amber-200 hover:shadow-lg transition-all group cursor-pointer"
                    >
                        <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-2xl font-black text-stone-900 tracking-tight">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Assignments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-50">
                            <h2 className="text-xl font-bold text-stone-900">Priority Assignments</h2>
                            <button 
                                onClick={() => navigate('/app/tasks')}
                                className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-amber-600 flex items-center gap-1 transition-colors"
                            >
                                View Tasks <ChevronRight size={14} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {myTasks.length > 0 ? myTasks.map((task, i) => (
                                <div key={task._id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100/50 hover:bg-white hover:border-amber-200 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-amber-600'}`} />
                                        <div>
                                            <p className="font-bold text-stone-800 text-sm">{task.title}</p>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'} • {task.priority} Priority
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-stone-300" />
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="mx-auto text-stone-200 mb-2" size={32} />
                                    <p className="text-stone-400 text-sm font-medium">All caught up! No pending tasks.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Today's Tasks Timeline */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-900 mb-8 pb-4 border-b border-stone-50">Today's Schedule</h2>
                        <div className="space-y-6 border-l-2 border-dashed border-stone-100 ml-2 pl-6">
                            {myTasks.filter(t => {
                                if (!t.dueDate) return false;
                                return new Date(t.dueDate).toDateString() === new Date().toDateString();
                            }).length > 0 ? (
                                myTasks.filter(t => {
                                    if (!t.dueDate) return false;
                                    return new Date(t.dueDate).toDateString() === new Date().toDateString();
                                }).map((task, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow-sm" />
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Task Deadline</p>
                                        <p className="font-bold text-stone-800 text-sm mt-1">{task.title}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="relative">
                                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-stone-200 border-4 border-white" />
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Free Time</p>
                                    <p className="font-bold text-stone-800 text-sm mt-1">No tasks due today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Quick Access Portal */}
                    <div className="bg-stone-900 rounded-3xl p-8 text-white">
                        <h3 className="text-lg font-bold mb-2">Internal Support</h3>
                        <p className="text-stone-400 text-xs font-medium mb-6">Need technical help? Raise a ticket for quick resolution.</p>
                        <button 
                            onClick={() => window.location.href = '/app/tickets'}
                            className="w-full py-4 bg-amber-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-amber-500 transition-colors"
                        >
                            Raise Support Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
