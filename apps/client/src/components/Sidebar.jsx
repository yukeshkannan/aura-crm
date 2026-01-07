import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Files, 
  Ticket, 
  Settings, 
  LogOut,
  UserPlus,
  Package,
  Receipt,
  ListTodo,
  Calendar,
  DollarSign,
  Clock,
  Briefcase
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  
  // -- CLIENT VIEW --
  if (user?.role === 'Client') {
      const clientItems = [
          { label: 'My Project', path: '/app/dashboard', icon: <Briefcase size={20} /> },
          { label: 'Explore Services', path: '/app/explore', icon: <Package size={20} /> },
          { label: 'My Invoices', path: '/app/invoices', icon: <Receipt size={20} /> },
          { label: 'Support Tickets', path: '/app/tickets', icon: <Ticket size={20} /> },
      ];

      return (
        <aside className="w-64 bg-stone-900 border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-2xl text-white font-sans">
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-amber-900/40">A</div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight text-white uppercase">Aura CRM</span>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Client Portal</span>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-6 overflow-y-auto">
                <ul className="flex flex-col gap-2">
                {clientItems.map((item) => (
                    <li key={item.path}>
                    <NavLink 
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                        isActive 
                        ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/20' 
                        : 'text-stone-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                    </li>
                ))}
                </ul>
            </nav>
            <div className="p-6 space-y-2 border-t border-white/5">
                 <NavLink 
                    to="/app/settings"
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm w-full ${
                        isActive ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'
                    }`}
                    >
                    <Settings size={20} />
                    Settings
                </NavLink>
                <button 
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm w-full text-red-400 hover:bg-red-500/10" 
                onClick={logout}
                >
                <LogOut size={20} />
                Logout
                </button>
            </div>
        </aside>
      );
  }

  // -- INTERNAL TEAM VIEW (Admin, Employee, Sales) --
  const navItems = [];

  // 1. Common for all internal roles
  navItems.push({ label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> });

  // 2. Role Specific Access
  if (user?.role === 'Admin' || user?.role === 'Sales') {
    navItems.push({ label: 'Contacts', path: '/app/contacts', icon: <Users size={20} /> });
    navItems.push({ label: 'Sales Pipeline', path: '/app/sales', icon: <Files size={20} /> });
  }

  // Support & Products (Admin/Support/Dev)
  if (user?.role === 'Admin' || user?.role === 'Employee') {
    navItems.push({ label: 'Tickets', path: '/app/tickets', icon: <Ticket size={20} /> });
  }

  if (user?.role === 'Admin') {
    navItems.push({ label: 'Products', path: '/app/products', icon: <Package size={20} /> });
  }

  // Financials (Strictly Admin only for now)
  if (user?.role === 'Admin') {
    navItems.push({ label: 'Invoices', path: '/app/invoices', icon: <Receipt size={20} /> });
  }

  // 3. Operational items for everyone
  navItems.push({ label: 'Tasks', path: '/app/tasks', icon: <ListTodo size={20} /> });
  navItems.push({ label: 'Calendar', path: '/app/calendar', icon: <Calendar size={20} /> });

  // 4. Personal/HR Management
  if (user?.role === 'Admin') {
    navItems.push({ label: 'Attendance', path: '/app/attendance', icon: <Clock size={20} /> });
  }
  navItems.push({ label: 'Payroll', path: '/app/payroll', icon: <DollarSign size={20} /> });

  // 5. System Administration
  if (user?.role === 'Admin') {
    navItems.push({ label: 'User Management', path: '/app/users', icon: <UserPlus size={20} /> });
  }

  return (
    <aside className="w-64 bg-white border-r border-stone-100 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-sm font-sans">
      <div className="p-8 border-b border-stone-50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-amber-200">A</div>
            <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-stone-900 uppercase leading-none">Aura CRM</span>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Enterprise Suite</span>
            </div>
        </div>
      </div>

      <nav className="flex-1 p-6 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive 
                  ? 'bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 space-y-1 border-t border-stone-50">
        <NavLink 
          to="/app/settings"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm w-full ${
            isActive 
            ? 'bg-amber-50 text-amber-600' 
            : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <Settings size={20} />
          Settings
        </NavLink>
        <button 
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm w-full text-red-500 hover:bg-red-50 mt-1" 
          onClick={logout}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
