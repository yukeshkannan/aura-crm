import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, Eye, EyeOff, Sparkles, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Support Ticket State
  const [showSupport, setShowSupport] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', desc: '' });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      if (location.state?.from) {
        navigate(location.state.from);
      } else {
        navigate('/app');
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleSupportSubmit = async (e) => {
      e.preventDefault();
      setSupportLoading(true);
      try {
          await axios.post('/api/tickets', {
              title: `Login Support: ${supportForm.name}`,
              description: supportForm.desc,
              guestEmail: supportForm.email,
              guestName: supportForm.name,
              priority: 'High'
          });
          setSupportSuccess(true);
          setSupportForm({ name: '', email: '', desc: '' });
          setTimeout(() => {
              setSupportSuccess(false);
              setShowSupport(false);
          }, 3000);
      } catch (err) {
          alert('Failed to send request');
      } finally {
          setSupportLoading(false);
      }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-50 font-sans relative overflow-hidden">
      
      {/* Support Modal (Preserved Logic) */}
      {showSupport && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                  <div className="p-8 bg-amber-600 text-white flex justify-between items-center">
                      <div>
                          <h3 className="text-2xl font-black italic uppercase tracking-tight leading-none">Support Desk</h3>
                          <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mt-2">Submit a Ticket</p>
                      </div>
                      <button onClick={() => setShowSupport(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                        <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-8">
                      {supportSuccess ? (
                          <div className="text-center py-12">
                              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <CheckCircle2 size={40} />
                              </div>
                              <h4 className="text-2xl font-black text-stone-900 mb-2">Ticket Received!</h4>
                              <p className="text-stone-500 font-medium mb-8">Our team will contact you via email shortly.</p>
                              <button 
                                onClick={() => { setShowSupport(false); setSupportSuccess(false); }}
                                className="w-full py-4 bg-stone-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                              >
                                  Back to Login
                              </button>
                          </div>
                      ) : (
                          <form onSubmit={handleSupportSubmit} className="space-y-6">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Your Name</label>
                                  <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 font-medium transition-all"
                                    placeholder="Enter your name"
                                    value={supportForm.name}
                                    onChange={e => setSupportForm({...supportForm, name: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Email for Contact</label>
                                  <input 
                                    required
                                    type="email" 
                                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 font-medium transition-all"
                                    placeholder="your@email.com"
                                    value={supportForm.email}
                                    onChange={e => setSupportForm({...supportForm, email: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Issue Details</label>
                                  <textarea 
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 font-medium transition-all resize-none"
                                    placeholder="Tell us what's happening (e.g. Can't login with my password)"
                                    value={supportForm.desc}
                                    onChange={e => setSupportForm({...supportForm, desc: e.target.value})}
                                  />
                              </div>
                              <button 
                                type="submit"
                                disabled={supportLoading}
                                className="w-full py-4 bg-stone-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                              >
                                  {supportLoading ? 'Submitting...' : 'Send Help Request'}
                                  <ChevronRight size={16} />
                              </button>
                          </form>
                      )}
                  </div>
              </motion.div>
          </div>
      )}

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
            Everything <br/> You Need To <br/>
            <span className="text-amber-500">Grow Smarter.</span>
          </h1>
          
          <p className="text-stone-400 text-lg font-medium max-w-md leading-relaxed">
            Manage leads, customers and teams from a single powerful platform.
          </p>
        </div>

        <div className="relative z-10 flex gap-12 border-t border-white/10 pt-10">
           <div>
              <p className="text-white font-black text-3xl tracking-tight">500+</p>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">Clients</p>
           </div>
           <div>
              <p className="text-white font-black text-3xl tracking-tight">99.9%</p>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">Uptime</p>
           </div>
        </div>
      </motion.div>

      {/* --- RIGHT PANEL: LOGIN FORM --- */}
      <div className="flex items-center justify-center p-8 lg:p-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
              <div className="mb-12">
                <h2 className="text-4xl font-black text-stone-900 mb-3 tracking-tight">Welcome Back 👋</h2>
                <p className="text-stone-500 font-medium text-lg">Log in to your workspace to continue.</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                  <p className="text-red-600 text-sm font-bold">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Work Email</label>
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
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Password</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-amber-600 hover:text-amber-700">Forgot?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-14 pr-12 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-stone-900 placeholder:text-stone-300 shadow-sm"
                      placeholder="••••••••"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full h-14 bg-stone-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-500 hover:text-stone-900 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-2 group"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Authenticating...' : 'Sign In Now'}
                      {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
              </form>

              <div className="mt-12 text-center grid gap-6">
                <p className="text-sm font-bold text-stone-400">
                    Don't have an account? <Link to="/signup" className="text-stone-900 hover:text-amber-600 transition-colors underline decoration-2 decoration-amber-200 underline-offset-4">Create Account</Link>
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-stone-300 justify-center">
                    <button onClick={() => setShowSupport(true)} className="hover:text-amber-600 transition-colors">Contact Support</button>
                </div>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;
