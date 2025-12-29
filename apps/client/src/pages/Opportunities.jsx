import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, DollarSign, Calendar, Filter, MoreHorizontal, X, User, TrendingUp, LayoutGrid, List, Trash2, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';

import { useAuth } from '../context/AuthContext';

const STAGES = ['New', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const Opportunities = () => {
    const { user } = useAuth();
    const [opportunities, setOpportunities] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [users, setUsers] = useState([]); // Store employees
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [editingOpportunity, setEditingOpportunity] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        stage: 'New',
        contactId: '',
        assignedTo: '', // Add assignedTo field
        expectedCloseDate: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [oppRes, contactRes, userRes] = await Promise.all([
                axios.get('/api/opportunities'),
                axios.get('/api/contacts'),
                axios.get('/api/auth/users')
            ]);
            
            let allOpportunities = oppRes.data.data;
            
            // Filter for Employees: Only show their assigned deals
            if (user?.role === 'Employee') {
                allOpportunities = allOpportunities.filter(o => {
                    const assignedId = typeof o.assignedTo === 'object' ? o.assignedTo?._id : o.assignedTo;
                    const currentUserId = user.id || user._id;
                    return assignedId === currentUserId;
                });
            }

            setOpportunities(allOpportunities);
            setContacts(contactRes.data.data);
            setUsers(userRes.data?.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setLoading(false);
        }
    };

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item._id); 
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetStage) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.stage === targetStage) return;

        const updatedOpp = { ...draggedItem, stage: targetStage };
        
        setOpportunities(prev => 
            prev.map(opp => opp._id === updatedOpp._id ? updatedOpp : opp)
        );

        try {
            await axios.put(`/api/opportunities/${draggedItem._id}`, { stage: targetStage });
        } catch (err) {
            console.error("Failed to update stage", err);
            fetchData();
        }
        setDraggedItem(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (opp) => {
        setEditingOpportunity(opp);
        setFormData({
            title: opp.title,
            amount: opp.amount,
            stage: opp.stage,
            contactId: opp.contactId?._id || opp.contactId || '',
            assignedTo: opp.assignedTo?._id || opp.assignedTo || '',
            expectedCloseDate: opp.expectedCloseDate ? opp.expectedCloseDate.split('T')[0] : ''
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/opportunities/${id}`);
            setOpportunities(prev => prev.filter(o => o._id !== id));
            setIsDrawerOpen(false);
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingOpportunity) {
                await axios.put(`/api/opportunities/${editingOpportunity._id}`, formData);
            } else {
                await axios.post('/api/opportunities', formData);
            }
            
            setFormData({ title: '', amount: '', stage: 'New', contactId: '', assignedTo: '', expectedCloseDate: '' });
            setIsDrawerOpen(false);
            setEditingOpportunity(null);
            fetchData(); 
        } catch (err) {
            setError('Failed to save opportunity');
        }
    };

    const openCreateDrawer = () => {
        setEditingOpportunity(null);
        setFormData({ title: '', amount: '', stage: 'New', contactId: '', assignedTo: '', expectedCloseDate: '' });
        setIsDrawerOpen(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const getColumnTotal = (stage) => {
        return opportunities
            .filter(o => o.stage === stage)
            .reduce((sum, o) => sum + (o.amount || 0), 0);
    };

    const totalPipelineValue = opportunities.reduce((sum, o) => sum + (o.amount || 0), 0);

    const getStageColor = (stage) => {
        switch(stage) {
            case 'New': return { accent: '#3b82f6', bg: '#eff6ff', text: '#1e40af' };
            case 'Discovery': return { accent: '#8b5cf6', bg: '#f5f3ff', text: '#5b21b6' };
            case 'Proposal': return { accent: '#eab308', bg: '#fefce8', text: '#854d0e' };
            case 'Negotiation': return { accent: '#f97316', bg: '#fff7ed', text: '#9a3412' };
            case 'Won': return { accent: '#22c55e', bg: '#f0fdf4', text: '#166534' };
            case 'Lost': return { accent: '#ef4444', bg: '#fef2f2', text: '#991b1b' };
            default: return { accent: '#64748b', bg: '#f8fafc', text: '#334155' };
        }
    };

    if (loading) return <LoadingSpinner message="Loading Sales Pipeline..." />;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem 1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Sales Pipeline</h1>
            </div>            {/* Filters & Actions */}
            <div style={{ padding: '0 2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                     <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search deals..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '250px', fontSize: '0.9rem' }} 
                        />
                    </div>
                </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pipeline</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(totalPipelineValue)}</div>
                    </div>
                    <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
                     <button 
                        className="btn btn-primary" 
                        onClick={openCreateDrawer}
                        style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                    >
                        <Plus size={18} style={{ marginRight: '6px' }} />
                        New Deal
                    </button>
                     <button 
                        className="btn btn-ghost" 
                        onClick={() => exportToCSV(opportunities, 'opportunities')}
                        style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, border: '1px solid #e2e8f0', backgroundColor: 'white' }}
                    >
                        <Download size={18} style={{ marginRight: '6px' }} />
                        Export
                    </button>
                </div>
            </div>

            {/* Kanban Grid Layout (3x2) */}
            <div style={{ 
                flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', 
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem',
                alignContent: 'start'
            }}>
                {STAGES.map(stage => {
                    const stageStyle = getStageColor(stage);
                    const stageDeals = opportunities.filter(o => 
                        o.stage === stage && 
                        (o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (o.contactId?.company || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                    const columnTotal = stageDeals.reduce((sum, o) => sum + (o.amount || 0), 0);
                    
                    return (
                        <div 
                            key={stage}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                            style={{ 
                                backgroundColor: '#f8fafc', borderRadius: '16px', 
                                display: 'flex', flexDirection: 'column', 
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                height: 'fit-content', // Allow column to grow but respect grid flow
                                minHeight: '300px'
                            }}
                        >
                            {/* Column Header */}
                            <div style={{ 
                                padding: '1.25rem', borderBottom: '1px solid #e2e8f0', 
                                backgroundColor: 'white', borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
                                display: 'flex', flexDirection: 'column', gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>{stage}</h3>
                                    <span style={{ 
                                        backgroundColor: stageStyle.bg, color: stageStyle.text, 
                                        padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 
                                    }}>
                                        {stageDeals.length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ height: '6px', flex: 1, backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginRight: '1rem' }}>
                                        <div style={{ height: '100%', width: '100%', backgroundColor: stageStyle.accent }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
                                        {formatCurrency(columnTotal)}
                                    </div>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {stageDeals.map(opp => {
                                    const contact = contacts.find(c => c._id === opp.contactId) || contacts.find(c => c._id === opp.contactId?._id);
                                    const assignedUser = users.find(u => u._id === opp.assignedTo) || (opp.assignedTo && typeof opp.assignedTo === 'object' ? opp.assignedTo : null);

                                    return (
                                        <div
                                            key={opp._id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, opp)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => handleEdit(opp)}
                                            style={{
                                                backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
                                                cursor: 'grab', border: '1px solid #f1f5f9', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative'
                                            }}
                                            className="kanban-card group"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.08)';
                                                e.currentTarget.style.borderColor = stageStyle.accent + '40';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)';
                                                e.currentTarget.style.borderColor = '#f1f5f9';
                                            }}
                                        >
                                            {/* Delete Button (Visible on Hover) */}
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(opp); }}
                                                    style={{ padding: '5px', borderRadius: '6px', color: '#ef4444', border: 'none', background: '#fee2e2', cursor: 'pointer' }}
                                                    title="Delete Deal"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>

                                            {/* Card Content */}
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                                                    {contact ? contact.company || 'Direct Client' : 'Prospect'}
                                                </div>
                                                <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{opp.title}</h4>
                                                
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(opp.amount)}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>est.</span>
                                                </div>
                                                
                                                {/* Meta Info Row */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f8fafc' }}>
                                                    {assignedUser ? (
                                                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <div title={`Assigned to ${assignedUser.name}`} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, border: '2px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}>
                                                                {assignedUser.name ? assignedUser.name.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{assignedUser.name.split(' ')[0]}</span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic' }}>Unassigned</span>
                                                    )}
                                                    
                                                    {opp.expectedCloseDate && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                                                            <Calendar size={12} />
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                                                {new Date(opp.expectedCloseDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {stageDeals.length === 0 && (
                                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}>
                                        <p style={{ fontWeight: 500 }}>Empty Stage</p>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Drag deals here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit/Create Drawer */}
            {isDrawerOpen && (
                <>
                    <div 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 40, backdropFilter: 'blur(3px)' }} 
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <div style={{
                        position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', backgroundColor: 'white', zIndex: 50,
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
                        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{editingOpportunity ? 'Edit Deal' : 'New Opportunity'}</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '2px' }}>{editingOpportunity ? 'Update deal details.' : 'Add a deal to your pipeline.'}</p>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: 'white' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                            <form id="dealForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Deal Title <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange} 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} placeholder="e.g. Q4 Marketing Contract" />
                                </div>

                                 <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Value <span style={{ color: '#ef4444' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>$</div>
                                        <input required type="number" name="amount" value={formData.amount} onChange={handleChange} 
                                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 500 }} placeholder="0.00" />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Related Contact</label>
                                    <select required name="contactId" value={formData.contactId} onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '0.95rem' }}>
                                        <option value="">Select a Contact...</option>
                                        {contacts.map(c => (
                                            <option key={c._id} value={c._id}>{c.name} {c.company ? `- ${c.company}` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Assign To (Employee)</label>
                                    <select name="assignedTo" value={formData.assignedTo} onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '0.95rem' }}>
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Stage</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {STAGES.map(s => (
                                            <button 
                                                key={s} 
                                                type="button"
                                                onClick={() => setFormData({...formData, stage: s})}
                                                style={{ 
                                                    padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                    border: formData.stage === s ? `1px solid ${getStageColor(s).accent}` : '1px solid #e2e8f0',
                                                    backgroundColor: formData.stage === s ? getStageColor(s).bg : 'white',
                                                    color: formData.stage === s ? getStageColor(s).text : '#64748b',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                 <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Target Close Date</label>
                                    <input type="date" name="expectedCloseDate" value={formData.expectedCloseDate} onChange={handleChange} 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                                </div>
                            </form>
                        </div>
                        
                        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                            {editingOpportunity ? (
                                <button 
                                    onClick={() => setShowDeleteConfirm(editingOpportunity)}
                                    className="btn btn-ghost" 
                                    style={{ color: '#ef4444', fontWeight: 600 }}
                                >
                                    <Trash2 size={18} style={{ marginRight: '6px' }} />
                                    Delete
                                </button>
                            ) : <div></div>}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setIsDrawerOpen(false)} className='btn btn-ghost' style={{ fontWeight: 600 }}>Cancel</button>
                                <button form="dealForm" type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>{editingOpportunity ? 'Save Changes' : 'Create Deal'}</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Simple Delete Confirm */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '400px', textAlign: 'center' }}>
                         <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Delete this deal?</h3>
                         <p style={{ color: '#64748b', margin: '1rem 0 1.5rem' }}>Are you sure you want to delete <strong>{showDeleteConfirm.title}</strong>?</p>
                         <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                             <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                             <button className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(showDeleteConfirm._id)}>Yes, Delete</button>
                         </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .kanban-card:hover {
                    z-index: 10;
                }
            `}</style>
        </div>
    );
};

export default Opportunities;
