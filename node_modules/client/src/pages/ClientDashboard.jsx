import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, Download, MessageSquare, Briefcase, 
    ChevronRight, Calendar, CheckCircle, CreditCard,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const ClientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clientData, setClientData] = useState({
        contact: null,
        projects: [],
        milestones: [],
        invoices: [],
        tickets: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Find the contact associated with this user's email
                const contactsRes = await axios.get('/api/contacts');
                const contact = (contactsRes.data.data || []).find(c => c.email === user?.email);

                if (!contact) {
                    setClientData(prev => ({ ...prev, noContact: true }));
                    setLoading(false);
                    return;
                }

                // 2. Fetch everything else
                const [invRes, ticketRes, oppRes, taskRes] = await Promise.all([
                    axios.get('/api/invoices'),
                    axios.get('/api/tickets'),
                    axios.get('/api/opportunities'),
                    axios.get('/api/tasks')
                ]);

                const myInvoices = (invRes.data.data || []).filter(inv => inv.customerEmail === contact.email);
                const myTickets = (ticketRes.data.data || []).filter(t => t.customerId?._id === contact._id || t.customerId === contact._id);
                // "Projects" are Won Opportunities
                const myProjects = (oppRes.data.data || []).filter(o => (o.contactId?._id === contact._id || o.contactId === contact._id) && o.stage === 'Won');
                // "Milestones" are Tasks linked to this contact
                const myMilestones = (taskRes.data.data || []).filter(t => t.contactId?._id === contact._id || t.contactId === contact._id);

                setClientData({
                    contact,
                    projects: myProjects,
                    milestones: myMilestones,
                    invoices: myInvoices,
                    tickets: myTickets
                });
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setLoading(false);
            }
        };

        if (user?.email) fetchDashboardData();
    }, [user]);

    const handleExport = () => {
        const headers = ['Invoice ID', 'Date', 'Amount', 'Status'];
        const rows = clientData.invoices.map(inv => [inv._id, new Date(inv.dueDate).toLocaleDateString(), inv.totalAmount, inv.status]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment_details_${user?.name}.csv`;
        a.click();
    };

    if (loading) return <LoadingSpinner message="Loading your workspace..." />;

    if (clientData.noContact) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl m-8 border-2 border-dashed border-stone-200">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Workspace Inactive</h2>
                <p className="text-stone-500 max-w-sm mx-auto">
                    We couldn't find a client record for {user?.email}. Please contact support to link your corporate identity.
                </p>
            </div>
        );
    }

    const totalInvoiced = clientData.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const activeProject = clientData.projects[0];

    return (
        <div className="p-8 space-y-10 min-h-screen bg-white font-sans">
            
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Client Hub <span className="text-amber-600">.</span></h1>
                    <p className="text-stone-500 font-medium mt-1">Hello, {user?.name}. Manage your projects and billing here.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-xl shadow-stone-200"
                >
                    <Download size={18} /> Export Finance Details
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Projects" 
                    value={clientData.projects.length} 
                    icon={<Briefcase className="text-amber-600" />} 
                    sub="Running deliveries"
                    path="/app/dashboard"
                />
                <StatCard 
                    title="Total Billed" 
                    value={`$${totalInvoiced.toLocaleString()}`} 
                    icon={<CreditCard className="text-emerald-600" />} 
                    sub={`${clientData.invoices.length} invoices`}
                    path="/app/invoices"
                />
                <StatCard 
                    title="Open Tickets" 
                    value={clientData.tickets.filter(t => t.status !== 'Closed').length} 
                    icon={<MessageSquare className="text-blue-600" />} 
                    sub="Support required"
                    path="/app/tickets"
                />
                <StatCard 
                    title="Completed Tasks" 
                    value={clientData.milestones.filter(m => m.status === 'Completed').length} 
                    icon={<CheckCircle className="text-stone-600" />} 
                    sub="Total efficiency"
                    path="/app/dashboard"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Active Project View */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-stone-50 rounded-[48px] p-10 border border-stone-100">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Primary Focus</span>
                                <h3 className="text-2xl font-black text-stone-900 uppercase italic">
                                    {activeProject ? activeProject.name : 'No Active Project'}
                                </h3>
                            </div>
                            <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-200">
                                Phase: Implementation
                            </span>
                        </div>

                        {/* Progress Bar Rendering */}
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between text-xs font-black text-stone-500 uppercase tracking-widest">
                                <span>Overall Progress</span>
                                <span>{clientData.milestones.length > 0 ? Math.round((clientData.milestones.filter(m => m.status === 'Completed').length / clientData.milestones.length) * 100) : 0}%</span>
                            </div>
                            <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-600 rounded-full" 
                                    style={{ width: `${clientData.milestones.length > 0 ? (clientData.milestones.filter(m => m.status === 'Completed').length / clientData.milestones.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Recent Milestones */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} className="text-amber-600" /> Recent Sprints
                            </h4>
                            <div className="divide-y divide-stone-100">
                                {clientData.milestones.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-stone-100/50 px-2 rounded-xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                                                {item.status === 'Completed' ? <CheckCircle size={16} /> : <Calendar size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-stone-800">{item.title}</p>
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-stone-200 group-hover:text-amber-600 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Summary Bar */}
                <div className="space-y-6">
                    <div 
                        onClick={() => navigate('/app/invoices')}
                        className="bg-stone-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                             <CreditCard size={100} />
                        </div>
                        <h3 className="text-xl font-black mb-10 relative z-10">Financial <br/> Summary</h3>
                        
                        <div className="space-y-8 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Outstanding Dues</p>
                                <p className="text-4xl font-black text-amber-500 tracking-tighter">
                                    ${clientData.invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="h-px bg-white/10 w-full" />
                            <div className="space-y-4">
                                {clientData.invoices.slice(0, 2).map((inv, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-stone-500 font-bold">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                        <span className="font-black">${inv.totalAmount.toLocaleString()}</span>
                                        <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black ${inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all mt-4">
                                View Full Ledger
                            </button>
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/app/tickets')}
                        className="bg-amber-50 rounded-[40px] p-8 border border-amber-200 cursor-pointer hover:border-amber-400 transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                             <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                                <MessageSquare size={20} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-stone-900">Need Assistance?</p>
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">SLA Response: 4 Hrs</p>
                             </div>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Your dedicated account manager is active. Open a ticket for high-priority requests.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

const StatCard = ({ title, value, icon, sub, path }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => path && navigate(path)}
            className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-black text-stone-900 mb-1 tracking-tight">{value}</h3>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{title}</span>
                <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mt-0.5">{sub}</span>
            </div>
        </div>
    );
};

export default ClientDashboard;
