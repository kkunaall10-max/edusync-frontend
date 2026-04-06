import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Menu, X, Bell, Search, LayoutDashboard, Clock, 
  Users, Calendar, CheckCircle2, ChevronRight, 
  BookOpen, Star, AlertCircle, Phone, LogOut, TrendingUp, ClipboardCheck, GraduationCap, Megaphone, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import LoadingScreen from '../components/LoadingScreen';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const TeacherDashboard = () => {
    const [showLoader, setShowLoader] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgAttendance: 0,
        pendingHomework: 0,
        classPerformance: 0,
        pendingLeaves: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAllData = useCallback(async (email, cancelToken) => {
        try {
            const profileRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email },
                cancelToken
            });
            const profile = profileRes.data;
            setTeacherProfile(profile);

            const [studentsRes, homeworkRes, attendanceRes, leavesRes] = await Promise.all([
                axios.get(`${API}/api/students`, { params: { class: profile.class_assigned, section: profile.section_assigned }, cancelToken }),
                axios.get(`${API}/api/homework`, { params: { class: profile.class_assigned, section: profile.section_assigned }, cancelToken }),
                axios.get(`${API}/api/attendance`, { params: { class: profile.class_assigned, section: profile.section_assigned }, cancelToken }),
                axios.get(`${API}/api/leave/teacher`, { params: { class: profile.class_assigned, section: profile.section_assigned, status: 'pending' }, cancelToken }),
            ]);

            setStats({
                totalStudents: studentsRes.data.length || 0,
                avgAttendance: 92,
                pendingHomework: homeworkRes.data.length || 0,
                classPerformance: 88,
                pendingLeaves: (leavesRes.data || []).length
            });
            setPendingRequests(leavesRes.data || []);

            setAttendanceData([
                { day: 'Mon', present: 42, absent: 3 },
                { day: 'Tue', present: 40, absent: 5 },
                { day: 'Wed', present: 44, absent: 1 },
                { day: 'Thu', present: 43, absent: 2 },
                { day: 'Fri', present: 39, absent: 6 },
            ]);

            setRecentActivity([
                { id: 1, type: 'attendance', title: 'Attendance Marked', time: '10:30 AM', status: 'completed' },
                { id: 2, type: 'homework', title: 'Math Homework Assigned', time: 'Yesterday', status: 'pending' },
            ]);

        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Dashboard Fetch Error:", error);
            }
        }
    }, [navigate]);
 
    const handleLeaveResponse = async (leaveId, status) => {
        try {
            await axios.put(`${API}/api/leave/${leaveId}/respond`, {
                status,
                teacher_remark: 'Processed from dashboard'
            });
            // Update local state to remove the processed leave
            setPendingRequests(prev => prev.filter(l => l.id !== leaveId));
            setStats(prev => ({ ...prev, pendingLeaves: Math.max(0, prev.pendingLeaves - 1) }));
        } catch (error) {
            console.error("Dashboard leave response error:", error);
        }
    };

    useEffect(() => {
        const source = axios.CancelToken.source();
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const isFirstLoad = sessionStorage.getItem('teacherFirstLoad');
            if (isFirstLoad === 'true') {
                setShowLoader(true);
                sessionStorage.removeItem('teacherFirstLoad');
                const timer = setTimeout(() => { setShowLoader(false); }, 10000);
                fetchAllData(user.email, source.token);
                return () => clearTimeout(timer);
            } else {
                fetchAllData(user.email, source.token);
            }
        };
        init();
        return () => source.cancel();
    }, [fetchAllData, navigate]);

    const styles = {
        pageWrapper: {
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff',
            paddingBottom: '40px'
        },
        sidebar: {
            position: 'fixed',
            left: 0, top: 0,
            width: '260px',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        navbar: {
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : '260px',
            right: 0,
            height: '80px',
            background: 'rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px'
        },
        glassCard: {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
          padding: '24px'
        },
        statCard: {
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '100px',
            paddingLeft: isMobile ? '16px' : '32px',
            paddingRight: isMobile ? '16px' : '32px'
        }
    };

    if (showLoader) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
            {/* oversized background pattern - FIX 6 */}
            <div style={{
              position: 'fixed',
              top: '-5%', left: '-5%',
              width: '110vw', height: '110vh',
              backgroundImage: 'url(/nature-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: -2,
            }} />
            
            <div style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.35)',
              zIndex: -1,
            }} />

            {isMobile && menuOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setMenuOpen(false)} />
            )}

            <aside style={styles.sidebar}>
                {/* Logo Area - FIX 3 */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'40px', padding:'0 8px' }}>
                  <div style={{
                    width: 32, height: 32,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', 
                    justifyContent: 'center',
                  }}>
                    <span style={{ color:'white', fontSize:16, fontWeight:800 }}>E</span>
                  </div>
                  <span style={{ 
                    color:'white', fontSize:18, fontWeight:800, letterSpacing:1 
                  }}>EduSync</span>
                </div>
                
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: stats.pendingLeaves },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                        { label: 'Announcements', icon: <Megaphone size={20} />, path: '/dashboard/teacher/announcements' },
                        { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
                        { label: 'Support', icon: <AlertCircle size={20} />, path: '/dashboard/support' },
                    ].map((item) => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left', position:'relative'}} onClick={() => { navigate(item.path); if (isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                            {item.badge > 0 && (
                                <span style={{
                                    position: 'absolute', top: -4, right: -4,
                                    backgroundColor: 'red', borderRadius: 10,
                                    width: 18, height: 18, fontSize: 11, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <div>
                        <h2 style={{fontSize:'20px', fontWeight:'800', margin:0}}>Welcome, {teacherProfile?.full_name?.split(' ')[0]}</h2>
                        <p style={{fontSize:'12px', opacity:0.6, margin:0}}>Class {teacherProfile?.class_assigned} — Section {teacherProfile?.section_assigned}</p>
                    </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    <div style={{position:'relative'}}><Bell size={22} /><span style={{position:'absolute', top:'-2px', right:'-2px', width:'8px', height:'8px', background:'#2563EB', borderRadius:'50%', border:'2px solid #000'}}></span></div>
                    <div style={{width:'40px', height:'40px', borderRadius:'14px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700'}}>{teacherProfile?.full_name?.charAt(0)}</div>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap:'20px', marginBottom:'32px'}}>
                    {[
                        { label: 'Total Students', value: stats.totalStudents, icon: <Users size={24}/>, color: '#2563EB' },
                        { label: 'Attendance', value: `${stats.avgAttendance}%`, icon: <ClipboardCheck size={24}/>, color: '#10B981' },
                        { label: 'Pending Leaves', value: stats.pendingLeaves, icon: <Calendar size={24}/>, color: '#EF4444', path: '/dashboard/teacher/leaves' },
                        { label: 'Homework', value: stats.pendingHomework, icon: <BookOpen size={24}/>, color: '#F59E0B' },
                        { label: 'Performance', value: `${stats.classPerformance}%`, icon: <TrendingUp size={24}/>, color: '#8B5CF6' }
                    ].map((stat, i) => (
                        <div key={i} style={{...styles.statCard, cursor: stat.path ? 'pointer' : 'default'}} onClick={() => stat.path && navigate(stat.path)}>
                            <div style={{width:'48px', height:'48px', borderRadius:'14px', background:`${stat.color}20`, display:'flex', alignItems:'center', justifyContent:'center', color:stat.color, marginBottom:'16px'}}>
                                {stat.icon}
                            </div>
                            <h3 style={{fontSize:'28px', fontWeight:'800', margin:0}}>{stat.value}</h3>
                            <p style={{fontSize:'13px', opacity:0.6, margin:'4px 0 0 0'}}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'24px'}}>
                    <div style={{ ...styles.glassCard, minHeight: '350px' }}>
                        <h4 style={{fontSize:'18px', fontWeight:'800', marginBottom:'24px', margin:0}}>Attendance Overview</h4>
                        <div style={{height:'300px', width:'100%', minWidth: 0}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{background:'rgba(0,0,0,0.8)', border:'none', borderRadius:'12px', fontSize:'12px'}} />
                                    <Bar dataKey="present" fill="#2563EB" radius={[4,4,0,0]} barSize={20} />
                                    <Bar dataKey="absent" fill="rgba(255,255,255,0.1)" radius={[4,4,0,0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={styles.glassCard}>
                        <h4 style={{fontSize:'18px', fontWeight:'800', marginBottom:'24px', margin:0}}>Recent Activity</h4>
                        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                            {recentActivity.map(act => (
                                <div key={act.id} style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                    <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        {act.type === 'attendance' ? <ClipboardCheck size={18} /> : <BookOpen size={18} />}
                                    </div>
                                    <div style={{flex:1}}>
                                        <p style={{fontSize:'14px', fontWeight:'600', margin:0}}>{act.title}</p>
                                        <p style={{fontSize:'12px', opacity:0.5, margin:0}}>{act.time}</p>
                                    </div>
                                    <ChevronRight size={16} opacity={0.3} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
 
                {/* Pending Leave Requests Section - NEW */}
                {pendingRequests.length > 0 && (
                    <div style={{marginTop:'32px'}}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
                            <h4 style={{fontSize:'20px', fontWeight:'800', margin:0}}>Pending Leave Requests</h4>
                            <button 
                                onClick={() => navigate('/dashboard/teacher/leaves')}
                                style={{background:'transparent', border:'none', color:'#2563EB', fontSize:'13px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}
                            >
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'20px'}}>
                            {pendingRequests.slice(0, 3).map(l => (
                                <div key={l.id} style={styles.glassCard}>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px'}}>
                                        <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800'}}>
                                            {l.students?.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{fontSize:'15px', fontWeight:'800', margin:0}}>{l.students?.full_name}</p>
                                            <p style={{fontSize:'11px', opacity:0.5, margin:0}}>{new Date(l.from_date).toLocaleDateString()} — {new Date(l.to_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p style={{fontSize:'13px', opacity:0.7, margin:'0 0 20px 0', lineHeight:'1.4', height:'36px', overflow:'hidden'}}>{l.reason}</p>
                                    <div style={{display:'flex', gap:'8px'}}>
                                        <button 
                                            onClick={() => handleLeaveResponse(l.id, 'approved')}
                                            style={{flex:1, height:'36px', borderRadius:'10px', background:'#10B981', color:'white', border:'none', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'}}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleLeaveResponse(l.id, 'rejected')}
                                            style={{flex:1, height:'36px', borderRadius:'10px', background:'rgba(244,63,94,0.15)', color:'#FB7185', border:'none', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'}}
                                        >
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default React.memo(TeacherDashboard);
