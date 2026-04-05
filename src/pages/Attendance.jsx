import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import { 
  ClipboardCheck, Search, Users, Calendar, 
  ChevronRight, ArrowRight, Download, Filter
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api';

const Attendance = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[4], // Default to Class 5
        section: SCHOOL_SECTIONS[0],
        date: new Date().toISOString().split('T')[0]
    });

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const [stdRes, attRes] = await Promise.all([
                axios.get(`${API_BASE}/students`, { params: { class: filters.class, section: filters.section } }),
                axios.get(`${API_BASE}/attendance`, { params: { class: filters.class, section: filters.section, date: filters.date } })
            ]);
            setStudents(stdRes.data);
            setAttendanceData(attRes.data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [filters.class, filters.section, filters.date]);

    const getStatus = (studentId) => {
        const record = attendanceData.find(a => a.student_id === studentId);
        return record ? record.status : 'N/A';
    };

    const stats = {
        total: students.length,
        present: attendanceData.filter(a => a.status === 'present').length,
        absent: attendanceData.filter(a => a.status === 'absent').length,
        late: attendanceData.filter(a => a.status === 'late').length
    };

    const exportCSV = () => {
        const headers = ['Roll No','Student Name','Status','Date'];
        const rows = students.map(s => [
            s.roll_number, s.full_name, getStatus(s.id), filters.date
        ]);
        const csv = [headers, ...rows]
            .map(r => r.join(','))
            .join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Layout role="principal">
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header section with Premium White UI */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance Logs</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
                            Institutional Presence Monitoring
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</label>
                        <input 
                            type="date"
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.date} 
                            onChange={(e) => setFilters({...filters, date: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Actions</label>
                        <button 
                            onClick={exportCSV}
                            className="h-12 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Status Briefing */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-blue-600">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Students</span>
                            <Users size={16} className="text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">{stats.total}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present Today</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">{stats.present}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">{stats.absent}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Arrival</span>
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">{stats.late}</h2>
                    </div>
                </div>

                {/* Main Roll Sheet Table */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-bottom border-slate-100">
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Standard</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Roll No.</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No scholars found in this division</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => {
                                    const status = getStatus(student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                        {student.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900">{student.full_name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.parent_email || 'No Email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-xs font-black text-slate-700">{student.class} - {student.section}</span>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-xs font-black text-slate-700">{student.roll_number}</span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                                    status === 'absent' ? 'bg-rose-50 text-rose-600' :
                                                    status === 'late' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {status}
                                                </span>
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

export default Attendance;
