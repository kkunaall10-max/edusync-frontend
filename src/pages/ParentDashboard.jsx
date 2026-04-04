import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import parentBg from '../assets/parent-bg.jpg';

const API_BASE_URL = 'https://edusync.up.railway.app/api/parent';

const ParentDashboard = () => {
  const [child, setChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [homework, setHomework] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No logged in user found");

      // 1. Fetch Child Profile
      const childRes = await axios.get(`${API_BASE_URL}/child`, { 
        params: { parent_email: user.email } 
      });
      const childData = childRes.data;
      setChild(childData);

      // 2. Fetch Related Data in Parallel
      const [attendanceRes, feesRes, homeworkRes, marksRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/attendance`, { params: { student_id: childData.id } }),
        axios.get(`${API_BASE_URL}/fees`, { params: { student_id: childData.id } }),
        axios.get(`${API_BASE_URL}/homework`, { params: { class: childData.class, section: childData.section } }),
        axios.get(`${API_BASE_URL}/marks`, { params: { student_id: childData.id } })
      ]);

      setAttendance(attendanceRes.data);
      setFees(feesRes.data);
      setHomework(homeworkRes.data?.slice(0, 5) || []);
      setMarks(marksRes.data?.slice(0, 5) || []);

    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError(err.response?.data?.error || "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { label: 'A+', color: '#DCFCE7', bg: 'rgba(236, 246, 239, 0.4)', shadow: 'rgba(236,246,239,0.2)' };
    if (percentage >= 80) return { label: 'A', color: '#DBEAFE', bg: 'rgba(198, 198, 199, 0.4)', shadow: 'rgba(198,198,199,0.2)' };
    if (percentage >= 70) return { label: 'B+', color: '#F3F4F6', bg: 'rgba(212, 212, 212, 0.4)', shadow: 'rgba(212,212,212,0.1)' };
    if (percentage >= 60) return { label: 'B', color: '#FEF3C7', bg: 'rgba(251, 191, 36, 0.1)', shadow: 'rgba(251,191,36,0.1)' };
    if (percentage >= 40) return { label: 'C', color: '#FFEDD5', bg: 'rgba(249, 115, 22, 0.1)', shadow: 'rgba(249,115,22,0.1)' };
    return { label: 'F', color: '#FEE2E2', bg: 'rgba(220, 38, 38, 0.1)', shadow: 'rgba(220,38,38,0.1)' };
  };

  const styles = {
    fixedBg: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${parentBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: -1
    },
    wrapper: {
      minHeight: '100vh',
      color: '#FFFFFF',
      fontFamily: '"Manrope", sans-serif'
    },
    sidebar: {
      width: '240px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.15)',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    },
    sidebarLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
      fontWeight: isActive ? '700' : '500',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      borderRight: isActive ? '2px solid #FFFFFF' : 'none',
      textDecoration: 'none',
      transition: 'all 0.3s',
      marginBottom: '8px',
      cursor: 'pointer'
    }),
    header: {
      height: '64px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '240px',
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 40
    },
    main: {
      marginLeft: '240px',
      padding: '96px 32px 48px 32px',
      minHeight: '100vh'
    },
    glassCard: {
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      padding: '24px'
    },
    heroCard: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      position: 'relative',
      overflow: 'hidden'
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: '800',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    },
    badge: {
      padding: '8px 16px',
      borderRadius: '9999px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '11px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.fixedBg} />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p style={{ fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>Syncing child profile...</p>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.fixedBg} />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
          <div style={{ ...styles.glassCard, maxWidth: '480px', width: '100%', padding: '48px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#ee7d77', marginBottom: '24px' }}>error</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>No student linked</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>{error || "We couldn't find any child profile associated with your account."}</p>
            <button 
              onClick={fetchDashboardData}
              style={{ padding: '12px 32px', backgroundColor: '#FFFFFF', color: '#000000', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPaid = fees?.records?.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalPending = fees?.records?.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalOverdue = fees?.records?.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0) || 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.fixedBg} />

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>EduSync</h1>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: '800', marginTop: '4px' }}>Parent Portal</p>
        </div>
        <nav style={{ flex: 1 }}>
          <a style={styles.sidebarLink(true)} onClick={() => navigate('/dashboard/parent')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Child Dashboard</span>
          </a>
          <a style={styles.sidebarLink(false)} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', border:'1px solid rgba(255,255,255,0.3)' }}>
            {child.full_name?.substring(0, 1) || 'G'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>Parent Account</p>
            <p style={{ fontSize: '10px', opacity: 0.6, margin: 0 }}>Active Profile</p>
          </div>
        </div>
      </aside>

      {/* Top Navbar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>My Child's Overview</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', position: 'relative' }}>
            <span className="material-symbols-outlined">notifications</span>
            <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: '#ee7d77', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          
          {/* Hero Card */}
          <section style={{ ...styles.glassCard, ...styles.heroCard, marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={styles.avatar}>{getInitials(child.full_name)}</div>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>{child.full_name}</h3>
                <div style={{ display: 'flex', gap: '16px', opacity: 0.8, fontSize: '14px', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span> Roll: {child.roll_number}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>school</span> Class {child.class}-{child.section}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={styles.badge}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: parseFloat(attendance?.percentage) >= 75 ? '#DCFCE7' : '#ee7d77' }}></span>
                Attendance {attendance?.percentage}%
              </div>
              <div style={styles.badge}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: fees?.summary?.overdueCount > 0 ? '#ee7d77' : '#DCFCE7' }}></span>
                Fee Status: {fees?.summary?.overdueCount > 0 ? 'Due' : 'Clear'}
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            
            {/* Card 1: Attendance */}
            <div style={{ ...styles.glassCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Attendance</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Academic Statistics</p>
                </div>
                <span className="material-symbols-outlined" style={{ opacity: 0.3 }}>calendar_month</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '24px 0' }}>
                <span style={{ fontSize: '72px', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1 }}>{attendance?.total}</span>
                <span style={{ fontSize: '20px', fontWeight: '600', opacity: 0.6 }}>Total Days</span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#DCFCE7' }}></span> Present: {attendance?.present}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ee7d77' }}></span> Absent: {attendance?.absent}
                  </div>
                </div>
                <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${attendance?.percentage}%`, backgroundColor: parseFloat(attendance?.percentage) >= 75 ? '#DCFCE7' : '#ee7d77', transition: 'all 1s ease-out' }}></div>
                </div>
                <p style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.8, marginTop: '12px' }}>
                  {parseFloat(attendance?.percentage) >= 75 ? "Excellent attendance sustained!" : "Attendance tracking below requirement."}
                </p>
              </div>
            </div>

            {/* Card 2: Fee Status */}
            <div style={{ ...styles.glassCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fee Status</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Financial Overview</p>
                </div>
                <span className="material-symbols-outlined" style={{ opacity: 0.3 }}>payments</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '24px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#DCFCE7' }}>₹{totalPaid.toLocaleString()}</p>
                  <p style={{ fontSize: '9px', fontWeight: '800', opacity: 0.4, textTransform: 'uppercase' }}>Paid</p>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#DBEAFE' }}>₹{totalPending.toLocaleString()}</p>
                  <p style={{ fontSize: '9px', fontWeight: '800', opacity: 0.4, textTransform: 'uppercase' }}>Pending</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ee7d77' }}>₹{totalOverdue.toLocaleString()}</p>
                  <p style={{ fontSize: '9px', fontWeight: '800', opacity: 0.4, textTransform: 'uppercase' }}>Overdue</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {fees?.records?.slice(0, 2).map((fee, idx) => (
                  <div key={fee.id || idx} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{fee.month} {fee.fee_type}</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '9999px', backgroundColor: fee.status === 'paid' ? 'rgba(236, 246, 239, 0.2)' : 'rgba(238, 125, 119, 0.2)', color: fee.status === 'paid' ? '#DCFCE7' : '#ee7d77', border: `1px solid ${fee.status === 'paid' ? '#DCFCE7' : '#ee7d77'}` }}>{fee.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Recent Homework */}
            <div style={{ ...styles.glassCard, minHeight: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Homework</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Active Assignments</p>
                </div>
                <span className="material-symbols-outlined" style={{ opacity: 0.3 }}>assignment</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {homework.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.4, fontSize: '13px' }}>No homework assigned yet.</div>
                ) : (
                  homework.map((hw, idx) => (
                    <div key={hw.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>{hw.subject}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{hw.title}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '9px', fontWeight: '800', opacity: 0.4, textTransform: 'uppercase', margin: 0 }}>Due Date</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>{new Date(hw.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 4: Latest Results */}
            <div style={{ ...styles.glassCard, minHeight: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latest Results</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Performance Overview</p>
                </div>
                <span className="material-symbols-outlined" style={{ opacity: 0.3 }}>grade</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {marks.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.4, fontSize: '13px' }}>Await official evaluations...</div>
                ) : (
                  marks.map((res, idx) => {
                    const grade = getGrade((res.marks_obtained / res.total_marks) * 100);
                    return (
                      <div key={res.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{res.subject}</span>
                          <span style={{ fontSize: '11px', opacity: 0.5 }}>{res.exam_type} • {res.marks_obtained}/{res.total_marks}</span>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', border: `1px solid ${grade.color}`, backgroundColor: grade.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${grade.shadow}` }}>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: grade.color }}>{grade.label}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;

