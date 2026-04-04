import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

const STUDENTS_API_URL = 'https://edusync.up.railway.app/api/students';
const MARKS_API_URL = 'https://edusync.up.railway.app/api/marks';
const TEACHERS_API_URL = 'https://edusync.up.railway.app/api/teachers';

const TeacherMarks = () => {
    const [activeTab, setActiveTab] = useState('enterMarks'); 
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [marks, setMarks] = useState({});
    const [previousResults, setPreviousResults] = useState([]);

    const [examConfig, setExamConfig] = useState({
        examType: 'Mid Term',
        examDate: new Date().toISOString().split('T')[0],
        totalMarks: 100
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    const tRes = await axios.get(TEACHERS_API_URL, { params: { email: user.email } });
                    if (tRes.data && tRes.data.length > 0) {
                        const profile = tRes.data[0];
                        setTeacherProfile(profile);
                        
                        const sRes = await axios.get(STUDENTS_API_URL, { 
                            params: { class: profile.class_assigned, section: profile.section_assigned } 
                        });
                        setStudents(sRes.data);
                    }
                } catch (err) { console.error(err); }
                finally { setLoading(false); }
            }
        };
        fetchAll();
    }, []);

    const fetchPreviousResults = async () => {
        if (!teacherProfile) return;
        setLoading(true);
        try {
            const res = await axios.get(MARKS_API_URL, { 
                params: { class: teacherProfile.class_assigned, section: teacherProfile.section_assigned } 
            });
            setPreviousResults(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (activeTab === 'previousResults') fetchPreviousResults(); }, [activeTab]);

    const handleMarkChange = (studentId, value) => {
        const numValue = Math.min(examConfig.totalMarks, Math.max(0, parseInt(value) || 0));
        setMarks(prev => ({ ...prev, [studentId]: numValue }));
    };

    const calculateGrade = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const marksData = Object.entries(marks).map(([studentId, score]) => ({
                student_id: studentId,
                exam_type: examConfig.examType,
                subject: teacherProfile?.subject_assigned,
                marks_obtained: score,
                total_marks: examConfig.totalMarks,
                exam_date: examConfig.examDate,
                grade: calculateGrade(score, examConfig.totalMarks)
            }));
            await axios.post(`${MARKS_API_URL}/bulk`, { marksData });
            alert('Academic records synchronized.');
            setMarks({});
        } catch (err) { alert('Synchronization failed.'); }
        finally { setSaving(false); }
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
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance Portal</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Scholastic evaluation and grading</p>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
                        <button 
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'enterMarks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setActiveTab('enterMarks')}
                        >
                            Enter Marks
                        </button>
                        <button 
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'previousResults' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setActiveTab('previousResults')}
                        >
                            History
                        </button>
                    </div>
                </div>

                {activeTab === 'enterMarks' ? (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exam Category</label>
                                <select 
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
                                    value={examConfig.examType} 
                                    onChange={(e) => setExamConfig({ ...examConfig, examType: e.target.value })}
                                >
                                    <option>Mid Term</option>
                                    <option>Final Exam</option>
                                    <option>Unit Test</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assessment Date</label>
                                <input 
                                    type="date" 
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                    value={examConfig.examDate} 
                                    onChange={(e) => setExamConfig({ ...examConfig, examDate: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Maximum Score</label>
                                <input 
                                    type="number" 
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                    value={examConfig.totalMarks} 
                                    onChange={(e) => setExamConfig({ ...examConfig, totalMarks: parseInt(e.target.value) })} 
                                />
                            </div>
                            <button 
                                onClick={handleSave} 
                                disabled={saving || students.length === 0} 
                                className="h-12 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-1"
                            >
                                {saving ? 'Syncing...' : 'Bulk Sync'}
                            </button>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identify</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Score</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-sm font-black text-slate-400 uppercase tracking-widest">Compiling Records...</td></tr>
                                    ) : students.length === 0 ? (
                                        <tr><td colSpan="3" className="px-8 py-20 text-center text-sm font-black text-slate-400 uppercase tracking-widest">No learners found</td></tr>
                                    ) : (
                                        students.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-slate-200">
                                                            {getInitials(s.full_name)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 leading-tight">{s.full_name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Roll: {s.roll_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="number" 
                                                            className="w-24 h-10 bg-slate-50 border-none rounded-xl px-3 text-sm font-black text-slate-900 text-center outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                                            value={marks[s.id] || ''} 
                                                            onChange={(e) => handleMarkChange(s.id, e.target.value)} 
                                                        />
                                                        <span className="text-xs font-black text-slate-300">/ {examConfig.totalMarks}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        calculateGrade(marks[s.id] || 0, examConfig.totalMarks) === 'F' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                        {calculateGrade(marks[s.id] || 0, examConfig.totalMarks)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Performance</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving History...</td></tr>
                                ) : previousResults.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-sm font-black text-slate-400 uppercase tracking-widest">No previous records found</td></tr>
                                ) : (
                                    previousResults.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6 text-sm font-black text-slate-900">{r.student_name}</td>
                                            <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.exam_type}</td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-600">{r.subject}</td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900">{r.marks_obtained} <span className="text-slate-300">/ {r.total_marks}</span></td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    r.grade === 'F' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {r.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TeacherMarks;
