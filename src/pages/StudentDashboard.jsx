import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import apiClient from '../utils/api';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const studentsRes = await apiClient.get('/students');
          const currentStudent = Array.isArray(studentsRes.data) ? studentsRes.data[0] : null;

          if (!currentStudent?.id) {
            throw new Error('Student profile not linked to this account');
          }

          const res = await apiClient.get(`/reports/student-report/${currentStudent.id}`);
          // Transform marks into course format
          const marks = res.data.marks || [];
          const uniqueSubjects = [...new Set(marks.map(m => m.subject))];
          
          const courses = uniqueSubjects.map(sub => {
            const subMarks = marks.filter(m => m.subject === sub);
            const avg = subMarks.reduce((acc, m) => acc + parseFloat(m.percentage), 0) / subMarks.length;
            return { name: sub, progress: Math.min(100, Math.ceil(avg)) };
          });

          setData({
            ...res.data,
            courses: courses.length > 0 ? courses : [
              { name: 'Enrolling in Subjects...', progress: 0 }
            ]
          });
        }
      } catch (err) {
        console.error("Error fetching student dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Learning Journey: {data?.student?.full_name || 'Student'}
            </h3>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
              Class {data?.student?.class} | Section {data?.student?.section}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-right">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Attendance</p>
            <p className="text-xl font-black text-emerald-700 leading-none">{data?.attendanceSummary?.percentage}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-4">
             <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Academic Performance
             </h4>
             {data?.courses?.map((course) => (
               <div key={course.name} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                 <div className="flex justify-between mb-3">
                   <span className="font-bold text-slate-700">{course.name}</span>
                   <span className="text-sm text-blue-600 font-black">{course.progress}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3">
                   <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${course.progress}%`, boxShadow: '0 0 10px rgba(37, 99, 235, 0.3)' }}
                   ></div>
                 </div>
               </div>
             ))}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <h4 className="font-bold mb-4 relative z-10">Financial Status</h4>
              <div className="space-y-4 relative z-10">
                {data?.fees?.filter(f => f.status !== 'paid').length > 0 ? (
                  data.fees.filter(f => f.status !== 'paid').slice(0, 2).map((fee, idx) => (
                    <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/5">
                      <p className="text-xs font-bold text-white/60 uppercase">{fee.fee_type}</p>
                      <p className="font-black text-white">₹{fee.amount}</p>
                      <p className="text-[10px] text-amber-400 font-bold">Due: {fee.due_date}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-emerald-400 font-bold">✓ All Fees Paid</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center">
               <p className="text-sm font-bold text-slate-400">Next Big Exam</p>
               <p className="text-xl font-black text-slate-600 mt-1 uppercase tracking-tighter">Mid-Term 2026</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
