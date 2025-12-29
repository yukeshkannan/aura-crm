import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Lock, Mail, User, ArrowRight, Building2, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      {/* Visual Column */}
      <div className="hidden md:flex md:w-[45%] bg-stone-900 p-16 flex-col justify-between relative overflow-hidden">
         {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-900/40">A</div>
            <span className="text-white font-black text-2xl tracking-tighter uppercase">Aura<span className="text-amber-600">.</span>CRM</span>
          </div>

          <div className="space-y-6 max-w-sm">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-widest"
            >
              <Sparkles size={12} /> Cloud Infrastructure
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter">
              Begin Your <br/> <span className="text-amber-600">Digital Scale.</span>
            </h1>
            <p className="text-stone-400 font-medium text-lg leading-relaxed pt-4">
              Join the ecosystem designed for high-performance entities and modern corporate operations.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-stone-900 bg-stone-800" />
              ))}
            </div>
            <p className="text-xs font-black text-stone-500 uppercase tracking-[0.2em]">Verified by Global Security</p>
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2 mb-12 md:hidden">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-black text-2xl tracking-tighter text-stone-900 uppercase">Aura CRM</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-stone-900 mb-3 tracking-tighter uppercase">Client Onboarding</h2>
            <p className="text-stone-500 font-medium font-sans">Initialize your professional workspace profile.</p>
          </div>

          {error && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 shadow-sm"
             >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
             </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="name"
                  type="text" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-50 bg-stone-50 hover:bg-white hover:border-stone-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold text-stone-900 placeholder:text-stone-300"
                  placeholder="e.g. Johnathan Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Entity / Organization</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="department" 
                  type="text" 
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-50 bg-stone-50 hover:bg-white hover:border-stone-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold text-stone-900 placeholder:text-stone-300"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-50 bg-stone-50 hover:bg-white hover:border-stone-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold text-stone-900 placeholder:text-stone-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Security Key (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-50 bg-stone-50 hover:bg-white hover:border-stone-100 focus:bg-white focus:border-amber-600 outline-none transition-all font-bold text-stone-900 placeholder:text-stone-300"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-stone-900 text-white font-black py-4 rounded-2xl hover:bg-amber-600 hover:shadow-2xl hover:shadow-amber-900/40 transition-all flex items-center justify-center gap-3 mt-6 uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50 h-[60px]"
            >
              {isLoading ? 'Processing Authorization...' : 'Initialize Workspace'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-stone-50">
            <p className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-4">Already synchronized?</p>
            <NavLink to="/login" className="px-8 py-3 bg-stone-50 text-stone-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all inline-flex items-center gap-2">
              Secure Sign In <ArrowRight size={14} />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
