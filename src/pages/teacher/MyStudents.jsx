import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, Users, Plus, Search, Trash2, Mail, Phone, Calendar, UserPlus, Award, 
  TrendingUp, ClipboardCheck, BookOpen, GraduationCap, LogOut, Megaphone, AlertCircle, Settings
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const MyStudents = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [leaveStats, setLeaveStats] = useState({ pendingLeaves: 0 });
    const [menuOpen, setMenuOpen] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollForm, setEnrollForm] = useState({
        full_name: '',
        roll_number: '',
        parent_email: '',
        parent_phone: '',
        dob: '',
        gender: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const teacherRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email: user.email }
            });
            const profile = teacherRes.data;
            setTeacherProfile(profile);

            const studentsRes = await axios.get(`${API}/api/students`, {
                params: { 
                    class: profile.class_assigned, 
                    section: profile.section_assigned 
                }
            });
            setStudents(studentsRes.data);

            const leavesRes = await axios.get(`${API}/api/leave/teacher`, { 
                params: { class: profile.class_assigned, section: profile.section_assigned, status: 'pending' } 
            });
            setLeaveStats({ pendingLeaves: leavesRes.data.length || 0 });
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEnroll = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...enrollForm,
                class: teacherProfile.class_assigned,
                section: teacherProfile.section_assigned,
            };
            await axios.post(`${API}/api/students`, payload);
            alert('Student enrolled!');
            setShowEnrollModal(false);
            fetchData();
        } catch (err) {
            console.error("Enroll Error:", err);
            alert('Enrollment failed');
        }
    };

    const deleteStudent = async (id) => {
        if (!window.confirm('Remove this student record?')) return;
        try {
            await axios.delete(`${API}/api/students/${id}`);
            fetchData();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: 'white'
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 200,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        overlay: {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 190,
            opacity: menuOpen ? 1 : 0, visibility: menuOpen ? 'visible' : 'hidden', transition: '0.3s opacity'
        },
        headerGlass: {
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', borderRadius: 16,
            padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? '12px' : '0'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px', paddingTop: '40px', padding: isMobile ? '40px 16px' : '40px 32px',
            transition: 'margin-left 0.3s ease'
        },
        glassCard: {
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)', padding: '24px', marginBottom: '32px'
        },
        modal: {
            position: 'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)', zIndex:1000,
            display:'flex', alignItems:'center', justifyContent:'center', padding: isMobile ? 16 : 20
        },
        input: {
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, padding: '12px', color: 'white', fontSize: 13, outline: 'none', width: '100%', marginBottom: 15
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={{ position: 'fixed', top: '-5%', left: '-5%', width: '110vw', height: '110vh', backgroundImage: 'url(/nature-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: -1 }} />

            {isMobile && <div style={styles.overlay} onClick={() => setMenuOpen(false)} />}

            <aside style={styles.sidebar}>
                <div style={{ display:'flex', alignItems:'center', justifyContent: 'space-between', marginBottom:'40px', padding:'0 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color:'white', fontSize:16, fontWeight:800 }}>E</span>
                    </div>
                    <span style={{ color:'white', fontSize:18, fontWeight:800, letterSpacing:1 }}>EduSync</span>
                  </div>
                  {isMobile && <X size={24} onClick={() => setMenuOpen(false)} style={{ cursor: 'pointer', opacity: 0.7 }} />}
                </div>
                <nav style={{flex:1}}>
                    {[
                        { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
                        { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
                        { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
                        { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: leaveStats.pendingLeaves },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                        { label: 'Announcements', icon: <Megaphone size={20} />, path: '/dashboard/teacher/announcements' },
                        { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
                        { label: 'Support', icon: <AlertCircle size={20} />, path: '/dashboard/support' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>{item.icon} {item.label}</div>{item.badge !== undefined && (<span style={{background:'rgba(255,0,0,0.6)', borderRadius:'8px', padding:'2px 6px', fontSize:'12px', color:'#fff'}}>{item.badge}</span>)}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button 
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#FF4D4D',
                            fontSize: '14px',
                            fontWeight: '700',
                            backgroundColor: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid rgba(255, 77, 77, 0.2)',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <div style={styles.headerGlass}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer', color:'white'}} />}
                    <h1 style={{ color: 'white', fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: 0 }}>Class Division: {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</h1>
                  </div>
                  <div style={{display:'flex', gap:12, width: isMobile ? '100%' : 'auto'}}>
                    <div style={{position:'relative', display: isMobile ? 'none' : 'block'}}>
                        <Search size={16} style={{position:'absolute', left:12, top:12, opacity:0.5, color:'white'}} />
                        <input placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '10px 16px 10px 40px', color: 'white', fontSize: 13, outline: 'none', width: 220 }} />
                    </div>
                    <button onClick={() => setShowEnrollModal(true)} style={{ background: '#22C55E', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: isMobile ? 1 : 'none', justifyContent: 'center' }}>
                        <UserPlus size={18} /> Enroll Student
                    </button>
                  </div>
                  {isMobile && (
                      <div style={{position:'relative', width: '100%', marginTop: 10}}>
                          <Search size={16} style={{position:'absolute', left:12, top:12, opacity:0.5, color:'white'}} />
                          <input placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 16px 10px 40px', color: 'white', fontSize: 13, outline: 'none', width: '100%' }} />
                      </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: isMobile ? 16 : 24 }}>
                    {filteredStudents.map(s => (
                        <div key={s.id} style={{ ...styles.glassCard, marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                                <div style={{ display:'flex', gap:15, alignItems:'center' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'white', fontWeight:800 }}>{s.full_name?.charAt(0)}</div>
                                    <div>
                                        <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color:'white' }}>{s.full_name}</h3>
                                        <p style={{ fontSize: 12, opacity: 0.5, margin: 0, color:'white' }}>Roll No: {s.roll_number} | {s.gender?.toUpperCase() || 'N/A'}</p>
                                    </div>
                                </div>
                                <Trash2 size={16} onClick={() => deleteStudent(s.id)} style={{ cursor: 'pointer', opacity: 0.3, color:'white' }} />
                            </div>
                            
                            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(255,255,255,0.6)' }}><Mail size={14}/> {s.parent_email}</div>
                                <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(255,255,255,0.6)' }}><Phone size={14}/> {s.parent_phone}</div>
                                <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(255,255,255,0.6)' }}><Calendar size={14}/> Born: {new Date(s.dob).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                    {filteredStudents.length === 0 && (
                        <div style={{ ...styles.glassCard, gridColumn: '1/-1', textAlign: 'center', padding: isMobile ? '40px 20px' : '60px' }}>
                            <Users size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <p style={{ fontSize: 16, fontWeight: 600, opacity: 0.4 }}>No scholars found in this division</p>
                        </div>
                    )}
                </div>

                {showEnrollModal && (
                    <div style={styles.modal}>
                        <div style={{ ...styles.glassCard, maxWidth: 400, width: '100%', margin: 0, paddingBottom:30 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                                <h2 style={{ fontSize:18, fontWeight:800, margin:0, color:'white' }}>New Enrollment</h2>
                                <X size={20} onClick={() => setShowEnrollModal(false)} style={{ cursor:'pointer' }} />
                            </div>
                            <form onSubmit={handleEnroll}>
                                <input required placeholder="Full Name" value={enrollForm.full_name} onChange={e => setEnrollForm({...enrollForm, full_name: e.target.value})} style={styles.input} />
                                <input required placeholder="Roll Number" value={enrollForm.roll_number} onChange={e => setEnrollForm({...enrollForm, roll_number: e.target.value})} style={styles.input} />
                                
                                <select 
                                    required 
                                    value={enrollForm.gender} 
                                    onChange={e => setEnrollForm({...enrollForm, gender: e.target.value})} 
                                    style={{
                                        ...styles.input,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" style={{backgroundColor:'#1a1a2e', color:'white'}}>Select Gender</option>
                                    <option value="male" style={{backgroundColor:'#1a1a2e', color:'white'}}>Male</option>
                                    <option value="female" style={{backgroundColor:'#1a1a2e', color:'white'}}>Female</option>
                                    <option value="other" style={{backgroundColor:'#1a1a2e', color:'white'}}>Other</option>
                                </select>

                                <input required type="email" placeholder="Parent Email" value={enrollForm.parent_email} onChange={e => setEnrollForm({...enrollForm, parent_email: e.target.value})} style={styles.input} />
                                <input required placeholder="Parent Phone" value={enrollForm.parent_phone} onChange={e => setEnrollForm({...enrollForm, parent_phone: e.target.value})} style={styles.input} />
                                <label style={{ display:'block', fontSize:10, fontWeight:700, opacity:0.5, marginBottom:5, marginLeft:5, color:'white' }}>DATE OF BIRTH</label>
                                <input required type="date" value={enrollForm.dob} onChange={e => setEnrollForm({...enrollForm, dob: e.target.value})} style={styles.input} />
                                
                                <button type="submit" style={{ width:'100%', padding:'14px', background:'#22C55E', color:'white', border:'none', borderRadius:12, fontWeight:800, cursor:'pointer', marginTop:10 }}>Seal Enrollment</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyStudents;
