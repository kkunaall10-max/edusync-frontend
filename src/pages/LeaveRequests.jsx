import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Menu, X, Bell, Users, Clock, CheckCircle, XCircle, 
  ChevronRight, Calendar, User, MessageSquare
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const LeaveRequests = () => {
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [remark, setRemark] = useState({}); // { leaveId: remarkText }
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchLeaves = useCallback(async (teacherId) => {
        try {
            const res = await axios.get(`${API}/api/leave/teacher/${teacherId}`);
            setLeaves(res.data);
        } catch (error) {
            console.error("Fetch leaves error:", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const profileRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email: user.email }
            });
            const profile = profileRes.data;
            setTeacherProfile(profile);
            await fetchLeaves(profile.id);
            setLoading(false);
        };
        init();
    }, [navigate, fetchLeaves]);

    const handleResponse = async (leaveId, status) => {
        setSubmitting(true);
        try {
            await axios.put(`${API}/api/leave/${leaveId}/respond`, {
                status,
                teacher_remark: remark[leaveId] || ''
            });
            await fetchLeaves(teacherProfile.id);
        } catch (error) {
            console.error("Response error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const styles = {
        pageWrapper: {
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff',
            paddingBottom: '40px'
        },
        sidebar: {
            position: 'fixed',
            left: 0, top: 0,
            width: '260px',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        navbar: {
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : '260px',
            right: 0,
            height: '80px',
            background: 'rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px',
            paddingTop: '100px',
            paddingLeft: isMobile ? '16px' : '32px',
            paddingRight: isMobile ? '16px' : '32px'
        },
        glassCard: {
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
            padding: '24px',
            marginBottom: '20px'
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
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
              width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.35)',
              zIndex: -1,
            }} />

            {isMobile && menuOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setMenuOpen(false)} />
            )}

            <aside style={styles.sidebar}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'40px', padding:'0 8px' }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color:'white', fontSize:16, fontWeight:800 }}>E</span>
                  </div>
                  <span style={{ color:'white', fontSize:18, fontWeight:800, letterSpacing:1 }}>EduSync</span>
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <Clock size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves' },
                    ].map((item) => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if (isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer'}} />}
                    <div>
                        <h2 style={{fontSize:'20px', fontWeight:'800', margin:0}}>Leave Protocol</h2>
                        <p style={{fontSize:'12px', opacity:0.6, margin:0}}>Class {teacherProfile?.class_assigned} — Section {teacherProfile?.section_assigned}</p>
                    </div>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{maxWidth:'900px', margin:'0 auto'}}>
                    {leaves.length > 0 ? (
                        leaves.map(l => (
                            <div key={l.id} style={styles.glassCard}>
                                <div style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:'20px', marginBottom:'20px'}}>
                                    <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
                                        <div style={{width:'56px', height:'56px', borderRadius:'16px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'800'}}>
                                            {l.students?.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{fontSize:'20px', fontWeight:'800', margin:0}}>{l.students?.full_name}</h3>
                                            <p style={{fontSize:'13px', opacity:0.6, marginTop:2}}>Roll No: {l.students?.roll_number}</p>
                                        </div>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                        <p style={{fontSize:'14px', fontWeight:'700', color:'#4ade80'}}>{new Date(l.from_date).toLocaleDateString()}</p>
                                        <p style={{fontSize:'12px', opacity:0.5}}>until {new Date(l.to_date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'16px', marginBottom:'20px'}}>
                                    <p style={{fontSize:'14px', opacity:0.8, lineHeight:'1.5', margin:0}}>{l.reason}</p>
                                </div>

                                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                                    <input 
                                        type="text" 
                                        placeholder="Add response remark (optional)..."
                                        style={{width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 16px', color:'white', outline:'none', fontSize:'14px'}}
                                        value={remark[l.id] || ''}
                                        onChange={(e) => setRemark({...remark, [l.id]: e.target.value})}
                                    />
                                    <div style={{display:'flex', gap:'12px'}}>
                                        <button 
                                            onClick={() => handleResponse(l.id, 'approved')}
                                            disabled={submitting}
                                            style={{flex:1, height:'48px', borderRadius:'14px', background:'#10B981', color:'white', border:'none', fontSize:'14px', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'0.2s'}}
                                        >
                                            <CheckCircle size={18} /> Approve Application
                                        </button>
                                        <button 
                                            onClick={() => handleResponse(l.id, 'rejected')}
                                            disabled={submitting}
                                            style={{flex:1, height:'48px', borderRadius:'14px', background:'rgba(244,63,94,0.2)', color:'#FB7185', border:'1px solid rgba(244,63,94,0.3)', fontSize:'14px', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'0.2s'}}
                                        >
                                            <XCircle size={18} /> Deny Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{...styles.glassCard, textAlign:'center', padding:'80px 20px'}}>
                            <div style={{width:'80px', height:'80px', borderRadius:'30px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'rgba(255,255,255,0.2)'}}>
                                <Clock size={40} />
                            </div>
                            <h3 style={{fontSize:'22px', fontWeight:'800', margin:'0 0 8px 0'}}>Zero Pending Protocols</h3>
                            <p style={{fontSize:'14px', opacity:0.5, maxWidth:'300px', margin:'0 auto'}}>All scholastic units are currently operational within standard parameters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LeaveRequests;
