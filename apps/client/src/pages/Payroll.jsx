import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    DollarSign, FileText, Download, Users, CheckCircle, AlertCircle, 
    Search, Calendar, Briefcase, TrendingUp, ChevronRight, Loader2, Trash2, 
    Zap, CreditCard, ArrowUpRight, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Payroll = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('payslips'); // 'payslips' | 'generate'
    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [allPayrolls, setAllPayrolls] = useState([]); // For Admin to see status
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        } 

        if (user.role === 'Admin') {
            setActiveTab('generate');
            fetchEmployees();
            fetchAllPayrolls(); // Fetch all to check status
        } else {
            setActiveTab('payslips');
        }
        fetchMyPayroll();
    }, [user?.id]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/api/auth/users');
            setEmployees(res.data.data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const fetchMyPayroll = async () => {
        if (!user || !user.id) return;
        try {
            setLoading(true);
            const res = await axios.get(`/api/payroll?userId=${user.id}`);
            setPayrolls(res.data.data);
        } catch (err) {
            console.error("Fetch payroll error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPayrolls = async () => {
        try {
            const res = await axios.get('/api/payroll');
            setAllPayrolls(res.data.data);
        } catch (err) {
            console.error("Fetch all payrolls error:", err);
        }
    };

    const handleGenerate = async (employee) => {
        try {
            setGeneratingId(employee._id);
            const today = new Date();
            const month = today.toLocaleString('default', { month: 'long' });
            const year = today.getFullYear();

            const baseSalary = employee.salary?.base || 0;
            if (baseSalary === 0) {
                 setNotification({ type: 'error', message: `Please set a base salary for ${employee.name} first.` });
                 setGeneratingId(null);
                 return;
            }

            const payload = {
                userId: employee._id,
                month,
                year,
                baseSalary: baseSalary,
                presentDays: 22,
                totalDays: 30
            };
            console.log("Generating Payroll Payload:", payload);

            await axios.post('/api/payroll/generate', payload);
            
            setNotification({ type: 'success', message: `Payroll generated for ${employee.name}` });
            setGeneratingId(null);
            fetchAllPayrolls(); // Refresh status list
            
            if (user.id === employee._id) {
                fetchMyPayroll(); 
            }
        } catch (err) {
            console.error("Generate Payroll Error:", err);
            setNotification({ type: 'error', message: err.response?.data?.message || 'Generation failed' });
            setGeneratingId(null);
        }
    };

    const handleDownloadPDF = (slip) => {
        const today = new Date();
        const disburseDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const isFuture = today < disburseDate;
        const statusText = isFuture ? 'APPROVED & QUEUED' : 'SETTLED & DISBURSED';
        const statusColor = isFuture ? '#d97706' : '#059669';

        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
                <head>
                    <title>Official_Payslip_${slip.month}_${slip.year}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #1c1917; background: #fff; }
                        .payslip-container { padding: 60px; max-width: 900px; margin: 0 auto; }
                        
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #1c1917; padding-bottom: 30px; margin-bottom: 40px; }
                        .brand { font-size: 32px; font-weight: 900; letter-spacing: -1.5px; }
                        .brand span { color: #d97706; }
                        .doc-info { text-align: right; }
                        .doc-info h1 { margin: 0; font-size: 12px; font-weight: 900; color: #a8a29e; letter-spacing: 3px; }
                        .doc-info p { margin: 5px 0 0; font-size: 24px; font-weight: 900; }

                        .meta-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 60px; margin-bottom: 50px; }
                        .meta-box h2 { font-size: 10px; font-weight: 900; color: #a8a29e; letter-spacing: 2px; margin-bottom: 12px; border-left: 3px solid #d97706; padding-left: 10px; }
                        .meta-box p { margin: 0; font-size: 16px; font-weight: 700; color: #1c1917; }
                        .meta-box .sub { font-size: 12px; color: #78716c; font-weight: 500; margin-top: 4px; }

                        .status-banner { background: #fafaf9; border: 1px solid #e7e5e4; padding: 20px 30px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
                        .status-label { font-size: 10px; font-weight: 900; color: #a8a29e; letter-spacing: 1px; }
                        .status-value { font-size: 14px; font-weight: 900; color: ${statusColor}; }

                        .earnings-table { width: 100%; border-collapse: collapse; margin-bottom: 60px; }
                        .earnings-table th { text-align: left; padding: 15px 0; font-size: 10px; font-weight: 900; color: #a8a29e; border-bottom: 1px solid #e7e5e4; }
                        .earnings-table td { padding: 20px 0; font-size: 15px; font-weight: 600; border-bottom: 1px solid #f5f5f4; }
                        .earnings-table .amount { text-align: right; font-variant-numeric: tabular-nums; }
                        
                        .summary-box { background: #1c1917; color: #fff; padding: 40px; border-radius: 30px; display: flex; justify-content: space-between; align-items: center; }
                        .summary-label { font-size: 12px; font-weight: 700; color: #a8a29e; letter-spacing: 1px; margin-bottom: 8px; }
                        .summary-amount { font-size: 42px; font-weight: 900; letter-spacing: -1px; }
                        
                        .footer { margin-top: 80px; text-align: center; border-top: 1px solid #f5f5f4; padding-top: 30px; }
                        .footer p { font-size: 11px; color: #a8a29e; line-height: 1.6; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="payslip-container">
                        <div class="header">
                            <div class="brand">AURA<span>CRM</span></div>
                            <div class="doc-info">
                                <h1>OFFICIAL ARCHIVAL RECORD</h1>
                                <p>${slip.month.toUpperCase()} ${slip.year}</p>
                            </div>
                        </div>

                        <div class="meta-grid">
                            <div class="meta-box">
                                <h2>RECIPIENT PERSONNEL</h2>
                                <p>${user.name.toUpperCase()}</p>
                                <div class="sub">${user.email}</div>
                                <div class="sub" style="margin-top: 10px; font-weight: 800; color: #1c1917">Designation: ${user.role || 'Personnel'}</div>
                            </div>
                            <div class="meta-box" style="text-align: right">
                                <h2>DISBURSEMENT INTEL</h2>
                                <p>DEC 31, 2025</p>
                                <div class="sub">Cycle ID: PAY-${slip._id.slice(-6).toUpperCase()}</div>
                                <div class="sub">Mode: Electronic Transfer</div>
                            </div>
                        </div>

                        <div class="status-banner">
                            <div>
                                <div class="status-label">CURRENT ALLOCATION STATUS</div>
                                <div class="status-value">${statusText}</div>
                            </div>
                            <div style="text-align: right">
                                <div class="status-label">VERIFICATION HASH</div>
                                <div class="status-value" style="font-family: monospace; color: #a8a29e; font-size: 10px">0x${slip._id.slice(0, 8)}...8A2</div>
                            </div>
                        </div>

                        <table class="earnings-table">
                            <thead>
                                <tr>
                                    <th>DESCRIPTION OF SERVICE</th>
                                    <th class="amount">CAPITAL ALLOCATION</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Base Operational Salary (Fixed)</td>
                                    <td class="amount">₹${slip.baseSalary.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td>Performance Incentives</td>
                                    <td class="amount">₹0.00</td>
                                </tr>
                                <tr>
                                    <td>Statutory Deductions</td>
                                    <td class="amount">₹0.00</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="summary-box">
                            <div>
                                <div class="summary-label">TOTAL NET DISBURSEMENT</div>
                                <div class="summary-amount">₹${slip.netSalary.toLocaleString()}</div>
                            </div>
                            <div style="text-align: right; opacity: 0.5">
                                <div style="font-size: 10px; font-weight: 900; letter-spacing: 2px">STAMP OF AUTHENTICITY</div>
                                <div style="font-size: 24px; font-weight: 900; margin-top: 10px">QC VERIFIED</div>
                            </div>
                        </div>

                        <div class="footer">
                            <p>This document is a verified electronic record of Aura CRM Enterprise Suite.<br/>
                            Unauthorized tampering of this document is a violation of company policy.<br/>
                            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Real Stats
    const totalPaid = payrolls.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
    // Format to K or L
    const formatCurrency = (amount) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    const pendingCount = employees.length - payrolls.filter(p => {
        const today = new Date();
        return p.month === today.toLocaleString('default', { month: 'long' }) && p.year === today.getFullYear();
    }).length;

    const stats = [
        { label: 'Revenue Disbursed', value: formatCurrency(totalPaid), icon: Zap, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
        { label: 'Awaiting Process', value: `${pendingCount > 0 ? pendingCount : 0} Emp`, icon: AlertCircle, color: 'from-stone-800 to-stone-900', shadow: 'shadow-stone-200' },
        { label: 'Scheduled Payment', value: 'Dec 31', icon: Calendar, color: 'from-stone-500 to-stone-600', shadow: 'shadow-stone-100' },
    ];

    if (loading) return <LoadingSpinner />;
    if (!user) return <div className="p-8 text-center text-slate-500">Please log in to view payroll information.</div>;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Top Notification Toast */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in-down ${
                    notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-red-100 text-red-700'
                }`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Refined Professional Header */}
            <div className="bg-white border-b border-stone-200 py-10 px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em]">
                            <Briefcase size={12} />
                            Governance & Finance
                        </div>
                        <h1 className="text-4xl font-black text-stone-900 tracking-tight">Financial Records</h1>
                        <p className="text-stone-400 text-sm font-medium">Official disbursement history and compensation analytics.</p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100 min-w-[200px] flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-stone-900 tracking-tight">{stat.value}</span>
                                    <stat.icon size={14} className="text-amber-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    
                    {/* Compact Tabs */}
                    {user.role === 'Admin' && (
                        <div className="flex border-b border-stone-100 px-6">
                            <button 
                                onClick={() => setActiveTab('generate')}
                                className={`px-8 py-5 text-[10px] font-bold tracking-[0.2em] transition-all relative ${
                                    activeTab === 'generate' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users size={14} />
                                    CORE PROCESSING
                                </div>
                                {activeTab === 'generate' && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-stone-900" />
                                )}
                            </button>
                            <button 
                                onClick={() => setActiveTab('payslips')}
                                className={`px-8 py-5 text-[10px] font-bold tracking-[0.2em] transition-all relative ${
                                    activeTab === 'payslips' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={14} />
                                    MY ARCHIVES
                                </div>
                                {activeTab === 'payslips' && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-stone-900" />
                                )}
                            </button>
                        </div>
                    )}

                    <div className="p-10 min-h-[500px] bg-stone-50/20">
                        <AnimatePresence mode="wait">
                            {activeTab === 'generate' ? (
                                <motion.div 
                                    key="generate"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Workforce Roster</h2>
                                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{filteredEmployees.length} Verified Personnel</p>
                                            </div>
                                        </div>
                                        <div className="relative w-full md:w-80 group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="SEARCH PERSONNEL..." 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-white border-2 border-stone-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-600 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-hidden rounded-[32px] border border-stone-100 bg-white shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-100">
                                                <tr>
                                                    <th className="p-8 pl-10">Personnel Profile</th>
                                                    <th className="p-8">Assigned Designation</th>
                                                    <th className="p-8">Compensation Model</th>
                                                    <th className="p-8 text-right pr-10">Lifecycle</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-50 bg-white">
                                                {filteredEmployees.map((emp) => (
                                                    <tr key={emp._id} className="hover:bg-amber-50/30 transition-colors group">
                                                        <td className="p-8 pl-10">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500 font-black text-xl border border-stone-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all duration-300">
                                                                    {emp.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-stone-900 uppercase tracking-tighter text-lg">{emp.name}</p>
                                                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{emp.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-8">
                                                            <div className="space-y-1">
                                                                <span className="font-black text-stone-900 text-xs uppercase tracking-widest">{emp.role}</span>
                                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{emp.department || 'Infrastructure'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-8">
                                                            {emp.salary?.base ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-xs tracking-widest border border-emerald-100">
                                                                        ₹{emp.salary.base.toLocaleString()}
                                                                    </div>
                                                                    <ArrowUpRight size={14} className="text-emerald-500" />
                                                                </div>
                                                            ) : (
                                                                <span className="text-stone-300 font-black text-[10px] uppercase tracking-widest">Model Not Defined</span>
                                                            )}
                                                        </td>
                                                        <td className="p-8 text-right pr-10">
                                                            {(() => {
                                                                const today = new Date();
                                                                const currentMonth = today.toLocaleString('default', { month: 'long' });
                                                                const currentYear = today.getFullYear();
                                                                const existingPayroll = allPayrolls.find(p => p.userId === emp._id && p.month === currentMonth && p.year === currentYear);

                                                                if (existingPayroll) {
                                                                    return (
                                                                        <div className="flex items-center justify-end gap-3">
                                                                            <span className="px-5 py-2.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 flex items-center gap-2">
                                                                                <CheckCircle size={14} /> ARCHIVED
                                                                            </span>
                                                                            <button 
                                                                                onClick={() => handleDelete(existingPayroll._id)}
                                                                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <button 
                                                                        onClick={() => handleGenerate(emp)}
                                                                        disabled={generatingId === emp._id}
                                                                        className="px-8 py-3 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-stone-200 hover:shadow-amber-200 flex items-center gap-2 ml-auto"
                                                                    >
                                                                        {generatingId === emp._id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                                                                        Disburse
                                                                    </button>
                                                                );
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="payslips"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                                >
                                    {payrolls.map((slip) => (
                                        <div 
                                            key={slip._id} 
                                            className="bg-white rounded-2xl border border-stone-100 overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all duration-300"
                                        >
                                            <div className="p-6 border-b border-stone-50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{slip.month} {slip.year}</p>
                                                        <h3 className="text-sm font-bold text-stone-900">Official Payslip Record</h3>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownloadPDF(slip)}
                                                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>

                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100/50">
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Tax Cycle</p>
                                                        <p className="text-xs font-bold text-stone-600">{slip.year}</p>
                                                    </div>
                                                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100/50 text-right">
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Status</p>
                                                        <p className="text-xs font-bold text-amber-600">Pending Release</p>
                                                    </div>
                                                </div>

                                                <div className="py-4 border-t border-dashed border-stone-100 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Net Disbursement</p>
                                                        <p className="text-2xl font-black text-stone-900 tracking-tight">₹{slip.netSalary.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Release Date</p>
                                                        <p className="text-xs font-bold text-stone-900">DEC 31</p>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => handleDownloadPDF(slip)}
                                                    className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Printer size={14} /> 
                                                    VIEW STATEMENT
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {payrolls.length === 0 && (
                                        <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-stone-100 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-8 border border-stone-100 shadow-inner">
                                                <TrendingUp size={40} className="text-stone-300" />
                                            </div>
                                            <h3 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">No Archival Records</h3>
                                            <p className="text-stone-400 font-medium mt-3 max-w-sm mx-auto">
                                                Earnings disbursements for the current cycle haven't been finalized yet.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
