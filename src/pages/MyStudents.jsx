import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

const API_BASE_URL = 'https://edusync.up.railway.app/api';

const MyStudents = () => {
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // 1. Fetch Teacher Profile
            let profile = null;
            try {
                const teacherRes = await axios.get(`${API_BASE_URL}/teachers`, { params: { email: user.email } });
                if (teacherRes.data && teacherRes.data.length > 0) {
                    profile = teacherRes.data[0];
                    setTeacherProfile(profile);
                }
            } catch (err) {
                console.error("Error fetching teacher profile:", err);
            }

            if (!profile) return;

            // 2. Fetch Students for the class
            let studentsData = [];
            try {
                const studentsRes = await axios.get(`${API_BASE_URL}/students`, { 
                    params: { 
                        class: profile.class_assigned, 
                        section: profile.section_assigned 
                    } 
                });
                studentsData = studentsRes.data;
                setStudents(studentsData);
                setFilteredStudents(studentsData);
            } catch (err) {
                console.error("Error fetching students:", err);
            }

            // 3. Fetch Fee Status for each student
            if (studentsData.length > 0) {
                const studentsWithFees = await Promise.all(studentsData.map(async (student) => {
                    let feeStatus = 'Pending';
                    try {
                        const feesRes = await axios.get(`${API_BASE_URL}/fees/student/${student.id}`);
                        const latestFee = feesRes.data && feesRes.data.length > 0 ? feesRes.data[0] : null;
                        const today = new Date().toISOString().split('T')[0];

                        if (latestFee) {
                            if (latestFee.status === 'paid') {
                                feeStatus = 'Paid';
                            } else if (latestFee.status === 'pending') {
                                if (latestFee.due_date < today) {
                                    feeStatus = 'Overdue';
                                } else {
                                    feeStatus = 'Pending';
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching fees for student ${student.id}:`, err);
                    }
                    return { ...student, feeStatus };
                }));
                setStudents(studentsWithFees);
                setFilteredStudents(studentsWithFees);
            }

        } catch (error) {
            console.error("Critical error in fetchData:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student => 
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900/5">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aggregating Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout role="teacher">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Students</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Class {teacherProfile?.class_assigned} — Section {teacherProfile?.section_assigned}
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter students..." 
                            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <span className="material-symbols-outlined text-4xl">group_off</span>
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest underline decoration-rose-500/30">No students found in this sector</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/30 transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                                        {getInitials(student.full_name)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{student.full_name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Roll Identity: {student.roll_number}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Status</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            student.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                                            student.feeStatus === 'Overdue' ? 'bg-rose-50 text-rose-600' : 
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                            {student.feeStatus}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${
                                            student.feeStatus === 'Paid' ? 'w-full bg-emerald-500' : 
                                            student.feeStatus === 'Overdue' ? 'w-1/3 bg-rose-500' : 
                                            'w-2/3 bg-amber-500'
                                        }`}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class {student.class}-{student.section}</span>
                                    <button 
                                        onClick={() => navigate(`/dashboard/teacher/attendance`)}
                                        className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-wider hover:gap-3 transition-all">
                                        Mark Attendance
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyStudents;

