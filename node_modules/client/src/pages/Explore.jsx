import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, Smartphone, Zap, Shield, 
    BarChart, Database, ArrowRight, Check,
    Monitor, Server, Code2, Sparkles, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';

const Explore = () => {
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [sentId, setSentId] = useState(null);
    const [contactId, setContactId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. Fetch Products from DB
                const prodRes = await axios.get('/api/products');
                setProducts(prodRes.data.data || []);

                // 2. Fetch Contact ID
                const res = await axios.get('/api/contacts');
                const contact = (res.data.data || []).find(c => c.email === user?.email);
                if (contact) setContactId(contact._id);
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching content:", err);
                setLoading(false);
            }
        };
        if (user?.email) fetchContent();
    }, [user]);

    // Helper to get icon based on category
    const getServiceIcon = (category, name) => {
        const lowerName = name?.toLowerCase() || '';
        if (lowerName.includes('web') || lowerName.includes('app')) return <Monitor size={24} />;
        if (lowerName.includes('mobile') || lowerName.includes('phone')) return <Smartphone size={24} />;
        if (lowerName.includes('security') || lowerName.includes('shield')) return <Shield size={24} />;
        if (lowerName.includes('cloud') || lowerName.includes('database')) return <Server size={24} />;
        if (lowerName.includes('analytics') || lowerName.includes('data')) return <BarChart size={24} />;
        
        // Fallback by category
        switch(category) {
            case 'Software': return <Zap size={24} />;
            case 'Hardware': return <Database size={24} />;
            case 'Subscription': return <Zap size={24} />;
            default: return <Sparkles size={24} />;
        }
    };

    const handleInquiry = async (serviceName) => {
        if (!contactId) {
            alert("Error: Contact information not found. Please contact support.");
            return;
        }

        setSending(true);
        try {
            // FIX: Added required 'customerId' field to the payload
            await axios.post('/api/tickets', {
                customerId: contactId,
                title: `Service Inquiry: ${serviceName}`,
                description: `Client ${user?.name} (${user?.email}) expressed interest in the "${serviceName}" service via the Explore portal.`,
                priority: 'High',
                status: 'Open'
            });
            setSentId(serviceName);
            setTimeout(() => setSentId(null), 4000);
        } catch (err) {
            console.error("Booking failed:", err);
            alert("Failed to register inquiry. Please try again later.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-amber-100 pb-20 mt-[-32px]">
            {/* Minimalist Hero Section */}
            <div className="max-w-7xl mx-auto px-8 pt-24 pb-16 border-b border-stone-100">
                <div className="max-w-3xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <span className="w-12 h-0.5 bg-amber-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Services Portfolio</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl font-black text-stone-900 leading-[0.95] tracking-tight mb-8"
                    >
                        Professional Solutions <br /> For <span className="text-amber-600">Global Scale.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-stone-500 font-medium leading-relaxed max-w-2xl"
                    >
                        Explore our engineering excellence and strategic digital frameworks designed to optimize corporate performance.
                    </motion.p>
                </div>
            </div>

            {/* Structured Grid */}
            <div className="max-w-7xl mx-auto px-8 py-20">
                {products.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-stone-100 rounded-[40px]">
                        <p className="text-stone-400 font-bold">No services synchronized from Admin portal yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx }}
                                className="flex flex-col group h-full"
                            >
                                <div className="mb-8 relative inline-block">
                                    <div className="w-14 h-14 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center text-stone-600 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 group-hover:shadow-lg group-hover:shadow-amber-200 transition-all duration-300">
                                        {getServiceIcon(product.category, product.name)}
                                    </div>
                                    <span className="absolute -top-2 -right-2 text-[8px] font-black text-white bg-stone-900 border-2 border-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                                        {product.category}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <h3 className="text-2xl font-black text-stone-900 tracking-tight leading-tight uppercase">
                                        {product.name}
                                    </h3>
                                    <p className="text-stone-500 font-medium text-sm leading-relaxed min-h-[60px]">
                                        {product.description || 'Enterprise grade solution tailored for your corporate infrastructure and performance goals.'}
                                    </p>
                                    
                                    <div className="pt-4 flex items-center gap-2">
                                        <div className="px-3 py-1 bg-stone-100 rounded-lg text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                            SKU: {product.sku}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleInquiry(product.name)}
                                    disabled={sending || sentId === product.name}
                                    className={`mt-10 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${
                                        sentId === product.name 
                                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                                        : 'bg-white border-stone-200 text-stone-900 hover:border-amber-600 hover:bg-amber-600 hover:text-white active:scale-95'
                                    }`}
                                >
                                    {sending && sentId === null ? (
                                        <div className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                                    ) : sentId === product.name ? (
                                        <>Consigned <Check size={14} strokeWidth={4} /></>
                                    ) : (
                                        <>Inquire for ${product.price?.toLocaleString()} <ArrowRight size={14} strokeWidth={3} /></>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Professional Footer CTA */}
            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-stone-900 rounded-[48px] p-12 lg:p-24 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-600 rounded-3xl flex items-center justify-center text-white mb-10 shadow-2xl rotate-3">
                        <MessageSquare size={32} />
                    </div>
                    
                    <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8 max-w-3xl leading-none">
                        Complex Requirements? <br /> <span className="text-stone-500">Let’s Architect Together.</span>
                    </h2>
                    
                    <p className="text-stone-400 text-lg font-medium max-w-xl mb-12">
                        For bespoke enterprise solutions or high-security advisory, schedule a strategic consultation with our lead engineering team.
                    </p>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-10 py-4 bg-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-500 hover:-translate-y-1 transition-all shadow-xl shadow-amber-900/40"
                        >
                            Book Strategy Session
                        </button>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Monitor size={400} />
                    </div>
                </div>
            </div>

            <BookingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={user}
                contactId={contactId}
            />
        </div>
    );
};

export default Explore;
