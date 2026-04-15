import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    Download, Printer, AlertTriangle, CheckCircle2, 
    TrendingUp, FileText, LayoutDashboard, BrainCircuit 
} from 'lucide-react';
import apiClient from '../utils/api';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import AISidebar from '../components/AISidebar';
import AIChat from '../components/AIChat';

const PrincipalDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
    
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([{
      role: 'ai',
      text: 'Good morning, Principal. I am your Administrative Partner, ready to assist with reports, announcements, or school data. What would you like to review today?'
    }]);
    const [inputMsg, setInputMsg] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [chartData, setChartData] = useState(null);
    const [strategicActions, setStrategicActions] = useState([]);

    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        feesCollected: 0,
        attendanceToday: 0
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();

    const fetchData = useCallback(async (cancelToken) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const [
                studentsRes,
                teachersRes,
                feesRes,
                attendanceRes,
                overdueRes,
                annRes
            ] = await Promise.all([
                apiClient.get('/students', { cancelToken }),
                apiClient.get('/teachers', { cancelToken }),
                apiClient.get('/fees/stats', { cancelToken }),
                apiClient.get(`/attendance?date=${today}`, { cancelToken }),
                apiClient.get('/fees?status=overdue', { cancelToken }),
                apiClient.get('/announcements', { cancelToken })
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
            setAnnouncements(annRes?.data?.slice(0, 3) || []);
            setLoading(false);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchData(source.token);
        
        // Fetch AI History from Database
        const fetchHistory = async () => {
            try {
                const res = await apiClient.get('/ai/history');
                if (res.data && res.data.length > 0) {
                    setMessages(res.data.map(h => ({
                        role: h.role === 'user' ? 'user' : 'ai',
                        text: h.content,
                        actions: [] // Actions are usually real-time
                    })));
                }
            } catch (err) {
                console.log('No history found or table not ready yet.');
            }
        };
        fetchHistory();

        return () => source.cancel("Cleanup on unmount");
    }, [fetchData]);

    const sendMessage = async (customMsg = null) => {
      const msgToSend = customMsg || inputMsg;
      if (!msgToSend.trim()) return;
      
      const userMsg = msgToSend;
      setInputMsg('');
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setAiLoading(true);
      
      try {
        const res = await apiClient.post('/ai/chat', { message: userMsg });
        
        const aiResponse = res.data;
        setMessages(prev => [...prev, { 
            role: 'ai', 
            text: aiResponse.reply,
            actions: aiResponse.actions || []
        }]);
        
        if (aiResponse.isReport) {
            setReportContent(aiResponse.reply);
            setChartData(aiResponse.chartData);
            setStrategicActions(aiResponse.strategicActions || []);
            setReportModalOpen(true);
        }
      } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sir, technical issue occurred. Please try again shortly.' }]);
      }
      setAiLoading(false);
    };

    const handleAIAction = (action) => {
        switch(action.type) {
            case 'NAV_REPORTS_ATTENDANCE':
                navigate('/dashboard/reports?type=attendance');
                break;
            case 'NAV_REPORTS_FEES':
                navigate('/dashboard/reports?type=fees');
                break;
            case 'NAV_REPORTS_MARKS':
                navigate('/dashboard/reports?type=marks');
                break;
            case 'NAV_ANNOUNCEMENTS':
                navigate('/dashboard/announcements');
                break;
            case 'NAV_STAFF':
                navigate('/dashboard/teachers');
                break;
            case 'OPEN_REPORT_MODAL':
                setReportModalOpen(true);
                break;
            case 'DOWNLOAD_PDF':
                window.print();
                break;
            default:
                console.log('Unhandled AI action:', action);
        }
        setChatOpen(false); // Close chat for navigation
    };

    if (loading) return <LoadingScreen />;

    const styles = {
        pageWrapper: {
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
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
                    <div className="flex justify-between items-center">
                        <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 m-0 tracking-tight">Good morning, Principal</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Academic Command Center</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setChatOpen(!chatOpen)}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-indigo-600 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-base">chat</span>
                                AI Assistant
                            </button>
                            <button 
                                onClick={() => setAiSidebarOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-base">auto_awesome</span>
                                AI Insights
                            </button>
                        </div>
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

                    {/* Announcements Widget */}
                    <div style={styles.card} className="mt-8">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-lg font-black text-slate-900 m-0 uppercase tracking-tighter">Latest Announcements</h4>
                            <button onClick={() => navigate('/dashboard/announcements')} className="text-xs font-black text-blue-600 uppercase tracking-widest bg-transparent border-none cursor-pointer">View All Announcements</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {announcements.length === 0 ? (
                                <div className="col-span-3 py-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No announcements</div>
                            ) : announcements.map(ann => (
                                <div key={ann.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col hover:border-slate-300 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/announcements')}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            ann.priority === 'urgent' ? 'bg-red-100 text-red-600 border border-red-200' :
                                            ann.priority === 'important' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
                                            'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {ann.priority || 'Normal'}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {new Date(ann.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h5 className="text-base font-black text-slate-900 mb-2 m-0 leading-tight">{ann.title}</h5>
                                    <p className="text-sm font-medium text-slate-500 m-0 line-clamp-1 flex-1">{ann.content}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center">
                                        <span className={`px-2 py-1 rounded inline-flex items-center text-[10px] font-black uppercase tracking-wider ${
                                            ann.target_audience === 'all' ? 'bg-blue-50 text-blue-600' :
                                            ann.target_audience === 'teachers' ? 'bg-purple-50 text-purple-600' :
                                            ann.target_audience === 'parents' ? 'bg-green-50 text-green-600' :
                                            'bg-orange-50 text-orange-600'
                                        }`}>
                                            {ann.target_audience === 'class' ? `Class ${ann.target_class} ${ann.target_section||''}` : ann.target_audience === 'all' ? 'All School' : ann.target_audience === 'teachers' ? 'Teachers Only' : 'Parents Only'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
            <AISidebar isOpen={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />
            
            {/* FLOATING AI BUTTON */}
            <button
                style={{
                  position: 'fixed',
                  bottom: '32px',
                  right: '32px',
                  zIndex: 1000,
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
                  color: 'white',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: '0.3s'
                }}
                className="hover:scale-110"
                onClick={() => setChatOpen(!chatOpen)}
            >
                <span className="material-symbols-outlined">smart_toy</span>
            </button>

            {/* CHAT PANEL */}
            {chatOpen && (
              <div style={{
                position: 'fixed',
                bottom: '108px',
                right: '32px',
                width: '380px',
                height: '520px',
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                border: '1px solid #E5E7EB',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideIn 0.3s ease-out'
              }}>
                <style>{`
                  @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                `}</style>
                
                {/* HEADER */}
                <div style={{
                  background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                  padding: '16px 20px',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">robot</span>
                    </div>
                    <div>
                      <p className="font-black text-sm m-0 leading-none">EduSync Intelligence</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-bold text-blue-100 m-0 uppercase tracking-widest">Principal Assistant Online</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* MESSAGES AREA */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F9FAFB' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      background: m.role === 'user' ? '#2563EB' : 'white',
                      color: m.role === 'user' ? 'white' : '#1F2937',
                      padding: '12px 16px',
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      maxWidth: '85%',
                      fontSize: '14px',
                      fontWeight: '500',
                      lineHeight: '1.5',
                      boxShadow: m.role === 'ai' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                      border: m.role === 'ai' ? '1px solid #E5E7EB' : 'none'
                    }}>
                      <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                      
                      {/* ACTION BUTTONS */}
                      {m.role === 'ai' && m.actions && m.actions.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {m.actions.map((act, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAIAction(act)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #DBEAFE',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: '0.2s'
                                }}
                                className="hover:bg-blue-100"
                            >
                                <span>{act.label}</span>
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ alignSelf: 'flex-start', background: '#E5E7EB', padding: '12px 16px', borderRadius: '18px 18px 18px 4px' }}>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* INPUT AREA */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Principal sahab, kuch poochna hai?"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '100px', padding: '10px 18px', fontSize: '14px', outline: 'none' }}
                  />
                  <button onClick={() => sendMessage()} style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </div>
              </div>
            )}

            {/* PRESENTATION MODE REPORT MODAL */}
            {reportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-5xl bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative my-auto animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="no-print bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <BrainCircuit className="text-white" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Institutional Strategy Document</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Authenticated Principal's Secure Transcript</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setReportModalOpen(false)} 
                                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div id="print-area" className="flex-1 overflow-y-auto p-10 md:p-16 relative">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
                                <h1 className="text-[140px] font-black tracking-tighter rotate-12">OFFICIAL</h1>
                            </div>

                            <div className="relative z-10 space-y-12">
                                <div className="text-center space-y-3">
                                    <div className="flex justify-center mb-6">
                                        <CheckCircle2 className="text-blue-600" size={48} />
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">DAV Centenary Public School</h2>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Administrative Audit Record • {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                                </div>

                                {/* VISUAL ANALYTICS SECTION */}
                                {chartData && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 no-break">
                                        {chartData.attendanceByClass && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance Verification (By Class)</h4>
                                                <div style={{ width: '100%', height: 200 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData.attendanceByClass}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                            <XAxis dataKey="name" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                                                            <YAxis fontSize={10} fontWeight={800} axisLine={false} tickLine={false} domain={[0, 100]} />
                                                            <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}} />
                                                            <Bar dataKey="percentage" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={20} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                        {chartData.feeSplit && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Financial Liquidity Split</h4>
                                                <div style={{ width: '100%', height: 200 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData.feeSplit}
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                <Cell fill="#2563EB" />
                                                                <Cell fill="#F1F5F9" />
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TEXT CONTENT */}
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[200px]">
                                    <div className="whitespace-pre-wrap font-bold text-slate-700 leading-relaxed text-sm md:text-base">
                                        {reportContent}
                                    </div>
                                </div>

                                {/* STRATEGIC ACTION LIST */}
                                {strategicActions.length > 0 && (
                                    <div className="space-y-6 bg-blue-50/50 p-8 rounded-[40px] border border-blue-100 no-break">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="text-blue-600" size={20} />
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Recommended Administrative Actions</h4>
                                        </div>
                                        <div className="grid gap-4">
                                            {strategicActions.map((action, idx) => (
                                                <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-blue-100/50 shadow-sm">
                                                    <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={16} />
                                                    <p className="text-sm font-bold text-slate-600 m-0">{action}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SIGNATURE AREA */}
                                <div className="grid grid-cols-2 gap-20 pt-16 border-t-2 border-slate-50 no-break">
                                    <div className="text-center space-y-1">
                                        <div className="w-32 h-px bg-slate-200 mx-auto mb-4"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Principal</p>
                                        <p className="text-[8px] text-slate-300 uppercase tracking-widest">Shankar Lal Sahab</p>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="w-32 h-px bg-slate-200 mx-auto mb-4"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Strategist AI</p>
                                        <p className="text-[8px] text-slate-300 uppercase tracking-widest underline underline-offset-4 decoration-blue-500/30">System Authenticated Record</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="no-print bg-slate-50/80 px-10 py-6 border-t border-slate-100 flex gap-4 justify-end">
                            <button 
                                onClick={() => window.print()} 
                                className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 cursor-pointer"
                            >
                                <Download size={16} />
                                Get Official PDF
                            </button>
                            <button 
                                onClick={() => setReportModalOpen(false)} 
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @media print {
                            .no-print { display: none !important; }
                            body * { visibility: hidden; }
                            #print-area, #print-area * { visibility: visible; }
                            #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
                            .no-break { break-inside: avoid; }
                            @page { size: auto; margin: 20mm; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default React.memo(PrincipalDashboard);
