import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Users, DollarSign, TrendingUp, AlertCircle, 
    CheckCircle, BarChart3, ArrowRight, Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ClientDashboard from './ClientDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    if (user?.role === 'Client') {
        return <ClientDashboard />;
    }

    if (user?.role === 'Employee') {
        return <EmployeeDashboard />;
    }

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/api/analytics/dashboard');
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <LoadingSpinner message="Loading Analytics..." />;

    const { overview, actionItems, breakdown } = data || { 
        overview: {}, actionItems: {}, breakdown: { sales: {}, finance: {}, support: {} } 
    };

    return (
        <div className="p-8 bg-stone-50 min-h-screen overflow-y-auto font-sans">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Executive Dashboard <span className="text-amber-600">.</span></h1>
                    <p className="text-stone-500 font-medium mt-1">Real-time overview of your company's performance.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-black text-stone-600 hover:bg-stone-50 transition-all shadow-sm">
                        Download Report
                    </button>
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-200">
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard 
                    title="Revenue Potential" 
                    value={`$${overview.totalRevenuePotential?.toLocaleString() || '0'}`} 
                    icon={<DollarSign className="text-amber-600" />} 
                    path="/app/sales"
                />
                <MetricCard 
                    title="Total Collected" 
                    value={`$${overview.totalCollected?.toLocaleString() || '0'}`} 
                    icon={<TrendingUp className="text-emerald-600" />} 
                    path="/app/invoices"
                />
                <MetricCard 
                    title="Active Deals" 
                    value={overview.totalDeals || '0'} 
                    icon={<BarChart3 className="text-blue-600" />} 
                    sub={`Win Rate: ${overview.winRate}`}
                    path="/app/sales"
                />
                <MetricCard 
                    title="Total Contacts" 
                    value={overview.totalContacts || '0'} 
                    icon={<Users className="text-stone-600" />} 
                    path="/app/contacts"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Sales Breakdown */}
                <div 
                    onClick={() => navigate('/app/sales')}
                    className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm cursor-pointer hover:border-amber-200 transition-all"
                >
                    <h3 className="text-xl font-black text-stone-900 mb-6">Sales Pipeline Status</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-6 bg-stone-50 rounded-2xl text-center">
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-2">Active</p>
                            <p className="text-3xl font-black text-stone-900">{breakdown.sales.active}</p>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-2xl text-center">
                            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Won</p>
                            <p className="text-3xl font-black text-emerald-700">{breakdown.sales.won}</p>
                        </div>
                        <div className="p-6 bg-rose-50 rounded-2xl text-center">
                            <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-2">Lost</p>
                            <p className="text-3xl font-black text-rose-700">{breakdown.sales.lost}</p>
                        </div>
                    </div>
                </div>

                {/* Billing Summary */}
                <div 
                    onClick={() => navigate('/app/invoices')}
                    className="bg-stone-900 rounded-3xl p-8 text-white shadow-xl cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                >
                    <h3 className="text-xl font-black mb-6">Financial Overview</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-stone-400">Total Invoiced</span>
                                <span>${breakdown.finance.totalInvoiced?.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500" 
                                    style={{ width: `${breakdown.finance.totalInvoiced > 0 ? (breakdown.finance.collected / breakdown.finance.totalInvoiced) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-xs font-bold text-stone-500 uppercase mb-1">Collected</p>
                                <p className="text-lg font-black text-emerald-400">${breakdown.finance.collected?.toLocaleString() || 0}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-xs font-bold text-stone-500 uppercase mb-1">Pending</p>
                                <p className="text-lg font-black text-amber-500">${breakdown.finance.pending?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Items */}
            <div>
                <h3 className="text-xl font-black text-stone-900 mb-6 flex items-center gap-2">
                    Action Items Required
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black rounded uppercase">Urgent</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionCard 
                        title="Overdue Invoices" 
                        count={actionItems.overdueInvoices} 
                        status={actionItems.overdueInvoices > 0 ? 'critical' : 'success'}
                        path="/app/invoices"
                    />
                    <ActionCard 
                        title="Critical Tickets" 
                        count={actionItems.criticalTickets} 
                        status={actionItems.criticalTickets > 0 ? 'critical' : 'success'}
                        path="/app/tickets"
                    />
                    <ActionCard 
                        title="Pending Tasks" 
                        count={actionItems.pendingTasks} 
                        status="warning"
                        path="/app/tasks"
                    />
                    <ActionCard 
                        title="New Leads" 
                        count={actionItems.newLeads} 
                        status="info"
                        path="/app/contacts"
                    />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend, sub, path }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => path && navigate(path)}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    {icon}
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>}
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-1">{value}</h3>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{title}</p>
            {sub && <p className="text-[10px] font-bold text-stone-500 mt-2">{sub}</p>}
        </div>
    );
};

const ActionCard = ({ title, count, status, path }) => {
    const navigate = useNavigate();
    const styles = {
        critical: 'border-rose-100 bg-rose-50 text-rose-700 hover:border-rose-300',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
        warning: 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-300',
        info: 'border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-300'
    };

    return (
        <div 
            onClick={() => path && navigate(path)}
            className={`p-5 rounded-2xl border-2 ${styles[status]} flex items-center justify-between cursor-pointer transition-all hover:shadow-md`}
        >
            <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
                <p className="text-2xl font-black">{count}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                <ArrowRight size={20} />
            </div>
        </div>
    );
}

export default Dashboard;
