import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ChevronRight, CheckCircle2, ShieldCheck, Globe2, 
    Users2, ArrowRight, Zap, Target, BarChart3, 
    Lock, Sparkles, MessageSquare, Briefcase, 
    ArrowUpRight, PlayCircle, Layers, Activity, 
    CloudIcon, Database, Terminal, Heart,
    LayoutDashboard, PieChart, Bell, Calendar,
    UserCircle, Search, Settings, Star, Palette
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const Themes = [
    { id: 'amber', name: 'Amber Aura', class: 'theme-amber', color: '#f59e0b' },
    { id: 'indigo', name: 'Indigo Trust', class: 'theme-indigo', color: '#4f46e5' },
    { id: 'emerald', name: 'Emerald Growth', class: 'theme-emerald', color: '#10b981' },
    { id: 'slate', name: 'Slate Core', class: 'theme-slate', color: '#334155' }
];

const LandingPage = () => {
    const [currentTheme, setCurrentTheme] = useState(Themes[0]);
    const { scrollY } = useScroll();
    const navBackground = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]);
    const navBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(20px)"]);
    const navShadow = useTransform(scrollY, [0, 50], ["none", "0 1px 15px -10px rgb(0 0 0 / 0.1)"]);

    return (
        <div className={`${currentTheme.class} bg-white min-h-screen text-slate-900 selection:bg-primary-light font-sans overflow-x-hidden transition-colors duration-500`}>
            
            {/* --- REFINED NAVIGATION --- */}
            <motion.nav 
                style={{ 
                    backgroundColor: navBackground,
                    backdropFilter: navBlur,
                    boxShadow: navShadow
                }}
                className="fixed top-0 inset-x-0 h-16 z-[100] transition-all duration-300 border-b border-transparent"
            >
                <div className="max-w-6xl mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-premium group-hover:rotate-3 transition-all duration-300">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">
                            AURA <span className="text-primary italic">CRM</span>
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-200/60">
                        {Themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setCurrentTheme(t)}
                                className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${currentTheme.id === t.id ? 'scale-110 shadow-sm ring-2 ring-white' : 'opacity-30 hover:opacity-60'}`}
                                style={{ backgroundColor: t.color }}
                                title={t.name}
                            >
                                {currentTheme.id === t.id && <div className="w-1 h-1 bg-white rounded-full" />}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest">
                            Log In
                        </Link>
                        <Link to="/signup" className="px-5 py-2.5 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-primary transition-all shadow-md hover:shadow-premium uppercase tracking-widest">
                            Get Started
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* --- COMPACT HERO SECTION --- */}
            <section className="relative pt-32 pb-20 px-6 mesh-bg-theme min-h-[85vh] flex flex-col justify-center">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center">


                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[1.02] max-w-4xl mb-10"
                    >
                        Business software, <br/>
                        reimagined with <span className="text-gradient-pro italic">soul.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mb-12 leading-relaxed"
                    >
                        Management shouldn't feel mechanical. Aura CRM brings 
                        clarity, warmth, and intuitive efficiency to the modern workspace.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link to="/signup" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-premium flex items-center gap-3 group">
                            Start Building <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* --- REFINED CORE PHILOSOPHY --- */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
                        <div className="max-w-xl">
                            <h2 className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-5">Our Philosophy</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-tight mb-6">
                                Engineering for the <br/> human element.
                            </h3>
                        </div>
                        <div className="max-w-xs border-l-2 border-primary/20 pl-6 py-1">
                             <p className="text-slate-500 font-bold text-base leading-snug">
                                We've humanized corporate tools by removing the friction points that stall meaningful growth.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PhilosophyBlock 
                            icon={<Zap size={28} />}
                            title="Zero-Lag Sync"
                            desc="Real-time data orchestration that keeps your global team in perfect aesthetic harmony."
                        />
                        <PhilosophyBlock 
                            icon={<ShieldCheck size={28} />}
                            title="Iron Trust"
                            desc="Security without complexity. Institutional-grade safety wrapped in a clean interface."
                        />
                        <PhilosophyBlock 
                            icon={<Globe2 size={28} />}
                            title="Unified Core"
                            desc="One heartbeat for Sales, HR, and Finance. Integrated intelligence in every click."
                        />
                    </div>
                </div>
            </section>

            {/* --- SLEEK SOLUTIONS --- */}
            <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter mb-6 leading-none">
                            Tailored for <span className="text-primary italic">Ambition.</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Aura isn't just a platform; it's a precision instrument for your organization's daily operations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sales Block */}
                        <div className="group pro-card-premium p-10 h-[500px] flex flex-col justify-between bg-slate-950 text-white relative">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -mr-48 -mt-48 transition-all group-hover:bg-primary/20" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-premium">
                                    <Target size={28} className="text-white" />
                                </div>
                                <h3 className="text-4xl font-black mb-6 text-white tracking-tighter">Growth Engine</h3>
                                <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
                                    Strategic pipeline management and automated lead orchestration for high-velocity teams.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-wrap gap-2.5 mt-8 p-3 rounded-2xl bg-white/5 border border-white/10">
                                {['Smart Pipelines', 'Revenue Analytics', 'Lead Flow'].map(tag => (
                                    <span key={tag} className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 bg-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Invoice Block */}
                        <div className="group pro-card-premium p-10 h-[500px] flex flex-col justify-between bg-white text-slate-950 border border-slate-200">
                            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-light/40 rounded-full blur-[80px] -mr-48 -mb-48" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                    <Briefcase size={28} />
                                </div>
                                <h3 className="text-4xl font-black mb-6 text-slate-950 tracking-tighter">Enterprise Hub</h3>
                                <p className="text-slate-500 text-lg max-w-sm leading-relaxed">
                                    The definitive core for People Ops, automated payroll, and intelligent invoicing.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-wrap gap-2.5 mt-8 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                {['HR Intelligence', 'Auto-Payslips', 'Audit Flow'].map(tag => (
                                    <span key={tag} className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PREMIUM TESTIMONIAL SLIDER --- */}
            <section className="py-24 px-6 bg-secondary relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <TestimonialSlider />
                </div>
            </section>

            {/* --- CONCISE FOOTER --- */}
            <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2">
                             <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-8 h-8 bg-primary rounded-lg shadow-premium" />
                                <span className="text-xl font-black tracking-tighter text-slate-950">AURA CRM</span>
                            </div>
                            <p className="text-slate-500 font-bold text-base leading-relaxed max-w-xs mb-6">
                                Precision engineered enterprise software for teams that value design.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Platform</h4>
                            <ul className="space-y-3 text-slate-500 font-bold text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">Sales Engine</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">People Ops</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Finance Pro</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Company</h4>
                            <ul className="space-y-3 text-slate-500 font-bold text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Security Repo</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* removed copyright footer */}
                </div>
            </footer>
        </div>
    );
};

const testimonials = [
    {
        quote: "Finally, a CRM that doesn't feel like a legacy weight. It's fast, intentional, and remarkably effective.",
        author: "Sarah Al-Fassi",
        role: "CEO, Global Pulse",
        initials: "SA"
    },
    {
        quote: "The intuitive flow of Aura has completely transformed how our sales team operates. It's pure precision.",
        author: "Marcus Thorne",
        role: "Head of Growth, Apex Tech",
        initials: "MT"
    },
    {
        quote: "Aura provides the kind of clarity we've been searching for. It's the standard for modern enterprise tools.",
        author: "Elena Vance",
        role: "CTO, Veridian Systems",
        initials: "EV"
    },
    {
        quote: "The interface is so clean, team adoption was instant. No training needed, just results.",
        author: "James Sterling",
        role: "Operations Director, Core Flow",
        initials: "JS"
    }
];

const TestimonialSlider = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative overflow-hidden py-10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                >
                    <div className="flex justify-center gap-1.5 mb-8">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="fill-primary text-primary shadow-sm" />)}
                    </div>
                    <blockquote className="text-3xl md:text-5xl font-black text-white italic leading-tight mb-14 tracking-tighter max-w-4xl mx-auto h-[120px] md:h-[150px] flex items-center justify-center">
                        "{testimonials[index].quote}"
                    </blockquote>
                    <div className="flex flex-col items-center gap-5 mt-10">
                        <div className="w-16 h-16 rounded-full border-2 border-primary/50 p-1 bg-slate-800/50 backdrop-blur-sm">
                            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-primary font-black text-xl shadow-inner uppercase">
                                {testimonials[index].initials}
                            </div>
                        </div>
                        <div className="text-center">
                            <h5 className="text-lg font-black text-white italic tracking-tight">{testimonials[index].author}</h5>
                            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mt-1.5">{testimonials[index].role}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-center gap-2.5 mt-16">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${index === i ? 'bg-primary w-8 shadow-sm shadow-primary/50' : 'bg-slate-700 hover:bg-slate-600'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const PhilosophyBlock = ({ icon, title, desc }) => (
    <div className="p-8 pro-card-premium group hover:-translate-y-2">
        <div className="w-14 h-14 rounded-xl bg-slate-50 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
            {icon}
        </div>
        <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tighter">{title}</h3>
        <p className="text-slate-500 font-bold text-base leading-snug">{desc}</p>
    </div>
);

export default LandingPage;
