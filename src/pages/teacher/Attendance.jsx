import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, Users, BookOpen, GraduationCap, 
  ClipboardCheck, TrendingUp, Calendar
} from 'lucide-react';

const API = 'https://edusync.up.railway.app';

const Attendance = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchInitialData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const teacherRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email: user.email }
            });
            const profile = teacherRes.data;
            setTeacherProfile(profile);

            const studentsRes = await axios.get(`${API}/api/students`, {
                params: { class: profile.class_assigned, section: profile.section_assigned }
            });
            setStudents(studentsRes.data);
        } catch (error) {
            console.error("Attendance Data Error:", error);
        }
    }, [navigate]);

    const fetchExistingAttendance = useCallback(async (date) => {
        if (!teacherProfile) return;
        try {
            const res = await axios.get(`${API}/api/attendance`, {
                params: { 
                    class: teacherProfile.class_assigned, 
                    section: teacherProfile.section_assigned, 
                    date: date 
                }
            });
            const existing = {};
            res.data.forEach(record => {
                existing[record.student_id] = record.status;
            });
            setAttendance(existing);
        } catch (err) {
            console.error("Error fetching existing attendance:", err);
        }
    }, [teacherProfile]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (teacherProfile) {
            fetchExistingAttendance(selectedDate);
        }
    }, [selectedDate, teacherProfile, fetchExistingAttendance]);

    const markAttendance = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === status ? null : status
        }));
    };

    const submitAttendance = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const records = students
                .filter(s => attendance[s.id])
                .map(s => ({
                    student_id: s.id,
                    class: teacherProfile.class_assigned,
                    section: teacherProfile.section_assigned,
                    date: selectedDate,
                    status: attendance[s.id],
                    marked_by: user.email
                }));
            
            await axios.post(`${API}/api/attendance/mark`, { records });
            alert('Attendance submitted successfully!');
        } catch (err) {
            console.error("Submit Attendance Error:", err);
            alert('Failed to submit attendance');
        }
    };

    const stats = useMemo(() => {
        const counts = { present: 0, absent: 0, late: 0 };
        students.forEach(s => {
            if (attendance[s.id]) counts[attendance[s.id]]++;
        });
        const total = students.length;
        const percentage = total > 0 ? ((counts.present / total) * 100).toFixed(1) : 0;
        return { ...counts, percentage };
    }, [students, attendance]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: '#ffffff'
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
        statCard: {
            background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: isMobile ? '16px' : '20px',
            border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center'
        },
        glassCard: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)', padding: '24px'
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
            </aside>

            <main style={styles.mainContent}>
                <div style={styles.headerGlass}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer', color:'white'}} />}
                    <h1 style={{ color: 'white', fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: 0 }}>Roll Book: {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</h1>
                  </div>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 16px', color:'white', outline:'none', fontSize:'14px', cursor:'pointer', width: isMobile ? '100%' : 'auto'}} />
                </div>

                <div style={{display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: isMobile ? '12px' : '20px', marginBottom:'32px'}}>
                    <div style={styles.statCard}>
                        <p style={{fontSize:'10px', fontWeight:'700', opacity:0.6, margin:0, textTransform:'uppercase', color:'white'}}>Present</p>
                        <h3 style={{fontSize: isMobile ? '20px' : '24px', fontWeight:'900', margin:'4px 0 0 0', color:'#22C55E'}}>{stats.present}</h3>
                    </div>
                    <div style={styles.statCard}>
                        <p style={{fontSize:'10px', fontWeight:'700', opacity:0.6, margin:0, textTransform:'uppercase', color:'white'}}>Absent</p>
                        <h3 style={{fontSize: isMobile ? '20px' : '24px', fontWeight:'900', margin:'4px 0 0 0', color:'#EF4444'}}>{stats.absent}</h3>
                    </div>
                    <div style={styles.statCard}>
                        <p style={{fontSize:'10px', fontWeight:'700', opacity:0.6, margin:0, textTransform:'uppercase', color:'white'}}>Late</p>
                        <h3 style={{fontSize: isMobile ? '20px' : '24px', fontWeight:'900', margin:'4px 0 0 0', color:'#EAB308'}}>{stats.late}</h3>
                    </div>
                    <div style={styles.statCard}>
                        <p style={{fontSize:'10px', fontWeight:'700', opacity:0.6, margin:0, textTransform:'uppercase', color:'white'}}>Overall %</p>
                        <h3 style={{fontSize: isMobile ? '20px' : '24px', fontWeight:'900', margin:'4px 0 0 0', color:'white'}}>{stats.percentage}%</h3>
                    </div>
                </div>

                <div style={styles.glassCard}>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{ width:'100%', borderCollapse:'collapse', minWidth: isMobile ? '500px' : 'auto' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <th style={{ padding:'16px', textAlign:'left', color:'white', fontSize:11, fontWeight:700, letterSpacing:1 }}>ROLL</th>
                                    <th style={{ padding:'16px', textAlign:'left', color:'white', fontSize:11, fontWeight:700, letterSpacing:1 }}>NAME</th>
                                    <th style={{ padding:'16px', textAlign:'center', color:'white', fontSize:11, fontWeight:700, letterSpacing:1 }}>P</th>
                                    <th style={{ padding:'16px', textAlign:'center', color:'white', fontSize:11, fontWeight:700, letterSpacing:1 }}>A</th>
                                    <th style={{ padding:'16px', textAlign:'center', color:'white', fontSize:11, fontWeight:700, letterSpacing:1 }}>L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                                        background: attendance[student.id] === 'present' ? 'rgba(34,197,94,0.1)' 
                                                  : attendance[student.id] === 'absent' ? 'rgba(239,68,68,0.1)'
                                                  : attendance[student.id] === 'late' ? 'rgba(234,179,8,0.1)' : 'transparent',
                                        transition: 'background 0.2s',
                                    }}>
                                        <td style={{ padding:'16px', color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:700 }}>{student.roll_number}</td>
                                        <td style={{ padding:'16px', color:'white', fontSize:14, fontWeight:600 }}>{student.full_name}</td>
                                        <td style={{ padding:'16px', textAlign:'center' }}>
                                            <button onClick={() => markAttendance(student.id, 'present')} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid', borderColor: attendance[student.id]==='present' ? '#22C55E' : 'rgba(255,255,255,0.3)', background: attendance[student.id]==='present' ? '#22C55E' : 'transparent', cursor: 'pointer', color: 'white', fontWeight: 800 }}>✓</button>
                                        </td>
                                        <td style={{ padding:'16px', textAlign:'center' }}>
                                            <button onClick={() => markAttendance(student.id, 'absent')} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid', borderColor: attendance[student.id]==='absent' ? '#EF4444' : 'rgba(255,255,255,0.3)', background: attendance[student.id]==='absent' ? '#EF4444' : 'transparent', cursor: 'pointer', color: 'white', fontWeight: 800 }}>✗</button>
                                        </td>
                                        <td style={{ padding:'16px', textAlign:'center' }}>
                                            <button onClick={() => markAttendance(student.id, 'late')} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid', borderColor: attendance[student.id]==='late' ? '#EAB308' : 'rgba(255,255,255,0.3)', background: attendance[student.id]==='late' ? '#EAB308' : 'transparent', cursor: 'pointer', color: 'white', fontWeight: 800 }}>L</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={submitAttendance} style={{ width:'100%', padding:'16px', background:'#2563EB', color:'white', border:'none', borderRadius:'16px', fontWeight:'800', marginTop:'24px', cursor:'pointer', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }}>Save Attendance Records</button>
                </div>
            </main>
        </div>
    );
};

export default Attendance;

