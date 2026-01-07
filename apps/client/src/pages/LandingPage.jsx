import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, ArrowRight, BarChart3, Users, 
    ShieldCheck, Zap, Layers, Database, Globe,
    LayoutDashboard, UserCircle, CreditCard, Sparkles, X
} from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
            
            {/* --- NAVIGATION --- */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <Sparkles size={20} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-stone-900">
                            AURA <span className="text-amber-600">CRM</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex gap-8 text-sm font-bold text-stone-500">
                        <a href="#features" className="hover:text-amber-600 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-amber-600 transition-colors">Pricing</a>
                        <a href="#testimonials" className="hover:text-amber-600 transition-colors">Stories</a>
                    </div>

                    <div className="flex gap-4">
                        <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-stone-600 hover:text-stone-900">Log In</Link>
                        <Link to="/signup" className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6 border border-amber-100">
                            <Zap size={12} fill="currentColor" /> New Release v2.0
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-stone-900 leading-[1.1] mb-8 tracking-tight">
                            All-in-One CRM to <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                Manage Your Sales.
                            </span>
                        </h1>
                        <p className="text-xl text-stone-500 font-medium mb-10 max-w-lg leading-relaxed">
                            Streamline your workflow, boost conversions, and grow your business with a platform designed for humans, not robots.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/signup" className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-all shadow-xl shadow-amber-200 flex items-center justify-center gap-2 group">
                                Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 bg-white text-stone-600 border border-stone-200 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
                                <Zap size={20} /> Watch Demo
                            </button>
                        </div>
                        <div className="mt-10 flex items-center gap-4 text-sm font-bold text-stone-400">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-xs overflow-hidden`}>
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by 500+ Companies</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Decorative Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/20 rounded-full blur-[100px] -z-10" />
                        
                        {/* Glassmorphic Dashboard Mockup */}
                        <motion.div 
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-4 shadow-2xl"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" 
                                alt="CRM Dashboard" 
                                className="rounded-2xl shadow-inner border border-stone-100"
                            />
                            {/* Floating Card Element */}
                            <motion.div 
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -left-10 bottom-20 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-4 py-5 px-6"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase">Revenue</p>
                                    <p className="text-xl font-black text-stone-900">+$12,450</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- PROBLEM SECTION (PAIN POINTS) --- */}
            <section className="py-24 bg-stone-900 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Stop managing chaos.</h2>
                        <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                             Spreadsheets and disconnected tools are costing you money. It's time to consolidate.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: <X className="text-red-500" />, title: "Leads Slipping Away", desc: "Without automated tracking, 60% of leads are lost in the noise." },
                            { icon: <Layers className="text-orange-500" />, title: "No Pipeline Visibility", desc: "Guesswork isn't a strategy. Know exactly where every deal stands." },
                            { icon: <Users className="text-blue-500" />, title: "Team Disconnect", desc: "Sales, HR, and Support silos kill productivity. Unify them now." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-stone-400 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-amber-600 font-bold tracking-widest uppercase text-xs">Powerful Features</span>
                        <h2 className="text-4xl font-black text-stone-900 mt-3 mb-6">Everything you need to scale.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Users size={24} />, title: "Lead Tracking", desc: "Capture and organize leads from every source automatically." },
                            { icon: <Zap size={24} />, title: "Auto Follow-ups", desc: "Never miss a touchpoint with intelligent automation triggers." },
                            { icon: <Layers size={24} />, title: "Team Management", desc: "Assign roles, track performance, and manage permission levels." },
                            { icon: <BarChart3 size={24} />, title: "Sales Reports", desc: "Visual analytics that show you exactly how to grow revenue." },
                            { icon: <ShieldCheck size={24} />, title: "Secure Login", desc: "Enterprise-grade encryption keeps your customer data safe." },
                            { icon: <Database size={24} />, title: "Customer Database", desc: "A unified view of every interaction, purchase, and ticket." }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl border border-stone-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50 transition-all bg-white">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 mb-3">{feature.title}</h3>
                                <p className="text-stone-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-24 bg-stone-100 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-stone-900">Get started in minutes.</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-stone-300 -z-10" />

                        {[
                            { step: "01", title: "Add Leads", desc: "Import your contacts or capture them via web forms." },
                            { step: "02", title: "Assign Team", desc: "Route deals to the right agents automatically." },
                            { step: "03", title: "Track & Close", desc: "Monitor progress and celebrate the wins." }
                        ].map((step, i) => (
                            <div key={i} className="text-center bg-stone-100">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-stone-100 text-2xl font-black text-amber-600">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                                <p className="text-stone-500 font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- DASHBOARD PREVIEW STRIP --- */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-stone-900 mb-10">
                        Everything you need. <br/> One clean dashboard.
                    </h2>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="rounded-3xl shadow-2xl overflow-hidden border border-stone-200"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                            alt="Full Dashboard" 
                            className="w-full object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section id="testimonials" className="py-24 bg-amber-50 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-black text-stone-900 text-center mb-16">Loved by Sales Teams</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah J.", role: "CEO, TechFlow", quote: "The interface is so clean. My team actually enjoys using CRM now." },
                            { name: "Mike R.", role: "Sales Director", quote: "We doubled our closing rate in 3 months thanks to the automated follow-ups." },
                            { name: "Elena K.", role: "Founder, StartUp", quote: "Invoicing used to be a nightmare. Now it's one click. Worth every penny." }
                        ].map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100">
                                <div className="flex gap-1 mb-4">
                                    {[1,2,3,4,5].map(s => <Sparkles key={s} size={16} className="text-amber-500 fill-amber-500" />)}
                                </div>
                                <p className="text-stone-700 font-medium mb-6 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-stone-200 rounded-full overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt={t.name} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900 text-sm">{t.name}</p>
                                        <p className="text-xs font-bold text-stone-400 uppercase">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section id="pricing" className="py-24 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-stone-900 mb-16">Simple Pricing.</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-3xl border border-stone-200 bg-white">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Starter</h3>
                            <div className="text-4xl font-black text-stone-900 mb-6">$0</div>
                            <ul className="space-y-4 text-left mb-8 text-stone-600 font-medium text-sm">
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-stone-900" /> 500 Leads</li>
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-stone-900" /> Basic Pipeline</li>
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-stone-900" /> Email Support</li>
                            </ul>
                            <Link to="/signup" className="block w-full py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition-colors">Start Free</Link>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-3xl border-2 border-amber-500 bg-white relative shadow-2xl shadow-amber-100">
                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Popular</div>
                            <h3 className="text-xl font-bold text-amber-600 mb-2">Professional</h3>
                            <div className="text-4xl font-black text-stone-900 mb-6">$29<span className="text-base text-stone-400 font-medium">/mo</span></div>
                            <ul className="space-y-4 text-left mb-8 text-stone-600 font-medium text-sm">
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-600" /> Unlimited Leads</li>
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-600" /> Advanced Analytics</li>
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-amber-600" /> Auto-Invoicing</li>
                            </ul>
                            <Link to="/signup" className="block w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200">Get Pro</Link>
                        </div>

                        {/* Business */}
                        <div className="p-8 rounded-3xl border border-stone-200 bg-white">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Business</h3>
                            <div className="text-4xl font-black text-stone-900 mb-6">$99<span className="text-base text-stone-400 font-medium">/mo</span></div>
                            <ul className="space-y-4 text-left mb-8 text-stone-600 font-medium text-sm">
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-stone-900" /> Dedicated Manager</li>
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-stone-900" /> API Access</li>
                                <li className="flex gap-2"><CheckCircle2 size={16} className="text-stone-900" /> Custom Roles</li>
                            </ul>
                            <Link to="/signup" className="block w-full py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition-colors">Contact Sales</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-24 px-6 bg-stone-950 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to grow your business?</h2>
                    <p className="text-xl text-stone-400 mb-10">Join 500+ companies streamlining their workflow today.</p>
                    <Link to="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-amber-600 text-white rounded-2xl font-bold text-xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-900/50">
                        Create Your CRM Account <ArrowRight />
                    </Link>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 px-6 bg-white border-t border-stone-100 text-center">
                <p className="text-stone-400 font-bold text-sm">© 2026 Aura CRM. All rights reserved.</p>
            </footer>

        </div>
    );
};

export default LandingPage;
