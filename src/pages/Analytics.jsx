import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area,
    ReferenceLine, LabelList
} from 'recharts';
import { 
    TrendingUp, Users, BookOpen, AlertCircle, 
    Download, LayoutDashboard, ChevronRight, Menu, X,
    Calendar, DollarSign, Filter, RefreshCw, Layers
} from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/analytics';

const Analytics = () => {
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [error, setError] = useState(null);
    
    // Data states
    const [attendanceData, setAttendanceData] = useState([]);
    const [performanceData, setPerformanceData] = useState({ students: [], average: 0, weakStudents: [] });
    const [subjectData, setSubjectData] = useState([]);
    const [feeData, setFeeData] = useState({ summary: [], trends: [] });
    const [classStats, setClassStats] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        class: 'All',
        section: 'All',
        days: '30'
    });

    const navigate = useNavigate();

    // Secure Data Fetching with Centralized ApiClient
    const fetchData = useCallback(async (userRole, email, currentFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                params: { ...currentFilters, role: userRole } 
            };
            // Only add email for teachers to minimize PI exposure and avoid URL misparsing
            if (userRole === 'teacher' && email) {
                config.params.email = email;
            }
            
            const [attRes, perfRes, subRes] = await Promise.all([
                apiClient.get(`/analytics/attendance`, config),
                apiClient.get(`/analytics/performance`, config),
                apiClient.get(`/analytics/subjects`, config)
            ]);

            // Map data from { success, data } format
            if (attRes.data.success) setAttendanceData(attRes.data.data);
            if (perfRes.data.success) setPerformanceData(perfRes.data.data);
            if (subRes.data.success) setSubjectData(subRes.data.data);

            if (userRole === 'principal') {
                const [feeRes, classRes] = await Promise.all([
                    apiClient.get(`/analytics/fees`, config),
                    apiClient.get(`/analytics/classes`, config)
                ]);
                if (feeRes.data.success) setFeeData(feeRes.data.data);
                if (classRes.data.success) setClassStats(classRes.data.data);
            }
        } catch (err) {
            console.error("Analytics fetch error:", err);
            setError(err.response?.data?.error || err.message);
            if (err.message.includes('session')) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        const init = async () => {
            // Check session and handle potential refresh token errors
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                console.error("Session error:", sessionError);
                navigate('/login');
                return;
            }
            
            const userData = session.user;
            setUser(userData);
            
            // SECURITY: Always fetch the true role from the profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userData.id)
                .single();
            
            const userRole = profile?.role?.toLowerCase() || 'teacher';
            setRole(userRole);
            
            // For teachers, fetch their locked scope
            if (userRole === 'teacher') {
                try {
                    const { data: teachers } = await supabase
                        .from('teachers')
                        .select('class_assigned, section_assigned')
                        .eq('email', userData.email)
                        .limit(1);
                    
                    if (teachers && teachers.length > 0) {
                        const teacher = teachers[0];
                        const teacherFilters = {
                            ...filters,
                            class: teacher.class_assigned,
                            section: teacher.section_assigned
                        };
                        setFilters(teacherFilters);
                        fetchData(userRole, userData.email, teacherFilters);
                        return;
                    }
                } catch (e) {
                    console.warn("Soft handling teach scope err:", e);
                }
            }
            
            fetchData(userRole, userData.email, filters);
        };
        
        init();

        // Listen for auth changes to prevent stale refresh token errors
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
                navigate('/login');
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            subscription.unsubscribe();
        };
    }, [filters, navigate, fetchData]);

    const handleExportAudit = () => {
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `edusync_audit_${filters.class}_${timestamp}.csv`;
            
            // Header
            let csvRows = [`"EduSync Academic & Fiscal Audit - ${timestamp}"`, `""`];
            
            // Student Performance Section
            csvRows.push(`"STUDENT PERFORMANCE (${filters.class})"`);
            csvRows.push(`"Name","Roll Number","Percentage"`);
            performanceData.students.forEach(s => {
                csvRows.push(`"${s.name}","${s.roll}","${s.percentage}%"`);
            });
            csvRows.push(`""`);
            
            // Subject Proficiency Section
            csvRows.push(`"SUBJECT PROFICIENCY"`);
            csvRows.push(`"Subject","Average Score"`);
            subjectData.forEach(s => {
                csvRows.push(`"${s.subject}","${s.average}%"`);
            });
            csvRows.push(`""`);
            
            // Fiscal Summary
            csvRows.push(`"FISCAL LIQUIDITY SUMMARY"`);
            csvRows.push(`"Status","Count"`);
            feeData.summary.forEach(s => {
                csvRows.push(`"${s.name}","${s.value}"`);
            });

            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export failure:", err);
            alert("Audit export failed. Please check device permissions.");
        }
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '32px',
        padding: '24px',
        boxShadow: '0 8px 32px -4px rgba(15, 23, 42, 0.08)'
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
                <h1 style={{ fontSize: '32px', fontVariationSettings: '"wght" 900', margin: 0, color: '#0f172a', letterSpacing: '-1px' }}>Intelligence Dashboard</h1>
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px', fontWeight: '600' }}>Academic telemetry for {role === 'principal' ? 'Full Institution' : 'Assigned Class'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    background: 'white', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    width: isMobile ? '100%' : 'auto',
                    opacity: role === 'teacher' ? 0.8 : 1
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '10px' }}><LayoutDashboard size={14} color="#64748b" /></div>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Class</span>
                        <select 
                            style={{ background: 'transparent', border: 'none', color: '#0f172a', padding: '8px 0', fontSize: '14px', fontWeight: '900', outline: 'none', cursor: 'pointer' }}
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="All">All Levels</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i+1} value={`Class ${i+1}`}>Class {i+1}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ width: '1px', background: '#f1f5f9', margin: '8px 12px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '10px' }}><Layers size={14} color="#64748b" /></div>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Section</span>
                        <select 
                            style={{ background: 'transparent', border: 'none', color: '#0f172a', padding: '8px 0', fontSize: '14px', fontWeight: '900', outline: 'none', cursor: 'pointer' }}
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="All">All Sections</option>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => fetchData(role, user?.email)}
                        style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '14px', color: '#0f172a', padding: '12px 14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {!isMobile && "Sync Data"}
                    </button>
                    {role === 'principal' && (
                        <button 
                            onClick={handleExportAudit}
                            style={{ background: '#0f172a', border: 'none', borderRadius: '14px', color: 'white', padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800' }}
                        >
                            <Download size={16} />
                            {!isMobile && "Export Audit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const StatCard = ({ title, value, sub, icon: Icon, color }) => (
        <div style={{ ...glassStyle, display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
            <div style={{ background: `${color}10`, padding: '14px', borderRadius: '18px', border: `1px solid ${color}20` }}>
                <Icon color={color} size={26} />
            </div>
            <div>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
                <h3 style={{ fontSize: '28px', fontWeight: '950', margin: '2px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</h3>
                <p style={{ fontSize: '11px', color: color, margin: 0, fontWeight: '800', opacity: 0.9 }}>{sub}</p>
            </div>
        </div>
    );

    if (loading && !attendanceData.length && !performanceData.students.length) {
        return (
            <Layout role={role}>
                <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={48} className="animate-spin" color="#3b82f6" />
                        <LayoutDashboard size={20} color="#3b82f6" style={{ position: 'absolute' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: '950', color: '#0f172a', fontSize: '14px', letterSpacing: '2px', margin: '0 0 8px' }}>SYNCHRONIZING TELEMETRY</p>
                        <p style={{ fontWeight: '700', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Assembling real-time institutional insights...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout role={role}>
                <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ ...glassStyle, textAlign: 'center', maxWidth: '400px' }}>
                        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ margin: '0 0 8px' }}>Intelligence Engine Failure</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Reconnect System
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role={role}>
                {renderHeader()}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    <StatCard 
                        title="Avg Attendance" 
                        value={attendanceData.length > 0 ? `${attendanceData[attendanceData.length-1].present}%` : '0%'} 
                        sub="System Normative" icon={Calendar} color="#3b82f6" 
                    />
                    <StatCard 
                        title="Academic Average" 
                        value={`${performanceData.average || 0}%`} 
                        sub="Standard Deviation: 4.2" icon={TrendingUp} color="#10b981" 
                    />
                    <StatCard 
                        title="Total Active" 
                        value={performanceData.students.length} 
                        sub="Verified Identities" icon={Users} color="#8b5cf6" 
                    />
                    <StatCard 
                        title="Risk Profiles" 
                        value={performanceData.weakStudents.length} 
                        sub="Intervention Needed" icon={AlertCircle} color="#ef4444" 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Attendance Trend */}
                    <div style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Attendance Trajectory</h4>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '4px', background: '#3b82f6' }} /> Present</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '4px', background: '#ef4444' }} /> Absent</span>
                            </div>
                        </div>
                        <div style={{ height: '320px', width: '100%' }}>
                            {attendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                                    <AreaChart data={attendanceData}>
                                        <defs>
                                            <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#94a3b8" 
                                            fontSize={11} 
                                            fontWeight={700}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                                            dy={10}
                                        />
                                        <YAxis stroke="#94a3b8" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-10} />
                                        <Tooltip 
                                            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                                            itemStyle={{ color: 'white', fontWeight: '800' }}
                                        />
                                        <Area type="monotone" dataKey="present" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={4} animationDuration={2000} />
                                        <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '700' }}>Awaiting sensor data...</div>
                            )}
                        </div>
                    </div>

                    {/* Fee Analysis */}
                    {role === 'principal' && (
                        <div style={glassStyle}>
                            <h4 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Fiscal Liquidity</h4>
                            <div style={{ height: '320px', width: '100%' }}>
                                {feeData.summary.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                                        <PieChart>
                                            <Pie 
                                                data={feeData.summary} 
                                                cx="50%" cy="50%" 
                                                innerRadius={70} 
                                                outerRadius={95} 
                                                paddingAngle={8} 
                                                dataKey="value"
                                                animationBegin={200}
                                            >
                                                {feeData.summary.map((entry, index) => <Cell key={index} fill={entry.color} stroke="white" strokeWidth={4} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: 'white' }} />
                                            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '800', color: '#64748b', paddingTop: '20px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '700' }}>Awaiting fiscal audit...</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Institutional Hierarchy / Solo Class Breakdown */}
                    {role === 'principal' && classStats.length > 0 && (
                        <div style={glassStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                                    {filters.class === 'All' ? "Institutional Hierarchy" : `Solo ${filters.class} Breakdown`}
                                </h4>
                                <TrendingUp size={20} color="#3b82f6" style={{ opacity: 0.5 }} />
                            </div>
                            <div style={{ height: '320px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                                    <BarChart data={classStats} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#94a3b8" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-10} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: 'white' }} />
                                        <Bar dataKey="average" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={35}>
                                            {classStats.map((entry, index) => (
                                                <Cell key={index} fill={filters.class === 'All' ? '#3b82f6' : '#10b981'} />
                                            ))}
                                            <LabelList dataKey="average" position="top" style={{ fill: '#0f172a', fontSize: '11px', fontWeight: '950' }} formatter={(v) => `${v}%`} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#3b82f620', padding: '8px', borderRadius: '8px' }}><AlertCircle size={14} color="#3b82f6" /></div>
                                <p style={{ fontSize: '11px', color: '#475569', fontWeight: '700', margin: 0 }}>
                                    {filters.class === 'All' ? "Comparative average performance ranking for all primary solo classes." : `Granular performance analysis of individual solo sections within ${filters.class}.`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Subject Distribution */}
                    <div style={glassStyle}>
                        <h4 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Subject Proficiency</h4>
                        <div style={{ height: '320px', width: '100%' }}>
                            {subjectData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                                    <BarChart data={subjectData} layout="vertical" margin={{ left: -20, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="subject" type="category" stroke="#64748b" fontSize={11} fontWeight={800} width={100} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: 'white' }} />
                                        <Bar dataKey="average" radius={[0, 8, 8, 0]} barSize={20}>
                                            {subjectData.map((entry, index) => (
                                                <Cell key={index} fill={entry.average > 75 ? '#10b981' : entry.average > 40 ? '#f59e0b' : '#ef4444'} radius={[0, 8, 8, 0]} />
                                            ))}
                                            <LabelList dataKey="average" position="right" style={{ fill: '#0f172a', fontSize: '12px', fontWeight: '900' }} formatter={(v) => `${v}%`} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '700' }}>No academic records found</div>
                            )}
                        </div>
                    </div>

                    {/* Priority Intervention Table / Student Ledger */}
                    <div style={{ ...glassStyle, overflowX: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                                {filters.class === 'All' ? "Critical Interventions" : `${filters.class} Performance Ledger`}
                            </h4>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: filters.class === 'All' ? '#fef2f2' : '#f0fdf4', 
                                color: filters.class === 'All' ? '#ef4444' : '#10b981', 
                                border: `1px solid ${filters.class === 'All' ? '#fee2e2' : '#dcfce7'}`, 
                                padding: '8px 16px', 
                                borderRadius: '14px', 
                                fontSize: '11px', 
                                fontWeight: '900' 
                            }}>
                                <AlertCircle size={16} /> 
                                {filters.class === 'All' 
                                    ? `${performanceData.weakStudents.length} RISKY PROFILES` 
                                    : `${performanceData.students.length} ENROLLED STUDENTS`}
                            </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ borderBottom: '2px solid #f1f5f9' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Dossier Name</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Roll</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Status Quo</th>
                                    <th style={{ textAlign: 'right', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(filters.class === 'All' ? performanceData.weakStudents : performanceData.students).length > 0 ? 
                                (filters.class === 'All' ? performanceData.weakStudents : performanceData.students).map((s, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }} className="group">
                                        <td style={{ padding: '18px 12px', fontWeight: '900', color: '#0f172a' }}>{s.name}</td>
                                        <td style={{ padding: '18px 12px', color: '#64748b', fontWeight: '700' }}>{s.roll}</td>
                                        <td style={{ padding: '18px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', minWidth: '80px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        width: `${s.percentage}%`, 
                                                        height: '100%', 
                                                        background: s.percentage > 75 ? '#10b981' : s.percentage > 40 ? '#f59e0b' : '#ef4444', 
                                                        borderRadius: '4px' 
                                                    }} />
                                                </div>
                                                <span style={{ 
                                                    color: s.percentage > 75 ? '#10b981' : s.percentage > 40 ? '#f59e0b' : '#ef4444', 
                                                    fontWeight: '900', 
                                                    fontSize: '12px' 
                                                }}>{s.percentage}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 12px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => navigate(`/dashboard/students?search=${s.name}`)}
                                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900', transition: 'all 0.2s' }}
                                            >
                                                Deep Audit
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>
                                            {filters.class === 'All' ? "All student profiles meeting normative standards." : "No student records identified for this solo class." }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
        </Layout>
    );
};

export default Analytics;
