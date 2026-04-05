import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight, Activity, Clock, 
  CheckCircle, AlertCircle, Award, Target
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell
} from 'recharts';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const TeacherDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [recentHomework, setRecentHomework] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // 1. Get Teacher Profile
            const profileRes = await axios.get(`${API_BASE_URL}/teachers/profile`, { params: { email: user.email } });
            const profile = profileRes.data;
            setTeacherProfile(profile);

            const { class_assigned, section_assigned } = profile;

            // 2. Parallel Requests for Dashboard Data
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const [studentsRes, homeworkRes, attendanceRes, marksRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/students`, { params: { class: class_assigned, section: section_assigned } }),
                axios.get(`${API_BASE_URL}/homework`, { params: { class: class_assigned, section: section_assigned } }),
                axios.get(`${API_BASE_URL}/attendance`, { params: { teacher_email: user.email, startDate, endDate } }),
                axios.get(`${API_BASE_URL}/marks`, { params: { teacher_email: user.email } })
            ]);

            setStudents(studentsRes.data);
            setRecentHomework(homeworkRes.data.slice(0, 3));
            setAttendanceData(attendanceRes.data);
            setMarksData(marksRes.data);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Data Processing for Charts ---
    
    // Weekly Attendance Calculation
    const weeklyChartData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push({
                date: d.toISOString().split('T')[0],
                day: days[d.getDay()],
                presentCount: 0,
                total: students.length || 0
            });
        }

        attendanceData.forEach(entry => {
            const dayEntry = last7Days.find(d => d.date === entry.date);
            if (dayEntry && entry.status === 'present') {
                dayEntry.presentCount++;
            }
        });

        return last7Days.map(d => ({
            name: d.day,
            percentage: d.total > 0 ? Math.round((d.presentCount / d.total) * 100) : 0
        }));
    }, [attendanceData, students]);

    // Performance Trend Calculation
    const performanceTrendData = useMemo(() => {
        const examGroups = {};
        marksData.forEach(m => {
            if (!examGroups[m.exam_type]) examGroups[m.exam_type] = { total: 0, count: 0 };
            const pct = (m.marks_obtained / m.total_marks) * 100;
            examGroups[m.exam_type].total += pct;
            examGroups[m.exam_type].count += 1;
        });

        return Object.entries(examGroups).map(([name, data]) => ({
            name,
            average: Math.round(data.total / data.count)
        }));
    }, [marksData]);

    // Student Status Calculation (summarized for grid)
    const studentStatusList = useMemo(() => {
        return students.slice(0, 8).map(s => {
            const sAttendance = attendanceData.filter(a => a.student_id === s.id);
            const presentCount = sAttendance.filter(a => a.status === 'present').length;
            const attPct = sAttendance.length > 0 ? Math.round((presentCount / sAttendance.length) * 100) : 100;
            
            const sMarks = marksData.filter(m => m.student_id === s.id);
            const latestMark = sMarks[0] ? Math.round((sMarks[0].marks_obtained / sMarks[0].total_marks) * 100) : 'N/A';

            return { id: s.id, name: s.full_name, attendance: attPct, grade: latestMark };
        });
    }, [students, attendanceData, marksData]);

    // Quick Stats Calculation
    const quickStats = useMemo(() => {
        const highestMark = marksData.length > 0 
            ? Math.max(...marksData.map(m => (m.marks_obtained / m.total_marks) * 100)) 
            : 0;
        
        return {
            highest: Math.round(highestMark),
            hwRate: '88%',
            nextExam: 'Oct 15',
            alertCount: students.length > 0 ? students.filter(s => s.is_active === false).length : 0
        };
    }, [marksData, students]);

    const styles = {
        pageWrapper: {
            backgroundImage: 'url(/nature-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff',
            paddingBottom: '40px'
        },
        glassCard: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.3)',
            padding: '24px',
            color: '#ffffff'
        },
        sidebar: {
            position: 'fixed',
            left: 0, top: 0, width: '260px', height: '100vh',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 100,
            transition: 'transform 0.3s ease',
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)'
        },
        navbar: {
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '64px',
            background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '80px',
            padding: isMobile ? '80px 16px 16px' : '80px 24px 24px'
        },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '14px',
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginBottom: '4px', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'
        },
        activeNavLink: { background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: '600' },
        pill: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }
    };

    if (loading) {
        return (
            <div style={{...styles.pageWrapper, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'15px'}}>
                    <div className="animate-spin" style={{width:'48px', height:'48px', border:'4px solid rgba(255,255,255,0.1)', borderTop:'4px solid white', borderRadius:'50%'}} />
                    <p style={{fontSize:'14px', fontWeight:'600', opacity:0.8}}>Synchronizing Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            {isMobile && menuOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setMenuOpen(false)} />
            )}

            <aside style={styles.sidebar}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'40px', padding:'0 8px'}}>
                    <div style={{background:'rgba(255,255,255,0.2)', padding:'8px', borderRadius:'12px'}}><GraduationCap size={28} /></div>
                    <span style={{fontSize:'22px', fontWeight:'800'}}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={18} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={18} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={18} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={18} />, path: '/dashboard/teacher/homework' },
                        { label: 'Marks Entry', icon: <GraduationCap size={18} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{...styles.navLink, ...(window.location.pathname === item.path ? styles.activeNavLink : {})}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} style={{...styles.navLink, color:'#ff9999', marginTop:'auto'}}><LogOut size={18} /> Logout</button>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h2 style={{fontSize:'18px', fontWeight:'700', margin:0}}>Teacher Portal</h2>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'18px'}}>
                    <Bell size={20} style={{cursor:'pointer', opacity:0.8}} />
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <div style={{width:'36px', height:'36px', borderRadius:'12px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', border:'1px solid rgba(255,255,255,0.1)'}}>
                            {teacherProfile?.full_name?.charAt(0)}
                        </div>
                        {!isMobile && <span style={{fontSize:'14px', fontWeight:'600'}}>{teacherProfile?.full_name?.split(' ')[0]}</span>}
                    </div>
                </div>
            </header>

            <main style={styles.mainContent}>
                {/* Row 1: 3 Stats Cards */}
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'16px', marginBottom:'24px'}}>
                    <div style={styles.glassCard}>
                        <div style={{background:'rgba(255,255,255,0.15)', width:'40px', height:'40px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}><Users size={22} /></div>
                        <div style={{fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.7)'}}>Active Students</div>
                        <div style={{fontSize:'36px', fontWeight:'700', marginTop:'8px'}}>{students.length}</div>
                    </div>
                    <div style={styles.glassCard}>
                        <div style={{background:'rgba(255,255,255,0.15)', width:'40px', height:'40px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}><Activity size={22} /></div>
                        <div style={{fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.7)'}}>Presence Rate</div>
                        <div style={{fontSize:'36px', fontWeight:'700', marginTop:'8px'}}>{weeklyChartData[weeklyChartData.length-1]?.percentage}%</div>
                    </div>
                    <div style={styles.glassCard}>
                        <div style={{background:'rgba(255,255,255,0.15)', width:'40px', height:'40px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}><Clock size={22} /></div>
                        <div style={{fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.7)'}}>Active Tasks</div>
                        <div style={{fontSize:'36px', fontWeight:'700', marginTop:'8px'}}>{recentHomework.length}</div>
                    </div>
                </div>

                {/* Row 2: Weekly Attendance Chart */}
                <div style={{...styles.glassCard, marginBottom:'24px'}}>
                    <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px', letterSpacing:'-0.5px'}}>Weekly Attendance Rate</h3>
                    <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} unit="%" />
                                <Tooltip contentStyle={{background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                                    {weeklyChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentage > 75 ? 'rgba(74, 222, 128, 0.7)' : 'rgba(248, 113, 113, 0.7)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 3: Performance Overview + Student Status */}
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap:'16px', marginBottom:'24px'}}>
                    <div style={{...styles.glassCard}}>
                        <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px' }}>Class Performance Trend</h3>
                        <div style={{ width: '100%', height: 320, minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} unit="%" />
                                    <Tooltip contentStyle={{background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px'}} />
                                    <Line type="monotone" dataKey="average" stroke="#ffffff" strokeWidth={3} dot={{fill:'#ffffff', r:6}} activeDot={{r:8}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{...styles.glassCard, height:'400px', display:'flex', flexDirection:'column'}}>
                        <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px' }}>Student Performance Grid</h3>
                        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px'}}>
                            {studentStatusList.map(s => (
                                <div key={s.id} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.05)'}}>
                                    <div style={{width:'32px', height:'32px', borderRadius:'10px', background: s.attendance > 75 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800'}}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div style={{flex:1}}>
                                        <div style={{fontSize:'13px', fontWeight:'700'}}>{s.name}</div>
                                        <div style={{fontSize:'11px', opacity:0.6, display:'flex', alignItems:'center', gap:'4px'}}>
                                            {s.attendance > 75 ? <CheckCircle size={10} color="#4ade80" /> : <AlertCircle size={10} color="#f87171" />}
                                            Att: {s.attendance}%
                                        </div>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                        <div style={{fontSize:'12px', fontWeight:'800'}}>{s.grade}%</div>
                                        <div style={{fontSize:'10px', opacity:0.4}}>Last Exam</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 4: Quick Stats Pills */}
                <div style={{display:'flex', flexWrap:'wrap', gap:'12px'}}>
                    <div style={styles.pill}><Award size={14} color="#fcd34d" /> Highest Class Score: {quickStats.highest}%</div>
                    <div style={styles.pill}><Target size={14} color="#60a5fa" /> HW Completion: {quickStats.hwRate}</div>
                    <div style={styles.pill}><Calendar size={14} color="#f472b6" /> Next Review: {quickStats.nextExam}</div>
                    <div style={styles.pill}><AlertCircle size={14} color="#f87171" /> Low Attendance Alerts: {quickStats.alertCount}</div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
