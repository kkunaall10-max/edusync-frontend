import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, Users, BookOpen, GraduationCap, 
  ClipboardCheck, TrendingUp, Plus, Search, Calendar, Trash2, LogOut, Download
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const Homework = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [homeworkList, setHomeworkList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHomework, setNewHomework] = useState({
        title: '',
        subject: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0]
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

            const hwRes = await axios.get(`${API}/api/homework`, {
                params: { class: profile.class_assigned, section: profile.section_assigned }
            });
            setHomeworkList(hwRes.data);
            
            setNewHomework(prev => ({ ...prev, subject: profile.subject || '' }));
        } catch (error) {
            console.error("Homework Fetch Error:", error);
        }
    }, [navigate]);

    const exportCSV = () => {
        const headers = ['Title', 'Subject', 'Class', 'Section', 'Due Date', 'Description'];
        const rows = homeworkList.map(hw => [
            hw.title, hw.subject, hw.class, hw.section, hw.due_date, hw.description
        ]);
        const csv = [headers, ...rows]
            .map(r => r.join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homework-assignments.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddHomework = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const payload = {
                ...newHomework,
                class: teacherProfile.class_assigned,
                section: teacherProfile.section_assigned,
                teacher_id: teacherProfile.id,
                created_by: user.email
            };
            await axios.post(`${API}/api/homework`, payload);
            alert('Homework assigned successfully!');
            setShowAddForm(false);
            fetchData();
        } catch (err) {
            console.error("Add Homework Error:", err);
            alert('Failed to assign homework');
        }
    };

    const deleteHomework = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await axios.delete(`${API}/api/homework/${id}`);
            fetchData();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const filteredHomework = homeworkList.filter(hw => 
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px', marginBottom: '24px'
        },
        input: {
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none', width: '100%', marginBottom: '16px'
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
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
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
                    <h1 style={{ color: 'white', fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: 0 }}>Homework Portal</h1>
                  </div>
                    <div style={{display:'flex', gap:12, width: isMobile ? '100%' : 'auto'}}>
                        <button 
                            onClick={exportCSV}
                            style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'10px 16px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700}}
                        >
                            <Download size={16} /> {isMobile ? '' : 'Export'}
                        </button>
                        <div style={{position:'relative', display: isMobile ? 'none' : 'block'}}>
                            <Search size={16} style={{position:'absolute', left:12, top:12, opacity:0.5}} />
                            <input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '10px 16px 10px 40px', color: 'white', fontSize: 13, outline: 'none', width: 220 }} />
                        </div>
                        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: isMobile ? 1 : 'none', justifyContent: 'center' }}>
                            {showAddForm ? 'Close' : <><Plus size={18} /> Assign Task</>}
                        </button>
                    </div>
                  {isMobile && !showAddForm && (
                      <div style={{position:'relative', width: '100%', marginTop: 10}}>
                          <Search size={16} style={{position:'absolute', left:12, top:12, opacity:0.5}} />
                          <input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 16px 10px 40px', color: 'white', fontSize: 13, outline: 'none', width: '100%' }} />
                      </div>
                  )}
                </div>

                {showAddForm && (
                    <div style={styles.glassCard}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>New Assignment - Class {teacherProfile?.class_assigned}</h2>
                        <form onSubmit={handleAddHomework}>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 8, display: 'block' }}>TITLE</label>
                                    <input required placeholder="Homework title" value={newHomework.title} onChange={e => setNewHomework({...newHomework, title: e.target.value})} style={styles.input} />
                                    
                                    <label style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 8, display: 'block' }}>SUBJECT</label>
                                    <input type="text" placeholder="Enter subject (e.g. Maths, Science, English)" value={newHomework.subject} onChange={e => setNewHomework(prev => ({ ...prev, subject: e.target.value }))} style={styles.input} />
                                    
                                    <label style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 8, display: 'block' }}>DUE DATE</label>
                                    <input type="date" required value={newHomework.due_date} onChange={e => setNewHomework({...newHomework, due_date: e.target.value})} style={styles.input} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 8, display: 'block' }}>DESCRIPTION / INSTRUCTIONS</label>
                                    <textarea required placeholder="Detailed homework description..." value={newHomework.description} onChange={e => setNewHomework({...newHomework, description: e.target.value})} style={{ ...styles.input, height: isMobile ? 120 : 160, resize: 'none' }} />
                                    <button type="submit" style={{ width: '100%', padding: '16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>Post Assignment</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {filteredHomework.map(hw => (
                        <div key={hw.id} style={styles.glassCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase' }}>{hw.subject}</div>
                                <Trash2 size={16} onClick={() => deleteHomework(hw.id)} style={{ cursor: 'pointer', opacity: 0.4 }} />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{hw.title}</h3>
                            <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.6, marginBottom: 20 }}>{hw.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, opacity: 0.5 }}>
                                <Calendar size={14} /> Due: {new Date(hw.due_date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {filteredHomework.length === 0 && (
                        <div style={{ ...styles.glassCard, gridColumn: '1/-1', textAlign: 'center', padding: isMobile ? '40px 20px' : '60px' }}>
                            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <p style={{ fontSize: 16, fontWeight: 600, opacity: 0.4 }}>No tasks found matching your criteria</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Homework;
