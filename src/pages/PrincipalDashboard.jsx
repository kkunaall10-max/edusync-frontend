import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PrincipalDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        feesCollected: 0,
        attendanceToday: 0
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Parallel data fetching
            const [
                userRes,
                studentsRes,
                teachersRes,
                feesRes,
                attendanceRes,
                overdueRes
            ] = await Promise.all([
                supabase.auth.getUser(),
                axios.get('http://localhost:5000/api/students'),
                axios.get('http://localhost:5000/api/teachers'),
                axios.get('http://localhost:5000/api/fees/stats'),
                axios.get(`http://localhost:5000/api/attendance?date=${today}`),
                axios.get('http://localhost:5000/api/fees?status=overdue')
            ]);

            setUser(userRes.data.user);

            // Calculate attendance percentage
            const totalAttendance = attendanceRes.data.length;
            const presentCount = attendanceRes.data.filter(a => a.status === 'present').length;
            const attendancePct = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

            setMetrics({
                totalStudents: studentsRes.data.length || 0,
                totalTeachers: teachersRes.data.length || 0,
                feesCollected: feesRes.data.total_collected || 0,
                attendanceToday: attendancePct.toFixed(1)
            });

            // Set top 3 real overdue alerts
            setRecentAlerts(overdueRes.data.slice(0, 3));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px'}}>
                    <div style={{width:'40px', height:'40px', border:'4px solid #2563EB', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
                    <p style={{color:'#6B7280', fontWeight:'500'}}>Initializing Dashboard...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Common styles
    const styles = {
        wrapper: {display:'flex', minHeight:'100vh', backgroundColor:'#F9FAFB', fontFamily:'Inter,sans-serif'},
        sidebar: {width:'240px', minHeight:'100vh', backgroundColor:'#FFFFFF', borderRight:'1px solid #E5E7EB', padding:'24px 16px', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0},
        logoArea: {marginBottom:'32px'},
        logoText: {fontSize:'22px', fontWeight:'700', color:'#2563EB', margin:0},
        portalLabel: {fontSize:'11px', color:'#6B7280', textTransform:'uppercase', margin:0, letterSpacing:'0.05em'},
        navLink: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#6B7280', textDecoration:'none', fontSize:'14px', fontWeight:'500', marginBottom:'4px', cursor:'pointer'},
        navLinkActive: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#2563EB', backgroundColor:'#EFF6FF', textDecoration:'none', fontSize:'14px', fontWeight:'600', marginBottom:'4px', cursor:'pointer'},
        main: {marginLeft:'240px', flex:1},
        header: {height:'64px', backgroundColor:'#FFFFFF', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'sticky', top:0, zIndex:10},
        headerTitle: {fontSize:'18px', fontWeight:'600', color:'#111827', margin:0},
        content: {padding:'24px'},
        statsRow: {display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px', marginBottom:'24px'},
        card: {backgroundColor:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)'},
        iconBoxBlue: {width:'40px', height:'40px', backgroundColor:'#EFF6FF', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', color:'#2563EB'},
        statNumber: {fontSize:'28px', fontWeight:'700', color:'#111827', margin:0},
        statLabel: {fontSize:'13px', color:'#6B7280', marginTop:'4px', margin:0},
        splitRow: {display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px'},
        btnPrimary: {width:'100%', padding:'12px 16px', backgroundColor:'#2563EB', color:'#FFFFFF', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'12px', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center'},
        btnSecondary: {width:'100%', padding:'12px 16px', backgroundColor:'#FFFFFF', color:'#374151', border:'1px solid #E5E7EB', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'12px', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center'}
    };

    return (
        <div style={styles.wrapper}>
            {/* SideNavBar */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h1 style={styles.logoText}>EduSync</h1>
                    <p style={styles.portalLabel}>Management Portal</p>
                </div>
                <nav style={{flex:1}}>
                    <a onClick={() => navigate('/dashboard/principal')} style={styles.navLinkActive}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Overview</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/students')} style={styles.navLink}>
                        <span className="material-symbols-outlined">group</span>
                        <span>Students</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/teachers')} style={styles.navLink}>
                        <span className="material-symbols-outlined">person</span>
                        <span>Teachers</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/attendance')} style={styles.navLink}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>Attendance</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/fees')} style={styles.navLink}>
                        <span className="material-symbols-outlined">payments</span>
                        <span>Fees</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/homework')} style={styles.navLink}>
                        <span className="material-symbols-outlined">assignment</span>
                        <span>Homework</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/marks')} style={styles.navLink}>
                        <span className="material-symbols-outlined">grade</span>
                        <span>Marks</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/reports')} style={styles.navLink}>
                        <span className="material-symbols-outlined">assessment</span>
                        <span>Reports</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div style={styles.main}>
                {/* TopNavBar */}
                <header style={styles.header}>
                    <h2 style={styles.headerTitle}>Good morning, Principal</h2>
                    <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                        <span className="material-symbols-outlined" style={{color:'#9CA3AF', cursor:'pointer'}}>notifications</span>
                        <div 
                            style={{borderLeft:'1px solid #E5E7EB', paddingLeft:'16px', display:'flex', alignItems:'center', gap:'12px', position: 'relative', cursor: 'pointer'}}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div style={{textAlign:'right'}}>
                                <p style={{fontSize:'13px', fontWeight:'600', color:'#111827', margin:0}}>{user?.email?.split('@')[0] || 'Administrator'}</p>
                                <p style={{fontSize:'10px', color:'#6B7280', margin:0, textTransform:'uppercase'}}>Institutional Admin</p>
                            </div>
                            <div style={{width:'36px', height:'36px', backgroundColor:'#F3F4F6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF'}}>
                                <span className="material-symbols-outlined">account_circle</span>
                            </div>

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '48px',
                                    right: 0,
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    padding: '8px',
                                    zIndex: 100,
                                    minWidth: '140px'
                                }}>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            textAlign: 'left',
                                            background: 'none',
                                            border: 'none',
                                            color: '#DC2626',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main style={styles.content}>
                    {/* Stats Row */}
                    <div style={styles.statsRow}>
                        <div style={styles.card}>
                            <div style={styles.iconBoxBlue}>
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <h3 style={styles.statNumber}>{metrics.totalStudents.toLocaleString()}</h3>
                            <p style={styles.statLabel}>Total Students</p>
                        </div>
                        <div style={styles.card}>
                            <div style={{...styles.iconBoxBlue, backgroundColor:'#ECFDF5', color:'#059669'}}>
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <h3 style={styles.statNumber}>{metrics.totalTeachers.toLocaleString()}</h3>
                            <p style={styles.statLabel}>Total Teachers</p>
                        </div>
                        <div style={styles.card}>
                            <div style={{...styles.iconBoxBlue, backgroundColor:'#FFFBEB', color:'#D97706'}}>
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <h3 style={styles.statNumber}>₹{metrics.feesCollected.toLocaleString()}</h3>
                            <p style={styles.statLabel}>Fees Collected</p>
                        </div>
                        <div style={styles.card}>
                            <div style={{...styles.iconBoxBlue, backgroundColor:'#F5F3FF', color:'#7C3AED'}}>
                                <span className="material-symbols-outlined">fact_check</span>
                            </div>
                            <h3 style={styles.statNumber}>{metrics.attendanceToday}%</h3>
                            <p style={styles.statLabel}>Today's Attendance</p>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div style={styles.splitRow}>
                        <div style={styles.card}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                                <h4 style={{fontSize:'16px', fontWeight:'700', color:'#111827', margin:0}}>Recent Alerts</h4>
                                <a onClick={() => navigate('/dashboard/fees')} style={{fontSize:'12px', fontWeight:'600', color:'#2563EB', textDecoration:'none', cursor:'pointer'}}>View All</a>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                                {recentAlerts.length > 0 ? recentAlerts.map((alert, i) => (
                                    <div key={i} style={{padding:'16px', backgroundColor:'#F9FAFB', borderRadius:'12px', display:'flex', alignItems:'center', gap:'16px', border:'1px solid #F3F4F6'}}>
                                        <div style={{width:'40px', height:'40px', backgroundColor:'#FEE2E2', color:'#EF4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <span className="material-symbols-outlined">payment</span>
                                        </div>
                                        <div style={{flex:1}}>
                                            <p style={{fontSize:'14px', fontWeight:'600', color:'#111827', margin:0}}>Fee Overdue: {alert.student?.full_name}</p>
                                            <p style={{fontSize:'12px', color:'#6B7280', margin:0}}>Outstanding: ₹{alert.amount.toLocaleString()} ({alert.fee_type})</p>
                                        </div>
                                        <span onClick={() => navigate('/dashboard/fees')} style={{fontSize:'12px', fontWeight:'700', color:'#2563EB', cursor:'pointer'}} className="material-symbols-outlined">chevron_right</span>
                                    </div>
                                )) : (
                                    <div style={{padding:'32px', textAlign:'center', color:'#9CA3AF'}}>
                                        <span className="material-symbols-outlined" style={{fontSize:'48px'}}>notifications_off</span>
                                        <p style={{fontSize:'14px', fontWeight:'500', marginTop:'8px'}}>No critical alerts</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                            <div style={styles.card}>
                                <h4 style={{fontSize:'16px', fontWeight:'700', color:'#111827', marginBottom:'20px', marginTop:0}}>Quick Actions</h4>
                                <button onClick={() => navigate('/dashboard/students')} style={styles.btnPrimary}>
                                    <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span className="material-symbols-outlined">person_add</span>
                                        Add New Student
                                    </span>
                                    <span className="material-symbols-outlined">east</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/reports')} style={styles.btnSecondary}>
                                    <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span className="material-symbols-outlined">analytics</span>
                                        Generate Report
                                    </span>
                                    <span className="material-symbols-outlined">east</span>
                                </button>
                            </div>

                            <div style={{...styles.card, backgroundColor:'#F9FAFB', borderStyle:'dashed'}}>
                                <h4 style={{fontSize:'12px', fontWeight:'600', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'16px', marginTop:0}}>Quick Overview</h4>
                                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                                        <div style={{width:'40px', height:'40px', backgroundColor:'#FFFFFF', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
                                            <span style={{fontSize:'9px', fontWeight:'800', color:'#EF4444'}}>OCT</span>
                                            <span style={{fontSize:'14px', fontWeight:'800', color:'#111827'}}>24</span>
                                        </div>
                                        <div style={{flex:1}}>
                                            <p style={{fontSize:'12px', fontWeight:'700', color:'#111827', margin:0}}>Parent Meeting</p>
                                            <p style={{fontSize:'10px', color:'#6B7280', margin:0}}>14:00 • Auditorium</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Placeholder */}
                <footer style={{padding:'32px', textAlign:'center', borderTop:'1px solid #E5E7EB', marginTop:'48px'}}>
                    <p style={{fontSize:'12px', color:'#9CA3AF', fontWeight:'500', margin:0}}>© 2024 EduSync Institution Portal. Professional School Management.</p>
                </footer>
            </div>
        </div>
    );
};

export default PrincipalDashboard;
