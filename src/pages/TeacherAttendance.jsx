import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const ATTENDANCE_API_URL = 'https://edusync.up.railway.app/api/attendance';
const STUDENTS_API_URL = 'https://edusync.up.railway.app/api/students';
const TEACHERS_API_URL = 'https://edusync.up.railway.app/api/teachers';

const TeacherAttendance = () => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[3], 
        section: SCHOOL_SECTIONS[0], 
        date: new Date().toISOString().split('T')[0]
    });
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                try {
                    const res = await axios.get(TEACHERS_API_URL, { params: { email: currentUser.email } });
                    if (res.data && res.data.length > 0) {
                        const profile = res.data[0];
                        setTeacherProfile(profile);
                        setFilters(prev => ({ 
                            ...prev, 
                            class: profile.class_assigned || SCHOOL_CLASSES[3], 
                            section: profile.section_assigned || SCHOOL_SECTIONS[0] 
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching teacher profile:', err);
                }
            }
        };
        fetchProfileData();
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
                marked_by: user?.email || 'System'
            }));

            await axios.post(`${ATTENDANCE_API_URL}/mark`, { attendanceData });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            alert('Error saving attendance: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(student => 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const counts = {
        present: Object.values(attendance).filter(s => s === 'present').length,
        absent: Object.values(attendance).filter(s => s === 'absent').length,
        late: Object.values(attendance).filter(s => s === 'late').length
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <Layout role="teacher">
            <div className="space-y-8">
                {showSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-bold">Attendance synchronized successfully.</span>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Class {filters.class} — Section {filters.section}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search learner..." 
                                className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <input 
                            type="date" 
                            value={filters.date} 
                            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                            className="h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none shadow-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Selection</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Registry...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center">
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No learners found in this sector</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 text-sm font-black text-slate-900">{student.roll_number}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-slate-200">
                                                        {getInitials(student.full_name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-tight">{student.full_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.parent_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-3 text-white">
                                                    <button 
                                                        onClick={() => handleStatusChange(student.id, 'present')}
                                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            attendance[student.id] === 'present' 
                                                            ? 'bg-emerald-500 shadow-lg shadow-emerald-100 ring-2 ring-emerald-500 ring-offset-2' 
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(student.id, 'absent')}
                                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            attendance[student.id] === 'absent' 
                                                            ? 'bg-rose-500 shadow-lg shadow-rose-100 ring-2 ring-rose-500 ring-offset-2' 
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        Absent
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(student.id, 'late')}
                                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            attendance[student.id] === 'late' 
                                                            ? 'bg-amber-500 shadow-lg shadow-amber-100 ring-2 ring-amber-500 ring-offset-2' 
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        Late
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                    <div className="flex items-center gap-8 bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Present: <span className="text-slate-900 ml-1">{counts.present}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Absent: <span className="text-slate-900 ml-1">{counts.absent}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Late: <span className="text-slate-900 ml-1">{counts.late}</span></span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSubmit} 
                        disabled={saving || students.length === 0} 
                        className="w-full md:w-auto h-16 px-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                        {saving ? 'Synchronizing...' : 'Submit Attendance'}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherAttendance;
