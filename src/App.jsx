import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
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
import LeaveManagement from './pages/LeaveManagement';
import Announcements from './pages/Announcements';

// Teacher Pages (Nature/Glassmorphism UI)
import TeacherDashboard from './pages/teacher/Dashboard';
import MyStudents from './pages/teacher/MyStudents';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherHomework from './pages/teacher/Homework';
import TeacherMarks from './pages/teacher/Marks';
import LeaveRequests from './pages/teacher/LeaveRequests';
import TeacherAnnouncements from './pages/teacher/Announcements';

// Extra Pages
import ParentDashboard from './pages/ParentDashboard';
import ParentAnnouncements from './pages/ParentAnnouncements';
import StudentDashboard from './pages/StudentDashboard';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Analytics from './pages/Analytics';

import ProtectedRoute from './components/ProtectedRoute';

// Landing / Public pages
import About from './pages/About';
import FeaturesPage from './pages/FeaturesPage';
import SecurityPage from './pages/SecurityPage';
import FAQPage from './pages/FAQPage';
import MobileAppPage from './pages/MobileAppPage';
import ContactPage from './pages/ContactPage';
import DemoPage from './pages/DemoPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import PublicSupport from './pages/PublicSupport';


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
      <Route path="/" element={<Home />} />
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
        path="/dashboard/announcements" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <Announcements />
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
      <Route 
        path="/dashboard/leave-management" 
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <LeaveManagement />
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
      <Route 
        path="/dashboard/teacher/leaves" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <LeaveRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/teacher/announcements" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAnnouncements />
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
        path="/dashboard/analytics" 
        element={
          <ProtectedRoute allowedRoles={['principal', 'teacher']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/parent" 
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/parent/announcements" 
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentAnnouncements />
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

      {/* =========================================================
          PUBLIC / LANDING ROUTES
          ========================================================= */}
      <Route path="/about"          element={<About />} />
      <Route path="/features"       element={<FeaturesPage />} />
      <Route path="/security"       element={<SecurityPage />} />
      <Route path="/faq"            element={<FAQPage />} />
      <Route path="/mobile-app"     element={<MobileAppPage />} />
      <Route path="/contact"        element={<ContactPage />} />
      <Route path="/demo"           element={<DemoPage />} />
      <Route path="/privacy"        element={<PrivacyPage />} />
      <Route path="/terms"          element={<TermsPage />} />
      <Route path="/public-support" element={<PublicSupport />} />

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
