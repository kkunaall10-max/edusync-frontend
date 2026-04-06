import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, LayoutDashboard, Users, Calendar, CheckSquare, 
  Clock, CheckCircle, XCircle, ClipboardCheck, BookOpen, GraduationCap, Megaphone, Settings, AlertCircle, Filter, MessageSquare
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const LeaveRequests = () => {
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, approvedMonth: 0, rejectedMonth: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [remarks, setRemarks] = useState({}); // { leaveId: remarkText }
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchLeaves = useCallback(async (profile) => {
        try {
            const res = await axios.get(`${API}/api/leave/teacher`, {
                params: { 
                    class: profile.class_assigned, 
                    section: profile.section_assigned,
                    status: filterStatus 
                }
            });
            setLeaves(res.data);

            // Fetch all for stats (simplified for monthly logic)
            const allRes = await axios.get(`${API}/api/leave/teacher`, {
                params: { 
                    class: profile.class_assigned, 
                    section: profile.section_assigned,
                    status: 'all'
                }
            });
            
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const pending = allRes.data.filter(l => l.status === 'pending').length;
            const approvedMonth = allRes.data.filter(l => {
                const d = new Date(l.updated_at || l.created_at);
                return l.status === 'approved' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;
            const rejectedMonth = allRes.data.filter(l => {
                const d = new Date(l.updated_at || l.created_at);
                return l.status === 'rejected' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;

            setStats({ pending, approvedMonth, rejectedMonth });
        } catch (error) {
            console.error("Fetch leaves error:", error);
        }
    }, [filterStatus]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            try {
                const profileRes = await axios.get(`${API}/api/teachers/profile`, {
                    params: { email: user.email }
                });
                setTeacherProfile(profileRes.data);
                await fetchLeaves(profileRes.data);
            } catch (err) {
                console.error("Init error:", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [navigate, fetchLeaves]);

    const handleResponse = async (leaveId, status) => {
        const remark = remarks[leaveId] || '';
        if (status === 'rejected' && !remark.trim()) {
            alert("Please provide a remark for rejection");
            return;
        }

        setProcessingId(leaveId);
        try {
            await axios.put(`${API}/api/leave/${leaveId}/respond`, {
                status,
                teacher_remark: remark
            });
            await fetchLeaves(teacherProfile);
        } catch (error) {
            console.error("Response error:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return { bg: 'rgba(22,163,74,0.3)', border: '#16a34a', color: '#4ade80' };
            case 'rejected': return { bg: 'rgba(220,38,38,0.3)', border: '#dc2626', color: '#f87171' };
            default: return { bg: 'rgba(217,119,6,0.3)', border: '#d97706', color: '#fbbf24' };
        }
    };

    const calculateDays = (start, end) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diff = Math.abs(d2 - d1);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
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
        },
        badge: (style) => ({
            background: style.bg,
            border: `1px solid ${style.border}`,
            color: style.color,
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase'
        })
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
                        { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: stats.pending },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                        { label: 'Announcements', icon: <Megaphone size={20} />, path: '/dashboard/teacher/announcements' },
                        { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
                        { label: 'Support', icon: <AlertCircle size={20} />, path: '/dashboard/support' },
                    ].map((item) => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left', position:'relative'}} onClick={() => { navigate(item.path); if (isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                            {item.badge > 0 && (
                                <span style={{position:'absolute', right:'16px', background:'#dc2626', color:'white', fontSize:'10px', padding:'2px 6px', borderRadius:'10px', fontWeight:'800'}}>
                                    {item.badge}
                                </span>
                            )}
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
                <div style={styles.glassCard}>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'20px', justifyContent:'space-around'}}>
                        <div style={{textAlign:'center'}}>
                            <p style={{fontSize:'12px', opacity:0.6, marginBottom:4}}>Pending</p>
                            <span style={{fontSize:'24px', fontWeight:'800', color:'#fbbf24'}}>{stats.pending}</span>
                        </div>
                        <div style={{textAlign:'center'}}>
                            <p style={{fontSize:'12px', opacity:0.6, marginBottom:4}}>Approved (Month)</p>
                            <span style={{fontSize:'24px', fontWeight:'800', color:'#4ade80'}}>{stats.approvedMonth}</span>
                        </div>
                        <div style={{textAlign:'center'}}>
                            <p style={{fontSize:'12px', opacity:0.6, marginBottom:4}}>Rejected (Month)</p>
                            <span style={{fontSize:'24px', fontWeight:'800', color:'#f87171'}}>{stats.rejectedMonth}</span>
                        </div>
                    </div>
                </div>

                <div style={{marginBottom:'24px', display:'flex', alignItems:'center', gap:10}}>
                    <Filter size={18} opacity={0.6} />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'white', padding:'8px 12px', outline:'none', fontSize:'14px'}}
                    >
                        <option value="all" style={{color:'black'}}>All Requests</option>
                        <option value="pending" style={{color:'black'}}>Pending Only</option>
                        <option value="approved" style={{color:'black'}}>Approved</option>
                        <option value="rejected" style={{color:'black'}}>Rejected</option>
                    </select>
                </div>

                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap:'20px'}}>
                    {leaves.length > 0 ? (
                        leaves.map(l => (
                            <div key={l.id} style={styles.glassCard}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                                    <div>
                                        <h3 style={{fontSize:'18px', fontWeight:'800', margin:0}}>{l.students?.full_name}</h3>
                                        <p style={{fontSize:'12px', opacity:0.5}}>Roll: {l.students?.roll_number} • {l.class} {l.section}</p>
                                    </div>
                                    <span style={styles.badge(getStatusStyle(l.status))}>{l.status}</span>
                                </div>

                                <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'16px', marginBottom:'20px'}}>
                                    <div style={{display:'flex', gap:'20px', marginBottom:12}}>
                                        <div>
                                            <p style={{fontSize:'10px', opacity:0.4, textTransform:'uppercase', margin:0}}>From</p>
                                            <p style={{fontSize:'14px', fontWeight:'700', margin:0}}>{new Date(l.from_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p style={{fontSize:'10px', opacity:0.4, textTransform:'uppercase', margin:0}}>To</p>
                                            <p style={{fontSize:'14px', fontWeight:'700', margin:0}}>{new Date(l.to_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p style={{fontSize:'10px', opacity:0.4, textTransform:'uppercase', margin:0}}>Days</p>
                                            <p style={{fontSize:'14px', fontWeight:'700', margin:0}}>{calculateDays(l.from_date, l.to_date)}</p>
                                        </div>
                                    </div>
                                    <p style={{fontSize:'13px', opacity:0.7, margin:0, lineHeight:'1.5'}}>{l.reason}</p>
                                </div>

                                {l.status === 'pending' ? (
                                    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                                        <input 
                                            type="text" 
                                            placeholder="Teacher remark..."
                                            style={{width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'10px 16px', color:'white', outline:'none', fontSize:'14px'}}
                                            value={remarks[l.id] || ''}
                                            onChange={(e) => setRemarks({...remarks, [l.id]: e.target.value})}
                                        />
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button 
                                                onClick={() => handleResponse(l.id, 'approved')}
                                                disabled={processingId === l.id}
                                                style={{flex:1, height:'44px', borderRadius:'14px', background:'#16a34a', color:'white', border:'none', fontSize:'14px', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
                                            >
                                                <CheckCircle size={18} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleResponse(l.id, 'rejected')}
                                                disabled={processingId === l.id}
                                                style={{flex:1, height:'44px', borderRadius:'14px', background:'rgba(220,38,38,0.15)', color:'#f87171', border:'1px solid rgba(220,38,38,0.3)', fontSize:'14px', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    l.teacher_remark && (
                                        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:12, display:'flex', gap:8}}>
                                            <MessageSquare size={14} opacity={0.4} />
                                            <p style={{fontSize:'12px', opacity:0.6, margin:0, fontStyle:'italic'}}>{l.teacher_remark}</p>
                                        </div>
                                    )
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{gridColumn:'1 / -1', textAlign:'center', padding:'60px 0', opacity:0.4}}>
                            <Calendar size={48} style={{margin:'0 auto 16px'}} />
                            <p style={{fontSize:'16px'}}>No leave requests for your class</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LeaveRequests;
