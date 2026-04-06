import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Menu, X, Users, BookOpen, GraduationCap, Calendar, Bell, 
  ClipboardCheck, TrendingUp, Save, BarChart2, Award, Target, LogOut, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const Marks = () => {
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    const [examType, setExamType] = useState('Unit Test');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState('');
  const [stats, setStats] = useState({ pendingLeaves: 0 });

    const navigate = useNavigate();
    const EXAM_TYPES = ['Unit Test', 'Class Test', 'Mid Term', 'Half Yearly', 'Final Exam', 'Assignment'];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const teacherRes = await axios.get(`${API}/api/teachers/profile`, {
                params: { email: user.email }
            });
            const profile = teacherRes.data;
            setTeacherProfile(profile);
            setSubject(profile.subject || '');

            const [studentsRes, existingMarksRes, leavesRes] = await Promise.all([
                axios.get(`${API}/api/students`, {
                  params: { class: profile.class_assigned, section: profile.section_assigned }
                }),
                axios.get(`${API}/api/marks`, {
                  params: { 
                    class: profile.class_assigned, 
                    section: profile.section_assigned,
                    exam_type: examType,
                    subject: subject || profile.subject
                  }
                }),
                axios.get(`${API}/api/leave/teacher`, { 
                  params: { class: profile.class_assigned, section: profile.section_assigned, status: 'pending' } 
                })
            ]);
            
            setStudents(studentsRes.data);
            setStats({ pendingLeaves: leavesRes.data.length || 0 });
            
            const existing = {};
            existingMarksRes.data.forEach(m => {
                existing[m.student_id] = {
                    obtained: m.marks_obtained,
                    total: m.total_marks
                };
            });
            setMarksData(existing);
        } catch (error) {
            console.error("Marks Fetch Error:", error);
        }
    }, [navigate, examType, subject]);

    const exportCSV = () => {
        const sortedData = students.map(s => {
            const m = marksData[s.id] || { obtained: 0, total: 100 };
            const perc = (Number(m.obtained) / Number(m.total)) * 100;
            let grade = 'F';
            if(perc >= 90) grade = 'A+';
            else if(perc >= 80) grade = 'A';
            else if(perc >= 70) grade = 'B';
            else if(perc >= 60) grade = 'C';
            else if(perc >= 50) grade = 'D';
            
            return {
                roll: s.roll_number,
                name: s.full_name,
                obtained: m.obtained,
                total: m.total,
                percentage: perc.toFixed(1) + '%',
                grade: grade
            };
        }).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

        const headers = ['Rank', 'Roll No', 'Name', 'Obtained', 'Total', 'Percentage', 'Grade'];
        const rows = sortedData.map((d, i) => [
            i + 1, d.roll, d.name, d.obtained, d.total, d.percentage, d.grade
        ]);
        
        const csv = [headers, ...rows]
            .map(r => r.join(','))
            .join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merit-list-${subject}-${examType}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarksChange = (studentId, field, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const saveSingleRecord = async (studentId) => {
        const data = marksData[studentId];
        if (!data || !data.obtained || !data.total) return alert('Enter valid marks');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await axios.post(`${API}/api/marks/save`, {
                student_id: studentId,
                class: teacherProfile.class_assigned,
                section: teacherProfile.section_assigned,
                subject: subject,
                exam_type: examType,
                exam_date: examDate,
                marks_obtained: data.obtained,
                total_marks: data.total,
                marked_by: user.email
            });
            alert('Progress saved');
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    const saveAllMarks = async () => {
        try {
            const marksToSave = students.map(s => ({
                student_id: s.id,
                teacher_id: teacherProfile?.id || null,
                class: teacherProfile?.class_assigned,
                section: teacherProfile?.section_assigned,
                subject: subject,
                exam_type: examType,
                marks_obtained: Number(marksData[s.id]?.obtained || 0),
                total_marks: Number(marksData[s.id]?.total || 100),
                exam_date: examDate
            }));

            if (marksToSave.length === 0) return alert('No records to save');
            await axios.post(`${API}/api/marks/bulk`, { marks: marksToSave });
            alert(`Bulk synchronized ${marksToSave.length} records!`);
            fetchData();
        } catch (err) {
            console.error("Bulk Save Error:", err);
            alert('Sync failed');
        }
    };

    const analytics = useMemo(() => {
        const scores = Object.values(marksData)
            .filter(m => m.obtained && m.total)
            .map(m => (m.obtained / m.total) * 100);
        
        if (scores.length === 0) return null;
        const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        
        let highest = { name: 'N/A', score: -1 };
        let lowest = { name: 'N/A', score: 101 };

        students.forEach(s => {
            const m = marksData[s.id];
            if (m?.obtained && m?.total) {
                const perc = (m.obtained / m.total) * 100;
                if (perc > highest.score) highest = { name: s.full_name, score: perc };
                if (perc < lowest.score) lowest = { name: s.full_name, score: perc };
            }
        });

        const chartData = students
            .filter(s => marksData[s.id])
            .map(s => ({
                name: s.full_name.split(' ')[0],
                score: ((marksData[s.id].obtained / marksData[s.id].total) * 100).toFixed(1)
            }));

        return { avg, highest, lowest, chartData };
    }, [marksData, students]);

    const styles = {
        pageWrapper: {
            position: 'relative', minHeight: '100vh', width: '100%',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: 'white'
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
        glassCard: {
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)', padding: '24px', marginBottom: '32px'
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
                        { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: stats.pendingLeaves },
                        { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
                    ].map(item => (
                        <button key={item.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'16px', color: '#fff', opacity: (window.location.pathname === item.path ? 1 : 0.6), background: (window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent'), border:'none', width:'100%', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'6px', transition:'0.2s', textAlign:'left', position: 'relative'}} onClick={() => { navigate(item.path); if(isMobile) setMenuOpen(false); }}>
                            {item.icon} {item.label}
                            {item.badge > 0 && (
                                <span style={{
                                    position: 'absolute', top: -4, right: -4,
                                    backgroundColor: 'red', borderRadius: 10,
                                    width: 18, height: 18, fontSize: 11, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button 
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#FF4D4D',
                            fontSize: '14px',
                            fontWeight: '700',
                            backgroundColor: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid rgba(255, 77, 77, 0.2)',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <div style={styles.headerGlass}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                    {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{cursor:'pointer', color:'white'}} />}
                    <h1 style={{ color: 'white', fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: 0 }}>Academic Records</h1>
                    <button 
                        onClick={exportCSV}
                        style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'10px 16px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700}}
                    >
                        <Download size={16} /> {isMobile ? '' : 'Export Merit List'}
                    </button>
                  </div>
                </div>

                <div style={styles.glassCard}>
                    <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap:20, marginBottom:30 }}>
                        <div>
                            <label style={{ fontSize:10, fontWeight:800, opacity:0.6, marginBottom:8, display:'block', color:'white' }}>EXAM CYCLE</label>
                            <select value={examType} onChange={e => setExamType(e.target.value)} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }} >
                                {EXAM_TYPES.map(t => (
                                    <option key={t} value={t} style={{backgroundColor:'#1a1a2e', color:'white'}}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize:10, fontWeight:800, opacity:0.6, marginBottom:8, display:'block', color:'white' }}>EXAM DATE</label>
                            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'12px', color:'white', width:'100%', outline:'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize:10, fontWeight:800, opacity:0.6, marginBottom:8, display:'block', color:'white' }}>SUBJECT</label>
                            <input placeholder="Enter Subject" value={subject} onChange={e => setSubject(e.target.value)} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'12px', color:'white', width:'100%', outline:'none' }} />
                        </div>
                        <div style={{ display:'flex', alignItems:'flex-end' }}>
                            <button onClick={saveAllMarks} style={{ width:'100%', padding:'12px', background:'#2563EB', color:'white', border:'none', borderRadius:12, fontWeight:800, cursor:'pointer' }}>Save All Marks</button>
                        </div>
                    </div>

                    <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', minWidth: isMobile ? '600px' : 'auto' }}>
                            <thead>
                                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding:16, textAlign:'left', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:800 }}>ROLL</th>
                                    <th style={{ padding:16, textAlign:'left', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:800 }}>SCHOLAR NAME</th>
                                    <th style={{ padding:16, textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:800 }}>OBTAINED</th>
                                    <th style={{ padding:16, textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:800 }}>TOTAL</th>
                                    <th style={{ padding:16, textAlign:'right', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:800 }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding:16, fontWeight:800, color:'rgba(255,255,255,0.5)' }}>{s.roll_number}</td>
                                        <td style={{ padding:16, fontWeight:700, color:'white' }}>{s.full_name}</td>
                                        <td style={{ padding:16, textAlign:'center' }}>
                                            <input type="number" value={marksData[s.id]?.obtained || ''} onChange={e => handleMarksChange(s.id, 'obtained', e.target.value)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:8, color:'white', width:60, textAlign:'center', outline:'none' }} />
                                        </td>
                                        <td style={{ padding:16, textAlign:'center' }}>
                                            <input type="number" value={marksData[s.id]?.total || 100} onChange={e => handleMarksChange(s.id, 'total', e.target.value)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:8, color:'white', width:60, textAlign:'center', outline:'none' }} />
                                        </td>
                                        <td style={{ padding:16, textAlign:'right' }}>
                                            <button onClick={() => saveSingleRecord(s.id)} style={{ padding:8, background:'rgba(255,255,255,0.1)', color:'white', border:'none', borderRadius:8, cursor:'pointer' }}><Save size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={styles.glassCard}>
                    <h2 style={{ fontSize:18, fontWeight:800, marginBottom:30, display:'flex', alignItems:'center', gap:10, color:'white' }}>
                        <BarChart2 size={22} className="text-blue-500" /> Performance Analytics
                    </h2>
                    
                    {analytics ? (
                        <>
                            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:20, marginBottom:40 }}>
                                <div style={{ background:'rgba(255,255,255,0.03)', padding:20, borderRadius:20, border:'1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize:11, fontWeight:800, opacity:0.5, marginBottom:8, color:'white' }}>AVERAGE SCORE</p>
                                    <h3 style={{ fontSize:28, fontWeight:900, margin:0, color:'white' }}>{analytics.avg}%</h3>
                                </div>
                                <div style={{ background:'rgba(255,255,255,0.03)', padding:20, borderRadius:20, border:'1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize:11, fontWeight:800, opacity:0.5, marginBottom:8, color:'white' }}>TOPPER</p>
                                    <h3 style={{ fontSize:16, fontWeight:800, margin:0, color:'#22C55E' }}>{analytics.highest.name}</h3>
                                    <p style={{ fontSize:12, fontWeight:700, margin:0, opacity:0.6, color:'white' }}>Score: {analytics.highest.score}%</p>
                                </div>
                                <div style={{ background:'rgba(255,255,255,0.03)', padding:20, borderRadius:20, border:'1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize:11, fontWeight:800, opacity:0.5, marginBottom:8, color:'white' }}>LOWEST</p>
                                    <h3 style={{ fontSize:16, fontWeight:800, margin:0, color:'#EF4444' }}>{analytics.lowest.name}</h3>
                                    <p style={{ fontSize:12, fontWeight:700, margin:0, opacity:0.6, color:'white' }}>Score: {analytics.lowest.score}%</p>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: 280, minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip contentStyle={{ background:'rgba(0,0,0,0.8)', border:'none', borderRadius:12, fontSize:12 }} />
                                        <Bar dataKey="score" radius={[6,6,0,0]}>
                                            {analytics.chartData.map((entry, index) => (
                                                <Cell key={index} fill={entry.score >= 80 ? '#22C55E' : entry.score >= 50 ? '#3B82F6' : '#EF4444'} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding:60, textAlign:'center', opacity:0.3 }}>
                            <Target size={48} style={{ marginBottom:16 }} />
                            <p>Real-time analytics will appear as you enter marks</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Marks;
