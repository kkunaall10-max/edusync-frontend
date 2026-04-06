import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ClipboardCheck, TrendingUp, ChevronRight, LogOut, Calendar, Megaphone, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const Dashboard = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgAttendance: 0,
        pendingHomework: 0,
        classPerformance: 0,
        pendingLeaves: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
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

            const [studentsRes, homeworkRes, leavesRes, annRes] = await Promise.all([
                axios.get(`${API}/api/students`, { params: { class: profile.class_assigned, section: profile.section_assigned } }),
                axios.get(`${API}/api/homework`, { params: { class: profile.class_assigned, section: profile.section_assigned } }),
                axios.get(`${API}/api/leave/teacher`, { params: { class: profile.class_assigned, section: profile.section_assigned, status: 'pending' } }),
                axios.get(`${API}/api/announcements`, { params: { target_audience: 'teachers', class: profile.class_assigned, section: profile.section_assigned } })
            ]);

            setStats({
                totalStudents: studentsRes.data.length || 0,
                avgAttendance: 92,
                pendingHomework: homeworkRes.data.length || 0,
                classPerformance: 88,
                pendingLeaves: leavesRes.data.length || 0
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
            setAnnouncements(annRes.data?.slice(0, 3) || []);
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
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: stats.pendingLeaves },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map((item) => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left', position: 'relative'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
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

                {/* Sidebar Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button 
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#FF4D4D',
                            fontSize: '14px',
                            fontWeight: '700',
                            backgroundColor: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid rgba(255, 77, 77, 0.2)',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <div style={styles.headerGlass}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Teacher Dashboard</h1>
                  </div>
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap:'16px', marginBottom:'32px'}}>
                    {[
                        { label: 'Total Students', value: stats.totalStudents, icon: <Users size={24}/>, color: '#2563EB' },
                        { label: 'Attendance', value: `${stats.avgAttendance}%`, icon: <ClipboardCheck size={24}/>, color: '#10B981' },
                        { label: 'Pending Leaves', value: stats.pendingLeaves, icon: <Calendar size={24}/>, color: '#EF4444', path: '/dashboard/teacher/leaves' },
                        { label: 'Homework', value: stats.pendingHomework, icon: <BookOpen size={24}/>, color: '#F59E0B' },
                        { label: 'Performance', value: `${stats.classPerformance}%`, icon: <TrendingUp size={24}/>, color: '#8B5CF6' }
                    ].map((stat, i) => (
                        <div key={i} style={{ ...styles.statCard, padding: isMobile ? '16px' : '24px', cursor: stat.path ? 'pointer' : 'default' }} onClick={() => stat.path && navigate(stat.path)}>
                            <div style={{width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius:'12px', background:`${stat.color}20`, display:'flex', alignItems:'center', justifyContent:'center', color:stat.color, marginBottom: isMobile ? '12px' : '16px'}}>
                                {stat.icon && React.cloneElement(stat.icon, { size: isMobile ? 20 : 24 })}
                            </div>
                            <h3 style={{fontSize: isMobile ? '20px' : '28px', fontWeight:'800', margin:0}}>{stat.value}</h3>
                            <p style={{fontSize: '12px', opacity:0.6, margin:'4px 0 0 0'}}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'24px'}}>
                    <div style={styles.glassCard}>
                        <h4 style={{fontSize:'18px', fontWeight:'800', marginBottom:'24px', margin:0}}>Attendance Overview</h4>
                        <div style={{ width: '100%', height: 280, minWidth: 0 }}>
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

                    <div style={styles.glassCard} className={isMobile ? "" : "col-span-2"}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                            <h4 style={{fontSize:'18px', fontWeight:'800', margin:0, display:'flex', alignItems:'center', gap:'8px'}}>
                                <Megaphone size={20} className="text-blue-400" /> School Announcements
                            </h4>
                            <button style={{background:'transparent', border:'none', color:'#60A5FA', fontSize:'12px', fontWeight:'700', cursor:'pointer', textTransform:'uppercase'}}>View All</button>
                        </div>
                        <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'16px'}}>
                            {announcements.length === 0 ? (
                                <div style={{gridColumn: '1 / -1', padding:'32px 0', textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'14px', fontWeight:'600'}}>No recent announcements.</div>
                            ) : (
                                announcements.map(ann => (
                                    <div key={ann.id} style={{background:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'16px', border:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>
                                        {ann.priority === 'urgent' && <div style={{position:'absolute', top:0, left:0, width:'100%', height:'4px', background:'#EF4444'}}></div>}
                                        {ann.priority === 'important' && <div style={{position:'absolute', top:0, left:0, width:'100%', height:'4px', background:'#F59E0B'}}></div>}
                                        
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                                                backgroundColor: ann.priority === 'urgent' ? 'rgba(239,68,68,0.2)' : ann.priority === 'important' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)',
                                                color: ann.priority === 'urgent' ? '#FCA5A5' : ann.priority === 'important' ? '#FCD34D' : '#D1D5DB',
                                                display: 'inline-flex', alignItems: 'center', gap: '4px'
                                            }}>
                                                {ann.priority === 'urgent' && <AlertCircle size={10} />}
                                                {ann.priority}
                                            </span>
                                            <span style={{fontSize:'10px', color:'rgba(255,255,255,0.5)', fontWeight:'600'}}>{new Date(ann.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h5 style={{fontSize:'15px', fontWeight:'700', margin:'0 0 8px 0', lineHeight:'1.3'}} className="line-clamp-1">{ann.title}</h5>
                                        <p style={{fontSize:'12px', color:'rgba(255,255,255,0.6)', margin:0, flex:1}} className="line-clamp-2">{ann.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

