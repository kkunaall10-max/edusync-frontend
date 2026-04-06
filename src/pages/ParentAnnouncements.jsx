import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Menu, X, Search, Bell, User, LayoutDashboard, LogOut,
  Megaphone, AlertCircle, Settings 
} from 'lucide-react';
import parentBg from '../assets/parent-bg.jpg';
import LoadingScreen from '../components/LoadingScreen';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/parent';
const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const ParentAnnouncements = () => {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [child, setChild] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { navigate('/login'); return; }
                setUserEmail(user.email);

                const childRes = await axios.get(`${API_BASE_URL}/child`, { params: { parent_email: user.email } });
                const childData = childRes.data;
                setChild(childData);

                // Fetch Announcements
                const fetchAnns = () => axios.get(`${API}/api/announcements`, {
                    params: { audience: 'parents', class: childData.class, section: childData.section }
                }).then(res => setAnnouncements(res.data || []));

                await fetchAnns();

                // Real-time listener
                const subscription = supabase
                  .channel('announcements_channel_parent')
                  .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
                     fetchAnns();
                  })
                  .subscribe();

                setLoading(false);

                return () => { supabase.removeChannel(subscription); };
            } catch (err) {
                console.error("Init Error:", err);
                setLoading(false);
            }
        };
        init();
    }, [navigate]);

    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const styles = {
        pageWrapper: { position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', fontFamily: "'Inter', sans-serif" },
        sidebar: { position: 'fixed', left: 0, top: 0, width: '240px', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.2)', padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 200, transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)', transition: 'transform 0.3s ease' },
        navbar: { height: '64px', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 24px', position: 'sticky', top: 0, zIndex: 150 },
        mainContent: { marginLeft: isMobile ? '0' : '240px', paddingTop: '0px', minHeight: '100vh', transition: 'margin 0.3s ease' },
        glassCard: { backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', padding: isMobile ? '16px' : '24px', marginBottom: '20px' }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div style={styles.pageWrapper}>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundImage: `url(${parentBg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 1 }} />

            {isMobile && menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 199 }} />}

            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex' }}>
                <aside style={styles.sidebar}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>E</div>
                            <span style={{ color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>EduSync</span>
                        </div>
                    </div>
                    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={() => {navigate('/dashboard/parent'); setMenuOpen(false);}} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#fff', opacity: 0.6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}><LayoutDashboard size={20} /> Dashboard</button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#fff', opacity: 1, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}><Megaphone size={20} /> Announcements</button>
                        <button onClick={() => {navigate('/dashboard/settings'); setMenuOpen(false);}} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#fff', opacity: 0.6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}><Settings size={20} /> Settings</button>
                        <button onClick={() => {navigate('/dashboard/support'); setMenuOpen(false);}} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#fff', opacity: 0.6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}><AlertCircle size={20} /> Support</button>
                    </nav>
                </aside>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 'calc(100% - 240px)', ...styles.mainContent }}>
                    <nav style={styles.navbar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {isMobile && <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}><Menu size={24} /></button>}
                            <h2 style={{ color: '#fff', fontSize: isMobile ? '18px' : '20px', fontWeight: '700', margin: 0 }}>Announcements</h2>
                        </div>
                    </nav>

                    <main style={{ padding: isMobile ? '20px' : '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                        <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap:'20px'}}>
                            {announcements.length > 0 ? (
                                announcements.map((ann, idx) => (
                                    <div key={idx} style={{...styles.glassCard, borderColor: ann.priority === 'urgent' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.3)'}} className={`relative overflow-hidden group ${ann.priority === 'urgent' ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-[pulse_3s_ease-in-out_infinite]' : ''}`}>
                                        {ann.priority === 'urgent' && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
                                        {ann.priority === 'important' && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>}
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                                             <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                                <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', backgroundColor: ann.priority === 'urgent' ? 'rgba(239,68,68,0.2)' : ann.priority === 'important' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)', color: ann.priority === 'urgent' ? '#FCA5A5' : ann.priority === 'important' ? '#FCD34D' : '#D1D5DB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    {ann.priority === 'urgent' && <AlertCircle size={10} />}
                                                    {ann.priority}
                                                </span>
                                             </div>
                                            <span style={{fontSize:'10px', color:'rgba(255,255,255,0.5)', fontWeight:'800'}}>
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 style={{color:'#fff', fontSize:'18px', fontWeight:'800', margin:'0 0 12px 0'}}>{ann.title}</h3>
                                        <p style={{color:'rgba(255,255,255,0.7)', fontSize:'14px', margin:'0 0 16px 0', lineHeight:'1.5'}}>{ann.content}</p>
                                        <div style={{borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'16px'}}>
                                             <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', backgroundColor: ann.target_audience === 'all' ? 'rgba(59,130,246,0.2)' : ann.target_audience === 'parents' ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)', color: ann.target_audience === 'all' ? '#93C5FD' : ann.target_audience === 'parents' ? '#86EFAC' : '#FDBA74' }}>
                                                 {ann.target_audience === 'class' ? `Class ${ann.target_class}` : ann.target_audience === 'all' ? 'All School' : 'Parents Only'}
                                             </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{gridColumn:'1 / -1', textAlign:'center', padding:'60px 0', opacity:0.4}}>
                                    <Megaphone size={48} color="white" style={{margin:'0 auto 16px'}} />
                                    <p style={{color:'white', fontSize:'16px'}}>No announcements available</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ParentAnnouncements;
