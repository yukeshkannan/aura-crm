import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-50 font-sans relative">
      {/* Support Modal Overlay */}
      {showSupport && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
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
                        <Lock size={20} />
                      </button>
                  </div>
                  
                  <div className="p-8">
                      {supportSuccess ? (
                          <div className="text-center py-12">
                              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <Lock size={40} />
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

      <div className="hidden lg:flex bg-stone-900 p-16 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-amber-900">A</div>
             <span className="text-xl font-black tracking-tight text-white uppercase italic">Aura CRM</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight mb-6">
            Everything <br/> You Need <span className="text-amber-500">To Grow.</span>
          </h1>
          <p className="text-stone-400 text-lg font-medium max-w-md">
            The next generation CRM platform designed for modern sales teams and customer-centric businesses.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
           <div>
              <p className="text-white font-black text-2xl tracking-tight">500+</p>
              <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest">Global Clients</p>
           </div>
           <div className="w-px h-10 bg-stone-800"></div>
           <div>
              <p className="text-white font-black text-2xl tracking-tight">99.9%</p>
              <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest">Uptime SLA</p>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-stone-900 mb-2">Welcome Back</h2>
            <p className="text-stone-500 font-medium">Log in to your workspace to continue.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-600 transition-all font-medium text-stone-900 placeholder:text-stone-300"
                  placeholder="john@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Password</label>
                
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-600 transition-all font-medium text-stone-900 placeholder:text-stone-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-stone-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-stone-200/50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In Now'}
              {!isLoading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-10 text-center grid gap-4">
            <p className="text-sm font-bold text-stone-500">
                Don't have an account? <Link to="/signup" className="text-amber-600 hover:text-amber-700">Get Started Free</Link>
            </p>
            <div className="h-px bg-stone-100 w-1/2 mx-auto"></div>
            <p className="text-sm font-bold text-stone-500">
                Having trouble logging in? <button onClick={() => setShowSupport(true)} className="text-amber-600 hover:text-amber-700">Contact Support</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
