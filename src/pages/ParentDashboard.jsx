import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
// Using root-relative path for Vercel
const parentBg = '/parent-bg.jpg';

const API_BASE_URL = 'https://edusync.up.railway.app/api/parent';

const ParentDashboard = () => {
    const [child, setChild] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [fees, setFees] = useState(null);
    const [homework, setHomework] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No logged in user found");

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
        glassCard: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '24px'
        },
        avatar: {
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '800',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            flexShrink: 0
        },
        badge: {
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
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

    return (
        <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: 'none' }} className="font-['Inter'] overflow-x-hidden">
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
                opacity: 0.5
            }} />
            
            <div className="relative z-10">
                <Layout role="parent">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Hero Card */}
                        <section style={styles.glassCard} className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <div style={styles.avatar}>{getInitials(child.full_name)}</div>
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-black text-white m-0 tracking-tight leading-none">{child.full_name}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/70 text-sm font-bold mt-3">
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">badge</span> Roll: {child.roll_number}</span>
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">school</span> Class {child.class}-{child.section}</span>
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

                        {/* Responsive Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                            
                            {/* Card 1: Attendance */}
                            <div style={styles.glassCard} className="flex flex-col justify-between min-h-[300px]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest">Attendance</h4>
                                        <p className="text-[10px] text-white/50 mt-1 uppercase font-bold">Academic Statistics</p>
                                    </div>
                                    <span className="material-symbols-outlined opacity-30 text-white">calendar_month</span>
                                </div>
                                <div className="flex items-baseline gap-4 mb-8">
                                    <span className="text-7xl md:text-8xl font-black text-white leading-none tracking-tighter">{attendance?.total}</span>
                                    <span className="text-lg font-bold text-white/40 uppercase">Total Days</span>
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
                                    <p className="text-xs italic text-white/70 font-medium">
                                        {parseFloat(attendance?.percentage) >= 75 ? "Excellent attendance sustained!" : "Attendance tracking below the required criteria."}
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Fee Status */}
                            <div style={styles.glassCard} className="flex flex-col justify-between min-h-[300px]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest">Fee Status</h4>
                                        <p className="text-[10px] text-white/50 mt-1 uppercase font-bold">Financial Overview</p>
                                    </div>
                                    <span className="material-symbols-outlined opacity-30 text-white">payments</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-8 text-center">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-lg font-black text-emerald-400 leading-none">₹{totalPaid.toLocaleString()}</p>
                                        <p className="text-[8px] font-black text-white/30 uppercase mt-2">Paid</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-lg font-black text-blue-400 leading-none">₹{totalPending.toLocaleString()}</p>
                                        <p className="text-[8px] font-black text-white/30 uppercase mt-2">Pending</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-lg font-black text-red-400 leading-none">₹{totalOverdue.toLocaleString()}</p>
                                        <p className="text-[8px] font-black text-white/30 uppercase mt-2">Overdue</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {fees?.records?.slice(0, 2).map((fee, idx) => (
                                        <div key={fee.id || idx} className="bg-white/5 p-4 rounded-xl flex justify-between items-center border border-white/10">
                                            <span className="text-xs font-bold text-white">{fee.month} {fee.fee_type}</span>
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${fee.status === 'paid' ? 'border-emerald-400 text-emerald-400' : 'border-red-400 text-red-400'}`}>
                                                {fee.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card 3: Recent Homework */}
                            <div style={styles.glassCard} className="min-h-[300px]">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest">Homework</h4>
                                        <p className="text-[10px] text-white/50 mt-1 uppercase font-bold">Active Assignments</p>
                                    </div>
                                    <span className="material-symbols-outlined opacity-30 text-white">assignment</span>
                                </div>
                                <div className="space-y-5">
                                    {homework.length === 0 ? (
                                        <div className="py-12 text-center text-white/30 text-sm font-bold uppercase tracking-widest">No homework assigned yet.</div>
                                    ) : (
                                        homework.map((hw, idx) => (
                                            <div key={hw.id || idx} className="flex justify-between items-center group">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-white/10 text-white/90 uppercase tracking-widest border border-white/10">{hw.subject}</span>
                                                    <h5 className="text-sm font-bold text-white m-0 group-hover:text-blue-400 transition-colors">{hw.title}</h5>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-white/30 uppercase m-0 leading-none">Due Date</p>
                                                    <p className="text-xs font-bold text-white mt-1">{new Date(hw.due_date).toLocaleDateString()}</p>
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
                                        <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest">Latest Results</h4>
                                        <p className="text-[10px] text-white/50 mt-1 uppercase font-bold">Performance Overview</p>
                                    </div>
                                    <span className="material-symbols-outlined opacity-30 text-white">grade</span>
                                </div>
                                <div className="space-y-5">
                                    {marks.length === 0 ? (
                                        <div className="py-12 text-center text-white/30 text-sm font-bold uppercase tracking-widest">Await official evaluations...</div>
                                    ) : (
                                        marks.map((res, idx) => {
                                            const grade = getGrade((res.marks_obtained / res.total_marks) * 100);
                                            return (
                                                <div key={res.id || idx} className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/5 transition-colors">
                                                    <div className="space-y-1">
                                                        <h5 className="text-sm font-bold text-white m-0">{res.subject}</h5>
                                                        <span className="text-[10px] text-white/50 font-medium uppercase tracking-tighter">{res.exam_type} • {res.marks_obtained}/{res.total_marks}</span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border font-black text-lg" style={{ borderColor: grade.color, backgroundColor: grade.bg, color: grade.color, boxShadow: `0 0 15px ${grade.shadow}` }}>
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
                </Layout>
            </div>
        </div>
    );
};

export default ParentDashboard;
