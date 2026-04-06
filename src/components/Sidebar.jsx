import React, { useState, useEffect } from 'react';
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
  X,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = {
    principal: [
      { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard/principal' },
      { name: 'Attendance', icon: <CheckSquare size={20} />, path: '/dashboard/attendance' },
      { name: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/homework' },
      { name: 'Announcements', icon: <Bell size={20} />, path: '/dashboard/announcements' },
      { name: 'Marks', icon: <Award size={20} />, path: '/dashboard/marks' },
      { name: 'Students', icon: <Users size={20} />, path: '/dashboard/students' },
      { name: 'Teachers', icon: <GraduationCap size={20} />, path: '/dashboard/teachers' },
      { name: 'Fees', icon: <IndianRupee size={20} />, path: '/dashboard/fees' },
      { name: 'Reports', icon: <FileText size={20} />, path: '/dashboard/reports' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
      { name: 'Support', icon: <HelpCircle size={20} />, path: '/dashboard/support' },
    ],
    teacher: [
      { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard/teacher' },
      { name: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
      { name: 'Attendance', icon: <CheckSquare size={20} />, path: '/dashboard/teacher/attendance' },
      { name: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
      { name: 'Marks Entry', icon: <Award size={20} />, path: '/dashboard/teacher/marks' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
      { name: 'Support', icon: <HelpCircle size={20} />, path: '/dashboard/support' },
    ],
    parent: [
      { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard/parent' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
      { name: 'Support', icon: <HelpCircle size={20} />, path: '/dashboard/support' },
    ]
  };

  const items = navItems[role] || [];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobile && (
        <div 
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease'
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className="no-print"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: isMobile ? '280px' : '240px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobile 
            ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') 
            : 'translateX(0)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#2563EB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
              <School size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E40AF', margin: 0, lineHeight: 1 }}>EduSync</h1>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', fontWeight: 600, margin: '4px 0 0 0' }}>Academic Atelier</p>
            </div>
          </div>
          
          {/* Close button inside sidebar on mobile */}
          {isMobile && (
            <button 
              onClick={onClose}
              style={{
                padding: '8px',
                color: '#94A3B8',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  border: 'none',
                  borderRadius: isActive ? '12px' : '8px',
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#1D4ED8' : '#475569',
                  borderLeft: isActive ? '4px solid #2563EB' : 'none'
                }}
              >
                <span style={{ color: isActive ? '#2563EB' : '#94A3B8', display: 'flex' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '14px', fontWeight: isActive ? '700' : '500' }}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} style={{ color: '#F87171' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

