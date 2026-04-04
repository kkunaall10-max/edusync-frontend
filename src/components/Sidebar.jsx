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
  School
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = ({ role }) => {
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
      { name: 'My Students', icon: <Users size={20} />, path: '/dashboard/students' },
      { name: 'Attendance', icon: <CheckSquare size={20} />, path: '/dashboard/attendance' },
      { name: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/homework' },
      { name: 'Marks Entry', icon: <Award size={20} />, path: '/dashboard/marks' },
    ],
    parent: [
      { name: 'Child Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/parent' },
    ]
  };

  const items = navItems[role] || [];

  // Inline Styles
  const styles = {
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100%',
      width: '240px',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      fontFamily: "'Inter', sans-serif"
    },
    header: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoBox: {
      width: '32px',
      height: '32px',
      backgroundColor: '#2563EB',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1D4ED8',
      lineHeight: '1',
      margin: 0
    },
    logoSub: {
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#64748B',
      fontWeight: '600',
      marginTop: '4px',
      margin: 0
    },
    nav: {
      flex: 1,
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflowY: 'auto'
    },
    navItem: (isActive) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: isActive ? '0 12px 12px 0' : '8px',
      borderLeft: isActive ? '4px solid #2563EB' : 'none',
      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
      color: isActive ? '#1D4ED8' : '#475569',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s'
    }),
    footer: {
      padding: '16px 12px',
      borderTop: '1px solid #F1F5F9',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    footerBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      color: '#475569',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '8px'
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* Sidebar Header */}
      <div style={styles.header}>
        <div style={styles.logoBox}>
          <School size={18} />
        </div>
        <div>
          <h1 style={styles.logoText}>EduSync</h1>
          <p style={styles.logoSub}>Academic Atelier</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              style={styles.navItem(isActive)}
            >
              <span style={{ color: isActive ? '#2563EB' : '#94A3B8' }}>
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
      <div style={styles.footer}>
        <button style={styles.footerBtn}>
          <Settings size={20} style={{ color: '#94A3B8' }} />
          <span>Settings</span>
        </button>
        <button style={styles.footerBtn}>
          <HelpCircle size={20} style={{ color: '#94A3B8' }} />
          <span>Support</span>
        </button>
        <button 
          onClick={handleLogout}
          style={{ ...styles.footerBtn, color: '#DC2626' }}
        >
          <LogOut size={20} style={{ color: '#F87171' }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
