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
    const [bulkReport, setBulkReport] = useState([]); // State for consolidated class audit

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
                const [feeRes, classRes, bulkRes] = await Promise.all([
                    apiClient.get(`/analytics/fees`, config),
                    apiClient.get(`/analytics/classes`, config),
                    apiClient.get(`/analytics/bulk-report`, config)
                ]);
                if (feeRes.data.success) setFeeData(feeRes.data.data);
                if (classRes.data.success) setClassStats(classRes.data.data);
                if (bulkRes.data.success) setBulkReport(bulkRes.data.data);
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
            
            // Unified Audit Section
            csvRows.push(`"STUDENT PERFORMANCE AUDIT (${filters.class})"`);
            csvRows.push(`"Name","Roll Number","Attendance %","Academic %","Fee Status"`);
            
            const reportData = (filters.class === 'All' ? performanceData.weakStudents : bulkReport);
            
            reportData.forEach(s => {
                const ac = filters.class === 'All' ? s.percentage : s.academic;
                const fe = filters.class === 'All' ? "N/A" : s.fees;
                const att = filters.class === 'All' ? "N/A" : `${s.attendance}%`;
                csvRows.push(`"${s.name}","${s.roll}","${att}","${ac}%","${fe}"`);
            });
            csvRows.push(`""`);
            
            // Subject Proficiency Section
            csvRows.push(`"SUBJECT PROFICIENCY"`);
            csvRows.push(`"Subject","Average Score"`);
            subjectData.forEach(s => {
                csvRows.push(`"${s.subject}","${s.average}%"`);
            });
            csvRows.push(`""`);
            
            // Fiscal Summary (Principal Only)
            if (role === 'principal') {
                csvRows.push(`"FISCAL LIQUIDITY SUMMARY"`);
                csvRows.push(`"Status","Count"`);
                feeData.summary.forEach(s => {
                    csvRows.push(`"${s.name}","${s.value}"`);
                });
            }

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
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Academic telemetry for {role === 'principal' ? 'Full Institution' : 'Assigned Class'}
                    <span style={{ 
                        background: '#f0fdf4', 
                        color: '#166534', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontSize: '10px', 
                        fontWeight: '900', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        border: '1px solid #dcfce7',
                        marginLeft: '8px'
                    }}>
                        <div style={{ width: '5px', height: '5px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                        LIVE
                    </span>
                </p>
            </div>
            
            <div style={{ 
                display: 'flex', 
                gap: '24px', 
                background: 'white', 
                padding: '16px 32px', 
                borderRadius: '32px', 
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 40px rgba(15, 23, 42, 0.04)',
                width: isMobile ? '100%' : 'auto',
                alignItems: 'center',
                flexGrow: 1
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Class</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select 
                            style={{ background: 'transparent', border: 'none', color: '#0f172a', padding: '0', fontSize: '15px', fontWeight: '900', outline: 'none', cursor: 'pointer', width: '100%', appearance: 'none' }}
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="All">All Levels</option>
                            {[
                                "Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                "11th Science Medical", "11th Science Non-Medical", "11th Commerce", "11th Arts",
                                "12th Science Medical", "12th Science Non-Medical", "12th Commerce", "12th Arts"
                            ].map((cls) => (
                                <option key={cls} value={cls.includes(' ') ? cls : `Class ${cls}`}>
                                    {cls.includes(' ') || isNaN(cls) ? cls : `Class ${cls}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ width: '1px', background: '#f1f5f9', height: '24px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Section</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select 
                            style={{ background: 'transparent', border: 'none', color: '#0f172a', padding: '0', fontSize: '15px', fontWeight: '900', outline: 'none', cursor: 'pointer', width: '100%' }}
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="All">All</option>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ width: '1px', background: '#f1f5f9', height: '24px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {new Date().toLocaleDateString('en-GB')}
                            <Calendar size={14} color="#64748b" />
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                    onClick={() => fetchData(role, user?.email)}
                    style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', color: '#0f172a', padding: '12px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Sync Data"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                
                {role === 'principal' && (
                    <button 
                        onClick={handleExportAudit}
                        style={{ 
                            background: '#0f172a', 
                            border: 'none', 
                            borderRadius: '18px', 
                            color: 'white', 
                            padding: '12px 24px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            fontSize: '13px', 
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <Download size={16} />
                        EXPORT CSV
                    </button>
                )}
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
                        <div style={{ width: '100%', height: 320 }}>
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
                            <div style={{ width: '100%', height: 320 }}>
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
                            <div style={{ width: '100%', height: 320 }}>
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
                        <div style={{ width: '100%', height: 320 }}>
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

                    {/* Unified Academic & Fiscal Audit Matrix */}
                    <div style={{ ...glassStyle, overflowX: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                                {filters.class === 'All' ? "Critical Institutional Interventions" : `Live ${filters.class} Audit Matrix`}
                            </h4>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: filters.class === 'All' ? '#fef2f2' : '#f0f9ff', 
                                color: filters.class === 'All' ? '#ef4444' : '#0ea5e9', 
                                border: `1px solid ${filters.class === 'All' ? '#fee2e2' : '#e0f2fe'}`, 
                                padding: '8px 16px', 
                                borderRadius: '14px', 
                                fontSize: '11px', 
                                fontWeight: '900' 
                            }}>
                                <LayoutDashboard size={14} /> 
                                {filters.class === 'All' 
                                    ? `${performanceData.weakStudents.length} RISKY PROFILES` 
                                    : `${bulkReport.length} ACTIVE AUDITS`}
                            </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ borderBottom: '2px solid #f1f5f9' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Identity</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Attendance</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Academics</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Fiscal</th>
                                    <th style={{ textAlign: 'right', padding: '16px 12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(filters.class === 'All' ? performanceData.weakStudents : bulkReport).length > 0 ? 
                                (filters.class === 'All' ? performanceData.weakStudents : bulkReport).map((s, idx) => {
                                    const percent = filters.class === 'All' ? s.percentage : s.academic;
                                    const feeStatus = filters.class === 'All' ? 'unknown' : s.fees;
                                    
                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }} className="group">
                                            <td style={{ padding: '18px 12px' }}>
                                                <div style={{ fontWeight: '900', color: '#0f172a' }}>{s.name}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>ROLL: {s.roll}</div>
                                            </td>
                                            
                                            <td style={{ padding: '18px 12px' }}>
                                                {filters.class === 'All' ? (
                                                    <span style={{ color: '#94a3b8' }}>--</span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${s.attendance}%`, height: '100%', background: s.attendance > 75 ? '#10b981' : '#ef4444' }} />
                                                        </div>
                                                        <span style={{ fontWeight: '800', fontSize: '11px', color: s.attendance > 75 ? '#10b981' : '#ef4444' }}>{s.attendance}%</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '18px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${percent}%`, height: '100%', background: percent > 75 ? '#8b5cf6' : percent > 40 ? '#f59e0b' : '#ef4444' }} />
                                                    </div>
                                                    <span style={{ fontWeight: '800', fontSize: '11px', color: percent > 75 ? '#8b5cf6' : percent > 40 ? '#f59e0b' : '#ef4444' }}>{percent}%</span>
                                                </div>
                                            </td>

                                            <td style={{ padding: '18px 12px' }}>
                                                {filters.class === 'All' ? (
                                                    <span style={{ color: '#94a3b8' }}>--</span>
                                                ) : (
                                                    <span style={{ 
                                                        px: '8x', 
                                                        py: '4px', 
                                                        borderRadius: '8px', 
                                                        fontSize: '10px', 
                                                        fontWeight: '900', 
                                                        textTransform: 'uppercase',
                                                        color: feeStatus === 'paid' ? '#10b981' : feeStatus === 'pending' ? '#f59e0b' : '#ef4444',
                                                        background: feeStatus === 'paid' ? '#f0fdf4' : feeStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                                                        padding: '4px 8px',
                                                        border: `1px solid ${feeStatus === 'paid' ? '#dcfce7' : feeStatus === 'pending' ? '#fef3c7' : '#fee2e2'}`
                                                    }}>
                                                        {feeStatus}
                                                    </span>
                                                )}
                                            </td>

                                            <td style={{ padding: '18px 12px', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => navigate(`/dashboard/students?search=${s.name}`)}
                                                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900', transition: 'all 0.2s' }}
                                                >
                                                    Deep Audit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>
                                            {filters.class === 'All' ? "Institutional health is optimal. No critical interventions identified." : "Live data stream empty for this specific solo class." }
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
