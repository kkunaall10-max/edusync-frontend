import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import natureBg from '../assets/nature-bg.jpg';

const API_BASE_URL = 'http://localhost:5000/api/homework';
const TEACHERS_API_URL = 'http://localhost:5000/api/teachers';

const TeacherHomework = () => {
    const role = 'teacher';
    // Logic States
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        subject: '',
        class: '',
        section: ''
    });

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    // Side Effects
    const fetchTeacherProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            try {
                const res = await axios.get(TEACHERS_API_URL, { params: { email: user.email } });
                if (res.data && res.data.length > 0) {
                    const profile = res.data[0];
                    setTeacherProfile(profile);
                    setFormData(prev => ({ 
                        ...prev, 
                        subject: profile.subject_assigned || '', 
                        class: profile.class_assigned || '', 
                        section: profile.section_assigned || '' 
                    }));
                }
            } catch (err) { console.error('Error fetching teacher info:', err); }
        }
    };

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const params = (role === 'teacher' && teacherProfile) ? { 
                class: teacherProfile.class_assigned, 
                section: teacherProfile.section_assigned 
            } : {};
            const res = await axios.get(API_BASE_URL, { params });
            setHomework(res.data);
        } catch (err) { console.error('Error fetching homework:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTeacherProfile(); }, []);
    useEffect(() => { if (teacherProfile) fetchHomework(); }, [teacherProfile]);

    const handleAddHomework = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE_URL, formData);
            setIsModalOpen(false);
            setFormData({ ...formData, title: '', description: '', dueDate: '' });
            fetchHomework();
        } catch (err) { alert('Error adding homework: ' + (err.response?.data?.error || err.message)); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this assignment?')) {
            try { await axios.delete(`${API_BASE_URL}/${id}`); fetchHomework(); }
            catch (err) { alert('Error deleting assignment'); }
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const styles = {
        outerWrapper: { position: 'relative', minHeight: '100vh', width: '100%', fontFamily: "'Inter', sans-serif", color: '#FFFFFF' },
        backgroundDiv: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundImage: `url(${natureBg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
        contentWrapper: { position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' },
        sidebar: {
            width: sidebarOpen ? '240px' : '0px',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-240px)',
            height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', 
            padding: sidebarOpen ? '24px' : '0', zIndex: 50, background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.3s ease', overflow: 'hidden'
        },
        navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: '8px' },
        navLinkActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.2)', textDecoration: 'none', fontSize: '14px', fontWeight: '700', transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' },
        header: { height: '64px', width: sidebarOpen ? 'calc(100% - 240px)' : '100%', position: 'fixed', top: 0, right: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(20px)', transition: 'all 0.3s ease' },
        main: { marginLeft: sidebarOpen ? '240px' : '0px', flex: 1, padding: '40px', paddingTop: '100px', minHeight: '100vh', transition: 'margin 0.3s ease' },
        glassPanel: { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px' },
        th: { padding: '16px 32px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' },
        td: { padding: '20px 32px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
        formInput: { width: '100%', height: '44px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '14px', outline: 'none' }
    };

    return (
        <div style={styles.outerWrapper}>
            <div style={styles.backgroundDiv}><div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div></div>
            <div style={styles.contentWrapper}>
                <aside style={styles.sidebar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ color: 'white' }}>school</span></div>
                        <div><h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>EduSync</h1><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>HOMEWORK SANCTUARY</p></div>
                    </div>
                    <nav style={{ flex: 1 }}>
                        <div onClick={() => navigate('/dashboard/teacher')} style={styles.navLink}><span className="material-symbols-outlined">dashboard</span><span>Overview</span></div>
                        <div onClick={() => navigate('/dashboard/teacher/students')} style={styles.navLink}><span className="material-symbols-outlined">group</span><span>My Students</span></div>
                        <div onClick={() => navigate('/dashboard/teacher/attendance')} style={styles.navLink}><span className="material-symbols-outlined">fact_check</span><span>Attendance</span></div>
                        <div onClick={() => navigate('/dashboard/teacher/homework')} style={styles.navLinkActive}><span className="material-symbols-outlined">assignment</span><span>Homework</span></div>
                        <div onClick={() => navigate('/dashboard/teacher/marks')} style={styles.navLink}><span className="material-symbols-outlined">grade</span><span>Marks</span></div>
                    </nav>
                </aside>

                <div style={{ flex: 1 }}>
                    <header style={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '20px' }}><span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span></button>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Homework Management</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ textAlign: 'right' }}><p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{teacherProfile?.full_name}</p><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Faculty</p></div>
                            <div onClick={() => setShowDropdown(!showDropdown)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><span className="material-symbols-outlined">person</span></div>
                        </div>
                    </header>

                    <main style={styles.main}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                            <div><h2 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', margin: '0 0 8px 0' }}>Daily Assignments</h2><p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>Assign and track scholastic tasks.</p></div>
                            <button onClick={() => setIsModalOpen(true)} style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', color: 'white', fontWeight: '800', cursor: 'pointer' }}><span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>add</span>Assign New Task</button>
                        </div>

                        <div style={styles.glassPanel}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}><th style={styles.th}>Assignment</th><th style={styles.th}>Target</th><th style={styles.th}>Due Date</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
                                <tbody>
                                    {loading ? (<tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading...</td></tr>) : homework.length === 0 ? (<tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No assignments.</td></tr>) : (
                                        homework.map((hw) => (
                                            <tr key={hw.id}><td style={styles.td}><div style={{ fontWeight: '700' }}>{hw.title}</div><div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{hw.description}</div></td><td style={styles.td}><span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', fontSize: '12px' }}>{hw.class} - {hw.section} • {hw.subject}</span></td><td style={styles.td}><span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '8px' }}>event</span>{new Date(hw.due_date).toLocaleDateString()}</td><td style={{ ...styles.td, textAlign: 'right' }}><button onClick={() => handleDelete(hw.id)} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-symbols-outlined">delete</span></button></td></tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.glassPanel, width: '500px', padding: '32px' }}>
                        <h3 style={{ margin: '0 0 24px 0' }}>New Assignment</h3>
                        <form onSubmit={handleAddHomework} style={{ display: 'grid', gap: '20px' }}>
                            <div><label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Title</label><input style={styles.formInput} required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
                            <div><label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Description</label><textarea style={{ ...styles.formInput, height: '80px', paddingTop: '12px' }} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea></div>
                            <div><label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Due Date</label><input type="date" style={styles.formInput} required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}><button type="submit" style={{ flex: 1, padding: '12px', background: 'white', color: 'black', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Create Assignment</button><button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Cancel</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherHomework;
