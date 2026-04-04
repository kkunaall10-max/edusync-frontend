import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import natureBg from '../assets/nature-bg.jpg';

const API_BASE_URL = 'http://localhost:5000/api';

const TeacherDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [studentsCount, setStudentsCount] = useState(0);
    const [recentHomework, setRecentHomework] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, total: 0 });
    const [showDropdown, setShowDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
            const teacherRes = await axios.get(`${API_BASE_URL}/teachers`, { params: { email: user.email } });
            if (teacherRes.data && teacherRes.data.length > 0) {
                const profile = teacherRes.data[0];
                setTeacherProfile(profile);

                const { class_assigned: className, section_assigned: section, id: teacherId } = profile;

                // 2. Fetch Students Count
                const studentsRes = await axios.get(`${API_BASE_URL}/students`, { 
                    params: { class: className, section: section } 
                });
                setStudentsCount(studentsRes.data.filter(s => s.is_active).length);

                // 3. Fetch Recent Homework (last 3)
                const homeworkRes = await axios.get(`${API_BASE_URL}/homework`, { 
                    params: { class: className, section: section } 
                });
                setRecentHomework(homeworkRes.data.slice(0, 3));

                // 4. Fetch Attendance Stats for Today
                const today = new Date().toISOString().split('T')[0];
                const attendanceRes = await axios.get(`${API_BASE_URL}/attendance`, { 
                    params: { class: className, section: section, date: today } 
                });
                
                const present = attendanceRes.data.filter(a => a.status === 'present').length;
                const absent = attendanceRes.data.filter(a => a.status === 'absent').length;
                setAttendanceStats({ 
                    present: present, 
                    absent: absent, 
                    total: studentsRes.data.length 
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundImage: `url(${natureBg})`, backgroundSize:'cover', fontFamily:'Inter, sans-serif'}}>
                <div style={{backgroundColor:'rgba(255,255,255,0.1)', backdropFilter:'blur(20px)', padding:'32px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.2)', textAlign:'center'}}>
                    <div style={{width:'40px', height:'40px', border:'4px solid #FFFFFF', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px auto'}}></div>
                    <p style={{color:'#FFFFFF', fontWeight:'600'}}>Syncing Faculty Data...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

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
            backgroundImage: `url(${natureBg})`,
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
        statCard: {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s ease'
        },
        quickActionBtn: {
            width: '100%',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            color: '#FFFFFF',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.3s ease'
        }
    };

    const attendancePercentage = attendanceStats.total > 0 
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
        : 0;

    return (
        <div style={styles.outerWrapper}>
            {/* Background Layer */}
            <div style={styles.backgroundDiv}></div>

            {/* Content Layer */}
            <div style={styles.contentWrapper}>
                {/* SideNavBar */}
                <aside style={styles.sidebar}>
                    <div style={{marginBottom:'40px'}}>
                        <h1 style={{...styles.editorialTitle, fontSize:'24px', fontWeight:'800'}}>EduSync</h1>
                    </div>
                    <nav style={{flex:1, display:'flex', flexDirection:'column', gap:'8px'}}>
                        <a onClick={() => navigate('/dashboard/teacher')} style={styles.navLinkActive}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Overview</span>
                        </a>
                        <a onClick={() => navigate('/dashboard/teacher/students')} style={styles.navLink}>
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
                                    placeholder="Search students, classes, or reports..." 
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
                            <p style={{fontSize:'10px', color:'rgba(255,255,255,0.6)', margin:0}}>Class {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</p>
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
                    {/* Welcome Header */}
                    <section style={{marginBottom:'40px'}}>
                        <h2 style={{...styles.editorialTitle, fontSize:'48px', fontWeight:'800', lineHeight:'1.1', marginBottom:'12px'}}>Good morning, {teacherProfile?.full_name?.split(' ')[0]}</h2>
                        <p style={{fontSize:'18px', color:'rgba(255,255,255,0.7)'}}>
                            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. 
                            You have {recentHomework.length} active assignments in {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}.
                        </p>
                    </section>

                    {/* Stats & Quick Actions Bento */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '20px',
                        padding: '24px 0',
                        marginBottom: '40px'
                    }}>
                        {/* My Class */}
                        <div style={styles.statCard}>
                            <p style={{...styles.editorialTitle, fontSize:'64px', fontWeight:'800', marginBottom:'16px'}}>{teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</p>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                                <span style={{fontSize:'12px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Primary Class</span>
                                <span style={{fontSize:'12px', fontWeight:'700', background:'rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:'9999px'}}>{teacherProfile?.subject}</span>
                            </div>
                        </div>

                        {/* Total Students */}
                        <div style={styles.statCard}>
                            <p style={{...styles.editorialTitle, fontSize:'64px', fontWeight:'800', marginBottom:'16px'}}>{studentsCount}</p>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                                <span style={{fontSize:'12px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Total Students</span>
                                <span style={{fontSize:'12px', fontWeight:'700', background:'rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:'9999px'}}>Assigned</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{...styles.glass, padding:'24px', display:'flex', flexDirection:'column', justifyContent:'space-between', gap:'12px'}}>
                            <button onClick={() => navigate('/dashboard/teacher/attendance')} style={styles.quickActionBtn}>
                                <span className="material-symbols-outlined">how_to_reg</span>
                                <span>Mark Attendance</span>
                            </button>
                            <button onClick={() => navigate('/dashboard/teacher/homework')} style={styles.quickActionBtn}>
                                <span className="material-symbols-outlined">add_task</span>
                                <span>Add Homework</span>
                            </button>
                            <button onClick={() => navigate('/dashboard/teacher/marks')} style={styles.quickActionBtn}>
                                <span className="material-symbols-outlined">edit_square</span>
                                <span>Enter Marks</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Split: Recent Homework & Attendance Summary */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        padding: '0 0 24px 0'
                    }}>
                        {/* Recent Homework List */}
                        <div style={{...styles.glass, padding:'32px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                                <h3 style={{...styles.editorialTitle, fontSize:'24px', fontWeight:'700'}}>Recent Homework</h3>
                                <a onClick={() => navigate('/dashboard/teacher/homework')} style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', textDecoration:'none', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.2)'}}>View All</a>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                                {recentHomework.length === 0 ? (
                                    <p style={{textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.5)'}}>No active homework assigned.</p>
                                ) : recentHomework.map((hw, i) => (
                                    <div key={i} style={{display:'flex', alignItems:'start', gap:'20px'}}>
                                        <div style={{width:'56px', height:'56px', borderRadius:'12px', backgroundColor:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                            <span className="material-symbols-outlined" style={{fontSize:'28px'}}>menu_book</span>
                                        </div>
                                        <div style={{flex:1}}>
                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                                                <h4 style={{fontSize:'17px', fontWeight:'700', margin:0}}>{hw.title}</h4>
                                                <span style={{fontSize:'10px', background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:'6px'}}>{new Date(hw.due_date).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'12px'}}>{hw.class}-{hw.section} • {hw.subject}</p>
                                            <div style={{width:'100%', height:'6px', backgroundColor:'rgba(255,255,255,0.1)', borderRadius:'9999px', overflow:'hidden'}}>
                                                <div style={{width:'85%', height:'100%', backgroundColor:'#FFFFFF', borderRadius:'9999px'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attendance Summary Card */}
                        <div style={{...styles.glass, padding:'32px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                            <h3 style={{...styles.editorialTitle, fontSize:'24px', fontWeight:'700', alignSelf:'start', marginBottom:'8px'}}>Daily Attendance</h3>
                            <p style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', alignSelf:'start', marginBottom:'32px'}}>Summary for {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned} today</p>
                            
                            <div style={{position:'relative', width:'192px', height:'192px', marginBottom:'32px'}}>
                                <svg style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
                                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                                    <circle 
                                        cx="96" cy="96" r="88" fill="transparent" stroke="#FFFFFF" strokeWidth="12" 
                                        strokeDasharray="552.92" 
                                        strokeDashoffset={552.92 - (552.92 * attendancePercentage) / 100} 
                                        strokeLinecap="round" 
                                    />
                                </svg>
                                <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                                    <span style={{...styles.editorialTitle, fontSize:'40px', fontWeight:'800'}}>{attendancePercentage}%</span>
                                    <span style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>Present</span>
                                </div>
                            </div>

                            <div style={{width:'100%', display:'flex', flexDirection:'column', gap:'12px'}}>
                                <div style={{display:'flex', justifyContent:'space-between', padding:'16px', borderRadius:'12px', backgroundColor:'rgba(255,255,255,0.05)'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        <span style={{width:'12px', height:'12px', borderRadius:'50%', backgroundColor:'#FFFFFF'}}></span>
                                        <span style={{fontSize:'14px', fontWeight:'500'}}>Present Today</span>
                                    </div>
                                    <span style={{fontWeight:'700'}}>{attendanceStats.present} students</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', padding:'16px', borderRadius:'12px', backgroundColor:'rgba(255,255,255,0.05)'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        <span style={{width:'12px', height:'12px', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.3)'}}></span>
                                        <span style={{fontSize:'14px', fontWeight:'500'}}>Absent</span>
                                    </div>
                                    <span style={{fontWeight:'700'}}>{attendanceStats.absent} students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
