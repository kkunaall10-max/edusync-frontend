import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

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

    const attendancePercentage = attendanceStats.total > 0 
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
        : 0;

    if (loading) {
        return (
            <Layout role="teacher">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Faculty Data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="teacher">
            <div className="space-y-10 pb-12">
                {/* Hero Header */}
                <header className="relative py-12 px-10 bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
                    <div className="relative z-10 space-y-4">
                        <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            Faculty Portal
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                            Welcome, {teacherProfile?.full_name?.split(' ')[0]}
                        </h1>
                        <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
                            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. 
                            You have {recentHomework.length} active assignments in Sector {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}.
                        </p>
                    </div>
                </header>

                {/* Primary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
                    <div className="bg-blue-600 p-8 rounded-[40px] shadow-xl shadow-blue-100 flex flex-col justify-between h-56 transition-transform hover:-translate-y-1 cursor-default">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-80">Primary Sector</h3>
                        <div>
                            <p className="text-5xl font-black">{teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}</p>
                            <p className="text-sm font-bold opacity-80 mt-1">{teacherProfile?.subject_assigned} Faculty</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl shadow-slate-100 flex flex-col justify-between h-56 transition-transform hover:-translate-y-1 cursor-default">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Learner Population</h3>
                        <div>
                            <p className="text-5xl font-black">{studentsCount}</p>
                            <p className="text-sm font-bold text-slate-400 mt-1">Active Accounts</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between h-56 transition-transform hover:-translate-y-1 group">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600 transition-colors">Quick Terminals</h3>
                        <div className="flex gap-2">
                            <button onClick={() => navigate('/dashboard/teacher/attendance')} className="flex-1 h-12 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-slate-100">
                                <span className="material-symbols-outlined text-xl">how_to_reg</span>
                            </button>
                            <button onClick={() => navigate('/dashboard/teacher/homework')} className="flex-1 h-12 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-xl">add_task</span>
                            </button>
                            <button onClick={() => navigate('/dashboard/teacher/marks')} className="flex-1 h-12 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-xl">grade</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Active Assignments */}
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Tasks</h3>
                            <button onClick={() => navigate('/dashboard/teacher/homework')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                                Explore Portal &rarr;
                            </button>
                        </div>
                        <div className="space-y-6">
                            {recentHomework.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No Active Assignments</p>
                                </div>
                            ) : (
                                recentHomework.map((hw, i) => (
                                    <div key={i} className="flex items-center gap-6 group cursor-pointer" onClick={() => navigate('/dashboard/teacher/homework')}>
                                        <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined">menu_book</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <p className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">{hw.title}</p>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(hw.due_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 w-[75%] rounded-full"></div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400">32/40 Submissions</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Attendance Analysis */}
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Daily Presence</h3>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time status</p>
                                <p className="text-xs font-bold text-slate-900">{attendancePercentage}% Engagement</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-10">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="50%" cy="50%" r="44%" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                                    <circle 
                                        cx="50%" cy="50%" r="44%" fill="transparent" stroke="#2563EB" strokeWidth="8" 
                                        strokeDasharray="276" 
                                        strokeDashoffset={276 - (276 * attendancePercentage) / 100} 
                                        strokeLinecap="round" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{attendancePercentage}%</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Present</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{attendanceStats.present} Learners</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-rose-50/50 rounded-2xl border border-rose-100/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 opacity-30"></div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Absent</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{attendanceStats.absent} Learners</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherDashboard;
