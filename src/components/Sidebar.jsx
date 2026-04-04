import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Settings, 
  HelpCircle,
  LogOut,
  IndianRupee,
  BookOpen,
  Award,
  School,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = {
    principal: [
      { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/principal' },
      { name: 'Students', icon: <Users size={20} />, path: '/dashboard/students' },
      { name: 'Faculty', icon: <GraduationCap size={20} />, path: '/dashboard/teachers' },
      { name: 'Fees Management', icon: <IndianRupee size={20} />, path: '/dashboard/fees' },
      { name: 'Attendance', icon: <CheckSquare size={20} />, path: '/dashboard/attendance' },
      { name: 'Reports', icon: <FileText size={20} />, path: '/dashboard/reports' },
      { name: 'Academic Support', icon: <BookOpen size={20} />, path: '/dashboard/homework' },
      { name: 'Grading', icon: <Award size={20} />, path: '/dashboard/marks' },
    ],
    teacher: [
      { name: 'My Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/teacher' },
      { name: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
      { name: 'Attendance', icon: <CheckSquare size={20} />, path: '/dashboard/teacher/attendance' },
      { name: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
      { name: 'Marks Entry', icon: <Award size={20} />, path: '/dashboard/teacher/marks' },
    ],
    parent: [
      { name: 'Child Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/parent' },
    ]
  };

  const items = navItems[role] || [];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-0 top-0 h-full w-[280px] md:w-[240px] bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out font-['Inter'] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
              <School size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-700 leading-none m-0">EduSync</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1 m-0">Academic Atelier</p>
            </div>
          </div>
          
          {/* Close button inside sidebar on mobile */}
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 md:hidden bg-transparent border-none cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left transition-all duration-200 border-none ${
                    isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600 rounded-r-xl' 
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 rounded-lg'
                }`}
              >
                <span className={`${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-1">
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="flex items-center gap-3 px-4 py-2.5 text-slate-600 text-sm font-medium bg-transparent border-none cursor-pointer rounded-lg hover:bg-slate-50"
          >
            <Settings size={20} className="text-slate-400" />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard/support')}
            className="flex items-center gap-3 px-4 py-2.5 text-slate-600 text-sm font-medium bg-transparent border-none cursor-pointer rounded-lg hover:bg-slate-50"
          >
            <HelpCircle size={20} className="text-slate-400" />
            <span>Support</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-red-600 text-sm font-medium bg-transparent border-none cursor-pointer rounded-lg hover:bg-red-50"
          >
            <LogOut size={20} className="text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
