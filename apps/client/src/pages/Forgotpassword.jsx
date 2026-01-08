import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            toast.success('OTP sent to your email');
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-50 font-sans relative overflow-hidden">
            
            {/* --- LEFT PANEL: BRAND STORY --- */}
            <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="hidden lg:flex bg-gradient-to-br from-black to-stone-950 p-16 flex-col justify-between relative overflow-hidden text-white"
            >
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-900/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-20 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-amber-900/50">
                            <Sparkles size={20} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white uppercase">AURA <span className="text-amber-600">CRM</span></span>
                    </div>

                    <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tight">
                        Recover <br/> Your Account <br/>
                        <span className="text-amber-500">Access.</span>
                    </h1>
                    
                    <p className="text-stone-400 text-lg font-medium max-w-md leading-relaxed">
                        Don't worry, it happens to the best of us. We'll help you get back in no time.
                    </p>
                </div>

                <div className="relative z-10 flex gap-12 border-t border-white/10 pt-10">
                   <div>
                      <p className="text-white font-black text-3xl tracking-tight">Secure</p>
                      <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">Recovery</p>
                   </div>
                   <div>
                      <p className="text-white font-black text-3xl tracking-tight">Fast</p>
                      <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">Process</p>
                   </div>
                </div>
            </motion.div>

            {/* --- RIGHT PANEL: FORM --- */}
            <div className="flex items-center justify-center p-8 lg:p-16 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <Link to="/login" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold text-sm mb-8 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>

                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-stone-900 mb-3 tracking-tight">Forgot Password? 🔒</h2>
                        <p className="text-stone-500 font-medium text-lg">Enter your email and we'll send you a recovery code.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Registered Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-stone-900 placeholder:text-stone-300 shadow-sm"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                className="w-full h-14 bg-stone-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-500 hover:text-stone-900 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-2 group"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Recovery Code'}
                                {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
