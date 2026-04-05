import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './pages/HomePage';

// Principal Pages (White UI)
import PrincipalDashboard from './pages/PrincipalDashboard';
import StudentList from './pages/StudentList';
import TeacherList from './pages/TeacherList';
import Attendance from './pages/Attendance';
import Homework from './pages/Homework';
import Marks from './pages/Marks';
import FeeManagement from './pages/FeeManagement';
import Reports from './pages/Reports';

// Teacher Pages (Nature/Glassmorphism UI)
import TeacherDashboard from './pages/TeacherDashboard';
import MyStudents from './pages/MyStudents';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherHomework from './pages/TeacherHomework';
import TeacherMarks from './pages/TeacherMarks';

// Extra Pages
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Settings from './pages/Settings';
import Support from './pages/Support';

import ProtectedRoute from './components/ProtectedRoute';

const DashboardRedirect = ({ role }) => {
  if (role === 'principal') return <Navigate to="/dashboard/principal" replace />;
  if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
  if (role === 'parent') return <Navigate to="/dashboard/parent" replace />;
  if (role === 'student') return <Navigate to="/dashboard/student" replace />;
  return <Navigate to="/unauthorized" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      
      {/* Role-based entry point */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {({ role }) => <DashboardRedirect role={role} />}
          </ProtectedRoute>
        } 
      />

      {/* =========================================================
          PRINCIPAL ROUTES (White UI)
          ========================================================= */}
      <Route 
        path="/dashboard/principal" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <PrincipalDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/students" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <StudentList role="principal" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teachers" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <TeacherList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/attendance" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <Attendance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/homework" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <Homework />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/marks" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <Marks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/fees" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <FeeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/reports" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <Reports />
          </ProtectedRoute>
        } 
      />

      {/* =========================================================
          TEACHER ROUTES (Nature UI)
          ========================================================= */}
      <Route 
        path="/dashboard/teacher" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/students" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <StudentList role="teacher" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/attendance" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Attendance role="teacher" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/homework" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Homework role="teacher" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/marks" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Marks role="teacher" />
          </ProtectedRoute>
        } 
      />

      {/* =========================================================
          GLOBAL SHARED ROUTES
          ========================================================= */}
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute allowedRoles={['principal', 'teacher', 'parent', 'student']}>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/support" 
        element={
          <ProtectedRoute allowedRoles={['principal', 'teacher', 'parent', 'student']}>
            <Support />
          </ProtectedRoute>
        } 
      />

      {/* Other specific dashboards */}
      <Route 
        path="/dashboard/parent" 
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="max-w-md w-full text-center p-8 border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50">
            <h1 className="text-3xl font-black text-red-600 mb-4 tracking-tighter">Unauthorized</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Your access credentials do not permit entry to this node. Please contact your system administrator.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Back to Terminal
            </button>
          </div>
        </div>
      } />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
