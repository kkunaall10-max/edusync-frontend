import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';

const ATTENDANCE_API_URL = 'https://edusync.up.railway.app/api/attendance';
const STUDENTS_API_URL = 'https://edusync.up.railway.app/api/students';

const Attendance = ({ role }) => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[3], 
        section: SCHOOL_SECTIONS[0], 
        date: new Date().toISOString().split('T')[0]
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const fetchStudentsAndAttendance = async () => {
        if (!filters.class || !filters.section) return;
        setLoading(true);
        try {
            const studentsRes = await axios.get(STUDENTS_API_URL, { 
                params: { class: filters.class, section: filters.section } 
            });
            const studentData = studentsRes.data;
            setStudents(studentData);

            const attendanceRes = await axios.get(ATTENDANCE_API_URL, { 
                params: { ...filters } 
            });
            
            const existingAttendance = {};
            attendanceRes.data.forEach(record => {
                existingAttendance[record.student_id] = record.status;
            });

            const initialAttendance = {};
            studentData.forEach(student => {
                initialAttendance[student.id] = existingAttendance[student.id] || 'present';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [filters.class, filters.section, filters.date]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
                student_id: studentId,
                status,
                date: filters.date,
                class: filters.class,
                section: filters.section,
                marked_by: user?.email || 'Principal'
            }));

            await axios.post(`${ATTENDANCE_API_URL}/mark`, { attendanceData });
            alert('Attendance records updated successfully.');
        } catch (error) {
            alert('Error saving: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout role={role}>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight">Attendance</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Daily registry for {filters.class}-{filters.section}</p>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={saving || students.length === 0}
                        className="w-full md:w-auto h-12 px-8 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-lg">sync</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class</label>
                        <select 
                            className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Section</label>
                        <select 
                            className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                        <input 
                            type="date"
                            className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.date}
                            onChange={(e) => setFilters({...filters, date: e.target.value})}
                        />
                    </div>
                </div>

                {/* Content Table / Cards */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium italic">Syncing records...</td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-20 text-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">group_off</span>
                                            <p className="text-slate-900 font-bold">No students found for this selection.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-blue-600 font-mono text-sm">{s.roll_number}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{s.full_name}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {['present', 'late', 'absent'].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(s.id, status)}
                                                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                                                                attendance[s.id] === status
                                                                    ? status === 'present' ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                                                    : status === 'late' ? 'bg-amber-50 border-amber-500 text-amber-600'
                                                                    : 'bg-rose-50 border-rose-500 text-rose-600'
                                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 italic">Syncing daily records...</div>
                        ) : students.length === 0 ? (
                            <div className="p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">group_off</span>
                                <p className="text-slate-900 font-bold">No students matched filters.</p>
                            </div>
                        ) : (
                            students.map((s) => (
                                <div key={s.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 leading-none">{s.full_name}</h4>
                                            <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">Roll: {s.roll_number}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {['present', 'late', 'absent'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(s.id, status)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
                                                        attendance[s.id] === status
                                                            ? status === 'present' ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                                            : status === 'late' ? 'bg-amber-50 border-amber-500 text-amber-600'
                                                            : 'bg-rose-50 border-rose-500 text-rose-600'
                                                            : 'bg-white border-slate-200 text-slate-300'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {status === 'present' ? 'check_circle' : status === 'late' ? 'schedule' : 'cancel'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Mobile status indicator */}
                                    <div className={`p-2 rounded-xl text-center text-[10px] font-black uppercase tracking-widest ${
                                        attendance[s.id] === 'present' ? 'bg-emerald-50 text-emerald-600'
                                        : attendance[s.id] === 'late' ? 'bg-amber-50 text-amber-600'
                                        : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        Currently Marked: {attendance[s.id]}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Attendance;

