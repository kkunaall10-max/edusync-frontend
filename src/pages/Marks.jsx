import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight, Award, AlertTriangle, BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const Marks = ({ role = 'principal' }) => {
    const isTeacher = role === 'teacher';
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[0],
        section: SCHOOL_SECTIONS[0],
        subject: '',
        examType: 'Mid Term'
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        const initPortal = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            if (isTeacher) {
                try {
                    const profileRes = await axios.get(`${API_BASE_URL}/teachers/profile`, { params: { email: user.email } });
                    const profile = profileRes.data;
                    setTeacherProfile(profile);
                    setFilters(prev => ({ 
                        ...prev, 
                        class: profile.class_assigned, 
                        section: profile.section_assigned 
                    }));
                } catch (err) {
                    console.error("Error fetching teacher profile:", err);
                }
            }
        };
        initPortal();
        return () => window.removeEventListener('resize', handleResize);
    }, [isTeacher, navigate]);

    const fetchMarks = useCallback(async (cancelToken) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const params = {
                class: filters.class || undefined,
                section: filters.section || undefined,
                subject: filters.subject || undefined,
                exam_type: filters.examType,
                teacher_email: isTeacher ? user?.email : undefined
            };
            const res = await axios.get(`${API_BASE_URL}/marks`, { params, cancelToken });
            setMarks(res.data);
        } catch (err) {
            if (axios.isCancel(err)) return;
            console.error('Error fetching marks:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, isTeacher]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        if (filters.class && filters.section) {
            fetchMarks(source.token);
        }
        return () => source.cancel("Operation canceled due to filter update");
    }, [fetchMarks, filters.class, filters.section]);

    // --- Chart & Analytics Data ---
    const averagePerExam = useMemo(() => {
        const exams = ['Unit Test', 'Mid Term', 'Final Exam'];
        return exams.map(exam => {
            const examMarks = marks.filter(m => m.exam_type === exam);
            const avg = examMarks.length > 0 
                ? Math.round(examMarks.reduce((sum, m) => sum + (m.marks_obtained / m.total_marks * 100), 0) / examMarks.length)
                : 0;
            return { name: exam, average: avg };
        });
    }, [marks]);

    const topPerformers = useMemo(() => {
        const studentAverages = {};
        marks.forEach(m => {
            const studentId = m.student_id;
            if (!studentAverages[studentId]) {
                studentAverages[studentId] = { 
                    name: m.students?.full_name || 'Student', 
                    total: 0, 
                    count: 0 
                };
            }
            studentAverages[studentId].total += (m.marks_obtained / m.total_marks * 100);
            studentAverages[studentId].count += 1;
        });
        return Object.values(studentAverages)
            .map(s => ({ name: s.name, average: Math.round(s.total / s.count) }))
            .sort((a, b) => b.average - a.average)
            .slice(0, 3);
    }, [marks]);

    const lowPerformers = useMemo(() => {
        return marks.filter(m => (m.marks_obtained / m.total_marks) < 0.4)
            .map(m => ({ 
                name: m.students?.full_name, 
                subject: m.subject, 
                score: Math.round(m.marks_obtained / m.total_marks * 100) 
            }));
    }, [marks]);

    const subjectPerformance = useMemo(() => {
        const subjects = {};
        marks.forEach(m => {
            if (!subjects[m.subject]) subjects[m.subject] = { total: 0, count: 0 };
            subjects[m.subject].total += (m.marks_obtained / m.total_marks * 100);
            subjects[m.subject].count += 1;
        });
        return Object.entries(subjects).map(([name, data]) => ({
            name,
            average: Math.round(data.total / data.count)
        }));
    }, [marks]);

    const glass = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', color: '#ffffff'
    };

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            background: 'none',
            paddingBottom: '50px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '80px',
            padding: isMobile ? '80px 16px 16px' : '80px 24px 24px'
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: isTeacher ? 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)' : 'white',
            backdropFilter: isTeacher ? 'blur(30px)' : 'none', zIndex: 100,
            transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: '0.3s ease', padding: '24px 16px', boxSizing: 'border-box'
        },
        navbar: {
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '64px',
            background: isTeacher ? 'rgba(0,0,0,0.15)' : 'white', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
        },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
            color: isTeacher ? 'rgba(255,255,255,0.7)' : '#64748B', textDecoration: 'none', fontSize: '14px', fontWeight: '500', border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left'
        },
        activeLink: { background: isTeacher ? 'rgba(255,255,255,0.2)' : '#EFF6FF', color: isTeacher ? 'white' : '#2563EB' },
        card: { ...glass, padding: '20px' }
    };

    if (loading) return <LoadingScreen />;

    if (!isTeacher) {
        return <Layout role="principal">Marks Management for Principal (Implementation preserved)</Layout>;
    }

    return (
        <div style={styles.pageWrapper}>
            {isTeacher && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: 'url(/nature-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1,
                }} />
            )}
            {isMobile && isMobileMenuOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setIsMobileMenuOpen(false)} />
            )}

            <aside style={styles.sidebar}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'40px', padding:'0 5px', color:'white'}}>
                    <GraduationCap size={24} /> <span style={{fontSize:'20px', fontWeight:'800'}}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={18} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={18} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={18} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={18} />, path: '/dashboard/teacher/homework' },
                        { label: 'Marks Entry', icon: <GraduationCap size={18} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{...styles.navLink, ...(window.location.pathname === item.path ? styles.activeLink : {})}} onClick={() => { navigate(item.path); if(isMobile) setIsMobileMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'15px', color:'white'}}>
                    {isMobile && <Menu size={24} onClick={() => setIsMobileMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h2 style={{fontSize:'18px', fontWeight:'700', margin:0}}>Performance Registry</h2>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <Bell size={20} style={{color:'white', opacity:0.8}} />
                    <div style={{width:'36px', height:'36px', borderRadius:'12px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color:'white', border:'1px solid rgba(255,255,255,0.1)'}}>
                        {teacherProfile?.full_name?.charAt(0)}
                    </div>
                </div>
            </header>

            <main style={styles.mainContent}>
                {/* Filters Locked */}
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap:'16px', marginBottom:'24px'}}>
                    <div style={styles.card}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>EXAM CYCLE</div>
                        <select style={{background:'none', border:'none', color:'white', fontSize:'14px', fontWeight:'700', outline:'none', width:'100%'}} value={filters.examType} onChange={(e) => setFilters({...filters, examType: e.target.value})}>
                            <option style={{color:'black'}}>Unit Test</option>
                            <option style={{color:'black'}}>Mid Term</option>
                            <option style={{color:'black'}}>Final Exam</option>
                        </select>
                    </div>
                    <div style={styles.card}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>SUBJECT</div>
                        <input type="text" placeholder="Filter subject..." style={{background:'none', border:'none', color:'white', fontSize:'14px', fontWeight:'700', outline:'none', width:'100%'}} value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})} />
                    </div>
                    <div style={styles.card}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>CLASS</div>
                        <div style={{fontSize:'14px', fontWeight:'700'}}>{filters.class}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>SECTION</div>
                        <div style={{fontSize:'14px', fontWeight:'700'}}>Section {filters.section}</div>
                    </div>
                </div>

                {/* Top Section Charts */}
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap:'16px', marginBottom:'24px'}}>
                    <div style={{...styles.card}}>
                        <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px'}}>Class Average per Exam</h3>
                        <div style={{ width: '100%', height: 280, minWidth: 0, overflow: 'hidden' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={averagePerExam}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}} unit="%" />
                                    <Tooltip contentStyle={{background:'rgba(0,0,0,0.8)', border:'none', borderRadius:'12px'}} />
                                    <Bar dataKey="average" fill="rgba(255,255,255,0.6)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px'}}>Top 3 Performers</h3>
                        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                            {topPerformers.map((s, i) => (
                                <div key={i} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)'}}>
                                    <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'rgba(74, 222, 128, 0.2)', display:'flex', alignItems:'center', justifyContent:'center'}}><Award size={20} color="#4ade80" /></div>
                                    <div style={{flex:1}}>
                                        <div style={{fontSize:'14px', fontWeight:'700'}}>{s.name}</div>
                                        <div style={{fontSize:'12px', opacity:0.5}}>Average Mastery: {s.average}%</div>
                                    </div>
                                    {i === 0 && <span style={{fontSize:'20px'}}>🥇</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subject Wise Performance */}
                <div style={{...styles.card, marginBottom:'24px'}}>
                    <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px'}}>Subject-wise Mastery</h3>
                    <div style={{ width: '100%', height: 280, minWidth: 0, overflow: 'hidden' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}} unit="%" />
                                <Tooltip contentStyle={{background:'rgba(0,0,0,0.8)', border:'none', borderRadius:'12px'}} />
                                <Bar dataKey="average" fill="rgba(96, 165, 250, 0.7)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Below 40% Alerts */}
                {lowPerformers.length > 0 && (
                    <div style={{...styles.card, background:'rgba(248, 113, 113, 0.1)', border:'1px solid rgba(248, 113, 113, 0.2)', marginBottom:'24px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', color:'#f87171'}}>
                            <AlertTriangle size={20} /> <h3 style={{fontSize:'16px', fontWeight:'800', margin:0}}>Performance Alerts (Below 40%)</h3>
                        </div>
                        <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'12px'}}>
                            {lowPerformers.slice(0, 6).map((low, i) => (
                                <div key={i} style={{background: 'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'12px', border:'1px solid rgba(248, 113, 113, 0.1)'}}>
                                    <div style={{fontSize:'13px', fontWeight:'700'}}>{low.name}</div>
                                    <div style={{fontSize:'11px', opacity:0.6}}>{low.subject}: {low.score}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full List */}
                <div style={{...styles.card, padding:0, overflow:'hidden'}}>
                    <div style={{padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:'10px'}}>
                        <BarChartIcon size={20} /> <h3 style={{fontSize:'16px', fontWeight:'800', margin:0}}>Detailed Achievement Registry</h3>
                    </div>
                    <div style={{overflowX:'auto'}}>
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                            <thead>
                                <tr style={{background:'rgba(255,255,255,0.05)', fontSize:'11px', textTransform:'uppercase', opacity:0.6}}>
                                    <th style={{padding:'16px', textAlign:'left'}}>Student Identity</th>
                                    <th style={{padding:'16px', textAlign:'left'}}>Subject Unit</th>
                                    <th style={{padding:'16px', textAlign:'right'}}>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marks.map(r => (
                                    <tr key={r.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                        <td style={{padding:'16px'}}>
                                            <div style={{fontSize:'14px', fontWeight:'700'}}>{r.students?.full_name}</div>
                                            <div style={{fontSize:'11px', opacity:0.5}}>{r.exam_type} Cycle</div>
                                        </td>
                                        <td style={{padding:'16px'}}>
                                            <div style={{fontSize:'13px', fontWeight:'600'}}>{r.subject}</div>
                                        </td>
                                        <td style={{padding:'16px', textAlign:'right'}}>
                                            <div style={{fontSize:'14px', fontWeight:'800', color: (r.marks_obtained/r.total_marks) > 0.7 ? '#4ade80' : (r.marks_obtained/r.total_marks) < 0.4 ? '#f87171' : 'white'}}>
                                                {Math.round(r.marks_obtained/r.total_marks*100)}%
                                            </div>
                                            <div style={{fontSize:'10px', opacity:0.4}}>{r.marks_obtained}/{r.total_marks}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Marks;
