import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Search, Bell, User, LayoutDashboard, LogOut, 
  Menu, X, TrendingUp, Calendar, CreditCard, 
  CheckCircle2, AlertCircle, BookOpen, GraduationCap
} from 'lucide-react';
import parentBg from '../assets/parent-bg.jpg';

const API_BASE_URL = 'https://edusync.up.railway.app/api/parent';

const ParentDashboard = () => {
    const [child, setChild] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [fees, setFees] = useState(null);
    const [homework, setHomework] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No logged in user found");
            setUserEmail(user.email);

            const childRes = await axios.get(`${API_BASE_URL}/child`, { 
                params: { parent_email: user.email } 
            });
            const childData = childRes.data;
            setChild(childData);

            const [attendanceRes, feesRes, homeworkRes, marksRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/attendance`, { params: { student_id: childData.id } }),
                axios.get(`${API_BASE_URL}/fees`, { params: { student_id: childData.id } }),
                axios.get(`${API_BASE_URL}/homework`, { params: { class: childData.class, section: childData.section } }),
                axios.get(`${API_BASE_URL}/marks`, { params: { student_id: childData.id } })
            ]);

            setAttendance(attendanceRes.data);
            setFees(feesRes.data);
            setHomework(homeworkRes.data?.slice(0, 5) || []);
            setMarks(marksRes.data?.slice(0, 5) || []);

        } catch (err) {
            console.error("Dashboard Load Error:", err);
            setError(err.response?.data?.error || "Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { label: 'A+', color: '#DCFCE7', bg: 'rgba(236, 246, 239, 0.4)', shadow: 'rgba(236,246,239,0.2)' };
        if (percentage >= 80) return { label: 'A', color: '#DBEAFE', bg: 'rgba(198, 198, 199, 0.4)', shadow: 'rgba(198,198,199,0.2)' };
        if (percentage >= 70) return { label: 'B+', color: '#F3F4F6', bg: 'rgba(212, 212, 212, 0.4)', shadow: 'rgba(212,212,212,0.1)' };
        if (percentage >= 60) return { label: 'B', color: '#FEF3C7', bg: 'rgba(251, 191, 36, 0.1)', shadow: 'rgba(251,191,36,0.1)' };
        if (percentage >= 40) return { label: 'C', color: '#FFEDD5', bg: 'rgba(249, 115, 22, 0.1)', shadow: 'rgba(249,115,22,0.1)' };
        return { label: 'F', color: '#FEE2E2', bg: 'rgba(220, 38, 38, 0.1)', shadow: 'rgba(220,38,38,0.1)' };
    };

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif"
        },
        sidebar: {
            position: 'fixed', left: 0, top: 0, width: '240px', height: '100vh',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255,255,255,0.2)', padding: '24px 16px',
            display: 'flex', flexDirection: 'column', zIndex: 100,
            transform: window.innerWidth < 1024 ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: '0.3s ease'
        },
        navbar: {
            height: '64px', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
            position: 'sticky', top: 0, zIndex: 50
        },
        mainContent: {
            marginLeft: window.innerWidth < 1024 ? 0 : '240px', paddingTop: '0px',
            minHeight: '100vh'
        },
        glassCard: {
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '16px', padding: '24px'
        },
        avatar: {
            width: '64px', height: '64px', borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: '800', border: '1px solid rgba(255, 255, 255, 0.2)',
            flexShrink: 0, color: 'white'
        },
        badge: {
            padding: '6px 12px', borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF',
            fontSize: '10px', fontWeight: '700', display: 'flex',
            alignItems: 'center', gap: '6px', border: '1px solid rgba(255, 255, 255, 0.1)'
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: 'none' }} className="font-['Inter'] flex flex-col items-center justify-center gap-4">
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: `url(${parentBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1,
                    opacity: 0.4
                }} />
                <div className="relative z-10 text-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-bold tracking-tight">Syncing child profile...</p>
                </div>
            </div>
        );
    }

    if (error || !child) {
        return (
            <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: 'none' }} className="font-['Inter'] flex flex-col items-center justify-center p-6">
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: `url(${parentBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1,
                    opacity: 0.4
                }} />
                <div className="relative z-10 w-full max-w-md p-10 text-center rounded-3xl" style={styles.glassCard}>
                    <span className="material-symbols-outlined text-6xl text-red-400 mb-6">error</span>
                    <h2 className="text-2xl font-black text-white mb-3">No student linked</h2>
                    <p className="text-white/60 mb-8">{error || "We couldn't find any child profile associated with your account."}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-slate-100 transition-colors cursor-pointer border-none"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const totalPaid = fees?.records?.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0) || 0;
    const totalPending = fees?.records?.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0) || 0;
    const totalOverdue = fees?.records?.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0) || 0;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Background Layer */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundImage: `url(${parentBg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 1 }} />

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex' }}>
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={{ padding: '0 8px', marginBottom: '40px' }}>
                        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', margin: 0, letterSpacing: '-1px' }}>EduSync</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', tracking: '2px', marginTop: '4px' }}>Parental Portal</p>
                    </div>

                    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                            onClick={() => navigate('/dashboard/parent')} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', 
                                border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: '700', cursor: 'pointer', textAlign: 'left' 
                            }}
                        >
                            <LayoutDashboard size={20} /> Overview
                        </button>
                    </nav>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', 
                                border: 'none', background: 'transparent', color: '#ff4d4d', fontWeight: '700', cursor: 'pointer', textAlign: 'left', width: '100%' 
                            }}
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </aside>

                <main style={styles.mainContent} className="flex-1">
                    {/* Navbar */}
                    <header style={styles.navbar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {window.innerWidth < 1024 && <Menu size={24} color="white" onClick={() => setMenuOpen(true)} style={{ cursor: 'pointer' }} />}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search child's progress..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', 
                                        padding: '10px 16px 10px 40px', color: 'white', fontSize: '14px', outline: 'none', width: '280px' 
                                    }} 
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', items: 'center', gap: '20px' }}>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', position: 'relative' }} onClick={() => alert('No new notifications')}>
                                <Bell size={22} />
                                <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ff4d4d', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)' }} />
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '6px', cursor: 'pointer', color: 'white' }} 
                                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                >
                                    <User size={22} />
                                </button>
                                {showAccountDropdown && (
                                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '12px', width: '220px', background: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 700 }}>Logged in as</p>
                                        <p style={{ color: 'white', fontSize: '13px', margin: '0 0 16px 0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</p>
                                        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'rgba(255,77,77,0.15)', color: '#ff4d4d', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <div style={{ padding: '32px' }}>
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Hero Card */}
                            <section style={styles.glassCard} className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <div style={styles.avatar}>{getInitials(child.full_name)}</div>
                                    <div>
                                        <h3 className="text-3xl md:text-4xl font-black text-white m-0 tracking-tight leading-none">{child.full_name}</h3>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/50 text-sm font-bold mt-3">
                                            <span className="flex items-center gap-2"><div style={{ width:20, height:20, background:'rgba(255,255,255,0.1)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}><TrendingUp size={12}/></div> Roll: {child.roll_number}</span>
                                            <span className="flex items-center gap-2"><div style={{ width:20, height:20, background:'rgba(255,255,255,0.1)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}><GraduationCap size={12}/></div> Class {child.class}-{child.section}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <div style={styles.badge}>
                                        <span className={`w-2 h-2 rounded-full ${parseFloat(attendance?.percentage) >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        Attendance {attendance?.percentage}%
                                    </div>
                                    <div style={styles.badge}>
                                        <span className={`w-2 h-2 rounded-full ${fees?.summary?.overdueCount > 0 ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                        Fees: {fees?.summary?.overdueCount > 0 ? 'Action Required' : 'Up to date'}
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                                {/* Card 1: Attendance */}
                                <div style={styles.glassCard} className="flex flex-col justify-between min-h-[300px]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Attendance</h4>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>Academic Statistics</p>
                                        </div>
                                        <Calendar size={20} style={{ opacity: 0.3, color: 'white' }} />
                                    </div>
                                    <div className="flex items-baseline gap-4 mb-8">
                                        <span style={{ fontSize: '72px', fontWeight: '900', color: 'white', lineHeight: 1, letterSpacing: '-4px' }}>{attendance?.total}</span>
                                        <span style={{ fontSize: '18px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Total Days</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs font-black text-white/90">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Present: {attendance?.present}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Absent: {attendance?.absent}
                                            </div>
                                        </div>
                                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ease-out ${parseFloat(attendance?.percentage) >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}
                                                style={{ width: `${attendance?.percentage}%` }}
                                            ></div>
                                        </div>
                                        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                                            {parseFloat(attendance?.percentage) >= 75 ? "Excellent attendance sustained!" : "Attendance tracking below the required criteria."}
                                        </p>
                                    </div>
                                </div>

                                {/* Card 2: Fee Status */}
                                <div style={styles.glassCard} className="flex flex-col justify-between min-h-[300px]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Fee Status</h4>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>Financial Overview</p>
                                        </div>
                                        <CreditCard size={20} style={{ opacity: 0.3, color: 'white' }} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-8 text-center">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-lg font-black text-emerald-400 leading-none">₹{totalPaid.toLocaleString()}</p>
                                            <p style={{ fontSize: '8px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '8px' }}>Paid</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-lg font-black text-blue-400 leading-none">₹{totalPending.toLocaleString()}</p>
                                            <p style={{ fontSize: '8px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '8px' }}>Pending</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-lg font-black text-red-400 leading-none">₹{totalOverdue.toLocaleString()}</p>
                                            <p style={{ fontSize: '8px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '8px' }}>Overdue</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {fees?.records?.slice(0, 2).map((fee, idx) => (
                                            <div key={fee.id || idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>{fee.month} {fee.fee_type}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {fee.status === 'paid' ? <CheckCircle2 size={12} color="#10b981" /> : <AlertCircle size={12} color="#ef4444" />}
                                                    <span style={{ fontSize: '9px', fontWeight: '900', color: fee.status === 'paid' ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>{fee.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card 3: Recent Homework */}
                                <div style={styles.glassCard} className="min-h-[300px]">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Homework</h4>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>Active Assignments</p>
                                        </div>
                                        <BookOpen size={20} style={{ opacity: 0.3, color: 'white' }} />
                                    </div>
                                    <div className="space-y-5">
                                        {homework.length === 0 ? (
                                            <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>No homework assigned yet.</div>
                                        ) : (
                                            homework.map((hw, idx) => (
                                                <div key={hw.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontSize: '8px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', textTransform: 'uppercase', width: 'fit-content' }}>{hw.subject}</span>
                                                        <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 }}>{hw.title}</h5>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontSize: '8px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: 0 }}>Due Date</p>
                                                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'white', marginTop: '4px', margin: 0 }}>{new Date(hw.due_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Card 4: Latest Results */}
                                <div style={styles.glassCard} className="min-h-[300px]">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Latest Results</h4>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>Performance Overview</p>
                                        </div>
                                        <TrendingUp size={20} style={{ opacity: 0.3, color: 'white' }} />
                                    </div>
                                    <div className="space-y-5">
                                        {marks.length === 0 ? (
                                            <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Await official evaluations...</div>
                                        ) : (
                                            marks.map((res, idx) => {
                                                const grade = getGrade((res.marks_obtained / res.total_marks) * 100);
                                                return (
                                                    <div key={res.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 }}>{res.subject}</h5>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '500', textTransform: 'uppercase' }}>{res.exam_type} • {res.marks_obtained}/{res.total_marks}</span>
                                                        </div>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${grade.color}`, backgroundColor: grade.bg, color: grade.color, fontWeight: '900', fontSize: '16px' }}>
                                                            {grade.label}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ParentDashboard;
