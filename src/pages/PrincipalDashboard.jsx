import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';

const PrincipalDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [minTimeDone, setMinTimeDone] = useState(false);
    const [dataReady, setDataReady] = useState(false);

    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        feesCollected: 0,
        attendanceToday: 0
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const navigate = useNavigate();

    // Force minimum 10 second loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimeDone(true);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (minTimeDone && dataReady) {
            setLoading(false);
        }
    }, [minTimeDone, dataReady]);

    const fetchData = useCallback(async (cancelToken) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const [
                studentsRes,
                teachersRes,
                feesRes,
                attendanceRes,
                overdueRes
            ] = await Promise.all([
                axios.get('https://edusync.up.railway.app/api/students', { cancelToken }),
                axios.get('https://edusync.up.railway.app/api/teachers', { cancelToken }),
                axios.get('https://edusync.up.railway.app/api/fees/stats', { cancelToken }),
                axios.get(`https://edusync.up.railway.app/api/attendance?date=${today}`, { cancelToken }),
                axios.get('https://edusync.up.railway.app/api/fees?status=overdue', { cancelToken })
            ]);

            const totalAttendance = attendanceRes.data.length;
            const presentCount = attendanceRes.data.filter(a => a.status === 'present').length;
            const attendancePct = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

            setMetrics({
                totalStudents: studentsRes.data.length || 0,
                totalTeachers: teachersRes.data.length || 0,
                feesCollected: feesRes.data.total_collected || 0,
                attendanceToday: attendancePct.toFixed(1)
            });

            setRecentAlerts(overdueRes.data.slice(0, 3));
            setDataReady(true);
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("Error fetching dashboard data:", error);
            setDataReady(true);
        }
    }, []);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchData(source.token);
        return () => source.cancel("Cleanup on unmount");
    }, [fetchData]);

    if (loading) return <LoadingScreen />;

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            background: 'none',
            fontFamily: "'Inter', sans-serif"
        },
        card: {
            backgroundColor:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:'24px', 
            padding:'24px', boxShadow:'0 16px 40px rgba(0,0,0,0.04)',
            willChange: 'transform', transform: 'translateZ(0)'
        },
        iconBoxBlue: {width:'48px', height:'48px', backgroundColor:'#EFF6FF', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', color:'#2563EB'},
        statNumber: {fontSize:'32px', fontWeight:'800', color:'#111827', margin:0, letterSpacing:'-1px'},
        statLabel: {fontSize:'14px', fontWeight:'600', color:'#6B7280', marginTop:'4px', margin:0},
        btnPrimary: {width:'100%', padding:'14px 16px', backgroundColor:'#2563EB', color:'#FFFFFF', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700', cursor:'pointer', marginBottom:'12px', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'0.2s'},
        btnSecondary: {width:'100%', padding:'14px 16px', backgroundColor:'#FFFFFF', color:'#374151', border:'1px solid #E5E7EB', borderRadius:'12px', fontSize:'14px', fontWeight:'700', cursor:'pointer', marginBottom:'12px', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'0.2s'}
    };

    return (
        <div style={styles.pageWrapper}>
            <Layout role="principal">
                <div className="space-y-8">
                    <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 m-0 tracking-tight">Good morning, Principal</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Academic Command Center</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div style={styles.card}>
                            <div style={styles.iconBoxBlue}>
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <h3 style={styles.statNumber}>{metrics.totalStudents.toLocaleString()}</h3>
                            <p style={styles.statLabel}>Total Students</p>
                        </div>
                        <div style={styles.card}>
                            <div style={{...styles.iconBoxBlue, backgroundColor:'#ECFDF5', color:'#059669'}}>
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <h3 style={styles.statNumber}>{metrics.totalTeachers.toLocaleString()}</h3>
                            <p style={styles.statLabel}>Total Teachers</p>
                        </div>
                        <div style={styles.card}>
                            <div style={{...styles.iconBoxBlue, backgroundColor:'#FFFBEB', color:'#D97706'}}>
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <h3 style={styles.statNumber}>₹{metrics.feesCollected.toLocaleString()}</h3>
                            <p style={styles.statLabel}>Fees Collected</p>
                        </div>
                        <div style={styles.card}>
                            <div style={{...styles.iconBoxBlue, backgroundColor:'#F5F3FF', color:'#7C3AED'}}>
                                <span className="material-symbols-outlined">fact_check</span>
                            </div>
                            <h3 style={styles.statNumber}>{metrics.attendanceToday}%</h3>
                            <p style={styles.statLabel}>Today's Attendance</p>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2" style={styles.card}>
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-lg font-black text-slate-900 m-0 uppercase tracking-tighter">System Critical Alerts</h4>
                                <button onClick={() => navigate('/dashboard/fees')} className="text-xs font-black text-blue-600 uppercase tracking-widest bg-transparent border-none cursor-pointer">Explore All</button>
                            </div>
                            <div className="flex flex-col gap-4">
                                {recentAlerts.length > 0 ? recentAlerts.map((alert, i) => (
                                    <div key={i} className="p-5 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/fees')}>
                                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined">priority_high</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-900 m-0 truncate">Overdue: {alert.student?.full_name}</p>
                                            <p className="text-xs font-bold text-slate-400 m-0 uppercase mt-0.5">Amount: ₹{alert.amount.toLocaleString()} • {alert.fee_type}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-6xl opacity-20">notifications_off</span>
                                        <p className="text-sm font-black mt-4 uppercase tracking-widest">Awaiting status updates...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div style={styles.card}>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 m-0">Quick Operations</h4>
                                <button onClick={() => navigate('/dashboard/students')} style={styles.btnPrimary}>
                                    <span className="flex items-center gap-3">
                                        <span className="material-symbols-outlined">person_add</span>
                                        Onboard Student
                                    </span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/reports')} style={styles.btnSecondary}>
                                    <span className="flex items-center gap-3">
                                        <span className="material-symbols-outlined">analytics</span>
                                        Intelligence Report
                                    </span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>

                            <div style={{...styles.card, backgroundColor:'#F9FAFB', borderStyle:'dashed', borderColor:'#D1D5DB'}}>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 m-0">System Calendar</h4>
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-14 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm flex-shrink-0 border border-slate-100">
                                        <span className="text-[10px] font-black text-rose-500 leading-none mb-1">OCT</span>
                                        <span className="text-xl font-black text-slate-900 leading-none">24</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 m-0 truncate">Director's Conference</p>
                                        <p className="text-xs font-bold text-slate-500 m-0 uppercase mt-0.5">14:00 • North Wing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </div>
    );
};

export default React.memo(PrincipalDashboard);
