import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight, Plus
} from 'lucide-react';

const API = 'https://edusync.up.railway.app';

const Homework = ({ role = 'teacher' }) => {
    const isTeacher = role === 'teacher';
    const [loading, setLoading] = useState(true);
    const [homework, setHomework] = useState([]);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Homework Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        subject: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchInitialData = useCallback(async (cancelToken) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            // FIX 1: Fetch teacher profile first
            const profileRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email: user.email },
                cancelToken
            });
            const profile = profileRes.data;
            setTeacherProfile(profile);
            setFormData(prev => ({ ...prev, subject: profile.subject_assigned || '' }));

            // Fetch homework for teacher's class/section ONLY
            const hwRes = await axios.get(`${API}/api/homework`, {
                params: { 
                    class: profile.class_assigned, 
                    section: profile.section_assigned 
                },
                cancelToken
            });
            setHomework(hwRes.data);
            setLoading(false);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Homework Fetch Error:", error);
                setLoading(false);
            }
        }
    }, [navigate]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchInitialData(source.token);
        return () => source.cancel();
    }, [fetchInitialData]);

    const handleCreateHomework = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                class: teacherProfile.class_assigned,
                section: teacherProfile.section_assigned,
                teacher_id: teacherProfile.id
            };
            await axios.post(`${API}/api/homework`, payload);
            alert('Homework assigned successfully!');
            setShowForm(false);
            // Refresh list
            const hwRes = await axios.get(`${API}/api/homework`, {
                params: { 
                    class: teacherProfile.class_assigned, 
                    section: teacherProfile.section_assigned 
                }
            });
            setHomework(hwRes.data);
        } catch (err) {
            console.error("Post Homework Error:", err);
            alert('Failed to assign homework');
        }
    };

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
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 100,
            transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: '0.3s ease'
        },
        navbar: {
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '80px',
            background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '100px',
            padding: isMobile ? '100px 16px' : '100px 32px'
        },
        glassCard: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)', padding: '24px'
        },
        input: {
            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', marginBottom: '16px'
        }
    };

    if (loading && isTeacher) return <LoadingScreen />;

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

            {isMobile && isMobileMenuOpen && ( <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setIsMobileMenuOpen(false)} /> )}

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
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if(isMobile) setIsMobileMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    {isMobile && <Menu size={24} onClick={() => setIsMobileMenuOpen(true)} style={{cursor:'pointer', color:'white'}} />}
                    <h2 style={{fontSize:'20px', fontWeight:'800', margin:0, color:'white'}}>Homework Manager</h2>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{background:'#2563EB', color:'white', border:'none', borderRadius:'12px', padding:'8px 16px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
                >
                    <Plus size={18} /> {showForm ? 'Cancel' : 'Assign Homework'}
                </button>
            </header>

            <main style={styles.mainContent}>
                {showForm && (
                    <div style={{...styles.glassCard, marginBottom:'32px'}}>
                        <h3 style={{fontSize:'18px', fontWeight:'800', marginBottom:'20px', margin:0, color:'white'}}>New Homework for Class {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</h3>
                        <form onSubmit={handleCreateHomework}>
                            <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'20px'}}>
                                <div>
                                    <label style={{fontSize:'12px', fontWeight:'600', opacity:0.6, display:'block', marginBottom:'8px'}}>Homework Title</label>
                                    <input style={styles.input} placeholder="e.g. Algebra Exercise 1" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{fontSize:'12px', fontWeight:'600', opacity:0.6, display:'block', marginBottom:'8px'}}>Subject</label>
                                    <input style={{...styles.input, opacity:0.6}} value={formData.subject} readOnly />
                                </div>
                            </div>
                            <div>
                                <label style={{fontSize:'12px', fontWeight:'600', opacity:0.6, display:'block', marginBottom:'8px'}}>Due Date</label>
                                <input type="date" style={styles.input} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{fontSize:'12px', fontWeight:'600', opacity:0.6, display:'block', marginBottom:'8px'}}>Description / Instructions</label>
                                <textarea style={{...styles.input, minHeight:'100px', resize:'none'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                            </div>
                            <button type="submit" style={{width:'100%', padding:'14px', background:'#2563EB', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', cursor:'pointer'}}>Post Assignment</button>
                        </form>
                    </div>
                )}

                <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                    <h4 style={{fontSize:'14px', fontWeight:'800', opacity:0.4, textTransform:'uppercase', margin:'0 0 8px 0', color:'white'}}>Posted Homework ({teacherProfile?.class_assigned}-{teacherProfile?.section_assigned})</h4>
                    {homework.map((hw) => (
                        <div key={hw.id} style={styles.glassCard}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                    <div style={{display:'inline-flex', padding:'4px 10px', background:'rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'11px', fontWeight:'800', textTransform:'uppercase', gap:'4px', marginBottom:'12px', color:'white'}}>
                                        <span>{hw.subject}</span>
                                    </div>
                                    <h3 style={{fontSize:'20px', fontWeight:'800', margin:'0 0 8px 0', letterSpacing:'-0.5px', color:'white'}}>{hw.title}</h3>
                                    <p style={{fontSize:'14px', opacity:0.6, margin:0, lineHeight:'1.6', color:'white'}}>{hw.description}</p>
                                </div>
                                <div style={{textAlign:'right', paddingLeft:'20px'}}>
                                    <p style={{fontSize:'10px', fontWeight:'900', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', margin:'0 0 4px 0'}}>Deadline</p>
                                    <div style={{fontSize:'15px', fontWeight:'900', color:'#FCA5A5'}}>{new Date(hw.due_date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {homework.length === 0 && (
                        <div style={{textAlign:'center', padding:'40px', opacity:0.3, color:'white'}}>No homework assigned yet.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default React.memo(Homework);
