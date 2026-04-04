import React from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, Layout as Apps, User } from 'lucide-react';

const Layout = ({ children, role }) => {
  // Inline Styles
  const styles = {
    layout: {
      display: 'flex',
      backgroundColor: '#F9F9FF',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    },
    main: {
      flex: 1,
      marginLeft: '240px'
    },
    header: {
      position: 'fixed',
      top: 0,
      right: 0,
      left: '240px',
      height: '64px',
      zIndex: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      boxSizing: 'border-box'
    },
    searchGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px'
    },
    searchContainer: {
      position: 'relative'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94A3B8'
    },
    searchInput: {
      height: '40px',
      paddingLeft: '40px',
      paddingRight: '16px',
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      fontSize: '14px',
      width: '256px',
      outline: 'none',
      transition: 'all 0.2s'
    },
    navLinks: {
      display: 'flex',
      gap: '24px'
    },
    navLink: {
      color: '#475569',
      fontWeight: '500',
      fontSize: '14px',
      textDecoration: 'none'
    },
    navLinkActive: {
      color: '#2563EB',
      borderBottom: '2px solid #2563EB',
      paddingBottom: '4px'
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    iconBtn: {
      padding: '8px',
      color: '#64748B',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '9999px',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex'
    },
    notificationDot: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '8px',
      height: '8px',
      backgroundColor: '#EF4444',
      borderRadius: '9999px',
      border: '2px solid #FFFFFF'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '9999px',
      overflow: 'hidden',
      border: '1px solid #E2E8F0',
      marginLeft: '8px',
      cursor: 'pointer',
      backgroundColor: '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    pageContent: {
      marginTop: '64px',
      padding: '32px',
      minHeight: 'calc(100vh - 64px)',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar role={role} />

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Navigation Bar */}
        <header style={styles.header}>
          <div style={styles.searchGroup}>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>
                <Search size={18} />
              </span>
              <input 
                style={styles.searchInput}
                placeholder="Search students, faculty..." 
                type="text"
              />
            </div>
            <nav style={styles.navLinks} className="hidden md:flex">
                <a style={{ ...styles.navLink, ...styles.navLinkActive }} href="#">Academic Year</a>
                <a style={styles.navLink} href="#">Term Schedule</a>
            </nav>
          </div>

          <div style={styles.actions}>
            <button style={styles.iconBtn}>
              <Bell size={20} />
              <span style={styles.notificationDot}></span>
            </button>
            <button style={styles.iconBtn}>
              <Apps size={20} />
            </button>
            <div style={styles.avatar}>
              <User size={18} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
