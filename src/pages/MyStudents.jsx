import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, Search, CreditCard, CheckCircle, AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const MyStudents = () => {
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = useCallback(async (cancelToken) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            // 1. Fetch Teacher Profile
            const teacherRes = await axios.get(`${API_BASE_URL}/teachers/profile`, { 
                params: { email: user.email },
                cancelToken
            });
            const profile = teacherRes.data;
            setTeacherProfile(profile);

            // 2. Fetch Students
            const studentsRes = await axios.get(`${API_BASE_URL}/students`, { 
                params: { class: profile.class_assigned, section: profile.section_assigned },
                cancelToken
            });
            const studentsData = studentsRes.data;

            // 3. Simple fee aggregation (mocked/simplified for logic)
            const studentsWithFees = await Promise.all(studentsData.map(async (student) => {
                let feeStatus = 'Pending';
                try {
                    const feesRes = await axios.get(`${API_BASE_URL}/fees/student/${student.id}`, { cancelToken });
                    const latestFee = feesRes.data?.[0];
                    if (latestFee) {
                        if (latestFee.status === 'paid') feeStatus = 'Paid';
                        else if (latestFee.due_date < new Date().toISOString().split('T')[0]) feeStatus = 'Overdue';
                    }
                } catch (err) { if (!axios.isCancel(err)) console.error(err); }
                return { ...student, feeStatus };
            }));

            setStudents(studentsWithFees);
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchData(source.token);
        return () => source.cancel("Cleanup");
    }, [fetchData]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, students]);

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            background: 'none',
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
            padding: '24px'
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
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '64px',
            background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '80px',
            padding: isMobile ? '80px 16px' : '80px 24px'
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundImage: 'url(/nature-bg.jpg)', backgroundSize: 'cover',
                backgroundPosition: 'center', backgroundRepeat: 'no-repeat', zIndex: -1
            }} />

            {isMobile && menuOpen && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setMenuOpen(false)} />}

            <aside style={styles.sidebar}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'40px', padding:'0 8px'}}>
                    <GraduationCap size={28} />
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
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'14px', color: (window.location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.6)'), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'14px', fontWeight:'600', marginBottom:'4px'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <h2 style={{fontSize:'18px', fontWeight:'700'}}>Students Directory</h2>
                </div>
                <div style={{position:'relative', width: isMobile ? '160px' : '300px'}}>
                    <Search size={16} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', opacity:0.5}} />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width:'100%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'8px 12px 8px 36px', color:'white', outline:'none', fontSize:'13px'}} />
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{marginBottom:'24px'}}>
                    <h1 style={{fontSize:'28px', fontWeight:'800', margin:0}}>My Class Registry</h1>
                    <p style={{opacity:0.6, fontSize:'14px', marginTop:'4px'}}>Class {teacherProfile?.class_assigned} — Section {teacherProfile?.section_assigned}</p>
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px'}}>
                    {filteredStudents.map(student => (
                        <div key={student.id} style={styles.glassCard}>
                            <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px'}}>
                                <div style={{width:'50px', height:'50px', borderRadius:'16px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'800', border:'1px solid rgba(255,255,255,0.1)'}}>
                                    {student.full_name.charAt(0)}
                                </div>
                                <div style={{flex:1}}>
                                    <h3 style={{fontSize:'16px', fontWeight:'700', margin:0}}>{student.full_name}</h3>
                                    <p style={{fontSize:'12px', opacity:0.5, margin:0}}>Roll: {student.roll_number}</p>
                                </div>
                                <div style={{padding:'4px 8px', borderRadius:'8px', background: student.feeStatus === 'Paid' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', color: student.feeStatus === 'Paid' ? '#4ade80' : '#f87171', fontSize:'10px', fontWeight:'800'}}>
                                    {student.feeStatus?.toUpperCase()}
                                </div>
                            </div>

                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => navigate('/dashboard/teacher/attendance')} style={{flex:1, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'10px', borderRadius:'12px', fontSize:'12px', fontWeight:'700', cursor:'pointer'}}>Mark Attendance</button>
                                <button onClick={() => navigate('/dashboard/teacher/marks')} style={{flex:1, background:'white', border:'none', color:'black', padding:'10px', borderRadius:'12px', fontSize:'12px', fontWeight:'700', cursor:'pointer'}}>Enter Marks</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default MyStudents;
