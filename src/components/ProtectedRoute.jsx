import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const fetchSessionAndRole = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        if (mounted) {
          setLoading(false);
          setSession(null);
        }
        return;
      }

      if (mounted) setSession(currentSession);

      // Fetch user role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();

      if (mounted) {
        if (!error && profile) {
          setRole(profile.role.toLowerCase());
        } else {
          console.error('Error fetching role:', error);
          setRole(null);
        }
        setLoading(false);
      }
    };

    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        if (!session) {
          setRole(null);
        } else {
          fetchSessionAndRole();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their respective correct dashboard instead of just /unauthorized
    if (role === 'principal') return <Navigate to="/dashboard/principal" replace />;
    if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
    if (role === 'parent') return <Navigate to="/dashboard/parent" replace />;
    if (role === 'student') return <Navigate to="/dashboard/student" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return typeof children === 'function' ? children({ role }) : children;
};

export default ProtectedRoute;
