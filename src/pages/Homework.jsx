import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight
} from 'lucide-react';

const API_BASE_URL = 'https://edusync.up.railway.app/api/homework';

const Homework = ({ role = 'principal' }) => {
    const isTeacher = role === 'teacher';
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        subject: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const params = {
                class: filters.class || undefined,
                section: filters.section || undefined,
                subject: filters.subject || undefined
            };
            const res = await axios.get(API_BASE_URL, { params });
            setHomework(res.data);
        } catch (err) {
            console.error('Error fetching homework:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomework();
    }, [filters.class, filters.section, filters.subject]);

    const glass = {
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '12px'
    };

    const styles = {
        pageWrapper: {
            backgroundImage: isTeacher ? 'url(/nature-bg.jpg)' : 'none',
            backgroundColor: isTeacher ? 'transparent' : '#F8FAFC',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            color: isTeacher ? 'white' : 'inherit'
        },
        sidebar: {
            position: 'fixed',
            left: 0,
            top: 0,
            width: '220px',
            height: '100vh',
            background: isTeacher ? 'rgba(0,0,0,0.3)' : 'white',
            backdropFilter: isTeacher ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isTeacher ? 'blur(20px)' : 'none',
            border: isTeacher ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E2E8F0',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transition: 'transform 0.3s ease',
            transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            boxSizing: 'border-box'
        },
        navLink: {
            color: isTeacher ? 'white' : '#64748B',
            padding: '10px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%'
        },
        activeLink: {
            background: isTeacher ? 'rgba(255,255,255,0.25)' : '#EFF6FF',
            color: isTeacher ? 'white' : '#2563EB'
        },
        navbar: {
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : '220px',
            right: 0,
            height: '60px',
            background: isTeacher ? 'rgba(0,0,0,0.25)' : 'white',
            backdropFilter: isTeacher ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isTeacher ? 'blur(20px)' : 'none',
            borderBottom: isTeacher ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            color: isTeacher ? 'white' : '#1E293B'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '220px',
            paddingTop: isMobile ? '76px' : '84px',
            paddingLeft: isMobile ? '16px' : '24px',
            paddingRight: isMobile ? '16px' : '24px',
            paddingBottom: isMobile ? '16px' : '24px'
        },
        card: {
            ...(isTeacher ? glass : { background: 'white', border: '1px solid #E2E8F0' }),
            padding: '16px'
        },
        label: {
            fontSize: '11px',
            letterSpacing: '1px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: isTeacher ? 'rgba(255,255,255,0.7)' : '#64748B',
            marginBottom: '4px',
            display: 'block'
        }
    };

    const TeacherSidebar = () => (
        <aside style={styles.sidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'30px', padding:'0 5px', color:'white'}}>
                <GraduationCap size={24} />
                <span style={{fontSize:'18px', fontWeight:'800'}}>EduSync</span>
            </div>
            <nav style={{flex:1}}>
                {[
                    { label: 'Overview', icon: <TrendingUp size={18} />, path: '/dashboard/teacher' },
                    { label: 'My Students', icon: <Users size={18} />, path: '/dashboard/teacher/students' },
                    { label: 'Attendance', icon: <ClipboardCheck size={18} />, path: '/dashboard/teacher/attendance' },
                    { label: 'Homework', icon: <BookOpen size={18} />, path: '/dashboard/teacher/homework' },
                    { label: 'Marks Entry', icon: <GraduationCap size={18} />, path: '/dashboard/teacher/marks' },
                ].map((item) => (
                    <button 
                        key={item.label}
                        style={{
                            ...styles.navLink,
                            ...(window.location.pathname === item.path ? styles.activeLink : {})
                        }}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setIsMobileMenuOpen(false);
                        }}
                    >
                        {item.icon} {item.label}
                    </button>
                ))}
            </nav>
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} style={{...styles.navLink, color:'#FCA5A5', marginTop:'auto'}}>
                <LogOut size={18} /> Logout
            </button>
        </aside>
    );

    if (!isTeacher) {
        return (
            <Layout role="principal">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight m-0 uppercase">Homework</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium italic">"Academic progress is measured in consistent effort."</p>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Class</label>
                            <select 
                                className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                                value={filters.class}
                                onChange={(e) => setFilters({...filters, class: e.target.value})}
                            >
                                <option value="">All Classes</option>
                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Section</label>
                            <select 
                                className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                                value={filters.section}
                                onChange={(e) => setFilters({...filters, section: e.target.value})}
                            >
                                <option value="">All Sections</option>
                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Subject</label>
                            <input 
                                type="text"
                                placeholder="Filter by Subject..."
                                className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none"
                                value={filters.subject}
                                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-bottom border-slate-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Details</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Group</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {homework.map(hw => (
                                    <tr key={hw.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-500 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-slate-900 tracking-tight">{hw.title}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{hw.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {hw.class} - {hw.section} • {hw.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-xs font-black text-rose-600">{new Date(hw.due_date).toLocaleDateString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            {isMobile && isMobileMenuOpen && (
                <div 
                    style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:45}}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <TeacherSidebar />

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    {isMobile && <Menu onClick={() => setIsMobileMenuOpen(true)} cursor="pointer" />}
                    <h2 style={{fontSize:'16px', fontWeight:'700', margin:0}}>Homework Portal</h2>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <Bell size={18} />
                    <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px'}}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap:'20px', marginBottom:'30px'}}>
                    <div style={styles.card}>
                        <label style={styles.label}>Class</label>
                        <select 
                            style={{background:'none', border:'none', color:'white', fontSize:'14px', fontWeight:'700', outline:'none', width:'100%'}}
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="" style={{color:'black'}}>All Classes</option>
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c} style={{color:'black'}}>{c}</option>)}
                        </select>
                    </div>
                    <div style={styles.card}>
                        <label style={styles.label}>Section</label>
                        <select 
                            style={{background:'none', border:'none', color:'white', fontSize:'14px', fontWeight:'700', outline:'none', width:'100%'}}
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="" style={{color:'black'}}>All Sections</option>
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s} style={{color:'black'}}>Section {s}</option>)}
                        </select>
                    </div>
                    <div style={styles.card}>
                        <label style={styles.label}>Subject</label>
                        <input 
                            type="text"
                            placeholder="Filter Subject..."
                            style={{background:'none', border:'none', color:'white', fontSize:'14px', fontWeight:'700', outline:'none', width:'100%'}}
                            value={filters.subject}
                            onChange={(e) => setFilters({...filters, subject: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    {loading ? (
                        <div style={{...glass, padding:'40px', textAlign:'center'}}>Synchronizing tasks...</div>
                    ) : (
                        homework.map((hw) => (
                            <div key={hw.id} style={styles.card}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    <div>
                                        <div style={{display:'inline-block', padding:'4px 8px', background:'rgba(255,255,255,0.1)', borderRadius:'6px', fontSize:'10px', fontWeight:'800', textTransform:'uppercase', marginBottom:'8px'}}>
                                            {hw.class}-{hw.section} | {hw.subject}
                                        </div>
                                        <h3 style={{fontSize:'16px', fontWeight:'700', margin:'0 0 8px 0'}}>{hw.title}</h3>
                                        <p style={{fontSize:'12px', opacity:0.7, margin:0, lineHeight:'1.5'}}>{hw.description}</p>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                        <label style={styles.label}>Deadline</label>
                                        <div style={{fontSize:'13px', fontWeight:'800', color:'#FCA5A5'}}>{new Date(hw.due_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Homework;
