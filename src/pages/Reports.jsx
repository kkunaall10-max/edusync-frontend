import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import { 
    FileText, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle, 
    Printer, 
    Search, 
    Download, 
    Filter,
    ArrowRight,
    ChevronDown
} from 'lucide-react';

const API_BASE_URL = 'https://edusync.up.railway.app/api/reports';
const STUDENTS_API_URL = 'https://edusync.up.railway.app/api/students';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('attendance');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');

    // Filters
    const [attFilters, setAttFilters] = useState({ 
        class: SCHOOL_CLASSES[3] || 'Class 1', 
        section: 'A', 
        month: (new Date().getMonth() + 1).toString(), 
        year: '2026' 
    });

    const [feeFilters, setFeeFilters] = useState({ 
        month: (new Date().getMonth() + 1).toString(), 
        year: '2026' 
    });

    const [academicFilters, setAcademicFilters] = useState({ 
        class: SCHOOL_CLASSES[3] || 'Class 1', 
        section: 'A', 
        exam_type: 'Unit Test' 
    });

    const MONTHS = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    const fetchAttendanceReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/attendance-summary`, { params: attFilters });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching attendance report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeeReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/fee-summary`, { params: feeFilters });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching fee report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAcademicReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/marks-summary`, { params: academicFilters });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching academic report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentReportCard = async (studentId) => {
        if (!studentId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/student-report/${studentId}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching student report card:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await axios.get(STUDENTS_API_URL);
            setAllStudents(res.data);
        } catch (error) {
            console.error('Error fetching all students:', error);
        }
    };

    useEffect(() => {
        fetchAllStudents();
    }, []);

    useEffect(() => {
        if (activeTab === 'attendance') fetchAttendanceReport();
        if (activeTab === 'fee') fetchFeeReport();
        if (activeTab === 'academic') fetchAcademicReport();
        if (activeTab === 'report-card' && selectedStudent) fetchStudentReportCard(selectedStudent);
    }, [activeTab, attFilters, feeFilters, academicFilters, selectedStudent]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Layout>
            <div className="flex flex-col space-y-8">
                <div className="no-print space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Institutional Audit</h1>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Academic & Financial Transcripts</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar gap-2">
                        {[
                            { id: 'attendance', label: 'Attendance Audit', icon: CheckCircle },
                            { id: 'fee', label: 'Financial Audit', icon: TrendingUp },
                            { id: 'academic', label: 'Academic Analysis', icon: Search },
                            { id: 'report-card', label: 'Student Record', icon: FileText }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { 
                                    if(activeTab === tab.id) {
                                        if (activeTab === 'attendance') fetchAttendanceReport();
                                        if (activeTab === 'fee') fetchFeeReport();
                                        if (activeTab === 'academic') fetchAcademicReport();
                                        if (activeTab === 'report-card' && selectedStudent) fetchStudentReportCard(selectedStudent);
                                    } else {
                                        setActiveTab(tab.id); 
                                        setData(null); 
                                    }
                                }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeTab === tab.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    {activeTab !== 'report-card' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-end">
                            {activeTab === 'attendance' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Class</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer" 
                                            value={attFilters.class} onChange={(e)=>setAttFilters({...attFilters, class: e.target.value})}>
                                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                                            value={attFilters.section} onChange={(e)=>setAttFilters({...attFilters, section: e.target.value})}>
                                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Month</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                                            value={attFilters.month} onChange={(e)=>setAttFilters({...attFilters, month: e.target.value})}>
                                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                            {activeTab === 'fee' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Month</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                                            value={feeFilters.month} onChange={(e)=>setFeeFilters({...feeFilters, month: e.target.value})}>
                                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Year</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                                            value={feeFilters.year} onChange={(e)=>setFeeFilters({...feeFilters, year: e.target.value})}>
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {activeTab === 'academic' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Class</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                                            value={academicFilters.class} onChange={(e)=>setAcademicFilters({...academicFilters, class: e.target.value})}>
                                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exam Type</label>
                                        <select className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                                            value={academicFilters.exam_type} onChange={(e)=>setAcademicFilters({...academicFilters, exam_type: e.target.value})}>
                                            {['Unit Test', 'Mid Term', 'Final Exam', 'Assignment'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                            <button 
                                onClick={activeTab === 'attendance' ? fetchAttendanceReport : activeTab === 'fee' ? fetchFeeReport : fetchAcademicReport}
                                className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                Sync Report
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {activeTab === 'report-card' && (
                        <div className="max-w-md mx-auto bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center">Protocol Subject Selection</label>
                                <div className="relative">
                                    <select className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all" 
                                        value={selectedStudent} onChange={(e)=>setSelectedStudent(e.target.value)}>
                                        <option value="">Choose student profile...</option>
                                        {allStudents.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Scholastic Data...</p>
                    </div>
                ) : data ? (
                    <>
                        {activeTab === 'attendance' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Total Enrolment', value: data.totalStudents, color: 'text-slate-900' },
                                        { label: 'Institutional Avg', value: `${data.classAvg}%`, color: 'text-blue-600' },
                                        { label: 'Critical Variance', value: data.below75Count, color: 'text-rose-600' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Index</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Identity</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ratio</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.breakdown.map(s => (
                                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-400">#{s.roll_number}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{s.full_name}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{s.present} / {s.total}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-blue-600">{s.percentage}%</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {data.breakdown.map(s => (
                                        <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{s.roll_number}</p>
                                                    <h3 className="text-base font-black text-slate-900">{s.full_name}</h3>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {s.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ratio</p>
                                                    <p className="text-sm font-bold text-slate-600">{s.present} / {s.total}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</p>
                                                    <p className="text-sm font-black text-blue-600">{s.percentage}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'fee' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Gross Verified', value: `₹${data.totalCollected}`, color: 'text-emerald-600' },
                                        { label: 'Network Pending', value: `₹${data.totalPending}`, color: 'text-blue-600' },
                                        { label: 'Critical Arrears', value: `₹${data.totalOverdue}`, color: 'text-rose-600' },
                                        { label: 'Liquidity Rate', value: `${data.collectionPercentage}%`, color: 'text-slate-900' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Name</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.records.map(f => (
                                                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-black text-slate-900">{f.fee_type}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.month} {f.year || '2026'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{f.student?.full_name}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(f.due_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-slate-900">₹{f.amount}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${f.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {f.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {data.records.map(f => (
                                        <div key={f.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-base font-black text-slate-900">{f.fee_type}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.student?.full_name}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${f.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {f.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                                                    <p className="text-sm font-bold text-slate-600">{new Date(f.due_date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</p>
                                                    <p className="text-sm font-black text-slate-900">₹{f.amount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'academic' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Scholastic Avg', value: `${data.classAvg}%`, color: 'text-slate-900' },
                                        { label: 'Peak Performance', value: `${data.highest}%`, color: 'text-emerald-600' },
                                        { label: 'Protocol Pass', value: data.passCount, color: 'text-blue-600' },
                                        { label: 'Revision Required', value: data.failCount, color: 'text-rose-600' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discipline</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrix Score</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Scholastic Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.records.map(r => (
                                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{r.student?.full_name}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{r.subject}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-black text-slate-900">{r.marks_obtained} / {r.total_marks}</p>
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{r.percentage}% Achievement</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-xs font-black ${r.grade === 'F' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-900'}`}>
                                                            {r.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {data.records.map(r => (
                                        <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-base font-black text-slate-900">{r.student?.full_name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.subject}</p>
                                                </div>
                                                <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full text-xs font-black ${r.grade === 'F' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-900'}`}>
                                                    {r.grade}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Ratio</p>
                                                    <p className="text-sm font-black text-slate-900">{r.marks_obtained} / {r.total_marks}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</p>
                                                    <p className="text-sm font-black text-blue-600">{r.percentage}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'report-card' && (
                            <div className="space-y-10">
                                <div className="bg-white max-w-3xl mx-auto p-10 md:p-16 rounded-[48px] border-4 border-slate-100 shadow-2xl relative overflow-hidden print:border-0 print:shadow-none print:p-0">
                                    {/* Watermark/Accent */}
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
                                    
                                    <div className="relative space-y-12">
                                        <div className="text-center space-y-2">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Official Institutional Transcript</p>
                                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">DAV CENTENARY PUBLIC SCHOOL</h2>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Year Cluster: 2023 - 2024</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y-2 border-slate-100">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Identity</p>
                                                <p className="text-lg font-black text-slate-900">{data.student.full_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Roll</p>
                                                <p className="text-lg font-black text-slate-900">{data.student.roll_number}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2 md:col-span-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorization</p>
                                                <p className="text-lg font-black text-slate-900">{data.student.class} — {data.student.section}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-8 h-0.5 bg-blue-600"></div>
                                                Scholastic Achievement Matrix
                                            </h3>
                                            <div className="overflow-hidden rounded-3xl border-2 border-slate-100">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50">
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discipline</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Max</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Achieved</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Grade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {data.marks.map(m => (
                                                            <tr key={m.id}>
                                                                <td className="px-6 py-4 text-sm font-black text-slate-900">{m.subject}</td>
                                                                <td className="px-6 py-4 text-sm font-bold text-slate-400 text-center">{m.total_marks}</td>
                                                                <td className="px-6 py-4 text-sm font-black text-slate-900 text-center">{m.marks_obtained}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`text-sm font-black ${m.grade === 'F' ? 'text-rose-600' : 'text-slate-900'}`}>{m.grade}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-slate-900 text-white">
                                                            <td className="px-6 py-6 text-sm font-black uppercase tracking-widest" colSpan="2">Aggregate Scholastic Score</td>
                                                            <td className="px-6 py-6 text-3xl font-black text-right" colSpan="2">{data.attendanceSummary.percentage}%</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-20 pt-10">
                                            <div className="border-t-2 border-slate-200 pt-4 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Principal</p>
                                                <p className="text-[9px] text-slate-300 mt-1 italic tracking-widest">Digitally Verified Architecture</p>
                                            </div>
                                            <div className="border-t-2 border-slate-200 pt-4 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parental Acknowledgement</p>
                                                <p className="text-[9px] text-slate-300 mt-1">Status: Electronic Handshake Req.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button onClick={handlePrint} className="no-print h-16 px-10 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3">
                                        <Printer size={20} />
                                        Print Official Transcript
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200">
                            <FileText size={48} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">System Ready for Audit</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Apply filters above to generate scholastic data</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    .Layout-main { margin-left: 0 !important; padding: 0 !important; }
                    .Layout-sidebar { display: none !important; }
                    .Layout-header { display: none !important; }
                }
            `}</style>
        </Layout>
    );
};

export default Reports;
