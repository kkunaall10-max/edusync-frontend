import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, Layout as Apps, User, Menu } from 'lucide-react';

const Layout = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    },
    header: {
      position: 'fixed',
      top: 0,
      right: 0,
      height: '64px',
      zIndex: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box'
    },
    searchGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
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
      gap: '8px'
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
      marginLeft: '4px',
      cursor: 'pointer',
      backgroundColor: '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    pageContent: {
      marginTop: '64px',
      minHeight: 'calc(100vh - 64px)',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main style={styles.main} className="md:ml-[240px]">
        {/* Top Navigation Bar */}
        <header style={styles.header} className="left-0 md:left-[240px] px-4 md:px-6">
          <div style={styles.searchGroup}>
            {/* Hamburger Menu Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>

            <div style={styles.searchContainer} className="hidden sm:block">
              <span style={styles.searchIcon}>
                <Search size={18} />
              </span>
              <input 
                style={styles.searchInput}
                className="w-48 lg:w-64 focus:w-64 lg:focus:w-80"
                placeholder="Search..." 
                type="text"
              />
            </div>
            
            <nav style={styles.navLinks} className="hidden lg:flex ml-4">
                <a style={{ ...styles.navLink, ...styles.navLinkActive }} href="#">Academic Year</a>
                <a style={styles.navLink} href="#">Term Schedule</a>
            </nav>
          </div>

          <div style={styles.actions}>
            <button style={styles.iconBtn}>
              <Bell size={20} />
              <span style={styles.notificationDot}></span>
            </button>
            <button style={styles.iconBtn} className="hidden sm:flex">
              <Apps size={20} />
            </button>
            <div style={styles.avatar}>
              <User size={18} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={styles.pageContent} className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
