import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2) {
                performSearch(query);
            } else {
                setResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    const performSearch = async (searchTerm) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/search?q=${searchTerm}`);
            setResults(res.data.results);
            setShowDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (type, item) => {
        setShowDropdown(false);
        setQuery(''); // Clear search on navigation
        
        switch(type) {
            case 'contacts': navigate('/contacts'); break; // Ideally deep link (e.g., /contacts?id=...)
            case 'products': navigate('/products'); break;
            case 'tickets': navigate('/tickets'); break;
            case 'opportunities': navigate('/opportunities'); break;
            default: break;
        }
    };


    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
            {/* Search Area */}
            <div className="flex items-center gap-4 flex-1 relative">
                <div ref={searchRef} className="relative w-96">
                    <div className="flex items-center bg-stone-50 px-4 py-2 rounded-xl border border-transparent focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
                        <Search size={18} className="text-stone-400" />
                        <input 
                            type="text" 
                            placeholder="Search clients, deals, or tickets..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => { if(results) setShowDropdown(true); }}
                            className="bg-transparent border-none outline-none ml-2 w-full text-stone-700 placeholder:text-stone-400 text-sm font-medium"
                        />
                        {loading && <Loader2 size={16} className="animate-spin text-stone-400" />}
                    </div>

                    {/* Search Results Dropdown */}
                    {showDropdown && results && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            {Object.entries(results).map(([key, section]) => {
                                if (section.count === 0) return null;
                                return (
                                    <div key={key}>
                                        <div className="px-4 py-2 bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100">
                                            {key} ({section.count})
                                        </div>
                                        {section.data.slice(0, 3).map(item => (
                                            <div 
                                                key={item._id} 
                                                onClick={() => handleResultClick(key, item)}
                                                className="px-4 py-3 cursor-pointer border-b border-stone-50 hover:bg-stone-50 flex justify-between items-center group transition-colors"
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-bold text-stone-700 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{item.name || item.title}</div>
                                                    {(item.email || item.sku || item.description) && (
                                                        <div className="text-[10px] text-stone-400 truncate max-w-[250px] font-medium">{item.email || item.sku || item.description?.substring(0, 40)}...</div>
                                                    )}
                                                </div>
                                                <ChevronRight size={14} className="text-stone-300 group-hover:text-amber-500 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                            {Object.values(results).every(s => s.count === 0) && (
                                <div className="p-8 text-center text-stone-400 text-sm font-bold">No records found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-stone-200"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-stone-50 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-black text-stone-900">{user?.name || 'User'}</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
