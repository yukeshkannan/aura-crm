import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Plus, Receipt, Calendar, User, 
    FileText, Download, Trash2, Printer, 
    CheckCircle, Clock, AlertTriangle, X, Edit2, Mail, CreditCard, Zap, ArrowRight
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Invoices = () => {
    const { user } = useAuth();
    const isClient = user?.role === 'Client';
    const [invoices, setInvoices] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        customerId: '', customerName: '', customerEmail: '', dueDate: '',
        items: [{ productId: '', description: '', quantity: 1, price: 0 }],
        status: 'Draft'
    });
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showEmailConfirm, setShowEmailConfirm] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, contactRes, prodRes] = await Promise.allSettled([
                axios.get('/api/invoices'),
                !isClient ? axios.get('/api/contacts') : Promise.resolve({ data: { data: [] } }),
                !isClient ? axios.get('/api/products') : Promise.resolve({ data: { data: [] } })
            ]);

            if (invRes.status === 'fulfilled') setInvoices(invRes.value.data.data || []);
            if (contactRes.status === 'fulfilled') setContacts(contactRes.value.data.data || []);
            if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.data || []);

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch invoices", err);
            setLoading(false);
        }
    };

    const handleCustomerChange = (e) => {
        const contactId = e.target.value;
        const contact = contacts.find(c => c._id === contactId);
        if (contact) {
            setFormData(prev => ({
                ...prev,
                customerId: contact._id,
                customerName: contact.name,
                customerEmail: contact.email
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) {
                newItems[index] = { ...newItems[index], productId: value, description: product.name, price: product.price };
            }
        } else {
            newItems[index][field] = value;
        }
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, totalAmount: calculateTotal() };
            if (editingId) {
                await axios.put(`/api/invoices/${editingId}`, payload);
            } else {
                await axios.post('/api/invoices', payload);
            }
            setIsDrawerOpen(false);
            fetchData();
        } catch (err) {
            alert("Error saving invoice");
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/invoices/${showDeleteConfirm._id}`);
            setShowDeleteConfirm(null);
            fetchData();
        } catch (err) {
            alert("Error deleting invoice");
        }
    };

    const confirmPay = async (invoice) => {
        try {
            // Simulated payment update
            await axios.put(`/api/invoices/${invoice._id}`, { ...invoice, status: 'Paid' });
            alert("Payment successful!");
            fetchData();
        } catch (err) {
            alert("Payment failed");
        }
    }

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Overdue': return 'bg-red-50 text-red-600 border-red-100';
            case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-stone-50 text-stone-600 border-stone-200';
        }
    };

    if (loading) return <LoadingSpinner message="Loading Invoices..." />;

    return (
        <div className="h-screen flex flex-col bg-stone-50/50 overflow-hidden font-sans">
            
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Financial Overview <span className="text-amber-600">.</span></h1>
                    <p className="text-stone-500 font-medium text-sm mt-1">
                        {isClient ? 'Download and settle your project invoices.' : 'Manage client billing, payments, and invoice lifecycle.'}
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    {!isClient && (
                        <button 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-black hover:bg-amber-700 transition-all shadow-sm shadow-amber-200"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    customerId: '', customerName: '', customerEmail: '', dueDate: '',
                                    items: [{ productId: '', description: '', quantity: 1, price: 0 }],
                                    status: 'Draft'
                                });
                                setIsDrawerOpen(true);
                            }}
                        >
                            <Plus size={18} /> Create Invoice
                        </button>
                    )}
                    <button 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-black hover:bg-stone-50 transition-all shadow-sm"
                        onClick={() => exportToCSV(invoices, 'invoices')}
                    >
                        <Download size={18} /> Export Records
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-8 overflow-y-auto">
                {invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                        <Receipt size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">No active invoices found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-stone-50/50 border-b border-stone-200">
                                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Client Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Due Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {invoices.map(inv => (
                                    <tr key={inv._id} className="hover:bg-stone-50/50 transition-colors group text-center lg:text-left">
                                        <td className="px-6 py-4">
                                            <span className="font-black text-stone-400">#{inv._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-stone-900">{inv.customerName}</div>
                                            <div className="text-xs font-bold text-stone-400">{inv.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-stone-600">
                                            {new Date(inv.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-black text-stone-900">${inv.totalAmount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {isClient && inv.status !== 'Paid' && (
                                                    <button 
                                                        onClick={() => confirmPay(inv)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 transition-all shadow-lg shadow-amber-200 group"
                                                    >
                                                        Pay Now
                                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                )}
                                                {!isClient && (
                                                    <button onClick={() => { setEditingId(inv._id); setFormData(inv); setIsDrawerOpen(true); }} className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-all" title="Edit Invoice">
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setShowDeleteConfirm(inv)} 
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-100"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-all" title="Download PDF">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Drawer (Admin Only) */}
            {isDrawerOpen && !isClient && (
                 <>
                 <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
                 <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                     <div className="px-8 py-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                         <h2 className="text-xl font-black text-stone-900">{editingId ? 'Modify Invoice' : 'Generate Invoice'}</h2>
                         <button onClick={() => setIsDrawerOpen(false)} className="text-stone-400 hover:text-stone-900"><X size={24} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-8 space-y-8">
                         <div className="space-y-4">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Client Selection</label>
                             <select 
                                 className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-bold text-stone-900 transition-all"
                                 value={formData.customerId}
                                 onChange={handleCustomerChange}
                             >
                                 <option value="">Choose Company...</option>
                                 {contacts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                             </select>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Due Date</label>
                            <input 
                                type="date" 
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-bold text-stone-900 transition-all"
                                value={formData.dueDate}
                                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                            />
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Service Item</label>
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <select 
                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold"
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                        >
                                            <option value="">Select Service...</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                    />
                                    <div className="flex items-center font-black text-stone-900">${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                         </div>
                     </div>

                     <div className="px-8 py-6 border-t border-stone-200 bg-stone-50 flex gap-3">
                         <button onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3 text-stone-400 font-bold hover:text-stone-900 transition-colors">Cancel</button>
                         <button onClick={handleSubmit} className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-black text-sm hover:bg-stone-800 shadow-lg shadow-stone-200 transition-all">
                             {editingId ? 'Update Invoice' : 'Issue Invoice'}
                         </button>
                     </div>
                 </div>
                 </>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-stone-900">Destroy Record?</h3>
                        <p className="text-stone-500 font-medium">This action will permanently delete this invoice. It cannot be recovered.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 font-bold text-stone-400 hover:text-stone-900">Reject</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all">Confirm</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
