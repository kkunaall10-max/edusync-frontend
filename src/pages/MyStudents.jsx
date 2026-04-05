import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Users, Search, GraduationCap, TrendingUp, BookOpen, ClipboardCheck, 
  ChevronRight, Menu
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStudents = useCallback(async (cancelToken) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const teacherRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email: user.email },
                cancelToken
            });
            const profile = teacherRes.data;
            setTeacherProfile(profile);

            const res = await axios.get(`${API}/api/students`, {
                params: { class: profile.class_assigned, section: profile.section_assigned },
                cancelToken
            });
            setStudents(res.data);
            setLoading(false);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Fetch Students Error:", error);
                setLoading(false);
            }
        }
    }, [navigate]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchStudents(source.token);
        return () => source.cancel();
    }, [fetchStudents]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif"
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
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
            backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)', padding: '24px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '100px',
            padding: isMobile ? '100px 16px' : '100px 32px'
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
            {/* FIX 6 consistency */}
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

            <aside style={styles.sidebar}>
                {/* FIX 3 Sidebar Consistency */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'40px', padding:'0 8px' }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color:'white', fontSize:16, fontWeight:800 }}>E</span>
                  </div>
                  <span style={{ color:'white', fontSize:18, fontWeight:800, letterSpacing:1 }}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer', color:'white'}} />}
                    <h2 style={{fontSize:'20px', fontWeight:'800', margin:0, color:'white'}}>Student Directory</h2>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={styles.glassCard}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                        <h3 style={{fontSize:'22px', fontWeight:'800', margin:0, color:'white'}}>Class {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</h3>
                        <div style={{position:'relative', width: isMobile ? '120px' : '280px'}}>
                            <Search size={18} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', opacity:0.5, color:'white'}} />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width:'100%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'14px', padding:'10px 12px 10px 40px', color:'white', outline:'none', fontSize:'14px'}} />
                        </div>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px'}}>
                        {students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                            <div key={student.id} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', transition:'0.2s', cursor:'pointer'}}>
                                <div style={{width:'56px', height:'56px', borderRadius:'16px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'800', color:'white'}}>{student.full_name.charAt(0)}</div>
                                <div style={{flex:1}}>
                                    <h4 style={{fontSize:'16px', fontWeight:'700', margin:0, color:'white'}}>{student.full_name}</h4>
                                    <p style={{fontSize:'12px', opacity:0.5, margin:'4px 0 0 0', color:'white'}}>Roll Number: {student.roll_number}</p>
                                </div>
                                <ChevronRight size={18} style={{opacity:0.2, color:'white'}} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyStudents;
