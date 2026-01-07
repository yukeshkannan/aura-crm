import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
    Filter, Calendar as CalendarIcon, CheckSquare, DollarSign, 
    ChevronLeft, ChevronRight, Clock, Plus, Receipt, X, LayoutGrid, List,
    Target, Zap, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const localizer = momentLocalizer(moment);

const Calendar = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [filter, setFilter] = useState({ tasks: true, opportunities: true, invoices: true });
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEventData, setNewEventData] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, oppsRes, invRes] = await Promise.all([
                axios.get('/api/tasks'),
                axios.get('/api/opportunities'),
                axios.get('/api/invoices')
            ]);

            const currentUserId = user.id || user._id;

            let rawTasks = tasksRes.data.data || [];
            let rawOpps = oppsRes.data.data || [];

            // Filter for Employees
            if (user?.role === 'Employee') {
                rawTasks = rawTasks.filter(t => {
                    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
                    return assignedId === currentUserId;
                });
                rawOpps = rawOpps.filter(o => {
                    const assignedId = typeof o.assignedTo === 'object' ? o.assignedTo?._id : o.assignedTo;
                    return assignedId === currentUserId;
                });
            }

            const taskEvents = rawTasks.map(task => ({
                id: task._id,
                title: task.title,
                start: new Date(task.dueDate),
                end: new Date(task.dueDate),
                type: 'task',
                status: task.status,
                priority: task.priority
            }));

            const oppEvents = rawOpps.map(opp => ({
                id: opp._id,
                title: `${opp.title} (₹${opp.amount.toLocaleString()})`,
                start: new Date(opp.expectedCloseDate),
                end: new Date(opp.expectedCloseDate),
                type: 'opportunity',
                stage: opp.stage,
                amount: opp.amount
            }));

            const invoiceEvents = (invRes.data.data || []).map(inv => ({
                id: inv._id,
                title: `INV-${inv._id.slice(-4).toUpperCase()} (₹${inv.totalAmount.toLocaleString()})`,
                start: new Date(inv.dueDate),
                end: new Date(inv.dueDate),
                type: 'invoice',
                status: inv.status,
                totalAmount: inv.totalAmount
            }));

            setEvents([...taskEvents, ...oppEvents, ...invoiceEvents]);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch calendar data", err);
            setLoading(false);
        }
    };

    const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onView = useCallback((newView) => setView(newView), [setView]);

    const handleFilterChange = (type) => {
        setFilter(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post('/api/tasks', {
                ...newEventData,
                type: 'Call', 
                status: 'Pending',
                description: 'Created from Calendar',
                assignedTo: user?.id
            });
            setShowCreateModal(false);
            setNewEventData({ title: '', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
            fetchData();
        } catch (err) {
            console.error("Failed to create task", err);
            alert("Failed to create event");
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(e => {
        if (e.type === 'task' && !filter.tasks) return false;
        if (e.type === 'opportunity' && !filter.opportunities) return false;
        if (e.type === 'invoice' && !filter.invoices) return false;
        
        // Final sanity check: Employees shouldn't see invoices on calendar even if filter is on
        if (user?.role === 'Employee' && e.type === 'invoice') return false;
        return true;
    });

    const eventStyleGetter = (event) => {
        let borderColor = '#0ea5e9'; // Default Blue
        let bgColor = '#f0f9ff';
        let color = '#1c1917';
        
        if (event.type === 'task') {
            borderColor = '#d97706'; // Amber
            bgColor = '#fffbeb';
            if (event.status === 'Completed') {
                 borderColor = '#78716c'; // Stone
                 bgColor = '#f5f5f4'; // Stone 100
                 color = '#78716c';
            }
        } else if (event.type === 'opportunity') {
            borderColor = '#6366f1'; // Indigo
            bgColor = '#eef2ff';
        } else if (event.type === 'invoice') {
            borderColor = '#10b981'; // Emerald
            bgColor = '#ecfdf5';
             if (event.status === 'Paid') {
                 borderColor = '#059669'; // Emerald 600
                 bgColor = '#d1fae5'; // Emerald 100
                 color = '#065f46'; // Emerald 800
            }
        }

        return {
            style: {
                backgroundColor: bgColor,
                color: color,
                borderRadius: '6px',
                border: 'none',
                borderLeft: `3px solid ${borderColor}`,
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '4px 8px',
                marginBottom: '2px'
            }
        };
    };

    const EventComponent = ({ event }) => {
        const isPaid = event.type === 'invoice' && event.status === 'Paid';
        const isCompleted = event.type === 'task' && event.status === 'Completed';

        return (
            <div className={`flex items-center gap-2 overflow-hidden ${isCompleted ? 'opacity-60' : ''}`}>
                <div className="flex-shrink-0">
                    {event.type === 'task' && !isCompleted && <Target size={10} className="text-amber-600" />}
                    {event.type === 'task' && isCompleted && <CheckSquare size={10} className="text-stone-500" />}
                    
                    {event.type === 'opportunity' && <Zap size={10} className="text-indigo-600" />}
                    
                    {event.type === 'invoice' && !isPaid && <Receipt size={10} className="text-emerald-600" />}
                    {event.type === 'invoice' && isPaid && <CheckSquare size={10} className="text-emerald-700" />}
                </div>
                <span className={`truncate uppercase tracking-tight text-[10px] ${isCompleted ? 'line-through decoration-stone-400' : ''}`}>
                    {event.title}
                </span>
                {isPaid && <span className="ml-auto text-[8px] font-black bg-emerald-200 text-emerald-800 px-1 rounded">PAID</span>}
            </div>
        );
    };

    if (loading) return <LoadingSpinner message="Orchestrating Schedule..." />;

    return (
        <div className="flex flex-col md:flex-row h-full bg-white overflow-hidden font-sans">
            
            {/* Sidebar - Governance Style */}
            <div className="w-full md:w-80 bg-stone-50 border-r border-stone-100 p-8 flex flex-col gap-10 flex-shrink-0">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em]">
                        <Briefcase size={12} />
                        Workflow Engine
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-md shadow-stone-200 uppercase tracking-widest"
                    >
                        <Plus size={16} /> Schedule Quick Task
                    </button>
                </div>

                {/* Structured Filters */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">Active Layers</h3>
                        <div className="space-y-3">
                            {[
                                { id: 'tasks', label: 'Service Tasks', color: 'bg-amber-600', icon: Target },
                                { id: 'opportunities', label: 'Active Pipeline', color: 'bg-indigo-600', icon: Zap },
                                { id: 'invoices', label: 'Accounts Receivable', color: 'bg-emerald-600', icon: Receipt },
                            ].filter(item => {
                                if (user?.role === 'Employee' && item.id === 'invoices') return false;
                                return true;
                            }).map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => handleFilterChange(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                        filter[item.id] ? 'bg-white border-stone-200 shadow-sm shadow-stone-100' : 'bg-transparent border-transparent opacity-50 gray-scale hover:opacity-80'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter[item.id] ? item.color : 'bg-stone-200'} text-white`}>
                                            <item.icon size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-stone-700">{item.label}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 border-stone-200 flex items-center justify-center ${filter[item.id] ? 'bg-stone-900 border-stone-900' : ''}`}>
                                        {filter[item.id] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-5 bg-white rounded-2xl border border-stone-100 text-center">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Calendar Integration</p>
                    <p className="text-xs font-medium text-stone-600">Sync with enterprise tools.</p>
                    <button className="mt-4 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors">Connect Service</button>
                </div>
            </div>

            {/* Main Statement Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Clean Toolbar */}
                <div className="px-10 py-6 bg-white border-b border-stone-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center bg-stone-50 p-1.5 rounded-xl border border-stone-100">
                            <button onClick={() => onNavigate(moment(date).subtract(1, view === 'month' ? 'month' : view === 'week' ? 'week' : 'day').toDate())} 
                                className="p-2 hover:bg-white hover:text-stone-900 rounded-lg transition-all text-stone-400">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => onNavigate(new Date())}
                                className="px-4 text-[10px] font-bold text-stone-900 uppercase tracking-[0.2em]">
                                Today
                            </button>
                            <button onClick={() => onNavigate(moment(date).add(1, view === 'month' ? 'month' : view === 'week' ? 'week' : 'day').toDate())} 
                                className="p-2 hover:bg-white hover:text-stone-900 rounded-lg transition-all text-stone-400">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <h2 className="text-3xl font-black text-stone-900 tracking-tighter">
                            {moment(date).format('MMMM')} <span className="text-stone-300 ml-1">{moment(date).format('YYYY')}</span>
                        </h2>
                    </div>

                    <div className="flex bg-stone-50 p-1.5 rounded-xl border border-stone-100">
                        {[
                            { id: 'month', icon: LayoutGrid, label: 'Monthly' },
                            { id: 'week', icon: List, label: 'Weekly' },
                            { id: 'day', icon: Clock, label: 'Daily' }
                        ].map(v => (
                            <button
                                key={v.id}
                                onClick={() => onView(v.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                                    ${view === v.id ? 'bg-white text-stone-900 shadow-sm border border-stone-100' : 'text-stone-400 hover:text-stone-600'}
                                `}
                            >
                                <v.icon size={12} />
                                {v.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Static Grid */}
                <div className="flex-1 overflow-hidden bg-white custom-calendar-wrapper p-4">
                    <BigCalendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            toolbar: () => null,
                            event: EventComponent
                        }}
                        view={view}
                        onView={onView}
                        date={date}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>

            {/* Redesigned Quick Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-stone-900/40 z-[60] flex items-center justify-center backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl overflow-hidden border border-stone-200"
                        >
                            <div className="p-10 border-b border-stone-100 bg-stone-50/50 flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">Schedule Registry</h3>
                                    <p className="text-stone-400 text-sm font-medium mt-1">Assign a new operational task to the system.</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-3 bg-white hover:bg-stone-100 rounded-full text-stone-400 transition-colors border border-stone-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEvent} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Assignment Title</label>
                                    <input 
                                        required autoFocus type="text" 
                                        value={newEventData.title}
                                        onChange={e => setNewEventData({...newEventData, title: e.target.value})}
                                        placeholder="Enter objective..."
                                        className="w-full px-6 py-4 rounded-2xl border border-stone-200 outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-50 transition-all font-bold text-stone-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Maturity Date</label>
                                        <div className="relative">
                                            <input 
                                                required type="date" 
                                                value={newEventData.dueDate}
                                                onChange={e => setNewEventData({...newEventData, dueDate: e.target.value})}
                                                className="w-full px-6 py-4 rounded-2xl border border-stone-200 outline-none focus:border-amber-600 font-bold text-stone-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Priority Index</label>
                                        <div className="relative">
                                            <select 
                                                value={newEventData.priority}
                                                onChange={e => setNewEventData({...newEventData, priority: e.target.value})}
                                                className="w-full px-6 py-4 rounded-2xl border border-stone-200 outline-none focus:border-amber-600 appearance-none font-bold text-stone-900 bg-white"
                                            >
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                                <ChevronRight size={16} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-bold text-stone-400 hover:bg-stone-50 transition-colors uppercase tracking-widest">Discard</button>
                                    <button type="submit" className="flex-1 py-4 rounded-2xl text-[10px] font-bold bg-stone-900 text-white hover:bg-amber-600 shadow-xl shadow-stone-200 transition-all uppercase tracking-widest">Commit Assignment</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .rbc-month-view, .rbc-time-view { border: none !important; font-family: 'Inter', sans-serif !important; }
                
                .rbc-header {
                    padding: 20px 0 !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    color: #a8a29e !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.15em !important;
                    border-bottom: 2px solid #f5f5f4 !important;
                    background: #fff !important;
                }
                
                .rbc-month-row { border-top: 1px solid #f5f5f4 !important; min-height: 140px; }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f5f5f4 !important; }
                .rbc-off-range-bg { background-color: #fafaf9 !important; }
                
                .rbc-date-cell {
                    padding: 15px !important;
                    font-size: 14px !important;
                    font-weight: 800 !important;
                    color: #d6d3d1 !important;
                    text-align: left !important;
                }
                
                .rbc-today { background-color: #fff !important; }
                
                .rbc-now .rbc-button-link {
                    color: #d97706 !important;
                    position: relative;
                }
                .rbc-now .rbc-button-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px; left: 50%; transform: translateX(-50%);
                    width: 4px; height: 4px; background: #d97706; border-radius: 50%;
                }

                .rbc-event {
                    background: none !important;
                    padding: 0 !important;
                }
                
                .rbc-event-content { font-size: 0 !important; } /* Hide default text rendering */

                .rbc-show-more {
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    color: #d97706 !important;
                    background: #fffbeb !important;
                    padding: 4px 8px !important;
                    border-radius: 4px !important;
                    margin: 4px 15px !important;
                    text-transform: uppercase !important;
                }

                .rbc-time-header { border-bottom: 2px solid #f5f5f4 !important; }
                .rbc-time-gutter { border-right: 1px solid #f5f5f4 !important; }
                .rbc-timeslot-group { border-bottom: 1px solid #fafaf9 !important; min-height: 80px; }
                .rbc-day-slot { border-left: 1px solid #f5f5f4 !important; }
                .rbc-label { color: #a8a29e; font-size: 11px; font-weight: 700; }
            `}</style>
        </div>
    );
};

export default Calendar;
