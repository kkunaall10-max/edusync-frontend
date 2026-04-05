import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight, Filter, Search, Award, TrendingDown, Target
} from 'lucide-react';

const API_BASE_URL = 'https://edusync.up.railway.app/api/marks';

const Marks = ({ role = 'teacher' }) => {
    const isTeacher = role === 'teacher';
    const [loading, setLoading] = useState(true);

    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedExam, setSelectedExam] = useState('Half Yearly');
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = useCallback(async (cancelToken) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const teacherRes = await axios.get('https://edusync.up.railway.app/api/teachers/profile', {
                params: { email: user.email },
                cancelToken
            });
            const profile = teacherRes.data;
            setTeacherProfile(profile);
            setSelectedClass(profile.class_assigned);
            setSelectedSection(profile.section_assigned);

            const [studentsRes, marksRes] = await Promise.all([
                axios.get('https://edusync.up.railway.app/api/students', { params: { class: profile.class_assigned, section: profile.section_assigned }, cancelToken }),
                axios.get(API_BASE_URL, { params: { class: profile.class_assigned, section: profile.section_assigned, exam_type: selectedExam, subject: selectedSubject }, cancelToken })
            ]);

            setStudents(studentsRes.data);
            setMarksData(marksRes.data);
            setLoading(false);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Marks Data Error:", error);
                setLoading(false);
            }
        }
    }, [selectedExam, selectedSubject, navigate]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchData(source.token);
        return () => source.cancel("Operation canceled due to filter update.");
    }, [fetchData]);

    const analytics = useMemo(() => {
        const scores = marksData.map(m => (m.marks_obtained / m.total_marks) * 100);
        const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
        const highest = scores.length > 0 ? Math.max(...scores).toFixed(1) : 0;
        const lowest = scores.length > 0 ? Math.min(...scores).toFixed(1) : 0;
        return { avg, highest, lowest };
    }, [marksData]);

    const performanceData = useMemo(() => [
        { range: '90-100', count: marksData.filter(m => (m.marks_obtained/m.total_marks)*100 >= 90).length },
        { range: '80-89', count: marksData.filter(m => { const p = (m.marks_obtained/m.total_marks)*100; return p >= 80 && p < 90; }).length },
        { range: '70-79', count: marksData.filter(m => { const p = (m.marks_obtained/m.total_marks)*100; return p >= 70 && p < 80; }).length },
        { range: '60-69', count: marksData.filter(m => { const p = (m.marks_obtained/m.total_marks)*100; return p >= 60 && p < 70; }).length },
        { range: '<60', count: marksData.filter(m => (m.marks_obtained/m.total_marks)*100 < 60).length },
    ], [marksData]);

    const styles = {
        pageWrapper: {
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 100,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: '0.3s ease'
        },
        navbar: {
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '80px',
            background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
        },
        glassCard: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.3)',
            padding: '24px', willChange: 'transform', transform: 'translateZ(0)'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '100px',
            padding: isMobile ? '100px 16px' : '100px 32px'
        }
    };

    if (loading && isTeacher) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
            {/* oversized background pattern */}
            <div style={{
              position: 'fixed',
              top: '-10%',
              left: '-10%',
              width: '120vw',
              height: '120vh',
              backgroundImage: 'url(/nature-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              zIndex: -2,
              transform: 'translateZ(0)',
              willChange: 'transform',
            }} />
            
            {/* dark overlay */}
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
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'40px', padding:'0 8px'}}>
                    <GraduationCap size={32} />
                    <span style={{fontSize:'24px', fontWeight:'800'}}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: (window.location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.5)'), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h2 style={{fontSize:'20px', fontWeight:'800', margin:0}}>Performance Portal</h2>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'12px', padding:'8px 12px', color:'white', outline:'none', fontSize:'13px', cursor:'pointer'}} >
                        <option value="Half Yearly" style={{color:'black'}}>Half Yearly</option>
                        <option value="Finals" style={{color:'black'}}>Finals</option>
                    </select>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'20px', marginBottom:'32px'}}>
                    {[
                        { label: 'Class Average', value: `${analytics.avg}%`, icon: <Target size={24}/>, color: '#2563EB' },
                        { label: 'Highest Score', value: `${analytics.highest}%`, icon: <Award size={24}/>, color: '#10B981' },
                        { label: 'Lowest Score', value: `${analytics.lowest}%`, icon: <TrendingDown size={24}/>, color: '#EF4444' }
                    ].map((s, i) => (
                        <div key={i} style={styles.glassCard}>
                            <div style={{width:'48px', height:'48px', borderRadius:'14px', background:`${s.color}20`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, marginBottom:'16px'}}>{s.icon}</div>
                            <h3 style={{fontSize:'28px', fontWeight:'800', margin:0}}>{s.value}</h3>
                            <p style={{fontSize:'13px', opacity:0.6, margin:0}}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'24px'}}>
                    <div style={styles.glassCard}>
                        <div style={{display:'flex', justifyContent:'space-between', items:'center', marginBottom:'24px'}}>
                            <h4 style={{fontSize:'18px', fontWeight:'800', margin:0}}>Class Grade Distribution</h4>
                            <span style={{fontSize:'12px', opacity:0.5}}>{selectedSubject}</span>
                        </div>
                        <div style={{height:'300px', width:'100%', minWidth:0}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{background:'#000', border:'none', borderRadius:'12px'}} />
                                    <Bar dataKey="count" fill="url(#colorBar)" radius={[6,6,0,0]} barSize={40}>
                                        <defs>
                                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2563EB" />
                                                <stop offset="100%" stopColor="#7C3AED" />
                                            </linearGradient>
                                        </defs>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={styles.glassCard}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                            <h4 style={{fontSize:'18px', fontWeight:'800', margin:0}}>Student Marks</h4>
                            <div style={{position:'relative', width:'120px'}}>
                                <Search size={14} style={{position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', opacity:0.3}} />
                                <input type="text" placeholder="Roll..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'6px 12px 6px 28px', color:'white', outline:'none', fontSize:'11px'}} />
                            </div>
                        </div>
                        <div style={{maxHeight:'350px', overflowY:'auto', paddingRight:'8px'}}>
                            {students.filter(s => s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())).map(student => {
                                const record = marksData.find(m => m.student_id === student.id);
                                return (
                                    <div key={student.id} style={{display:'flex', items:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                        <div style={{flex:1}}>
                                            <p style={{fontSize:'14px', fontWeight:'700', margin:0}}>{student.full_name}</p>
                                            <p style={{fontSize:'10px', opacity:0.5, margin:0}}>Roll No: {student.roll_number}</p>
                                        </div>
                                        <input 
                                            type="number" 
                                            defaultValue={record?.marks_obtained}
                                            onBlur={async (e) => {
                                                try {
                                                    await axios.post(API_BASE_URL, { student_id: student.id, class: selectedClass, section: selectedSection, exam_type: selectedExam, subject: selectedSubject, marks_obtained: e.target.value, total_marks: 100 });
                                                } catch (err) { console.error(err); }
                                            }}
                                            style={{width:'60px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'6px', color:'white', textAlign:'center', fontWeight:'700'}} 
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(Marks);
