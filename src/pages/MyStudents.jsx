import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// const natureBg = '/nature-bg.jpg';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const MyStudents = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUser(user);

            // 1. Fetch Teacher Profile
            let profile = null;
            try {
                const teacherRes = await axios.get(`${API_BASE_URL}/teachers`, { params: { email: user.email } });
                if (teacherRes.data && teacherRes.data.length > 0) {
                    profile = teacherRes.data[0];
                    setTeacherProfile(profile);
                    console.log('Teacher profile:', profile);
                    console.log('class_assigned:', profile?.class_assigned);
                    console.log('section_assigned:', profile?.section_assigned);
                }
            } catch (err) {
                console.error("Error fetching teacher profile:", err);
            }

            if (!profile) return;

            // 2. Fetch Students for the class
            let studentsData = [];
            try {
                console.log('Fetching students with:', {
                    class: profile.class_assigned,
                    section: profile.section_assigned
                });
                const studentsRes = await axios.get(`${API_BASE_URL}/students`, { 
                    params: { 
                        class: profile.class_assigned, 
                        section: profile.section_assigned 
                    } 
                });
                console.log('Students received:', studentsRes.data);
                studentsData = studentsRes.data;
                setStudents(studentsData);
                setFilteredStudents(studentsData);
            } catch (err) {
                console.error("Error fetching students:", err);
            }

            // 3. Fetch Fee Status for each student separately
            if (studentsData.length > 0) {
                const studentsWithFees = await Promise.all(studentsData.map(async (student) => {
                    let feeStatus = 'Pending';
                    try {
                        const feesRes = await axios.get(`${API_BASE_URL}/fees/student/${student.id}`);
                        const latestFee = feesRes.data && feesRes.data.length > 0 ? feesRes.data[0] : null;
                        const today = new Date().toISOString().split('T')[0];

                        if (latestFee) {
                            if (latestFee.status === 'paid') {
                                feeStatus = 'Paid';
                            } else if (latestFee.status === 'pending') {
                                if (latestFee.due_date < today) {
                                    feeStatus = 'Overdue';
                                } else {
                                    feeStatus = 'Pending';
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching fees for student ${student.id}:`, err);
                    }
                    return { ...student, feeStatus };
                }));
                setStudents(studentsWithFees);
                setFilteredStudents(studentsWithFees);
            }

        } catch (error) {
            console.error("Critical error in fetchData:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student => 
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const styles = {
        outerWrapper: {
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            fontFamily: "'Inter', sans-serif",
            color: '#FFFFFF'
        },
        backgroundDiv: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: "url('/nature-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
        },
        contentWrapper: {
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            minHeight: '100vh'
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px'
        },
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
        navLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
        navLinkActive: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '700',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
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
            WebkitBackdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease'
        },
        toggleBtn: {
            width: '36px',
            height: '36px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginRight: '12px'
        },
        main: {
            marginLeft: sidebarOpen ? '240px' : '0px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px',
            paddingTop: '96px',
            minHeight: '100vh',
            transition: 'margin 0.3s ease',
            overflowY: 'auto'
        },
        editorialTitle: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.02em',
            margin: 0
        },
        studentCard: {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            transition: 'all 0.3s ease'
        },
        badge: (color) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: `${color}20`,
            border: `1px solid ${color}30`,
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: color
        })
    };

    if (loading) {
        return (
            <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundImage: "url('/nature-bg.jpg')", backgroundSize:'cover', fontFamily:'Inter, sans-serif'}}>
                <div style={{backgroundColor:'rgba(255,255,255,0.1)', backdropFilter:'blur(20px)', padding:'32px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.2)', textAlign:'center'}}>
                    <div style={{width:'40px', height:'40px', border:'4px solid #FFFFFF', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px auto'}}></div>
                    <p style={{color:'#FFFFFF', fontWeight:'600'}}>Fetching Student Records...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={styles.outerWrapper}>
            <div style={styles.backgroundDiv}></div>

            <div style={styles.contentWrapper}>
                {/* SideNavBar */}
                <aside style={styles.sidebar}>
                    <div style={{marginBottom:'40px'}}>
                        <h1 style={{...styles.editorialTitle, fontSize:'24px', fontWeight:'800'}}>EduSync</h1>
                    </div>
                    <nav style={{flex:1, display:'flex', flexDirection:'column', gap:'8px'}}>
                        <a onClick={() => navigate('/dashboard/teacher')} style={styles.navLink}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Overview</span>
                        </a>
                        <a onClick={() => navigate('/dashboard/teacher/students')} style={styles.navLinkActive}>
                            <span className="material-symbols-outlined">group</span>
                            <span>My Students</span>
                        </a>
                        <a onClick={() => navigate('/dashboard/teacher/attendance')} style={styles.navLink}>
                            <span className="material-symbols-outlined">event_available</span>
                            <span>Attendance</span>
                        </a>
                        <a onClick={() => navigate('/dashboard/teacher/homework')} style={styles.navLink}>
                            <span className="material-symbols-outlined">assignment</span>
                            <span>Homework</span>
                        </a>
                        <a onClick={() => navigate('/dashboard/teacher/marks')} style={styles.navLink}>
                            <span className="material-symbols-outlined">grade</span>
                            <span>Marks</span>
                        </a>
                    </nav>
                    <div style={{marginTop:'auto', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', gap:'16px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'0 8px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.3)'}}>
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div style={{overflow:'hidden'}}>
                                <p style={{...styles.editorialTitle, fontSize:'14px', fontWeight:'700', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{teacherProfile?.full_name}</p>
                                <p style={{fontSize:'10px', color:'rgba(255,255,255,0.6)', margin:0}}>Academic Faculty</p>
                            </div>
                        </div>
                        <a onClick={handleLogout} style={{...styles.navLink, color:'rgba(239, 68, 68, 0.8)'}}>
                            <span className="material-symbols-outlined">logout</span>
                            <span>Logout</span>
                        </a>
                    </div>
                </aside>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* TopNavBar */}
                    <header style={styles.header}>
                        <div style={{display:'flex', alignItems:'center', gap:'4px', width:'50%'}}>
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                style={styles.toggleBtn}
                            >
                                {sidebarOpen ? '✕' : '☰'}
                            </button>
                            <div style={{position:'relative', width:'100%', maxWidth:'400px'}}>
                                <span className="material-symbols-outlined" style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.5)', fontSize:'18px'}}>search</span>
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search student by name or roll number..." 
                                    style={{width:'100%', backgroundColor:'rgba(0,0,0,0.2)', border:'none', borderRadius:'9999px', padding:'10px 16px 10px 42px', fontSize:'13px', color:'#FFFFFF', outline:'none'}}
                                />
                            </div>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                            <button style={{background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer'}}><span className="material-symbols-outlined">notifications</span></button>
                            <button style={{background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer'}}><span className="material-symbols-outlined">settings</span></button>
                            <div style={{width:'1px', height:'24px', backgroundColor:'rgba(255,255,255,0.2)'}}></div>
                            <div 
                                style={{display:'flex', alignItems:'center', gap:'12px', position:'relative', cursor:'pointer'}}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div style={{textAlign:'right'}}>
                                    <p style={{fontSize:'13px', fontWeight:'700', margin:0}}>{teacherProfile?.full_name}</p>
                                    <p style={{fontSize:'10px', color:'rgba(255,255,255,0.6)', margin:0}}>{teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</p>
                                </div>
                                <div style={{width:'36px', height:'36px', backgroundColor:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <span className="material-symbols-outlined">account_circle</span>
                                </div>

                                {showDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '48px',
                                        right: 0,
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        padding: '8px',
                                        zIndex: 100,
                                        minWidth: '140px'
                                    }}>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                textAlign: 'left',
                                                background: 'none',
                                                border: 'none',
                                                color: '#DC2626',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <main style={styles.main}>
                        <div style={{maxWidth:'1280px', margin:'0 auto'}}>
                            <header style={{marginBottom:'40px'}}>
                                <h1 style={{...styles.editorialTitle, fontSize:'48px', fontWeight:'800', lineHeight:'1.1', marginBottom:'12px'}}>My Students</h1>
                                <p style={{fontSize:'18px', color:'rgba(255,255,255,0.6)'}}>{teacherProfile?.class_assigned} - {teacherProfile?.section_assigned}</p>
                            </header>

                            {filteredStudents.length === 0 ? (
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0'}}>
                                    <span className="material-symbols-outlined" style={{fontSize:'64px', color:'rgba(255,255,255,0.2)', marginBottom:'16px'}}>group_off</span>
                                    <p style={{fontSize:'18px', color:'rgba(255,255,255,0.5)', fontWeight:'500'}}>No students found matching your search.</p>
                                </div>
                            ) : (
                                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'24px'}}>
                                    {filteredStudents.map((student) => {
                                        const attendanceColor = student.attendancePercentage >= 75 ? '#10B981' : '#EF4444';
                                        let feeColor = '#10B981'; // Paid
                                        if (student.feeStatus === 'Overdue') feeColor = '#EF4444';
                                        if (student.feeStatus === 'Pending') feeColor = '#F59E0B';

                                        return (
                                            <div key={student.id} style={styles.studentCard}>
                                                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                                                    <div style={{width:'56px', height:'56px', borderRadius:'14px', backgroundColor:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.3)', color:'#FFFFFF', fontWeight:'800', fontSize:'20px'}}>
                                                        {getInitials(student.full_name)}
                                                    </div>
                                                    <div style={{flex:1, overflow:'hidden'}}>
                                                        <h3 style={{fontSize:'20px', fontWeight:'700', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{student.full_name}</h3>
                                                        <p style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', margin:0}}>Roll No: {student.roll_number}</p>
                                                    </div>
                                                </div>

                                                <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                                                    <div style={styles.badge('rgba(255,255,255,0.5)')}>
                                                        <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor: 'rgba(255,255,255,0.5)'}}></div>
                                                        <span>Attendance N/A</span>
                                                    </div>
                                                    <div style={styles.badge(feeColor)}>
                                                        <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor: feeColor}}></div>
                                                        <span>{student.feeStatus}</span>
                                                    </div>
                                                </div>

                                                <div style={{paddingTop:'20px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                    <span style={{fontSize:'10px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', fontWeight:'700', letterSpacing:'0.1em'}}>Class {student.class}-{student.section}</span>
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/teacher/attendance`)} // Redirect to mark attendance
                                                        style={{background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer'}}
                                                    >
                                                        <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward_ios</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MyStudents;

