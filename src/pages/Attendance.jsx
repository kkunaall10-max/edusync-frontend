import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight, Activity, Target
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const Attendance = ({ role = 'principal' }) => {
    const isTeacher = role === 'teacher';
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [allAttendance, setAllAttendance] = useState([]); // For charts
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[0], 
        section: SCHOOL_SECTIONS[0], 
        date: new Date().toISOString().split('T')[0]
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

    const fetchStudentsAndAttendance = useCallback(async (cancelToken) => {
        if (!filters.class || !filters.section) return;
        setLoading(true);
        try {
            const [studentsRes, dailyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/students`, { 
                    params: { class: filters.class, section: filters.section },
                    cancelToken
                }),
                axios.get(`${API_BASE_URL}/attendance`, { 
                    params: { ...filters },
                    cancelToken
                })
            ]);

            const studentData = studentsRes.data;
            setStudents(studentData);

            // Fetch historical attendance for charts (last 30 days)
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const endDate = new Date().toISOString().split('T')[0];
            const historyRes = await axios.get(`${API_BASE_URL}/attendance`, { 
                params: { class: filters.class, section: filters.section, startDate, endDate },
                cancelToken
            });
            setAllAttendance(historyRes.data);

            const existingAttendance = {};
            dailyRes.data.forEach(record => {
                existingAttendance[record.student_id] = record.status;
            });

            const initialAttendance = {};
            studentData.forEach(student => {
                initialAttendance[student.id] = existingAttendance[student.id] || 'present';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchStudentsAndAttendance(source.token);
        return () => source.cancel("Operation canceled due to component update");
    }, [fetchStudentsAndAttendance]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
                student_id: studentId,
                status,
                date: filters.date,
                class: filters.class,
                section: filters.section,
                marked_by: user?.email || 'Teacher'
            }));

            await axios.post(`${API_BASE_URL}/attendance/mark`, { attendanceData });
            alert('Attendance records updated successfully.');
            // Re-fetch without cancel token for simplicity as it's a mutation callback
            fetchStudentsAndAttendance();
        } catch (error) {
            alert('Error saving: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    // --- Chart Data Calculation ---
    const chartData = useMemo(() => {
        return students.map(s => {
            const sHistory = allAttendance.filter(a => a.student_id === s.id);
            const presentCount = sHistory.filter(a => a.status === 'present').length;
            const pct = sHistory.length > 0 ? Math.round((presentCount / sHistory.length) * 100) : 100;
            return { name: s.full_name.split(' ')[0], percentage: pct };
        });
    }, [students, allAttendance]);

    const stats = useMemo(() => {
        const dailyValues = Object.values(attendance);
        return {
            present: dailyValues.filter(v => v === 'present').length,
            absent: dailyValues.filter(v => v === 'absent').length,
            late: dailyValues.filter(v => v === 'late').length,
            overall: dailyValues.length > 0 ? Math.round((dailyValues.filter(v => v === 'present').length / dailyValues.length) * 100) : 0
        };
    }, [attendance]);

    const glass = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', color: '#ffffff'
    };

    const styles = {
        pageWrapper: {
            backgroundImage: isTeacher ? 'url(/nature-bg.jpg)' : 'none',
            backgroundColor: isTeacher ? 'transparent' : '#F8FAFC',
            backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingBottom: '50px'
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
        statCard: { ...glass, padding: '20px', textAlign: 'center' }
    };

    if (loading) return <LoadingScreen />;

    const navItems = [
        { label: 'Overview', icon: <TrendingUp size={18} />, path: '/dashboard/teacher' },
        { label: 'My Students', icon: <Users size={18} />, path: '/dashboard/teacher/students' },
        { label: 'Attendance', icon: <ClipboardCheck size={18} />, path: '/dashboard/teacher/attendance' },
        { label: 'Homework', icon: <BookOpen size={18} />, path: '/dashboard/teacher/homework' },
        { label: 'Marks Entry', icon: <GraduationCap size={18} />, path: '/dashboard/teacher/marks' },
    ];

    if (!isTeacher) {
        return <Layout role="principal">Attendance Management for Principal (Current implementation preserved)</Layout>;
    }

    return (
        <div style={styles.pageWrapper}>
            {isMobile && isMobileMenuOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setIsMobileMenuOpen(false)} />
            )}

            <aside style={styles.sidebar}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'40px', padding:'0 5px', color:'white'}}>
                    <GraduationCap size={24} /> <span style={{fontSize:'20px', fontWeight:'800'}}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {navItems.map(item => (
                        <button key={item.label} style={{...styles.navLink, ...(window.location.pathname === item.path ? styles.activeLink : {})}} onClick={() => { navigate(item.path); if(isMobile) setIsMobileMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'15px', color:'white'}}>
                    {isMobile && <Menu size={24} onClick={() => setIsMobileMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h2 style={{fontSize:'18px', fontWeight:'700', margin:0}}>Daily Registry</h2>
                </div>
                <button onClick={handleSubmit} disabled={saving} style={{background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'}}>
                    {saving ? 'Syncing...' : 'Submit Registry'}
                </button>
            </header>

            <main style={styles.mainContent}>
                {/* Stats Row */}
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap:'16px', marginBottom:'24px'}}>
                    <div style={styles.statCard}>
                        <div style={{fontSize:'11px', opacity:0.6, fontWeight:'700', textTransform:'uppercase'}}>Present</div>
                        <div style={{fontSize:'24px', fontWeight:'800', color:'#4ade80'}}>{stats.present}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{fontSize:'11px', opacity:0.6, fontWeight:'700', textTransform:'uppercase'}}>Absent</div>
                        <div style={{fontSize:'24px', fontWeight:'800', color:'#f87171'}}>{stats.absent}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{fontSize:'11px', opacity:0.6, fontWeight:'700', textTransform:'uppercase'}}>Late</div>
                        <div style={{fontSize:'24px', fontWeight:'800', color:'#fbbf24'}}>{stats.late}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{fontSize:'11px', opacity:0.6, fontWeight:'700', textTransform:'uppercase'}}>Overall Rate</div>
                        <div style={{fontSize:'24px', fontWeight:'800'}}>{stats.overall}%</div>
                    </div>
                </div>

                {/* Filters (Locked for Teacher) */}
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'16px', marginBottom:'24px'}}>
                    <div style={{...styles.statCard, textAlign:'left'}}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>CLASS UNIT</div>
                        <div style={{fontSize:'14px', fontWeight:'700', color:'rgba(255,255,255,0.9)'}}>{filters.class} (Assigned)</div>
                    </div>
                    <div style={{...styles.statCard, textAlign:'left'}}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>SECTION</div>
                        <div style={{fontSize:'14px', fontWeight:'700', color:'rgba(255,255,255,0.9)'}}>Section {filters.section} (Assigned)</div>
                    </div>
                    <div style={{...styles.statCard, textAlign:'left'}}>
                        <div style={{fontSize:'10px', opacity:0.6, fontWeight:'800', marginBottom:'4px'}}>REGISTRY DATE</div>
                        <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} style={{background:'none', border:'none', color:'white', fontSize:'14px', fontWeight:'700', outline:'none', width:'100%'}} />
                    </div>
                </div>

                {/* Attendance Table */}
                <div style={{...glass, padding:'0', overflow:'hidden', marginBottom:'24px'}}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)'}}>
                                <th style={{padding:'16px', textAlign:'left', fontSize:'12px', opacity:0.6}}>STUDENT IDENTITY</th>
                                <th style={{padding:'16px', textAlign:'right', fontSize:'12px', opacity:0.6}}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                    <td style={{padding:'16px'}}>
                                        <div style={{fontSize:'14px', fontWeight:'700'}}>{s.full_name}</div>
                                        <div style={{fontSize:'11px', opacity:0.5}}>Roll: {s.roll_number}</div>
                                    </td>
                                    <td style={{padding:'16px', textAlign:'right'}}>
                                        <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                                            {['present', 'absent', 'late'].map(st => (
                                                <button key={st} onClick={() => handleStatusChange(s.id, st)} style={{
                                                    background: attendance[s.id] === st ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                                                    color:'white', padding:'6px 12px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'10px', fontWeight:'800', cursor:'pointer', textTransform:'uppercase'
                                                }}>
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Monthly Chart */}
                <div style={{...glass, padding:'24px'}}>
                    <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px'}}>Monthly Attendance Summary (30 Days)</h3>
                    <div style={{ width: '100%', height: 280, minWidth: 0, overflow: 'hidden' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} unit="%" />
                                <Tooltip contentStyle={{background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px'}} />
                                <Bar dataKey="percentage">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentage > 75 ? 'rgba(74, 222, 128, 0.7)' : 'rgba(248, 113, 113, 0.7)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Attendance;
