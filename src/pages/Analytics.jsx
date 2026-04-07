import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
    TrendingUp, Users, BookOpen, AlertCircle, 
    Download, LayoutDashboard, ChevronRight, Menu, X,
    Calendar, DollarSign, Filter, MoreHorizontal
} from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/analytics';

const Analytics = () => {
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    
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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            
            setUser(user);
            const userRole = user.user_metadata?.role || 'teacher';
            setRole(userRole);
            
            fetchData(userRole, user.email);
        };
        
        init();
        return () => window.removeEventListener('resize', handleResize);
    }, [filters]);

    const fetchData = async (userRole, email) => {
        setLoading(true);
        try {
            const params = { ...filters, role: userRole, email };
            
            const [attRes, perfRes, subRes, feeRes] = await Promise.all([
                axios.get(`${API}/attendance`, { params }),
                axios.get(`${API}/performance`, { params }),
                axios.get(`${API}/subjects`, { params }),
                userRole === 'principal' ? axios.get(`${API}/fees`, { params }) : Promise.resolve({ data: { summary: [], trends: [] } })
            ]);

            setAttendanceData(attRes.data);
            setPerformanceData(perfRes.data);
            setSubjectData(subRes.data);
            setFeeData(feeRes.data);
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, color: 'white' }}>Academic Insights</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Real-time school performance analytics</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {role === 'principal' && (
                    <>
                        <select 
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', padding: '10px 16px', outline: 'none' }}
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="All" style={{color:'black'}}>All Classes</option>
                            <option value="Class 1" style={{color:'black'}}>Class 1</option>
                            <option value="Class 2" style={{color:'black'}}>Class 2</option>
                            <option value="Class 5" style={{color:'black'}}>Class 5</option>
                        </select>
                        <select 
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', padding: '10px 16px', outline: 'none' }}
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="All" style={{color:'black'}}>All Sections</option>
                            <option value="A" style={{color:'black'}}>Section A</option>
                            <option value="B" style={{color:'black'}}>Section B</option>
                        </select>
                    </>
                )}
                <button style={{ background: '#2563eb', border: 'none', borderRadius: '12px', color: 'white', padding: '10px 20px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} /> Export
                </button>
            </div>
        </div>
    );

    const StatCard = ({ title, value, sub, icon: Icon, color }) => (
        <div style={{ ...glassStyle, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: `${color}20`, padding: '16px', borderRadius: '16px' }}>
                <Icon color={color} size={28} />
            </div>
            <div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{title}</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: 'white' }}>{value}</h3>
                <p style={{ fontSize: '12px', color: color, margin: '4px 0 0', fontWeight: '700' }}>{sub}</p>
            </div>
        </div>
    );

    if (loading && !attendanceData.length) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <TrendingUp size={48} className="animate-bounce" style={{ margin: '0 auto 20px', color: '#3b82f6' }} />
                    <h2>Compiling Analytic Models...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: isMobile ? '20px' : '40px', position: 'relative', overflow: 'hidden' }}>
            {/* Background blobs */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
                {renderHeader()}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    <StatCard title="Avg Attendance" value={attendanceData.length > 0 ? `${attendanceData[attendanceData.length-1].present}%` : '0%'} sub="+2.5% from last week" icon={Calendar} color="#3b82f6" />
                    <StatCard title="Academic Average" value={`${performanceData.average}%`} sub="Above board average" icon={TrendingUp} color="#10b981" />
                    <StatCard title="Total Students" value={performanceData.students.length} sub="Active enrollment" icon={Users} color="#8b5cf6" />
                    <StatCard title="Weak Profiles" value={performanceData.weakStudents.length} sub="Need attention" icon={AlertCircle} color="#ef4444" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    {/* Attendance Trend */}
                    <div style={{ ...glassStyle, gridColumn: isMobile ? '1' : 'span 2' }}>
                        <h4 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '800' }}>Attendance Trends (Last {filters.days} Days)</h4>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceData}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="present" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
                                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Fee Distribution (Principal Only) */}
                    {role === 'principal' && (
                        <div style={glassStyle}>
                            <h4 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '800' }}>Fee Collection Status</h4>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={feeData.summary} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {feeData.summary.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
                    {/* Subject Performance */}
                    <div style={glassStyle}>
                        <h4 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '800' }}>Subject Average %</h4>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="subject" type="category" stroke="rgba(255,255,255,0.6)" fontSize={12} width={80} />
                                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', borderRadius: '12px' }} />
                                    <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                                        {subjectData.map((entry, index) => (
                                            <Cell key={index} fill={entry.average > 75 ? '#10b981' : entry.average > 40 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weak Students Tracker */}
                    <div style={{ ...glassStyle, gridColumn: isMobile ? '1' : 'span 2', maxHeight: '400px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Priority Intervention (Weak Students)</h4>
                            <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                {performanceData.weakStudents.length} Students at Risk
                            </span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', opacity: 0.5 }}>Student Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', opacity: 0.5 }}>Roll</th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', opacity: 0.5 }}>Academic %</th>
                                    <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', opacity: 0.5 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceData.weakStudents.map((s, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', fontWeight: '700' }}>{s.name}</td>
                                        <td style={{ padding: '12px', opacity: 0.6 }}>{s.roll}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ color: '#ef4444', fontWeight: '900' }}>{s.percentage}%</span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Focus Profile</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
