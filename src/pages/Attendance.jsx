import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const ATTENDANCE_API_URL = 'https://web-production-d7c5e.up.railway.app/api/attendance';
const STUDENTS_API_URL = 'https://web-production-d7c5e.up.railway.app/api/students';

const Attendance = () => {
    const role = 'principal';
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[3], 
        section: SCHOOL_SECTIONS[0], 
        date: new Date().toISOString().split('T')[0]
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
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
                marked_by: user?.email || 'Principal'
            }));

            await axios.post(`${ATTENDANCE_API_URL}/mark`, { attendanceData });
            alert('Attendance records updated successfully.');
        } catch (error) {
            alert('Error saving: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

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
        th: {backgroundColor:'#F9FAFB', padding:'16px 24px', fontSize:'11px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', borderBottom:'1px solid #E5E7EB'},
        td: {padding:'16px 24px', fontSize:'14px', color:'#111827', borderBottom:'1px solid #F3F4F6', verticalAlign: 'middle'},
        statusBtn: (type, active) => {
            const colors = { present: '#10B981', absent: '#EF4444', late: '#F59E0B' };
            const bgColors = { present: '#ECFDF5', absent: '#FEF2F2', late: '#FFFBEB' };
            return {
                padding: '8px 16px',
                borderRadius: '8px',
                border: active ? `1px solid ${colors[type]}` : '1px solid #E5E7EB',
                backgroundColor: active ? bgColors[type] : 'transparent',
                color: active ? colors[type] : '#6B7280',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                marginRight: '8px',
                transition: 'all 0.2s'
            };
        }
    };

    return (
        <div style={styles.wrapper}>
            <aside style={styles.sidebar}>
                <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'22px', fontWeight:'700', color:'#2563EB', margin:0}}>EduSync</h1><p style={{fontSize:'11px', color:'#6B7280', textTransform:'uppercase', margin:0}}>Management Portal</p></div>
                <nav style={{flex:1}}>
                    <div onClick={() => navigate('/dashboard/principal')} style={styles.navLink}><span className="material-symbols-outlined">dashboard</span><span>Overview</span></div>
                    <div onClick={() => navigate('/dashboard/students')} style={styles.navLink}><span className="material-symbols-outlined">group</span><span>Students</span></div>
                    <div onClick={() => navigate('/dashboard/teachers')} style={styles.navLink}><span className="material-symbols-outlined">person</span><span>Teachers</span></div>
                    <div onClick={() => navigate('/dashboard/attendance')} style={styles.navLinkActive}><span className="material-symbols-outlined">calendar_today</span><span>Attendance</span></div>
                    <div onClick={() => navigate('/dashboard/fees')} style={styles.navLink}><span className="material-symbols-outlined">payments</span><span>Fees</span></div>
                    <div onClick={() => navigate('/dashboard/homework')} style={styles.navLink}><span className="material-symbols-outlined">assignment</span><span>Homework</span></div>
                    <div onClick={() => navigate('/dashboard/marks')} style={styles.navLink}><span className="material-symbols-outlined">grade</span><span>Marks</span></div>
                    <div onClick={() => navigate('/dashboard/reports')} style={styles.navLink}><span className="material-symbols-outlined">assessment</span><span>Reports</span></div>
                </nav>
            </aside>
            <div style={styles.main}>
                <header style={styles.header}>
                    <h2 style={{fontSize:'18px', fontWeight:'600', color:'#111827', margin:0}}>Institutional Attendance</h2>
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
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px'}}>
                        <div><h2 style={styles.pageTitle}>Attendance Registry</h2><p style={{color:'#6B7280', margin:0}}>Manage students' daily attendance records.</p></div>
                        <button onClick={handleSubmit} disabled={saving || students.length === 0} style={{padding:'12px 24px', backgroundColor:'#2563EB', color:'#FFF', border:'none', borderRadius:'12px', fontWeight:'700', cursor:'pointer'}}>{saving ? 'Syncing...' : 'Save Changes'}</button>
                    </div>

                    <div style={styles.filterRow}>
                        <div style={styles.filterCard}><label style={styles.label}>Class</label><select style={styles.select} value={filters.class} onChange={(e) => setFilters({...filters, class: e.target.value})}>{SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div style={styles.filterCard}><label style={styles.label}>Section</label><select style={styles.select} value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}>{SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}</select></div>
                        <div style={styles.filterCard}><label style={styles.label}>Date</label><input type="date" style={styles.select} value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} /></div>
                    </div>

                    <div style={styles.tableCard}>
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                            <thead><tr><th style={styles.th}>Roll No</th><th style={styles.th}>Student Name</th><th style={{...styles.th, textAlign:'right'}}>Attendance Status</th></tr></thead>
                            <tbody>
                                {loading ? (<tr><td colSpan="3" style={{padding:'64px', textAlign:'center', color:'#9CA3AF'}}>Loading data...</td></tr>) : students.length === 0 ? (<tr><td colSpan="3" style={{padding:'64px', textAlign:'center', color:'#9CA3AF'}}>No students found.</td></tr>) : (
                                    students.map(s => (
                                        <tr key={s.id}>
                                            <td style={styles.td}>{s.roll_number}</td>
                                            <td style={styles.td}><b>{s.full_name}</b></td>
                                            <td style={{...styles.td, textAlign:'right'}}>
                                                <button style={styles.statusBtn('present', attendance[s.id] === 'present')} onClick={() => handleStatusChange(s.id, 'present')}>Present</button>
                                                <button style={styles.statusBtn('late', attendance[s.id] === 'late')} onClick={() => handleStatusChange(s.id, 'late')}>Late</button>
                                                <button style={styles.statusBtn('absent', attendance[s.id] === 'absent')} onClick={() => handleStatusChange(s.id, 'absent')}>Absent</button>
                                            </td>
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

export default Attendance;

