import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import natureBg from '../assets/nature-bg.jpg';

const ATTENDANCE_API_URL = 'https://web-production-d7c5e.up.railway.app/api/attendance';
const STUDENTS_API_URL = 'https://web-production-d7c5e.up.railway.app/api/students';
const TEACHERS_API_URL = 'https://web-production-d7c5e.up.railway.app/api/teachers';

const TeacherAttendance = () => {
    const role = 'teacher';
    // Logic States
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[3], 
        section: SCHOOL_SECTIONS[0], 
        date: new Date().toISOString().split('T')[0]
    });

    // UI States
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    // Side Effects
    useEffect(() => {
        const fetchProfileData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                try {
                    const res = await axios.get(TEACHERS_API_URL, { params: { email: currentUser.email } });
                    if (res.data && res.data.length > 0) {
                        const profile = res.data[0];
                        setTeacherProfile(profile);
                        setFilters(prev => ({ 
                            ...prev, 
                            class: profile.class_assigned || SCHOOL_CLASSES[3], 
                            section: profile.section_assigned || SCHOOL_SECTIONS[0] 
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching teacher profile:', err);
                }
            }
        };
        fetchProfileData();
    }, []);

    const fetchStudentsAndAttendance = async () => {
        if (!filters.class || !filters.section) return;
        setLoading(true);
        try {
            const studentsRes = await axios.get(STUDENTS_API_URL, { 
                params: { class: filters.class, section: filters.section } 
            });
            const studentData = studentsRes.data;
            setStudents(studentData);

            const attendanceRes = await axios.get(ATTENDANCE_API_URL, { 
                params: { ...filters } 
            });
            
            const existingAttendance = {};
            attendanceRes.data.forEach(record => {
                existingAttendance[record.student_id] = record.status;
            });

            const initialAttendance = {};
            studentData.forEach(student => {
                initialAttendance[student.id] = existingAttendance[student.id] || 'present';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [filters.class, filters.section, filters.date]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
                student_id: studentId,
                status,
                date: filters.date,
                class: filters.class,
                section: filters.section,
                marked_by: user?.email || 'System'
            }));

            await axios.post(`${ATTENDANCE_API_URL}/mark`, { attendanceData });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            alert('Error saving attendance: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const filteredStudents = students.filter(student => 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const counts = {
        present: Object.values(attendance).filter(s => s === 'present').length,
        absent: Object.values(attendance).filter(s => s === 'absent').length,
        late: Object.values(attendance).filter(s => s === 'late').length
    };

    const styles = {
        outerWrapper: { position: 'relative', minHeight: '100vh', width: '100%', fontFamily: "'Inter', sans-serif", color: '#FFFFFF' },
        backgroundDiv: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundImage: `url(${natureBg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
        contentWrapper: { position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' },
        glassPanel: { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' },
        sidebar: {
            width: sidebarOpen ? '240px' : '0px',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-240px)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: sidebarOpen ? '24px' : '0',
            zIndex: 50,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        },
        navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: '8px' },
        navLinkActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.2)', textDecoration: 'none', fontSize: '14px', fontWeight: '700', transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' },
        header: {
            height: '64px',
            width: sidebarOpen ? 'calc(100% - 240px)' : '100%',
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease'
        },
        main: { marginLeft: sidebarOpen ? '240px' : '0px', flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', paddingTop: '100px', minHeight: '100vh', transition: 'margin 0.3s ease' },
        editorialTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', margin: 0 },
        statusBtn: (type, active) => {
            const colors = { present: '#16A34A', absent: '#DC2626', late: '#D97706' };
            return {
                padding: '8px 20px',
                borderRadius: '99px',
                border: active ? `2px solid rgba(255,255,255,0.5)` : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: active ? colors[type] : 'rgba(255,255,255,0.1)',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            };
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <div style={styles.outerWrapper}>
            <div style={styles.backgroundDiv}>
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
            </div>

            <div style={styles.contentWrapper}>
                <aside style={styles.sidebar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: 'white' }}>school</span>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, ...styles.editorialTitle }}>EduSync</h1>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>THE ACADEMIC SANCTUARY</p>
                        </div>
                    </div>

                    <nav style={{ flex: 1 }}>
                        <div onClick={() => navigate('/dashboard/teacher')} style={styles.navLink}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Overview</span>
                        </div>
                        <div onClick={() => navigate('/dashboard/teacher/students')} style={styles.navLink}>
                            <span className="material-symbols-outlined">group</span>
                            <span>My Students</span>
                        </div>
                        <div onClick={() => navigate('/dashboard/teacher/attendance')} style={styles.navLinkActive}>
                            <span className="material-symbols-outlined">fact_check</span>
                            <span>Attendance</span>
                        </div>
                        <div onClick={() => navigate('/dashboard/teacher/homework')} style={styles.navLink}>
                            <span className="material-symbols-outlined">assignment</span>
                            <span>Homework</span>
                        </div>
                        <div onClick={() => navigate('/dashboard/teacher/marks')} style={styles.navLink}>
                            <span className="material-symbols-outlined">grade</span>
                            <span>Marks</span>
                        </div>
                    </nav>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <div onClick={handleLogout} style={styles.navLink}>
                            <span className="material-symbols-outlined">logout</span>
                            <span>Logout</span>
                        </div>
                    </div>
                </aside>

                <div style={{ flex: 1 }}>
                    <header style={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' }}>
                                <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
                            </button>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>search</span>
                                <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '280px', height: '40px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '0 16px 0 44px', color: 'white', fontSize: '14px', outline: 'none' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{teacherProfile?.full_name || 'Academic Faculty'}</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Institutional Faculty</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => setShowDropdown(!showDropdown)}>
                                <span className="material-symbols-outlined">person</span>
                                {showDropdown && (
                                    <div style={{ position: 'absolute', top: '50px', right: 0, width: '160px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '8px', zIndex: 100 }}>
                                        <div onClick={handleLogout} style={{ ...styles.navLink, marginBottom: 0 }}>
                                            <span className="material-symbols-outlined">logout</span>
                                            <span>Sign Out</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <main style={styles.main}>
                        {showSuccess && (
                            <div style={{ ...styles.glassPanel, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="material-symbols-outlined">check_circle</span>
                                <span style={{ fontWeight: '600' }}>Attendance synchronized successfully.</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                            <div>
                                <h2 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', ...styles.editorialTitle, marginBottom: '8px' }}>Mark Attendance</h2>
                                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>Capture the daily presence of your sanctuary's learners.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ ...styles.glassPanel, padding: '12px 20px', minWidth: '180px', opacity: 0.8 }}>
                                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Class Section</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '700' }}>{filters.class} {filters.section}</span>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                                    </div>
                                </div>
                                <div style={{ ...styles.glassPanel, padding: '12px 20px', minWidth: '160px' }}>
                                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Current Date</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <input type="date" value={filters.date} onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: '700', outline: 'none', width: '100%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ ...styles.glassPanel, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Roll No</th>
                                        <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Student</th>
                                        <th style={{ padding: '16px 32px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status Selection</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading sanctuary records...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan="3" style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No learners found.</td></tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '20px 32px', fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>{student.roll_number}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>{getInitials(student.full_name)}</div>
                                                        <div>
                                                            <div style={{ fontWeight: '700' }}>{student.full_name}</div>
                                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{student.parent_email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                        <button style={styles.statusBtn('present', attendance[student.id] === 'present')} onClick={() => handleStatusChange(student.id, 'present')}>Present</button>
                                                        <button style={styles.statusBtn('absent', attendance[student.id] === 'absent')} onClick={() => handleStatusChange(student.id, 'absent')}>Absent</button>
                                                        <button style={styles.statusBtn('late', attendance[student.id] === 'late')} onClick={() => handleStatusChange(student.id, 'late')}>Late</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                            <div style={{ ...styles.glassPanel, padding: '12px 24px', borderRadius: '30px', display: 'flex', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Present: <b style={{ color: 'white' }}>{counts.present}</b></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Absent: <b style={{ color: 'white' }}>{counts.absent}</b></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Late: <b style={{ color: 'white' }}>{counts.late}</b></span>
                                </div>
                            </div>
                            <button onClick={handleSubmit} disabled={saving || students.length === 0} style={{ padding: '16px 48px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', color: 'white', fontSize: '18px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Synchronizing...' : 'Submit Attendance'}</button>
                        </div>
                    </main>
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } input::-webkit-calendar-picker-indicator { filter: invert(1); }`}</style>
        </div>
    );
};

export default TeacherAttendance;

