import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, TrendingUp, Users, ClipboardCheck, BookOpen, 
  Calendar, GraduationCap, Megaphone, AlertCircle, Settings
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const TeacherAnnouncements = () => {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [stats, setStats] = useState({ pendingLeaves: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            try {
                // Fetch Announcements
                const annRes = await axios.get(`${API}/api/announcements`, {
                    params: { audience: 'teachers' }
                });
                setAnnouncements(annRes.data || []);

                // Fetch real-time updates
                const subscription = supabase
                  .channel('announcements_channel')
                  .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
                     // Auto-refresh when an announcement changes
                     axios.get(`${API}/api/announcements`, { params: { audience: 'teachers' } })
                       .then(res => setAnnouncements(res.data || []));
                  })
                  .subscribe();

                // Get pending leaves count for sidebar
                const profileRes = await axios.get(`${API}/api/teachers/profile`, { params: { email: user.email } });
                const classAssigned = profileRes.data?.class_assigned;
                const sectionAssigned = profileRes.data?.section_assigned;
                
                if (classAssigned) {
                  const leavesRes = await axios.get(`${API}/api/leave/teacher`, {
                      params: { class: classAssigned, section: sectionAssigned, status: 'pending' }
                  });
                  setStats({ pendingLeaves: (leavesRes.data || []).length });
                }

                setLoading(false);

                return () => { supabase.removeChannel(subscription); };
            } catch (err) {
                console.error("Init error:", err);
                setLoading(false);
            }
        };
        init();
    }, [navigate]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: '#ffffff', paddingBottom: '40px'
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 16px', display: 'flex', flexDirection: 'column', zIndex: 100,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        navbar: {
            position: 'fixed', top: 0, left: isMobile ? 0 : '260px', right: 0, height: '80px',
            background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px', paddingTop: '100px', paddingLeft: isMobile ? '16px' : '32px', paddingRight: isMobile ? '16px' : '32px'
        },
        glassCard: {
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(24px)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)', padding: '24px', marginBottom: '20px'
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
            <div style={{ position: 'fixed', top: '-5%', left: '-5%', width: '110vw', height: '110vh', backgroundImage: 'url(/nature-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: -1 }} />

            {isMobile && menuOpen && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99}} onClick={() => setMenuOpen(false)} />}

            <aside style={styles.sidebar}>
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
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: stats.pendingLeaves },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                        { label: 'Announcements', icon: <Megaphone size={20} />, path: '/dashboard/teacher/announcements' },
                        { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
                        { label: 'Support', icon: <AlertCircle size={20} />, path: '/dashboard/support' },
                    ].map((item) => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left', position:'relative'}} onClick={() => { navigate(item.path); if (isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                            {item.badge > 0 && (
                                <span style={{ position: 'absolute', top: -4, right: -4, backgroundColor: 'red', borderRadius: 10, width: 18, height: 18, fontSize: 11, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <h2 style={{fontSize:'20px', fontWeight:'800', margin:0}}>School Announcements</h2>
                </div>
            </header>

            <main style={styles.mainContent}>
               <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap:'20px'}}>
                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} style={{...styles.glassCard, borderColor: ann.priority === 'urgent' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}} className={`relative overflow-hidden group ${ann.priority === 'urgent' ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-[pulse_3s_ease-in-out_infinite]' : ''}`}>
                                {ann.priority === 'urgent' && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
                                {ann.priority === 'important' && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>}
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px', alignItems: 'center'}}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                                        backgroundColor: ann.priority === 'urgent' ? 'rgba(239,68,68,0.2)' : ann.priority === 'important' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)',
                                        color: ann.priority === 'urgent' ? '#FCA5A5' : ann.priority === 'important' ? '#FCD34D' : '#D1D5DB',
                                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {ann.priority === 'urgent' && <AlertCircle size={10} />}
                                        {ann.priority}
                                    </span>
                                    <span style={{fontSize:'10px', opacity:0.5, fontWeight:'800'}}>
                                        {new Date(ann.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{fontSize:'18px', fontWeight:'800', margin:'0 0 8px 0', lineHeight:'1.2'}}>{ann.title}</h3>
                                <p style={{fontSize:'14px', opacity:0.7, margin:0, lineHeight:'1.5'}}>{ann.content}</p>
                                <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                                     <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                                        backgroundColor: ann.target_audience === 'all' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)',
                                        color: ann.target_audience === 'all' ? '#93C5FD' : '#D8B4FE'
                                     }}>
                                         {ann.target_audience === 'all' ? 'All School' : 'Teachers Only'}
                                     </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{gridColumn:'1 / -1', textAlign:'center', padding:'60px 0', opacity:0.4}}>
                            <Megaphone size={48} style={{margin:'0 auto 16px'}} />
                            <p style={{fontSize:'16px'}}>No announcements available</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherAnnouncements;
