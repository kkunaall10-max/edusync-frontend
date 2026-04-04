import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_BASE_URL = 'https://edusync.up.railway.app/api/reports';
const STUDENTS_API_URL = 'https://edusync.up.railway.app/api/students';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('attendance');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    // Filters
    const [attFilters, setAttFilters] = useState({ 
        class: SCHOOL_CLASSES[3] || 'Class 1', 
        section: 'A', 
        month: (new Date().getMonth() + 1).toString(), 
        year: '2026' 
    });

    const [feeFilters, setFeeFilters] = useState({ 
        month: (new Date().getMonth() + 1).toString(), 
        year: '2026' 
    });

    const [academicFilters, setAcademicFilters] = useState({ 
        class: SCHOOL_CLASSES[3] || 'Class 1', 
        section: 'A', 
        exam_type: 'Unit Test' 
    });

    const MONTHS = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    const fetchAttendanceReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/attendance-summary`, { params: attFilters });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching attendance report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeeReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/fee-summary`, { params: feeFilters });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching fee report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAcademicReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/marks-summary`, { params: academicFilters });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching academic report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentReportCard = async (studentId) => {
        if (!studentId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/student-report/${studentId}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching student report card:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await axios.get(STUDENTS_API_URL);
            setAllStudents(res.data);
        } catch (error) {
            console.error('Error fetching all students:', error);
        }
    };

    useEffect(() => {
        fetchAllStudents();
    }, []);

    useEffect(() => {
        if (activeTab === 'attendance') fetchAttendanceReport();
        if (activeTab === 'fee') fetchFeeReport();
        if (activeTab === 'academic') fetchAcademicReport();
        if (activeTab === 'report-card' && selectedStudent) fetchStudentReportCard(selectedStudent);
    }, [activeTab, attFilters, feeFilters, academicFilters, selectedStudent]);

    const handlePrint = () => {
        window.print();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Styles (Consistent with Academic Atelier)
    const styles = {
        wrapper: {display:'flex', minHeight:'100vh', backgroundColor:'#F9FAFB', fontFamily:'Inter, sans-serif'},
        sidebar: {width:'240px', minHeight:'100vh', backgroundColor:'#FFFFFF', borderRight:'1px solid #E5E7EB', padding:'24px 16px', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0},
        logoArea: {marginBottom:'32px'},
        logoText: {fontSize:'22px', fontWeight:'700', color:'#2563EB', margin:0},
        portalLabel: {fontSize:'11px', color:'#6B7280', textTransform:'uppercase', margin:0, letterSpacing:'0.05em'},
        navLink: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#6B7280', textDecoration:'none', fontSize:'14px', fontWeight:'500', marginBottom:'4px', cursor:'pointer'},
        navLinkActive: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#2563EB', backgroundColor:'#EFF6FF', textDecoration:'none', fontSize:'14px', fontWeight:'600', marginBottom:'4px', cursor:'pointer'},
        main: {marginLeft:'240px', flex:1},
        header: {height:'64px', backgroundColor:'#FFFFFF', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'sticky', top:0, zIndex:10},
        headerTitle: {fontSize:'18px', fontWeight:'600', color:'#111827', margin:0},
        content: {padding:'32px', maxWidth:'1400px', margin:'0 auto'},
        tabsWrapper: {display:'flex', backgroundColor:'#F3F4F6', padding:'4px', borderRadius:'12px', width:'fit-content', marginBottom:'40px'},
        tab: (active) => ({padding:'10px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:'700', color:active ? '#111827' : '#6B7280', backgroundColor:active ? '#FFFFFF' : 'transparent', border:'none', cursor:'pointer', transition:'all 0.2s', boxShadow:active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}),
        statsGrid: {display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'40px'},
        statsCard: {backgroundColor:'#FFFFFF', padding:'24px', borderRadius:'16px', border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        statsLabel: {fontSize:'10px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        statsValue: {fontSize:'24px', fontWeight:'800', color:'#111827', margin:0},
        filtersRow: {backgroundColor:'#FFFFFF', padding:'24px', borderRadius:'16px', border:'1px solid #E5E7EB', display:'flex', gap:'16px', marginBottom:'40px', alignItems:'flex-end'},
        filterItem: {flex:1},
        filterLabel: {display:'block', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        select: {width:'100%', height:'40px', border:'none', backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'0 12px', fontSize:'14px', fontWeight:'600', color:'#111827', outline:'none', cursor:'pointer', border:'1px solid #E5E7EB'},
        input: {width:'100%', height:'40px', border:'none', backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'0 12px', fontSize:'14px', fontWeight:'600', color:'#111827', outline:'none', border:'1px solid #E5E7EB'},
        tableCard: {backgroundColor:'#FFFFFF', borderRadius:'24px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        th: {backgroundColor:'#F9FAFB', padding:'16px 24px', fontSize:'11px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #E5E7EB', textAlign:'left'},
        td: {padding:'16px 24px', fontSize:'14px', color:'#111827', borderBottom:'1px solid #F3F4F6', verticalAlign:'middle'},
        reportCard: {backgroundColor:'#FFFFFF', width:'100%', maxWidth:'800px', margin:'0 auto', padding:'40px', border:'1px solid #E5E7EB', borderRadius:'8px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'},
        reportHeader: {textAlign:'center', borderBottom:'2px solid #111827', paddingBottom:'24px', marginBottom:'32px'},
        schoolName: {fontSize:'28px', fontWeight:'800', color:'#2563EB', margin:'10px 0'},
        reportSubtitle: {fontSize:'10px', color:'#6B7280', textTransform:'uppercase', fontWeight:'700', letterSpacing:'0.2em'},
        studentMetaGrid: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px', padding:'24px 0', borderBottom:'1px solid #E5E7EB', marginBottom:'32px'},
        metaItem: {display:'flex', flexDirection:'column', gap:'4px'},
        metaLabel: {fontSize:'10px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase'},
        metaValue: {fontSize:'14px', fontWeight:'700', color:'#111827'},
        gradeBadge: (color, bg) => ({padding:'4px 12px', borderRadius:'9999px', fontSize:'10px', fontWeight:'900', color:color, backgroundColor:bg, textTransform:'uppercase'}),
        printBtn: {padding:'14px 32px', backgroundColor:'#2563EB', color:'#FFFFFF', borderRadius:'12px', fontSize:'14px', fontWeight:'800', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', margin:'32px auto 0 auto', boxShadow:'0 4px 12px rgba(37,99,235,0.2)'}
    };

    return (
        <div style={styles.wrapper}>
            {/* Sidebar */}
            <aside style={{
                width: '240px',
                minHeight: '100vh',
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #E5E7EB',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0
            }} className="no-print">
                <div style={styles.logoArea}>
                    <h1 style={styles.logoText}>EduSync</h1>
                    <p style={styles.portalLabel}>Academic Architect</p>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <a onClick={() => navigate('/dashboard/principal')} style={styles.navLink}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Overview</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/students')} style={styles.navLink}>
                        <span className="material-symbols-outlined">group</span>
                        <span>Students</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/teachers')} style={styles.navLink}>
                        <span className="material-symbols-outlined">person_book</span>
                        <span>Teachers</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/attendance')} style={styles.navLink}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>Attendance</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/fees')} style={styles.navLink}>
                        <span className="material-symbols-outlined">payments</span>
                        <span>Fees</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/homework')} style={styles.navLink}>
                        <span className="material-symbols-outlined">assignment</span>
                        <span>Homework</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/marks')} style={styles.navLink}>
                        <span className="material-symbols-outlined">grade</span>
                        <span>Marks</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/reports')} style={styles.navLinkActive}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>assessment</span>
                        <span>Reports</span>
                    </a>
                </nav>
            </aside>

            <div style={styles.main}>
                <header style={styles.header} className="no-print">
                    <h2 style={styles.headerTitle}>Institutional Reports</h2>
                    <div 
                        style={{display:'flex', alignItems:'center', gap:'16px', position: 'relative', cursor: 'pointer'}}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div style={{textAlign:'right'}}>
                            <p style={{fontSize:'13px', fontWeight:'600', color:'#111827', margin:0}}>School Principal</p>
                            <p style={{fontSize:'10px', color:'#6B7280', margin:0, textTransform:'uppercase'}}>Principal Portal</p>
                        </div>
                        <div style={{width:'36px', height:'36px', backgroundColor:'#F3F4F6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF'}}>
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
                </header>

                <main style={styles.content}>
                    <div className="no-print">
                        <div style={{marginBottom:'32px'}}>
                            <h1 style={{fontSize:'32px', fontWeight:'800', margin:0, letterSpacing:'-0.02em'}}>Scholastic Audit</h1>
                            <p style={{fontSize:'14px', color:'#6B7280', margin:'4px 0 0 0'}}>Generate consolidated academic and financial transcripts.</p>
                        </div>

                        <div style={styles.tabsWrapper}>
                            <button onClick={() => { setActiveTab('attendance'); setData(null); }} style={styles.tab(activeTab === 'attendance')}>Attendance Audit</button>
                            <button onClick={() => { setActiveTab('fee'); setData(null); }} style={styles.tab(activeTab === 'fee')}>Financial Audit</button>
                            <button onClick={() => { setActiveTab('academic'); setData(null); }} style={styles.tab(activeTab === 'academic')}>Academic Analysis</button>
                            <button onClick={() => { setActiveTab('report-card'); setData(null); }} style={styles.tab(activeTab === 'report-card')}>Student Record</button>
                        </div>

                        {activeTab !== 'report-card' && (
                            <div style={styles.filtersRow}>
                                {activeTab === 'attendance' && (
                                    <>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Class</label>
                                            <select style={styles.select} value={attFilters.class} onChange={(e)=>setAttFilters({...attFilters, class: e.target.value})}>
                                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Section</label>
                                            <select style={styles.select} value={attFilters.section} onChange={(e)=>setAttFilters({...attFilters, section: e.target.value})}>
                                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Month</label>
                                            <select style={styles.select} value={attFilters.month} onChange={(e)=>setAttFilters({...attFilters, month: e.target.value})}>
                                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'fee' && (
                                    <>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Month</label>
                                            <select style={styles.select} value={feeFilters.month} onChange={(e)=>setFeeFilters({...feeFilters, month: e.target.value})}>
                                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </div>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Year</label>
                                            <select style={styles.select} value={feeFilters.year} onChange={(e)=>setFeeFilters({...feeFilters, year: e.target.value})}>
                                                <option value="2026">2026</option>
                                                <option value="2025">2025</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'academic' && (
                                    <>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Class</label>
                                            <select style={styles.select} value={academicFilters.class} onChange={(e)=>setAcademicFilters({...academicFilters, class: e.target.value})}>
                                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div style={styles.filterItem}>
                                            <label style={styles.filterLabel}>Exam Type</label>
                                            <select style={styles.select} value={academicFilters.exam_type} onChange={(e)=>setAcademicFilters({...academicFilters, exam_type: e.target.value})}>
                                                {['Unit Test', 'Mid Term', 'Final Exam', 'Assignment'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div style={{...styles.filterItem, flex:'none'}}>
                                    <button 
                                        onClick={activeTab === 'attendance' ? fetchAttendanceReport : activeTab === 'fee' ? fetchFeeReport : fetchAcademicReport}
                                        style={{...styles.select, backgroundColor:'#2563EB', color:'#FFFFFF', border:'none', width:'140px', fontWeight:'700'}}
                                    >Generate</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'report-card' && (
                            <div style={{...styles.filtersRow, maxWidth:'400px', margin:'0 auto 40px auto'}}>
                                <div style={styles.filterItem}>
                                    <label style={styles.filterLabel}>Select Student</label>
                                    <select style={styles.select} value={selectedStudent} onChange={(e)=>setSelectedStudent(e.target.value)}>
                                        <option value="">Choose student profile...</option>
                                        {allStudents.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div style={{textAlign:'center', padding:'64px'}}>
                            <div className="spinner" style={{width:'32px', height:'32px', border:'4px solid #F3F4F6', borderTop:'4px solid #2563EB', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px auto'}}></div>
                            <p style={{fontSize:'12px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em'}}>Aggregating Scholastic Data...</p>
                        </div>
                    ) : data ? (
                        <>
                            {activeTab === 'attendance' && (
                                <>
                                    <div style={styles.statsGrid}>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Total Students</span>
                                            <h3 style={styles.statsValue}>{data.totalStudents}</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Class Average</span>
                                            <h3 style={{...styles.statsValue, color:'#2563EB'}}>{data.classAvg}%</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Critical (&lt;75%)</span>
                                            <h3 style={{...styles.statsValue, color:'#EF4444'}}>{data.below75Count}</h3>
                                        </div>
                                    </div>
                                    <div style={styles.tableCard}>
                                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Roll No</th>
                                                    <th style={styles.th}>Student Name</th>
                                                    <th style={styles.th}>Present/Total</th>
                                                    <th style={styles.th}>Percentage</th>
                                                    <th style={styles.th}>Status Badge</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.breakdown.map(s => (
                                                    <tr key={s.id}>
                                                        <td style={styles.td}>{s.roll_number}</td>
                                                        <td style={{...styles.td, fontWeight:'700'}}>{s.full_name}</td>
                                                        <td style={styles.td}>{s.present} / {s.total}</td>
                                                        <td style={{...styles.td, fontWeight:'800'}}>{s.percentage}%</td>
                                                        <td style={styles.td}>
                                                            <span style={styles.gradeBadge(s.percentage >= 75 ? '#16A34A' : '#DC2626', s.percentage >= 75 ? '#DCFCE7' : '#FEE2E2')}>
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'fee' && (
                                <>
                                    <div style={styles.statsGrid}>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Gross Collected</span>
                                            <h3 style={{...styles.statsValue, color:'#16A34A'}}>₹{data.totalCollected}</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Net Pending</span>
                                            <h3 style={{...styles.statsValue, color:'#2563EB'}}>₹{data.totalPending}</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Critical Overdue</span>
                                            <h3 style={{...styles.statsValue, color:'#EF4444'}}>₹{data.totalOverdue}</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Collection Rate</span>
                                            <h3 style={styles.statsValue}>{data.collectionPercentage}%</h3>
                                        </div>
                                    </div>
                                    <div style={styles.tableCard}>
                                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Financial Record</th>
                                                    <th style={styles.th}>Student Name</th>
                                                    <th style={styles.th}>Due Date</th>
                                                    <th style={styles.th}>Amount</th>
                                                    <th style={styles.th}>Settlement</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.records.map(f => (
                                                    <tr key={f.id}>
                                                        <td style={styles.td}>
                                                            <div style={{fontWeight:'700'}}>{f.fee_type}</div>
                                                            <div style={{fontSize:'10px', color:'#9CA3AF'}}>{f.month} {f.year || '2026'}</div>
                                                        </td>
                                                        <td style={styles.td}>{f.student?.full_name}</td>
                                                        <td style={styles.td}>{new Date(f.due_date).toLocaleDateString()}</td>
                                                        <td style={{...styles.td, fontWeight:'800'}}>₹{f.amount}</td>
                                                        <td style={styles.td}>
                                                            <span style={styles.gradeBadge(f.status === 'paid' ? '#16A34A' : '#DC2626', f.status === 'paid' ? '#DCFCE7' : '#FEE2E2')}>
                                                                {f.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'academic' && (
                                <>
                                    <div style={styles.statsGrid}>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Class Avg %</span>
                                            <h3 style={styles.statsValue}>{data.classAvg}%</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Highest Score</span>
                                            <h3 style={{...styles.statsValue, color:'#16A34A'}}>{data.highest}%</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Passed Count</span>
                                            <h3 style={{...styles.statsValue, color:'#2563EB'}}>{data.passCount}</h3>
                                        </div>
                                        <div style={styles.statsCard}>
                                            <span style={styles.statsLabel}>Correction Needed</span>
                                            <h3 style={{...styles.statsValue, color:'#EF4444'}}>{data.failCount}</h3>
                                        </div>
                                    </div>
                                    <div style={styles.tableCard}>
                                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Student Name</th>
                                                    <th style={styles.th}>Subject Area</th>
                                                    <th style={styles.th}>Audit Score</th>
                                                    <th style={styles.th}>Scholastic Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.records.map(r => (
                                                    <tr key={r.id}>
                                                        <td style={{...styles.td, fontWeight:'700'}}>{r.student?.full_name}</td>
                                                        <td style={styles.td}>{r.subject}</td>
                                                        <td style={styles.td}>
                                                            <div style={{fontWeight:'800'}}>{r.marks_obtained} / {r.total_marks}</div>
                                                            <div style={{fontSize:'10px', color:'#2563EB'}}>{r.percentage}% Achievement</div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.gradeBadge(r.grade === 'F' ? '#DC2626' : '#111827', r.grade === 'F' ? '#FEE2E2' : '#F3F4F6')}>
                                                                {r.grade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'report-card' && (
                                <div style={{background:'#F3F4F6', padding:'48px 0', borderRadius:'24px'}}>
                                    <div style={styles.reportCard}>
                                        <div style={styles.reportHeader}>
                                            <span style={styles.reportSubtitle}>Official Scholastic Transcript</span>
                                            <h1 style={styles.schoolName}>DAV Centenary Public School</h1>
                                            <p style={{fontSize:'10px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', margin:0, letterSpacing:'0.1em'}}>Academic Session 2023 - 2024</p>
                                        </div>

                                        <div style={styles.studentMetaGrid}>
                                            <div style={styles.metaItem}>
                                                <span style={styles.metaLabel}>Student Designation</span>
                                                <span style={styles.metaValue}>{data.student.full_name}</span>
                                            </div>
                                            <div style={styles.metaItem}>
                                                <span style={styles.metaLabel}>Institutional Roll No</span>
                                                <span style={styles.metaValue}>{data.student.roll_number}</span>
                                            </div>
                                            <div style={styles.metaItem}>
                                                <span style={styles.metaLabel}>Class & Subsection</span>
                                                <span style={styles.metaValue}>{data.student.class} - {data.student.section}</span>
                                            </div>
                                        </div>

                                        <div style={{marginBottom:'40px'}}>
                                            <h4 style={{fontSize:'11px', fontWeight:'800', color:'#111827', textTransform:'uppercase', marginBottom:'16px'}}>I. Academic Achievement Matrix</h4>
                                            <table style={{width:'100%', borderCollapse:'collapse', border:'2px solid #F3F4F6', borderRadius:'8px', overflow:'hidden'}}>
                                                <thead>
                                                    <tr style={{backgroundColor:'#F9FAFB'}}>
                                                        <th style={{...styles.td, fontSize:'10px', fontWeight:'800'}}>Subject Body</th>
                                                        <th style={{...styles.td, fontSize:'10px', fontWeight:'800', textAlign:'center'}}>Max Score</th>
                                                        <th style={{...styles.td, fontSize:'10px', fontWeight:'800', textAlign:'center'}}>Achieved</th>
                                                        <th style={{...styles.td, fontSize:'10px', fontWeight:'800', textAlign:'center'}}>Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.marks.map(m => (
                                                        <tr key={m.id}>
                                                            <td style={{...styles.td, fontSize:'12px', fontWeight:'700'}}>{m.subject}</td>
                                                            <td style={{...styles.td, fontSize:'12px', textAlign:'center'}}>{m.total_marks}</td>
                                                            <td style={{...styles.td, fontSize:'12px', textAlign:'center', fontWeight:'800'}}>{m.marks_obtained}</td>
                                                            <td style={{...styles.td, textAlign:'center'}}>
                                                                <span style={{fontWeight:'900', color: m.grade === 'F' ? '#EF4444' : '#111827'}}>{m.grade}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr style={{backgroundColor:'#F9FAFB', borderTop:'2px solid #F3F4F6'}}>
                                                        <td style={{...styles.td, fontWeight:'800'}} colSpan="2">Aggregate Scholastic Score</td>
                                                        <td style={{...styles.td, textAlign:'center', fontWeight:'900', fontSize:'16px'}} colSpan="2">{data.attendanceSummary.percentage}% Overall</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', marginTop:'64px'}}>
                                            <div style={{textAlign:'center'}}>
                                                <div style={{height:'1px', backgroundColor:'#E5E7EB', marginBottom:'12px'}}></div>
                                                <p style={styles.metaLabel}>Signature of Principal</p>
                                                <p style={{fontSize:'9px', color:'#9CA3AF'}}>Dr. Julian Vance</p>
                                            </div>
                                            <div style={{textAlign:'center'}}>
                                                <div style={{height:'1px', backgroundColor:'#E5E7EB', marginBottom:'12px'}}></div>
                                                <p style={styles.metaLabel}>Signature of Parent</p>
                                                <p style={{fontSize:'9px', color:'#9CA3AF'}}>Date: _________________</p>
                                            </div>
                                        </div>

                                        <p style={{textAlign:'center', fontSize:'8px', color:'#9CA3AF', marginTop:'48px'}}>This is a verified institutional record generated via EduSync Academic Architecture. Valid without seal if digital signature is present.</p>
                                    </div>

                                    <button onClick={handlePrint} style={styles.printBtn} className="no-print">
                                        <span className="material-symbols-outlined">print</span>
                                        Print Official Transcript
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{height:'300px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#9CA3AF'}} className="no-print">
                            <span className="material-symbols-outlined" style={{fontSize:'64px', marginBottom:'16px', opacity:0.2}}>summarize</span>
                            <p style={{fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.1em'}}>Configure filters to generate institutional audit</p>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    #root { background: white !important; }
                }
            `}</style>
        </div>
    );
};

export default Reports;

