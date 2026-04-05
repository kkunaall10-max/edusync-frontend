import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import { 
  GraduationCap, Search, Filter, Plus, Calendar, 
  ChevronRight, ArrowRight, Download, BarChart2, Award, Target
} from 'lucide-react';

const API_BASE = 'https://edusync.up.railway.app/api';

const Marks = () => {
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[4], // Default to Class 5
        section: SCHOOL_SECTIONS[0],
        exam_type: 'Unit Test',
        subject: ''
    });

    const EXAM_TYPES = ['Unit Test', 'Class Test', 'Mid Term', 'Half Yearly', 'Final Exam', 'Assignment'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stdRes, marksRes] = await Promise.all([
                axios.get(`${API_BASE}/students`, { params: { class: filters.class, section: filters.section } }),
                axios.get(`${API_BASE}/marks`, { 
                    params: { 
                        class: filters.class, 
                        section: filters.section,
                        exam_type: filters.exam_type,
                        subject: filters.subject 
                    } 
                })
            ]);
            setStudents(stdRes.data);
            setMarks(marksRes.data);
        } catch (err) {
            console.error('Error fetching marks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.class, filters.section, filters.exam_type, filters.subject]);

    const getMarks = (studentId) => {
        const record = marks.find(m => m.student_id === studentId);
        return record ? `${record.marks_obtained}/${record.total_marks}` : 'N/A';
    };

    const getPercentage = (studentId) => {
        const record = marks.find(m => m.student_id === studentId);
        if (!record) return 0;
        return ((record.marks_obtained / record.total_marks) * 100).toFixed(1);
    };

    return (
        <Layout role="principal">
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header section with Premium White UI */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Performance</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
                            Institutional Scholastic Assessment Records
                        </p>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Class</label>
                        <select 
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.class} 
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section</label>
                        <select 
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.section} 
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exam Cycle</label>
                        <select 
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.exam_type} 
                            onChange={(e) => setFilters({...filters, exam_type: e.target.value})}
                        >
                            {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Export</label>
                        <button className="h-12 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]">
                            <Download size={14} /> Merit Rankings
                        </button>
                    </div>
                </div>

                {/* Performance Briefing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
                            <Target size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Cohort Average</p>
                            <h2 className="text-3xl font-black text-slate-900">{marks.length > 0 ? (marks.reduce((a,b) => a + (b.marks_obtained/b.total_marks)*100, 0) / marks.length).toFixed(1) : 0}%</h2>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
                            <Award size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Peak Excellence</p>
                            <h2 className="text-3xl font-black text-slate-900">{marks.length > 0 ? Math.max(...marks.map(m => (m.marks_obtained/m.total_marks)*100)).toFixed(1) : 0}%</h2>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center">
                            <BarChart2 size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Assessments Tracked</p>
                            <h2 className="text-3xl font-black text-slate-900">{marks.length}</h2>
                        </div>
                    </div>
                </div>

                {/* Main Marks Table */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-bottom border-slate-100">
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Scholar Identity</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Subject</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Score / Total</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Performance Rank</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Evaluation Metrics...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cohort records not found</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => {
                                    const percentage = getPercentage(student.id);
                                    const record = marks.find(m => m.student_id === student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                        {student.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900">{student.full_name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Roll: {student.roll_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {record?.subject || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="text-sm font-black text-slate-900">{getMarks(student.id)}</span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                                percentage >= 80 ? 'bg-emerald-500' :
                                                                percentage >= 60 ? 'bg-blue-500' :
                                                                percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                            }`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-900 min-w-[40px] italic">{percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Marks;
