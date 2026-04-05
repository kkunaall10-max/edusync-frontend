import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';

const PrincipalDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        feesCollected: 0,
        attendanceToday: 0
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const navigate = useNavigate();

    const fetchData = useCallback(async (cancelToken) => {
        setLoading(true);
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

        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchData(source.token);
        return () => source.cancel("Cleanup on unmount");
    }, [fetchData]);

    if (loading) return <LoadingScreen />;

    const styles = {
        card: {backgroundColor:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)'},
        iconBoxBlue: {width:'40px', height:'40px', backgroundColor:'#EFF6FF', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', color:'#2563EB'},
        statNumber: {fontSize:'28px', fontWeight:'700', color:'#111827', margin:0},
        statLabel: {fontSize:'13px', color:'#6B7280', marginTop:'4px', margin:0},
        btnPrimary: {width:'100%', padding:'12px 16px', backgroundColor:'#2563EB', color:'#FFFFFF', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'12px', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center'},
        btnSecondary: {width:'100%', padding:'12px 16px', backgroundColor:'#FFFFFF', color:'#374151', border:'1px solid #E5E7EB', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'12px', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center'}
    };

    return (
        <Layout role="principal">
            <div className="space-y-6">
                <div>
                   <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0">Good morning, Principal</h2>
                   <p className="text-sm text-slate-500 mt-1">Here's your school's overview for today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2" style={styles.card}>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-base font-bold text-slate-900 m-0">Recent Alerts</h4>
                            <button onClick={() => navigate('/dashboard/fees')} className="text-xs font-semibold text-blue-600 bg-transparent border-none cursor-pointer">View All</button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {recentAlerts.length > 0 ? recentAlerts.map((alert, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl flex items-center gap-4 border border-slate-100">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined">payment</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 m-0 truncate">Fee Overdue: {alert.student?.full_name}</p>
                                        <p className="text-xs text-slate-500 m-0">Outstanding: ₹{alert.amount.toLocaleString()} ({alert.fee_type})</p>
                                    </div>
                                    <span onClick={() => navigate('/dashboard/fees')} className="material-symbols-outlined text-blue-600 cursor-pointer flex-shrink-0">chevron_right</span>
                                </div>
                            )) : (
                                <div className="py-8 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-5xl">notifications_off</span>
                                    <p className="text-sm font-medium mt-2">No critical alerts</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div style={styles.card}>
                            <h4 className="text-base font-bold text-slate-900 mb-5 m-0">Quick Actions</h4>
                            <button onClick={() => navigate('/dashboard/students')} style={styles.btnPrimary}>
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">person_add</span>
                                    Add New Student
                                </span>
                                <span className="material-symbols-outlined">east</span>
                            </button>
                            <button onClick={() => navigate('/dashboard/reports')} style={styles.btnSecondary}>
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">analytics</span>
                                    Generate Report
                                </span>
                                <span className="material-symbols-outlined">east</span>
                            </button>
                        </div>

                        <div style={{...styles.card, backgroundColor:'#F9FAFB', borderStyle:'dashed'}}>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 m-0">Upcoming Event</h4>
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                                    <span className="text-[9px] font-extrabold text-red-500 leading-none">OCT</span>
                                    <span className="text-sm font-extrabold text-slate-900 leading-tight">24</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 m-0 truncate">Parent Meeting</p>
                                    <p className="text-[10px] text-slate-500 m-0">14:00 • Auditorium</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PrincipalDashboard;
