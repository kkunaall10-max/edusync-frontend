import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, Users, Plus, Search, Trash2, Mail, Phone, Calendar, UserPlus, X, Award
} from 'lucide-react';

const API = 'https://edusync.up.railway.app';

const MyStudents = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollForm, setEnrollForm] = useState({
        full_name: '',
        roll_number: '',
        parent_email: '',
        parent_phone: '',
        dob: '',
        gender: '' // FIX 2: Added gender
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

            // FIX 2: Automatic fetch locked to teacher's class
            const studentsRes = await axios.get(`${API}/api/students`, {
                params: { 
                    class: profile.class_assigned, 
                    section: profile.section_assigned 
                }
            });
            setStudents(studentsRes.data);
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

    // FIX 4: Search logic
    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif"
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(30px)', 
            borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 100,
            transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: '0.3s ease'
        },
        headerGlass: {
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', borderRadius: 16,
            padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '260px', paddingTop: '40px', padding: isMobile ? '40px 16px' : '40px 32px'
        },
        glassCard: {
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)', padding: '24px', marginBottom: '32px'
        },
        modal: {
            position: 'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)', zIndex:1000,
            display:'flex', alignItems:'center', justifyContent:'center', padding:20
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
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => navigate(item.path)}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <main style={styles.mainContent}>
                {/* FIX 3: Header in Glass card */}
                <div style={styles.headerGlass}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer', color:'white'}} />}
                    <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Class Division: {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</h1>
                  </div>
                  <div style={{display:'flex', gap:12}}>
                    {/* FIX 4: Search input */}
                    <div style={{position:'relative', display: isMobile ? 'none' : 'block'}}>
                        <Search size={16} style={{position:'absolute', left:12, top:12, opacity:0.5, color:'white'}} />
                        <input placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '10px 16px 10px 40px', color: 'white', fontSize: 13, outline: 'none', width: 220 }} />
                    </div>
                    <button onClick={() => setShowEnrollModal(true)} style={{ background: '#22C55E', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserPlus size={18} /> Enroll Student
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                    {filteredStudents.map(s => (
                        <div key={s.id} style={styles.glassCard}>
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
                </div>

                {showEnrollModal && (
                    <div style={styles.modal}>
                        <div style={{ ...styles.glassCard, width: 400, margin: 0, paddingBottom:30 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                                <h2 style={{ fontSize:18, fontWeight:800, margin:0, color:'white' }}>New Scholar Enrollment</h2>
                                <X size={20} onClick={() => setShowEnrollModal(false)} style={{ cursor:'pointer' }} />
                            </div>
                            <form onSubmit={handleEnroll}>
                                <input required placeholder="Full Name" value={enrollForm.full_name} onChange={e => setEnrollForm({...enrollForm, full_name: e.target.value})} style={styles.input} />
                                <input required placeholder="Roll Number" value={enrollForm.roll_number} onChange={e => setEnrollForm({...enrollForm, roll_number: e.target.value})} style={styles.input} />
                                
                                {/* FIX 2: Gender select */}
                                <select required value={enrollForm.gender} onChange={e => setEnrollForm({...enrollForm, gender: e.target.value})} style={{ ...styles.input, background:'rgba(255,255,255,0.1)', cursor:'pointer' }}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
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
