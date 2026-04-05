import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight
} from 'lucide-react';

const API_BASE_URL = 'https://edusync.up.railway.app/api/homework';

const Homework = ({ role = 'principal' }) => {
    const isTeacher = role === 'teacher';
    const [loading, setLoading] = useState(true);

    const [homework, setHomework] = useState([]);
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        subject: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchHomework = useCallback(async (cancelToken) => {
        try {
            const params = {
                class: filters.class || undefined,
                section: filters.section || undefined,
                subject: filters.subject || undefined
            };
            const res = await axios.get(API_BASE_URL, { params, cancelToken });
            setHomework(res.data);
            setLoading(false);
        } catch (err) {
            if (axios.isCancel(err)) return;
            console.error('Error fetching homework:', err);
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchHomework(source.token);
        return () => source.cancel("Operation canceled due to filter update");
    }, [fetchHomework]);

    const styles = {
        pageWrapper: {
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            color: isTeacher ? 'white' : 'inherit'
        },
        sidebar: {
            position: 'fixed',
            left: 0,
            top: 0,
            width: '260px',
            height: '100vh',
            background: isTeacher ? 'rgba(0,0,0,0.3)' : 'white',
            backdropFilter: isTeacher ? 'blur(30px)' : 'none',
            WebkitBackdropFilter: isTeacher ? 'blur(30px)' : 'none',
            border: isTeacher ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E2E8F0',
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transition: 'transform 0.3s ease',
            transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            boxSizing: 'border-box'
        },
        navbar: {
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '80px',
            background: isTeacher ? 'rgba(0,0,0,0.15)' : 'white',
            backdropFilter: isTeacher ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isTeacher ? 'blur(20px)' : 'none',
            borderBottom: isTeacher ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
            zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '100px',
            padding: isMobile ? '100px 16px' : '100px 32px'
        },
        glassCard: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.3)',
            padding: '24px', willChange: 'transform', transform: 'translateZ(0)'
        }
    };

    if (loading && isTeacher) return <LoadingScreen />;

    if (!isTeacher) {
        return (
            <Layout role="principal">
                <div className="space-y-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight m-0 uppercase">Homework Registry</h1>
                </div>
            </Layout>
        );
    }

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

            {isMobile && isMobileMenuOpen && (
                <div 
                    style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:45}}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside style={styles.sidebar}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'40px', padding:'0 5px', color:'white'}}>
                    <GraduationCap size={32} />
                    <span style={{fontSize:'22px', fontWeight:'800'}}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: (window.location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.5)'), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if(isMobile) setIsMobileMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    {isMobile && <Menu onClick={() => setIsMobileMenuOpen(true)} cursor="pointer" />}
                    <h2 style={{fontSize:'20px', fontWeight:'800', margin:0}}>Homework Portal</h2>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <Bell size={20} />
                    <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px'}}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap:'20px', marginBottom:'24px'}}>
                    <div style={styles.glassCard}>
                        <p style={{fontSize:'10px', fontWeight:'800', opacity:0.6, textTransform:'uppercase', margin:'0 0 8px 0'}}>Filter Class</p>
                        <select 
                            style={{background:'none', border:'none', color:'white', fontSize:'16px', fontWeight:'800', outline:'none', width:'100%', cursor:'pointer'}}
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="" style={{color:'black'}}>All Classes</option>
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c} style={{color:'black'}}>{c}</option>)}
                        </select>
                    </div>
                    <div style={styles.glassCard}>
                        <p style={{fontSize:'10px', fontWeight:'800', opacity:0.6, textTransform:'uppercase', margin:'0 0 8px 0'}}>Filter Section</p>
                        <select 
                            style={{background:'none', border:'none', color:'white', fontSize:'16px', fontWeight:'800', outline:'none', width:'100%', cursor:'pointer'}}
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="" style={{color:'black'}}>All Sections</option>
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s} style={{color:'black'}}>Section {s}</option>)}
                        </select>
                    </div>
                    <div style={styles.glassCard}>
                        <p style={{fontSize:'10px', fontWeight:'800', opacity:0.6, textTransform:'uppercase', margin:'0 0 8px 0'}}>Search Subject</p>
                        <input 
                            type="text"
                            placeholder="Type here..."
                            style={{background:'none', border:'none', color:'white', fontSize:'16px', fontWeight:'800', outline:'none', width:'100%'}}
                            value={filters.subject}
                            onChange={(e) => setFilters({...filters, subject: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                    {homework.map((hw) => (
                        <div key={hw.id} style={styles.glassCard}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                    <div style={{display:'inline-flex', padding:'4px 10px', background:'rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'11px', fontWeight:'800', textTransform:'uppercase', gap:'4px', marginBottom:'12px', border:'1px solid rgba(255,255,255,0.1)'}}>
                                        <span>{hw.class}-{hw.section}</span>
                                        <span style={{opacity:0.3}}>|</span>
                                        <span style={{color:'#60A5FA'}}>{hw.subject}</span>
                                    </div>
                                    <h3 style={{fontSize:'20px', fontWeight:'800', margin:'0 0 8px 0', letterSpacing:'-0.5px'}}>{hw.title}</h3>
                                    <p style={{fontSize:'14px', opacity:0.6, margin:0, lineHeight:'1.6'}}>{hw.description}</p>
                                </div>
                                <div style={{textAlign:'right', paddingLeft:'20px'}}>
                                    <p style={{fontSize:'10px', fontWeight:'900', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', margin:'0 0 4px 0'}}>Deadline</p>
                                    <div style={{fontSize:'15px', fontWeight:'900', color:'#FCA5A5'}}>{new Date(hw.due_date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default React.memo(Homework);
