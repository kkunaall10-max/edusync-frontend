import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import LoadingScreen from './components/LoadingScreen';

// Principal Pages (White UI)
import PrincipalDashboard from './pages/PrincipalDashboard';
import StudentList from './pages/StudentList';
import TeacherList from './pages/TeacherList';
import PrincipalAttendance from './pages/Attendance';
import PrincipalHomework from './pages/Homework';
import PrincipalMarks from './pages/Marks';
import FeeManagement from './pages/FeeManagement';
import Reports from './pages/Reports';

// Teacher Pages (Nature/Glassmorphism UI)
import TeacherDashboard from './pages/teacher/Dashboard';
import MyStudents from './pages/teacher/MyStudents';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherHomework from './pages/teacher/Homework';
import TeacherMarks from './pages/teacher/Marks';

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
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // FIX 6: 3 second loading screen on first render
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return <LoadingScreen />;
  }

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
            <PrincipalAttendance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/homework" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <PrincipalHomework />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/marks" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <PrincipalMarks />
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
            <MyStudents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/attendance" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAttendance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/homework" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherHomework />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/marks" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherMarks />
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
