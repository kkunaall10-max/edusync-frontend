import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
// const natureBg = '/nature-bg.jpg';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const TeacherDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [studentsCount, setStudentsCount] = useState(0);
    const [recentHomework, setRecentHomework] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, total: 0 });
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const teacherRes = await axios.get(`${API_BASE_URL}/teachers`, { params: { email: user.email } });
            if (teacherRes.data && teacherRes.data.length > 0) {
                const profile = teacherRes.data[0];
                setTeacherProfile(profile);

                const { class_assigned: className, section_assigned: section } = profile;

                const studentsRes = await axios.get(`${API_BASE_URL}/students`, { 
                    params: { class: className, section: section } 
                });
                setStudentsCount(studentsRes.data.filter(s => s.is_active).length);

                const homeworkRes = await axios.get(`${API_BASE_URL}/homework`, { 
                    params: { class: className, section: section } 
                });
                setRecentHomework(homeworkRes.data.slice(0, 3));

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 font-['Inter'] relative">
                <div 
                    className="absolute inset-0 opacity-40 bg-cover bg-center"
                    style={{ backgroundImage: "url('/nature-bg.jpg')" }}
                ></div>
                <div className="relative z-10 text-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium">Syncing Faculty Data...</p>
                </div>
            </div>
        );
    }

    const styles = {
        glass: {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px'
        },
        statCard: {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative'
        },
        quickActionBtn: {
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease'
        }
    };

    const attendancePercentage = attendanceStats.total > 0 
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
        : 0;

    return (
        <div className="min-h-screen relative font-['Inter'] bg-slate-900 overflow-x-hidden">
            <div 
                className="fixed inset-0 bg-cover bg-center z-0 opacity-60"
                style={{ backgroundImage: "url('/nature-bg.jpg')" }}
            ></div>
            
            <div className="relative z-10">
                <Layout role="teacher">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Welcome Header */}
                        <section>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight m-0">
                                Good morning, {teacherProfile?.full_name?.split(' ')[0]}
                            </h2>
                            <p className="text-lg md:text-xl text-white/70 mt-4 max-w-2xl">
                                Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. 
                                You have {recentHomework.length} active assignments in {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}.
                            </p>
                        </section>

                        {/* Stats & Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* My Class */}
                            <div style={styles.statCard}>
                                <p className="text-5xl md:text-6xl font-extrabold text-white mb-6 m-0 leading-none">
                                    {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}
                                </p>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Primary Class</span>
                                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white">{teacherProfile?.subject}</span>
                                </div>
                            </div>

                            {/* Total Students */}
                            <div style={styles.statCard}>
                                <p className="text-5xl md:text-6xl font-extrabold text-white mb-6 m-0 leading-none">
                                    {studentsCount}
                                </p>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Total Students</span>
                                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white">Assigned</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div style={{...styles.glass, padding:'24px'}} className="flex flex-col justify-center gap-3 md:col-span-2 lg:col-span-1">
                                <button onClick={() => navigate('/dashboard/teacher/attendance')} style={styles.quickActionBtn} className="hover:bg-white/20">
                                    <span className="material-symbols-outlined">how_to_reg</span>
                                    <span>Mark Attendance</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/teacher/homework')} style={styles.quickActionBtn} className="hover:bg-white/20">
                                    <span className="material-symbols-outlined">add_task</span>
                                    <span>Add Homework</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/teacher/marks')} style={styles.quickActionBtn} className="hover:bg-white/20">
                                    <span className="material-symbols-outlined">edit_square</span>
                                    <span>Enter Marks</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Split: Recent Homework & Attendance Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                            {/* Recent Homework List */}
                            <div style={{...styles.glass, padding:'24px md:32px'}} className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold text-white m-0">Recent Homework</h3>
                                    <button onClick={() => navigate('/dashboard/teacher/homework')} className="text-xs font-bold text-white/60 uppercase tracking-widest border-b border-white/20 bg-transparent cursor-pointer">View All</button>
                                </div>
                                <div className="space-y-6">
                                    {recentHomework.length === 0 ? (
                                        <p className="text-center py-10 text-white/50">No active homework assigned.</p>
                                    ) : recentHomework.map((hw, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                                                <span className="material-symbols-outlined">menu_book</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-base font-bold text-white m-0 truncate">{hw.title}</h4>
                                                    <span className="text-[10px] bg-white/15 px-2 py-1 rounded text-white/80 whitespace-nowrap">{new Date(hw.due_date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-white/60 mb-3">{hw.class}-{hw.section} • {hw.subject}</p>
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="w-[85%] h-full bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attendance Summary Card */}
                            <div style={{...styles.glass, padding:'24px md:32px'}} className="p-6 md:p-8 flex flex-col items-center">
                                <div className="w-full text-left mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold text-white m-0">Daily Attendance</h3>
                                    <p className="text-xs text-white/60 mt-1">Summary for {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned} today</p>
                                </div>
                                
                                <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="50%" cy="50%" r="44%" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                                        <circle 
                                            cx="50%" cy="50%" r="44%" fill="transparent" stroke="#FFFFFF" strokeWidth="10" 
                                            strokeDasharray="276" 
                                            strokeDashoffset={276 - (276 * attendancePercentage) / 100} 
                                            strokeLinecap="round" 
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                        <span className="text-3xl md:text-4xl font-extrabold">{attendancePercentage}%</span>
                                        <span className="text-[10px] uppercase font-bold text-white/60">Present</span>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                                            <span className="text-sm font-medium">Present Today</span>
                                        </div>
                                        <span className="font-bold">{attendanceStats.present}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white/30"></span>
                                            <span className="text-sm font-medium">Absent</span>
                                        </div>
                                        <span className="font-bold">{attendanceStats.absent}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </div>
        </div>
    );
};

export default TeacherDashboard;

