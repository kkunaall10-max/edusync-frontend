import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  ClipboardCheck, TrendingUp, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'https://edusync.up.railway.app';

const Dashboard = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgAttendance: 0,
        pendingHomework: 0,
        classPerformance: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAllData = useCallback(async (email) => {
        try {
            const profileRes = await axios.get(`${API}/api/teachers/profile`, { params: { email } });
            const profile = profileRes.data;
            setTeacherProfile(profile);

            const [studentsRes, homeworkRes] = await Promise.all([
                axios.get(`${API}/api/students`, { params: { class: profile.class_assigned, section: profile.section_assigned } }),
                axios.get(`${API}/api/homework`, { params: { class: profile.class_assigned, section: profile.section_assigned } })
            ]);

            setStats({
                totalStudents: studentsRes.data.length || 0,
                avgAttendance: 92,
                pendingHomework: homeworkRes.data.length || 0,
                classPerformance: 88
            });

            setAttendanceData([
                { day: 'Mon', present: 42, absent: 3 },
                { day: 'Tue', present: 40, absent: 5 },
                { day: 'Wed', present: 44, absent: 1 },
                { day: 'Thu', present: 43, absent: 2 },
                { day: 'Fri', present: 39, absent: 6 },
            ]);

            setRecentActivity([
                { id: 1, type: 'attendance', title: 'Attendance Marked', time: '10:30 AM' },
                { id: 2, type: 'homework', title: 'Math Homework Assigned', time: 'Yesterday' },
            ]);
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            fetchAllData(user.email);
        };
        init();
    }, [fetchAllData, navigate]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: '#ffffff', paddingBottom: '40px'
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 200,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        overlay: {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 190,
            opacity: menuOpen ? 1 : 0, visibility: menuOpen ? 'visible' : 'hidden', transition: '0.3s opacity'
        },
        headerGlass: {
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', borderRadius: 16,
            padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.15)'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px', paddingTop: '40px', paddingLeft: isMobile ? '16px' : '32px', paddingRight: isMobile ? '16px' : '32px',
            transition: 'margin-left 0.3s ease'
        },
        glassCard: {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)', padding: '24px'
        },
        statCard: {
          background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)'
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={{ position: 'fixed', top: '-5%', left: '-5%', width: '110vw', height: '110vh', backgroundImage: 'url(/nature-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: -1 }} />

            {isMobile && <div style={styles.overlay} onClick={() => setMenuOpen(false)} />}

            <aside style={styles.sidebar}>
                <div style={{ display:'flex', alignItems:'center', justifyContent: 'space-between', marginBottom:'40px', padding:'0 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color:'white', fontSize:16, fontWeight:800 }}>E</span>
                    </div>
                    <span style={{ color:'white', fontSize:18, fontWeight:800, letterSpacing:1 }}>EduSync</span>
                  </div>
                  {isMobile && <X size={24} onClick={() => setMenuOpen(false)} style={{ cursor: 'pointer', opacity: 0.7 }} />}
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map((item) => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <main style={styles.mainContent}>
                <div style={styles.headerGlass}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Teacher Dashboard</h1>
                  </div>
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap:'16px', marginBottom:'32px'}}>
                    {[
                        { label: 'Total Students', value: stats.totalStudents, icon: <Users size={24}/>, color: '#2563EB' },
                        { label: 'Attendance', value: `${stats.avgAttendance}%`, icon: <ClipboardCheck size={24}/>, color: '#10B981' },
                        { label: 'Homework', value: stats.pendingHomework, icon: <BookOpen size={24}/>, color: '#F59E0B' },
                        { label: 'Performance', value: `${stats.classPerformance}%`, icon: <TrendingUp size={24}/>, color: '#8B5CF6' }
                    ].map((stat, i) => (
                        <div key={i} style={{ ...styles.statCard, padding: isMobile ? '16px' : '24px' }}>
                            <div style={{width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius:'12px', background:`${stat.color}20`, display:'flex', alignItems:'center', justifyContent:'center', color:stat.color, marginBottom: isMobile ? '12px' : '16px'}}>
                                {React.cloneElement(stat.icon, { size: isMobile ? 20 : 24 })}
                            </div>
                            <h3 style={{fontSize: isMobile ? '20px' : '28px', fontWeight:'800', margin:0}}>{stat.value}</h3>
                            <p style={{fontSize: '12px', opacity:0.6, margin:'4px 0 0 0'}}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'24px'}}>
                    <div style={styles.glassCard}>
                        <h4 style={{fontSize:'18px', fontWeight:'800', marginBottom:'24px', margin:0}}>Attendance Overview</h4>
                        <div style={{ width: '100%', height: isMobile ? 220 : 280, minWidth: 0, minHeight: 0 }}>
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
            </main>
        </div>
    );
};

export default Dashboard;

