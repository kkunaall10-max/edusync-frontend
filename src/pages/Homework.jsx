import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_BASE_URL = 'http://localhost:5000/api/homework';

const Homework = () => {
    const role = 'principal';
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        subject: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const styles = {
        wrapper: {display:'flex', minHeight:'100vh', backgroundColor:'#F9FAFB', fontFamily:'Inter, sans-serif'},
        sidebar: {width:'240px', minHeight:'100vh', backgroundColor:'#FFFFFF', borderRight:'1px solid #E5E7EB', padding:'24px 16px', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0},
        navLink: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#6B7280', textDecoration:'none', fontSize:'14px', fontWeight:'500', marginBottom:'4px', cursor:'pointer'},
        navLinkActive: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#2563EB', backgroundColor:'#EFF6FF', textDecoration:'none', fontSize:'14px', fontWeight:'600', marginBottom:'4px', cursor:'pointer'},
        main: {marginLeft:'240px', flex:1},
        header: {height:'64px', backgroundColor:'#FFFFFF', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'sticky', top:0, zIndex:10},
        content: {padding:'32px'},
        pageTitle: {fontSize:'32px', fontWeight:'800', color:'#111827', margin:0},
        filterRow: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px', marginBottom:'32px'},
        filterCard: {backgroundColor:'#FFFFFF', padding:'16px', borderRadius:'16px', border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        label: {display:'block', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        select: {width:'100%', height:'40px', border:'none', backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'0 12px', fontSize:'14px', fontWeight:'600', color:'#111827', outline:'none', cursor:'pointer'},
        tableCard: {backgroundColor:'#FFFFFF', borderRadius:'24px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        th: {backgroundColor:'#F9FAFB', padding:'16px 24px', fontSize:'11px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', borderBottom:'1px solid #E5E7EB', textAlign: 'left'},
        td: {padding:'16px 24px', fontSize:'14px', color:'#111827', borderBottom:'1px solid #F3F4F6'}
    };

    return (
        <div style={styles.wrapper}>
            <aside style={styles.sidebar}>
                <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'22px', fontWeight:'700', color:'#2563EB', margin:0}}>EduSync</h1><p style={{fontSize:'11px', color:'#6B7280', textTransform:'uppercase', margin:0}}>Management Portal</p></div>
                <nav style={{flex:1}}>
                    <div onClick={() => navigate('/dashboard/principal')} style={styles.navLink}><span className="material-symbols-outlined">dashboard</span><span>Overview</span></div>
                    <div onClick={() => navigate('/dashboard/students')} style={styles.navLink}><span className="material-symbols-outlined">group</span><span>Students</span></div>
                    <div onClick={() => navigate('/dashboard/teachers')} style={styles.navLink}><span className="material-symbols-outlined">person</span><span>Teachers</span></div>
                    <div onClick={() => navigate('/dashboard/attendance')} style={styles.navLink}><span className="material-symbols-outlined">calendar_today</span><span>Attendance</span></div>
                    <div onClick={() => navigate('/dashboard/fees')} style={styles.navLink}><span className="material-symbols-outlined">payments</span><span>Fees</span></div>
                    <div onClick={() => navigate('/dashboard/homework')} style={styles.navLinkActive}><span className="material-symbols-outlined">assignment</span><span>Homework</span></div>
                    <div onClick={() => navigate('/dashboard/marks')} style={styles.navLink}><span className="material-symbols-outlined">grade</span><span>Marks</span></div>
                    <div onClick={() => navigate('/dashboard/reports')} style={styles.navLink}><span className="material-symbols-outlined">assessment</span><span>Reports</span></div>
                </nav>
            </aside>
            <div style={styles.main}>
                <header style={styles.header}>
                    <h2 style={{fontSize:'18px', fontWeight:'600', color:'#111827', margin:0}}>Institution Homework Log</h2>
                    <div onClick={() => setShowDropdown(!showDropdown)} style={{display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', position: 'relative'}}>
                        <div style={{textAlign:'right'}}><p style={{fontSize:'13px', fontWeight:'600', color:'#111827', margin:0}}>{user?.email?.split('@')[0] || 'Administrator'}</p><p style={{fontSize:'10px', color:'#6B7280', margin:0}}>Principal</p></div>
                        <div style={{width:'36px', height:'36px', backgroundColor:'#F3F4F6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><span className="material-symbols-outlined">account_circle</span></div>
                        {showDropdown && (
                            <div style={{position:'absolute', top:'48px', right:0, backgroundColor:'#FFF', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px', zIndex:100, minWidth:'140px'}}>
                                <button onClick={handleLogout} style={{width:'100%', padding:'10px', textAlign:'left', background:'none', border:'none', color:'#DC2626', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>Logout</button>
                            </div>
                        )}
                    </div>
                </header>
                <main style={styles.content}>
                    <div style={{marginBottom:'40px'}}><h2 style={styles.pageTitle}>Homework Oversight</h2><p style={{color:'#6B7280', margin:0}}>Review all assignments issued across academic streams.</p></div>

                    <div style={styles.filterRow}>
                        <div style={styles.filterCard}><label style={styles.label}>Class</label><select style={styles.select} value={filters.class} onChange={(e) => setFilters({...filters, class: e.target.value})}><option value="">All Classes</option>{SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div style={styles.filterCard}><label style={styles.label}>Section</label><select style={styles.select} value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}><option value="">All Sections</option>{SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}</select></div>
                        <div style={styles.filterCard}><label style={styles.label}>Subject</label><input style={{...styles.select, border:'1px solid transparent'}} placeholder="Filter by Subject..." value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})} /></div>
                    </div>

                    <div style={styles.tableCard}>
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                            <thead><tr><th style={styles.th}>Issue Date</th><th style={styles.th}>Assignment Details</th><th style={styles.th}>Target Group</th><th style={styles.th}>Due Date</th></tr></thead>
                            <tbody>
                                {loading ? (<tr><td colSpan="4" style={{padding:'64px', textAlign:'center', color:'#9CA3AF'}}>Synchronizing logs...</td></tr>) : homework.length === 0 ? (<tr><td colSpan="4" style={{padding:'64px', textAlign:'center', color:'#9CA3AF'}}>No assignments found for these filters.</td></tr>) : (
                                    homework.map(hw => (
                                        <tr key={hw.id}>
                                            <td style={styles.td}>{new Date(hw.created_at).toLocaleDateString()}</td>
                                            <td style={styles.td}><div style={{fontWeight:'700', color:'#111827'}}>{hw.title}</div><div style={{fontSize:'12px', color:'#6B7280'}}>{hw.description}</div></td>
                                            <td style={styles.td}><span style={{padding:'4px 12px', backgroundColor:'#EFF6FF', color:'#2563EB', borderRadius:'999px', fontSize:'12px', fontWeight:'700'}}>{hw.class} - {hw.section} • {hw.subject}</span></td>
                                            <td style={{...styles.td, fontWeight:'600', color:'#EF4444'}}>{new Date(hw.due_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Homework;
