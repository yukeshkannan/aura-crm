import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Package, Trash2, Edit2, ShoppingBag, Box, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Software', 'Hardware', 'Service', 'Subscription'];

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        category: 'Service',
        description: '',
        stock: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, categoryFilter]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch products", err);
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let temp = [...products];
        
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            temp = temp.filter(p => 
                p.name?.toLowerCase().includes(lowerQuery) || 
                p.sku?.toLowerCase().includes(lowerQuery)
            );
        }

        if (categoryFilter !== 'All') {
            temp = temp.filter(p => p.category === categoryFilter);
        }

        setFilteredProducts(temp);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (product) => {
        if (user?.role !== 'Admin') {
            alert("Only Admins can edit products.");
            return;
        }
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            price: product.price,
            category: product.category,
            description: product.description || '',
            stock: product.stock
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = (product) => {
         if (user?.role !== 'Admin') {
            alert("Only Admins can delete products.");
            return;
        }
        setShowDeleteConfirm(product);
    };

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await axios.delete(`/api/products/${showDeleteConfirm._id}`);
            setProducts(prev => prev.filter(p => p._id !== showDeleteConfirm._id));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete product", err);
            setShowDeleteConfirm(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct._id}`, formData);
            } else {
                await axios.post('/api/products', formData);
            }
            
            setFormData({ name: '', sku: '', price: '', category: 'Service', description: '', stock: 0 });
            setIsDrawerOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            console.error("Failed to save product", err);
            alert("Failed to save product. Check SKU uniqueness.");
        }
    };

    const openCreateDrawer = () => {
        setEditingProduct(null);
        setFormData({ name: '', sku: '', price: '', category: 'Service', description: '', stock: 0 });
        setIsDrawerOpen(true);
    };

    const getCategoryColor = (cat) => {
        switch(cat) {
            case 'Software': return { bg: '#fff7ed', text: '#ea580c' }; // Orange
            case 'Hardware': return { bg: '#fefce8', text: '#a16207' }; // Yellow
            case 'Service': return { bg: '#ecfdf5', text: '#059669' }; // Emerald
            case 'Subscription': return { bg: '#faf5ff', text: '#7c3aed' }; // Purple
            default: return { bg: '#f5f5f4', text: '#57534e' }; // Stone
        }
    };

    if (loading) return <LoadingSpinner message="Synchronizing Catalog..." />;

    return (
        <div className="h-screen flex flex-col bg-stone-50/50 overflow-hidden font-sans">
            
            {/* Header */}
            <div className="bg-white border-b border-stone-200 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20">
                <div>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Product Catalog <span className="text-amber-600">.</span></h1>
                    <p className="text-stone-500 font-medium text-sm mt-1">Manage corporate services, licenses, and inventory.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input 
                            type="text" 
                            placeholder="Search catalog..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-stone-400 placeholder:font-medium"
                        />
                    </div>
                    
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="hidden lg:block pl-4 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-black text-stone-600 outline-none focus:border-amber-500 transition-all cursor-pointer hover:bg-stone-50"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {user?.role === 'Admin' && (
                        <button 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                            onClick={openCreateDrawer}
                        >
                            <Plus size={18} strokeWidth={3} /> Add Product
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                            <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center mb-8">
                                <Package size={48} className="text-stone-300" />
                            </div>
                            <h3 className="text-xl font-black text-stone-800 tracking-tight">No products found</h3>
                            <p className="font-medium mt-2">Try adjusting your filters or add a new product.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                            {filteredProducts.map(product => {
                                const catColor = getCategoryColor(product.category);
                                return (
                                    <div key={product._id} className="bg-white rounded-[32px] border border-stone-200 overflow-hidden group hover:shadow-2xl hover:shadow-stone-200/50 hover:-translate-y-1.5 transition-all duration-500 relative flex flex-col">
                                        <div className="h-44 bg-stone-50/50 flex items-center justify-center border-b border-stone-100 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                            <ShoppingBag size={56} className="text-stone-200 group-hover:text-amber-200 group-hover:scale-110 transition-all duration-500 relative z-10" />
                                            
                                            <div className="absolute top-4 left-4">
                                                <span 
                                                    className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-white/50"
                                                    style={{ backgroundColor: catColor.bg, color: catColor.text }}
                                                >
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">SKU: {product.sku}</span>
                                            </div>
                                            
                                            <h3 className="font-black text-stone-900 text-xl mb-2 tracking-tight line-clamp-1">{product.name}</h3>
                                            <p className="text-sm text-stone-500 font-medium mb-8 line-clamp-2 flex-1">{product.description || 'Enterprise grade solution tailored for efficiency.'}</p>
                                            
                                            <div className="flex justify-between items-end pt-6 border-t border-stone-50">
                                                <div>
                                                    <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Unit Price</span>
                                                    <span className="text-2xl font-black text-stone-900 leading-none">${product.price?.toLocaleString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                        product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        {product.stock > 0 ? `${product.stock} Stock` : 'Out of Stock'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {user?.role === 'Admin' && (
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 lg:translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
                                                <button onClick={() => handleEdit(product)} className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xl flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product)} className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xl flex items-center justify-center text-stone-600 hover:text-red-600 hover:border-red-200 transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {isDrawerOpen && (
                <>
                    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsDrawerOpen(false)} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-stone-900 tracking-tight">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                                <p className="text-stone-500 font-medium text-sm mt-1">Configure your catalog items with precision.</p>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-white hover:text-stone-900 transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Product Identity</label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/30 text-stone-900 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                                        placeholder="e.g. Enterprise Cloud License" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">SKU Reference</label>
                                        <input 
                                            required 
                                            type="text" 
                                            name="sku" 
                                            value={formData.sku} 
                                            onChange={handleChange} 
                                            className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/30 text-stone-900 font-black tracking-tight focus:border-amber-500 outline-none transition-all uppercase"
                                            placeholder="SKU-001" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Category</label>
                                        <select 
                                            name="category" 
                                            value={formData.category} 
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-700 font-bold focus:border-amber-500 outline-none transition-all appearance-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Price (USD)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-black">$</span>
                                            <input 
                                                required 
                                                type="number" 
                                                name="price" 
                                                value={formData.price} 
                                                onChange={handleChange} 
                                                min="0" 
                                                step="0.01"
                                                className="w-full pl-10 pr-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/30 text-stone-900 font-black focus:border-amber-500 outline-none transition-all"
                                                placeholder="0.00" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Stock Availability</label>
                                        <input 
                                            required 
                                            type="number" 
                                            name="stock" 
                                            value={formData.stock} 
                                            onChange={handleChange} 
                                            min="0"
                                            className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/30 text-stone-900 font-bold focus:border-amber-500 outline-none transition-all"
                                            placeholder="0" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        rows={5}
                                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-stone-900 font-medium text-sm focus:border-amber-500 outline-none transition-all resize-none"
                                        placeholder="Enter comprehensive product specifications..." 
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex gap-4">
                            <button onClick={() => setIsDrawerOpen(false)} className="flex-1 px-6 py-4 rounded-2xl bg-white border border-stone-200 text-stone-600 font-black text-sm uppercase hover:bg-stone-100 transition-all">Cancel</button>
                            <button form="productForm" type="submit" className="flex-[2] px-6 py-4 rounded-2xl bg-stone-900 text-white font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-stone-200">
                                {editingProduct ? 'Update Product' : 'Authorize Product'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white p-10 rounded-[40px] w-full max-w-[440px] text-center shadow-2xl animate-in zoom-in duration-300">
                         <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <Trash2 size={40} strokeWidth={2.5} />
                        </div>
                         <h3 className="text-2xl font-black text-stone-900 tracking-tight">Decommission Product?</h3>
                         <p className="text-stone-500 font-medium mt-3 mb-10 leading-relaxed">
                            Are you certain you want to remove <strong>{showDeleteConfirm.name}</strong> from the catalog? This action is irreversible.
                        </p>
                         <div className="flex gap-4">
                             <button className="flex-1 py-4 px-6 rounded-2xl bg-stone-50 text-stone-600 font-black text-sm uppercase tracking-widest hover:bg-stone-100 transition-all" onClick={() => setShowDeleteConfirm(null)}>Abort</button>
                             <button className="flex-1 py-4 px-6 rounded-2xl bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-200" onClick={confirmDelete}>Confirm Delete</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
