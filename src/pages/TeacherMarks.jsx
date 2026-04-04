import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import natureBg from '../assets/nature-bg.jpg';

const STUDENTS_API_URL = 'https://edusync.up.railway.app/api/students';
const MARKS_API_URL = 'https://edusync.up.railway.app/api/marks';
const TEACHERS_API_URL = 'https://edusync.up.railway.app/api/teachers';

const TeacherMarks = () => {
    const role = 'teacher';
    const [activeTab, setActiveTab] = useState('enterMarks'); 
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [marks, setMarks] = useState({});
    const [previousResults, setPreviousResults] = useState([]);

    const [examConfig, setExamConfig] = useState({
        examType: 'Mid Term',
        examDate: new Date().toISOString().split('T')[0],
        totalMarks: 100
    });

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    const tRes = await axios.get(TEACHERS_API_URL, { params: { email: user.email } });
                    if (tRes.data && tRes.data.length > 0) {
                        const profile = tRes.data[0];
                        setTeacherProfile(profile);
                        
                        const sRes = await axios.get(STUDENTS_API_URL, { 
                            params: { class: profile.class_assigned, section: profile.section_assigned } 
                        });
                        setStudents(sRes.data);
                    }
                } catch (err) { console.error(err); }
                finally { setLoading(false); }
            }
        };
        fetchAll();
    }, []);

    const fetchPreviousResults = async () => {
        if (!teacherProfile) return;
        setLoading(true);
        try {
            const res = await axios.get(MARKS_API_URL, { 
                params: { class: teacherProfile.class_assigned, section: teacherProfile.section_assigned } 
            });
            setPreviousResults(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (activeTab === 'previousResults') fetchPreviousResults(); }, [activeTab]);

    const handleMarkChange = (studentId, value) => {
        const numValue = Math.min(examConfig.totalMarks, Math.max(0, parseInt(value) || 0));
        setMarks(prev => ({ ...prev, [studentId]: numValue }));
    };

    const calculateGrade = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const marksData = Object.entries(marks).map(([studentId, score]) => ({
                student_id: studentId,
                exam_type: examConfig.examType,
                subject: teacherProfile?.subject_assigned,
                marks_obtained: score,
                total_marks: examConfig.totalMarks,
                exam_date: examConfig.examDate,
                grade: calculateGrade(score, examConfig.totalMarks)
            }));
            await axios.post(`${MARKS_API_URL}/bulk`, { marksData });
            alert('Academic records synchronized.');
            setMarks({});
        } catch (err) { alert('Synchronization failed.'); }
        finally { setSaving(false); }
    };

    const styles = {
        outerWrapper: { position: 'relative', minHeight: '100vh', width: '100%', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" },
        backgroundDiv: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundImage: `url(${natureBg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
        sidebar: { width: sidebarOpen ? '240px' : '0px', height: '100vh', position: 'fixed', left: 0, top: 0, padding: sidebarOpen ? '24px' : '0', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(30px)', transition: 'all 0.3s ease', overflow: 'hidden', zIndex: 50 },
        main: { marginLeft: sidebarOpen ? '240px' : '0px', padding: '40px', paddingTop: '100px', flex: 1, minHeight: '100vh', transition: 'margin 0.3s ease', position: 'relative', zIndex: 5 },
        glassPanel: { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px' },
        navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', marginBottom: '8px', textDecoration: 'none' },
        navLinkActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#FFFFFF', background: 'rgba(255,255,255,0.2)', fontWeight: '700', marginBottom: '8px' },
        tabBtn: (active) => ({ padding: '12px 32px', border: 'none', background: active ? 'white' : 'transparent', color: active ? 'black' : 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }),
        input: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', padding: '12px', outline: 'none' }
    };

    return (
        <div style={styles.outerWrapper}>
            <div style={styles.backgroundDiv}><div style={{ background: 'rgba(0,0,0,0.5)', width: '100%', height: '100%' }}></div></div>
            <aside style={styles.sidebar}>
                <div style={{ marginBottom: '40px', padding: '0 8px' }}><h1 style={{ fontSize: '24px', fontWeight: '800' }}>EduSync</h1><p style={{ fontSize: '10px', opacity: 0.5 }}>ACADEMIC ATELIER</p></div>
                <nav>
                    <div onClick={() => navigate('/dashboard/teacher')} style={styles.navLink}><span className="material-symbols-outlined">dashboard</span><span>Overview</span></div>
                    <div onClick={() => navigate('/dashboard/teacher/students')} style={styles.navLink}><span className="material-symbols-outlined">group</span><span>My Students</span></div>
                    <div onClick={() => navigate('/dashboard/teacher/attendance')} style={styles.navLink}><span className="material-symbols-outlined">fact_check</span><span>Attendance</span></div>
                    <div onClick={() => navigate('/dashboard/teacher/homework')} style={styles.navLink}><span className="material-symbols-outlined">assignment</span><span>Homework</span></div>
                    <div onClick={() => navigate('/dashboard/teacher/marks')} style={styles.navLinkActive}><span className="material-symbols-outlined">grade</span><span>Marks</span></div>
                </nav>
            </aside>
            <main style={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div><h2 style={{ fontSize: '48px', fontWeight: '800' }}>Performance Portal</h2><p style={{ opacity: 0.6 }}>Scholastic evaluation and grading.</p></div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '16px', display: 'flex', gap: '8px' }}>
                        <button style={styles.tabBtn(activeTab === 'enterMarks')} onClick={() => setActiveTab('enterMarks')}>Enter Marks</button>
                        <button style={styles.tabBtn(activeTab === 'previousResults')} onClick={() => setActiveTab('previousResults')}>Previous Results</button>
                    </div>
                </div>

                {activeTab === 'enterMarks' ? (
                    <div style={{ display: 'grid', gap: '32px' }}>
                        <div style={{ ...styles.glassPanel, padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            <div><label>Exam Type</label><select style={{ ...styles.input, width: '100%' }} value={examConfig.examType} onChange={(e) => setExamConfig({ ...examConfig, examType: e.target.value })}><option>Mid Term</option><option>Final Exam</option><option>Unit Test</option></select></div>
                            <div><label>Exam Date</label><input type="date" style={{ ...styles.input, width: '100%' }} value={examConfig.examDate} onChange={(e) => setExamConfig({ ...examConfig, examDate: e.target.value })} /></div>
                            <div><label>Total Marks</label><input type="number" style={{ ...styles.input, width: '100%' }} value={examConfig.totalMarks} onChange={(e) => setExamConfig({ ...examConfig, totalMarks: parseInt(e.target.value) })} /></div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button onClick={handleSave} disabled={saving} style={{ width: '100%', height: '48px', background: 'white', color: 'black', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>{saving ? 'Syncing...' : 'Bulk Sync'}</button></div>
                        </div>

                        <div style={styles.glassPanel}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}><th style={{ padding: '20px' }}>Student</th><th style={{ padding: '20px' }}>Score</th><th style={{ padding: '20px' }}>Grade</th></tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}><td style={{ padding: '20px' }}>{s.full_name}</td><td style={{ padding: '20px' }}><input type="number" style={{ ...styles.input, width: '80px', textAlign: 'center' }} value={marks[s.id] || ''} onChange={(e) => handleMarkChange(s.id, e.target.value)} /> / {examConfig.totalMarks}</td><td style={{ padding: '20px' }}><span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>{calculateGrade(marks[s.id] || 0, examConfig.totalMarks)}</span></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={styles.glassPanel}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}><th style={{ padding: '20px' }}>Student</th><th style={{ padding: '20px' }}>Exam</th><th style={{ padding: '20px' }}>Subject</th><th style={{ padding: '20px' }}>Score</th><th style={{ padding: '20px' }}>Grade</th></tr></thead>
                            <tbody>
                                {previousResults.map(r => (
                                    <tr key={r.id}><td style={{ padding: '20px' }}>{r.student_name}</td><td style={{ padding: '20px' }}>{r.exam_type}</td><td style={{ padding: '20px' }}>{r.subject}</td><td style={{ padding: '20px' }}>{r.marks_obtained} / {r.total_marks}</td><td style={{ padding: '20px' }}>{r.grade}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherMarks;

