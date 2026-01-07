import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Lock, Mail, User, ArrowRight, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate form completion progress (0 to 4)
  const filledCount = Object.values(formData).filter(val => val.trim().length > 0).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        await axios.post('/api/auth/register', formData);
        const loginRes = await login(formData.email, formData.password);
        if (loginRes.success) {
            navigate('/app');
        } else {
            navigate('/login');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
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

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6"
          >
             <Sparkles size={12} /> Enterprise Ecosystem
          </motion.div>

          <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tight">
             Begin Your <br/> <span className="text-amber-500">Digital Scale.</span>
          </h1>
          
          <p className="text-stone-400 text-lg font-medium max-w-md leading-relaxed">
             Join the ecosystem built for high-performance teams and modern businesses.
          </p>
        </div>

        <div className="relative z-10 space-y-4 border-t border-white/10 pt-10 text-sm font-bold text-stone-300">
           <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-amber-600" /> Enterprise-grade security
           </div>
           <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-amber-600" /> 99.9% uptime guaranteed
           </div>
           <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-amber-600" /> Trusted by 500+ companies
           </div>
        </div>
      </motion.div>

      {/* --- RIGHT PANEL: FORM --- */}
      <div className="flex items-center justify-center p-6 lg:p-8 relative bg-white lg:bg-transparent h-screen">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="w-full max-w-md flex flex-col justify-center h-full"
        >
          <div className="mb-6 flex-shrink-0">
            <h2 className="text-3xl font-black text-stone-900 mb-2 tracking-tight">Client Onboarding</h2>
            <p className="text-stone-500 font-medium text-sm">Initialize your professional workspace profile.</p>
          </div>

          {error && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2 shadow-sm"
             >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
             </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 flex-shrink-0">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="name"
                  type="text" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-14 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-amber-600 focus:bg-white transition-all font-bold text-stone-900 placeholder:text-stone-300 text-sm"
                  placeholder="e.g. Johnathan Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Organization</label>
              <div className="relative group">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="department" 
                  type="text" 
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-14 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-amber-600 focus:bg-white transition-all font-bold text-stone-900 placeholder:text-stone-300 text-sm"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-14 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-amber-600 focus:bg-white transition-all font-bold text-stone-900 placeholder:text-stone-300 text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-14 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-amber-600 focus:bg-white transition-all font-bold text-stone-900 placeholder:text-stone-300 text-sm"
                  placeholder="••••••••••••"
                />
              </div>
              {/* Form Progress Indicator */}
              <div className="flex gap-1 h-1.5 mt-4 px-1">
                 <div className={`flex-1 rounded-full bg-stone-100 transition-colors duration-500 ${filledCount >= 1 ? 'bg-rose-500' : ''}`} />
                 <div className={`flex-1 rounded-full bg-stone-100 transition-colors duration-500 ${filledCount >= 2 ? 'bg-amber-500' : ''}`} />
                 <div className={`flex-1 rounded-full bg-stone-100 transition-colors duration-500 ${filledCount >= 3 ? 'bg-sky-500' : ''}`} />
                 <div className={`flex-1 rounded-full bg-stone-100 transition-colors duration-500 ${filledCount >= 4 ? 'bg-emerald-500' : ''}`} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-stone-900 text-white font-black h-12 rounded-2xl hover:bg-amber-600 hover:text-stone-900 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 uppercase tracking-widest text-xs shadow-xl shadow-stone-200"
            >
              {isLoading ? 'Processing...' : 'Initialize Workspace'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-stone-100 flex-shrink-0">
            <p className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-3">Already synchronized?</p>
            <NavLink to="/login" className="px-6 py-2.5 bg-stone-100 text-stone-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-all inline-flex items-center gap-2">
              Secure Sign In <ArrowRight size={14} />
            </NavLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
