import React from 'react';
import Layout from '../components/Layout';

const StudentDashboard = () => {
  return (
    <Layout role="student">
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Learning Journey</h3>
        <p className="text-slate-600">Your courses and upcoming assignments.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-4">
             <h4 className="font-bold text-slate-900">Current Courses</h4>
             {[
               { name: 'Introduction to Biology', progress: 65 },
               { name: 'World History', progress: 42 },
               { name: 'Modern Literature', progress: 88 },
             ].map((course) => (
               <div key={course.name} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                 <div className="flex justify-between mb-2">
                   <span className="font-medium text-slate-700">{course.name}</span>
                   <span className="text-sm text-slate-500 font-bold">{course.progress}%</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-2">
                   <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl">
            <h4 className="font-bold mb-4">Upcoming Deadlines</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-amber-400 pl-4">
                <p className="text-sm font-bold">Physics Lab Report</p>
                <p className="text-xs text-slate-400">Due in 2 days</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm font-bold">Math Quiz</p>
                <p className="text-xs text-slate-400">Due in 5 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
