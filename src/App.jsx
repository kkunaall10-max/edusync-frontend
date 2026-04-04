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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      
      {/* =========================================================
          PRINCIPAL ROUTES (White UI) - Prefix: /dashboard/
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
          TEACHER ROUTES (Nature UI) - Prefix: /dashboard/teacher/
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
          PARENT ROUTES
          ========================================================= */}
      <Route 
        path="/dashboard/parent" 
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        } 
      />

      {/* =========================================================
          STUDENT ROUTES
          ========================================================= */}
      <Route 
        path="/dashboard/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

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

      {/* =========================================================
          GLOBAL REDIRECTS & ERRORS
          ========================================================= */}
      {/* Catch-all unauthorized or missing routes */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
            <p className="mt-2 text-slate-600">You do not have permission to view this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 text-slate-900 underline"
            >
              Go to Login
            </button>
          </div>
        </div>
      } />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
