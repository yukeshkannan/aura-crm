import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, User, Briefcase, Mail, Shield, X, Check, Building2, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    designation: '',
    department: '',
    baseSalary: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user: currentUser } = useAuth(); 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users');
      setUsers(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave empty to keep existing
      role: user.role,
      designation: user.designation || '',
      department: user.department || '',
      baseSalary: user.salary?.base || ''
    });
    setIsDrawerOpen(true);
    setSuccess('');
    setError('');
  };

  const handleDelete = async (userId, e) => {
    e.stopPropagation(); // Prevent card click
    try {
        await axios.delete(`/api/auth/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        setShowDeleteConfirm(null);
        setSuccess('User deleted successfully');
    } catch (err) {
        setError('Failed to delete user');
    }
  };

  const confirmDelete = (e, user) => {
      e.stopPropagation();
      setShowDeleteConfirm(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        ...formData,
        salary: { base: Number(formData.baseSalary) || 0, allowances: 0 }
      };

      if (editingUser) {
        // Update existing user
        await axios.put(`/api/auth/users/${editingUser._id}`, payload);
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        await axios.post('/api/auth/create-user', payload);
        setSuccess('User created successfully!');
      }
      
      setFormData({
        name: '', email: '', password: '',
        role: 'Employee', designation: '', department: '', baseSalary: ''
      });
      setIsDrawerOpen(false);
      setEditingUser(null);
      fetchUsers(); 
    } catch (err) {
      setError(err.response?.data?.message || (editingUser ? 'Failed to update user' : 'Failed to create user'));
    }
  };

  const openDrawer = () => {
    setEditingUser(null);
    setFormData({
        name: '', email: '', password: '',
        role: 'Employee', designation: '', department: ''
    });
    setIsDrawerOpen(true);
    setSuccess('');
    setError('');
  };

  if (loading) return <LoadingSpinner message="Loading Users..." />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
          <p className="text-slate-500">Manage system access and roles</p>
        </div>
        <button 
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2" 
          onClick={openDrawer}
        >
          <Plus size={20} />
          Add New User
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((u) => (
          <div 
            key={u._id} 
            className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => handleEdit(u)}
          >
            {/* Hover Indicator */}
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>

            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                {u.name.charAt(0)}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                u.role === 'Admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {u.role}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{u.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{u.designation || 'No Designation'}</p>
            
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" />
                <span>{u.department || 'General'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(u); }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    <Pencil size={16} />
                    Edit
                </button>
                <button 
                    onClick={(e) => confirmDelete(e, u)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-Over Drawer for Add/Edit User */}
      {isDrawerOpen && (
        <>
            <div 
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit User' : 'New User'}</h2>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
                    
                    <form id="userForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="block mb-2 font-semibold text-slate-700">Full Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                            className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-slate-700">Email Address</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-slate-700">Password {editingUser && <span className="text-xs font-normal text-slate-400 ml-1">(Leave blank to keep current)</span>}</label>
                            <div className="relative">
                            <input 
                                required={!editingUser} // Only required for new users
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange}
                                className="w-full p-3 pr-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 font-semibold text-slate-700">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
                                    <option value="Employee">Employee</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Sales">Sales</option>
                                    <option value="HR">HR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-slate-700">Department</label>
                                <input type="text" name="department" placeholder="e.g. Finance" value={formData.department} onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-slate-700">Designation</label>
                            <input type="text" name="designation" placeholder="e.g. Sales Executive" value={formData.designation} onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        </div>

                         <div>
                            <label className="block mb-2 font-semibold text-slate-700">Base Salary (₹)</label>
                            <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="e.g. 50000" />
                        </div>
                    </form>
                </div>

                 <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                    <button onClick={() => setIsDrawerOpen(false)} className="px-6 py-2.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                    <button form="userForm" type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        {editingUser ? 'Update User' : 'Create User'}
                    </button>
                </div>
            </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h2>
                <p className="text-slate-500 mb-8">
                    Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                    <button 
                        className="flex-1 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" 
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="flex-1 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200" 
                        onClick={(e) => handleDelete(showDeleteConfirm._id, e)}
                    >
                        Delete User
                    </button>
                </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Users;
