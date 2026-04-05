import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, Layout as Apps, User, Menu } from 'lucide-react';

const Layout = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      minWidth: 0,
      marginLeft: isMobile ? 0 : '240px',
      transition: 'margin-left 0.3s ease'
    },
    header: {
      position: 'fixed',
      top: 0,
      right: 0,
      left: isMobile ? 0 : '240px',
      height: '64px',
      zIndex: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box',
      padding: isMobile ? '0 16px' : '0 24px',
      transition: 'left 0.3s ease'
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
      boxSizing: 'border-box',
      padding: isMobile ? '16px' : '32px'
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
      <main style={styles.main}>
        {/* Top Navigation Bar */}
        <header className="no-print" style={styles.header}>
          <div style={styles.searchGroup}>
            {/* Hamburger Menu Mobile */}
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: '8px',
                  marginLeft: '-8px',
                  color: '#475569',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Menu size={24} />
              </button>
            )}

            {!isMobile && (
              <div style={styles.searchContainer}>
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
            )}
            
            <nav style={styles.navLinks} className="hidden lg:flex ml-4">
            </nav>
          </div>

          <div style={styles.actions}>
            <button style={styles.iconBtn}>
              <Bell size={20} />
              <span style={styles.notificationDot}></span>
            </button>
            {!isMobile && (
              <button style={styles.iconBtn}>
                <Apps size={20} />
              </button>
            )}
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

