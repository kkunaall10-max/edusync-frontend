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
    Calendar, DollarSign, Filter, RefreshCw
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

    // Filters
    const [filters, setFilters] = useState({
        class: 'All',
        section: 'All',
        days: '30'
    });

    const navigate = useNavigate();

    // Secure Data Fetching with Centralized ApiClient
    const fetchData = useCallback(async (userRole, email) => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                params: { ...filters, role: userRole, email }
            };
            
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
                const feeRes = await apiClient.get(`/analytics/fees`, config);
                if (feeRes.data.success) setFeeData(feeRes.data.data);
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
            const userRole = userData.user_metadata?.role || 'teacher';
            setRole(userRole);
            
            fetchData(userRole, userData.email);
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

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.2)'
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: 'white', letterSpacing: '-0.5px' }}>Dashboard Intelligence</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '14px', fontWeight: '500' }}>Comprehensive data visualization for {role === 'principal' ? 'Full Institution' : 'Assigned Class'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {role === 'principal' && (
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <select 
                            style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="All" style={{color:'black'}}>All Classes</option>
                            <option value="Class 1" style={{color:'black'}}>Class 1</option>
                            <option value="Class 2" style={{color:'black'}}>Class 2</option>
                            <option value="Class 5" style={{color:'black'}}>Class 5</option>
                        </select>
                        <select 
                            style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="All" style={{color:'black'}}>All Sections</option>
                            <option value="A" style={{color:'black'}}>Section A</option>
                            <option value="B" style={{color:'black'}}>Section B</option>
                        </select>
                    </div>
                )}
                <button 
                    onClick={() => fetchData(role, user?.email)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', padding: '10px', cursor: 'pointer' }}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );

    const StatCard = ({ title, value, sub, icon: Icon, color }) => (
        <div style={{ ...glassStyle, display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
            <div style={{ background: `${color}15`, padding: '12px', borderRadius: '14px', border: `1px solid ${color}30` }}>
                <Icon color={color} size={24} />
            </div>
            <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900', margin: '4px 0 0', color: 'white' }}>{value}</h3>
                <p style={{ fontSize: '11px', color: color, margin: '2px 0 0', fontWeight: '800' }}>{sub}</p>
            </div>
        </div>
    );

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
            <div style={{ position: 'relative' }}>
                {loading && !attendanceData.length && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <TrendingUp size={32} className="animate-bounce" color="#3b82f6" style={{ margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '14px', fontWeight: '700' }}>Syncing Models...</p>
                        </div>
                    </div>
                )}

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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Attendance Trajectory</h4>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: '700' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} /> Present</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Absent</span>
                            </div>
                        </div>
                        <div style={{ height: '320px', width: '100%' }}>
                            {attendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={attendanceData}>
                                        <defs>
                                            <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="rgba(255,255,255,0.3)" 
                                            fontSize={10} 
                                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                                        />
                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} 
                                            itemStyle={{ fontWeight: '700' }}
                                        />
                                        <Area type="monotone" dataKey="present" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={3} animationDuration={1500} />
                                        <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>No telemetry data available</div>
                            )}
                        </div>
                    </div>

                    {/* Fee Analysis */}
                    {role === 'principal' && (
                        <div style={glassStyle}>
                            <h4 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '800' }}>Fiscal Liquidity</h4>
                            <div style={{ height: '320px', width: '100%' }}>
                                {feeData.summary.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
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
                                                {feeData.summary.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '10px' }} />
                                            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '20px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>Awaiting fiscal audit...</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '20px' }}>
                    {/* Subject Distribution */}
                    <div style={glassStyle}>
                        <h4 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '800' }}>Subject Proficiency</h4>
                        <div style={{ height: '320px', width: '100%' }}>
                            {subjectData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="subject" type="category" stroke="rgba(255,255,255,0.5)" fontSize={10} width={80} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '10px' }} />
                                        <Bar dataKey="average" radius={[0, 6, 6, 0]} barSize={20}>
                                            {subjectData.map((entry, index) => (
                                                <Cell key={index} fill={entry.average > 75 ? '#10b981' : entry.average > 40 ? '#f59e0b' : '#ef4444'} />
                                            ))}
                                            <LabelList dataKey="average" position="right" style={{ fill: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700' }} formatter={(v) => `${v}%`} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>No academic records found</div>
                            )}
                        </div>
                    </div>

                    {/* Priority Intervention Table */}
                    <div style={{ ...glassStyle, overflowX: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Critical Interventions</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                                <AlertCircle size={14} /> {performanceData.weakStudents.length} RISKY PROFILES
                            </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px' }}>Dossier Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px' }}>Roll</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px' }}>Status Quo</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px' }}>Operational Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceData.weakStudents.length > 0 ? performanceData.weakStudents.map((s, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '14px 12px', fontWeight: '700' }}>{s.name}</td>
                                        <td style={{ padding: '14px 12px', opacity: 0.5 }}>{s.roll}</td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', minWidth: '60px' }}>
                                                    <div style={{ width: `${s.percentage}%`, height: '100%', background: '#ef4444', borderRadius: '2px' }} />
                                                </div>
                                                <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '12px' }}>{s.percentage}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Deep Audit</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>All student profiles meeting normative standards.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
