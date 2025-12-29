import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, X, Trash2, Calendar, User as UserIcon, Layout, List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import KanbanBoard from '../components/KanbanBoard';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban'); 
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Access Control
    const canManageTasks = ['Admin', 'Sales', 'HR'].includes(user?.role);
    
    // Columns Configuration
    const columns = [
        { id: 'Pending', title: 'To Do', color: '#64748b' },
        { id: 'In Progress', title: 'In Progress', color: '#3b82f6' },
        { id: 'Completed', title: 'Done', color: '#10b981' },
        { id: 'Cancelled', title: 'Cancelled', color: '#ef4444' }
    ];

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'Call',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '',
        description: '',
        contactId: '',
        assignedTo: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [taskRes, contactRes, userRes] = await Promise.all([
                axios.get('/api/tasks'),
                axios.get('/api/contacts'),
                axios.get('/api/auth/users')
            ]);
            
            let allTasks = taskRes.data.data || [];
            
            // Filter for Employees: Only show their assigned tasks
            if (user?.role === 'Employee') {
                allTasks = allTasks.filter(t => {
                    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
                    const currentUserId = user.id || user._id;
                    return assignedId === currentUserId;
                });
            }

            setTasks(allTasks);
            setContacts(contactRes.data.data || []);
            setUsers(userRes.data.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.assignedTo) payload.assignedTo = user.id; 

            if (editingId) {
                await axios.put(`/api/tasks/${editingId}`, payload);
            } else {
                await axios.post('/api/tasks', payload);
            }
            
            fetchData();
            handleCloseDrawer();
        } catch (err) {
            console.error("Failed to save task", err);
            alert("Failed to save task");
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;
        
        // Optimistic Update
        const originalTasks = [...tasks];
        setTasks(prev => prev.map(t => 
            t._id === draggableId ? { ...t, status: newStatus } : t
        ));

        // API Call
        try {
            const task = tasks.find(t => t._id === draggableId);
            if (task && task.status !== newStatus) {
                await axios.put(`/api/tasks/${draggableId}`, { ...task, status: newStatus });

                // Notifications
                if (newStatus === 'Completed') {
                    // Resolve contact from state to ensure we have email
                    const contactId = typeof task.contactId === 'object' ? task.contactId?._id : task.contactId;
                    const contact = contacts.find(c => c._id === contactId);
                    
                    if (contact?.email) {
                        try {
                            console.log(`[Notification] Sending email to ${contact.email} for task completion`);
                            await axios.post('/api/notifications/email', {
                                to: contact.email,
                                subject: `Task Completed: ${task.title}`,
                                message: `Hello ${contact.name},<br>The task "<strong>${task.title}</strong>" has been marked as <strong>Completed</strong>.`
                            });
                        } catch(e) { console.error("Email failed", e); }
                    }
                }
            }
        } catch (err) {
            console.error("Failed to update status", err);
            setTasks(originalTasks); // Revert
        }
    };

    const handleDelete = (task) => {
        const taskObj = typeof task === 'string' ? tasks.find(t => t._id === task) : task;
        if(taskObj) setShowDeleteConfirm(taskObj);
    };

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await axios.delete(`/api/tasks/${showDeleteConfirm._id}`);
            setTasks(prev => prev.filter(t => t._id !== showDeleteConfirm._id));
            setShowDeleteConfirm(null);
            setIsDrawerOpen(false);
        } catch (err) {
            console.error("Failed to delete task", err);
            setShowDeleteConfirm(null);
        }
    };

    const handleEdit = (task) => {
        if (!canManageTasks) return; // Prevent employees from editing
        setEditingId(task._id);
        const contactId = typeof task.contactId === 'object' ? task.contactId?._id : task.contactId;
        const assignedTo = typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo;

        setFormData({
            title: task.title,
            type: task.type,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            description: task.description || '',
            contactId: contactId || '',
            assignedTo: assignedTo || ''
        });
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingId(null);
        setFormData({
            title: '', type: 'Call', status: 'Pending', priority: 'Medium',
            dueDate: '', description: '', contactId: '', assignedTo: ''
        });
    };

    const getPriorityStyle = (p) => {
        switch(p) {
            case 'High': return { bg: '#fee2e2', text: '#ef4444' };
            case 'Medium': return { bg: '#fff7ed', text: '#f97316' }; // Orange
            case 'Low': return { bg: '#f0f9ff', text: '#0ea5e9' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    // Card Renderer for Kanban
    const renderCard = (task) => (
        <div onClick={() => canManageTasks && handleEdit(task)} className={canManageTasks ? "cursor-pointer" : "cursor-default"}>
             <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                    task.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                    {task.priority}
                </span>
                {task.dueDate && (
                     <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>
            
            <h4 className="font-bold text-slate-800 mb-2 leading-relaxed">{task.title}</h4>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                     <span className="font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{task.type}</span>
                </div>
                {task.contactId && (
                     <div className="flex items-center gap-1 text-xs text-slate-500 font-medium" title={task.contactId.name}>
                        <UserIcon size={12} />
                        <span className="max-w-[80px] truncate">{task.contactId.name}</span>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) return <LoadingSpinner message="Loading Tasks..." />;

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
                <div>
                     <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
                     <p className="text-slate-500 text-sm mt-1 font-medium">Manage your daily activities and follow-ups.</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-4">
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Layout size={16} /> Board
                        </button>
                        <button 
                             onClick={() => setViewMode('list')}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <List size={16} /> List
                        </button>
                    </div>
                    {canManageTasks ? (
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                        >
                            <Plus size={18} /> New Task
                        </button>
                    ) : (
                        <div className="bg-stone-100 text-stone-500 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-stone-200">
                            View Only Mode
                        </div>
                    )}
                </div>
            </div>

            {/* Board Content */}
            {viewMode === 'kanban' ? (
                <KanbanBoard 
                    columns={columns} 
                    data={tasks} 
                    onDragEnd={handleDragEnd}
                    renderCard={renderCard}
                    loading={loading}
                    layout="grid"
                />
            ) : (
                <div className="flex-1 p-8 overflow-y-auto">
                    {/* List View Fallback */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.map(task => (
                                    <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{task.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                task.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{task.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityStyle(task.priority).bg} ${getPriorityStyle(task.priority).text}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canManageTasks ? (
                                                <button onClick={() => handleEdit(task)} className="text-slate-400 hover:text-blue-600 p-1 font-bold">Edit</button>
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">Read Only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Drawer */}
            {isDrawerOpen && (
                <>
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={handleCloseDrawer} />
                <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Task' : 'New Task'}</h2>
                            <p className="text-slate-500 text-sm mt-0.5">{editingId ? 'Update task details.' : 'Schedule a new activity.'}</p>
                        </div>
                        <button onClick={handleCloseDrawer} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <form id="taskForm" onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Task Title <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Call Client about Proposal"
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Type</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.type} 
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 appearance-none text-sm font-medium"
                                        >
                                            {['Call', 'Meeting', 'Email', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Priority</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.priority} 
                                            onChange={e => setFormData({...formData, priority: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 appearance-none text-sm font-medium"
                                        >
                                            {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Status</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.status} 
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 appearance-none text-sm font-medium"
                                        >
                                            {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Due Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.dueDate}
                                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm font-medium"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Assign To</label>
                                <div className="relative">
                                    <select 
                                        value={formData.assignedTo} 
                                        onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 appearance-none text-sm font-medium"
                                    >
                                        <option value="">-- Assign Employee --</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Link Contact</label>
                                <div className="relative">
                                    <select 
                                        value={formData.contactId} 
                                        onChange={e => setFormData({...formData, contactId: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 appearance-none text-sm font-medium"
                                    >
                                        <option value="">-- No Contact --</option>
                                        {contacts.map(c => (
                                            <option key={c._id} value={c._id}>{c.name} ({c.company})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Description</label>
                                <textarea 
                                    rows="4"
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none resize-none text-sm"
                                    placeholder="Add details about this task..."
                                />
                            </div>

                            {editingId && (
                                <div className="pt-4 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => handleDelete(editingId)} 
                                        className="w-full text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Trash2 size={16} /> Delete Task
                                    </button>
                                </div>
                            )}

                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                        <button onClick={handleCloseDrawer} className="flex-1 text-slate-600 font-bold hover:bg-slate-200 py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
                        <button form="taskForm" type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors text-sm">
                            {editingId ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-[400px] text-center shadow-2xl animate-in zoom-in duration-200">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                            <h3 className="text-xl font-bold text-slate-900">Delete Task?</h3>
                            <p className="text-slate-500 my-4">
                            Are you sure you want to delete <strong>{showDeleteConfirm.title}</strong>? This action cannot be undone.
                        </p>
                            <div className="flex gap-4 justify-center">
                                <button className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                                <button className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-colors" onClick={confirmDelete}>Yes, Delete</button>
                            </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
