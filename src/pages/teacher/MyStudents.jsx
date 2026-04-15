import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import apiClient from '../../utils/api';
import {
  Menu, X, Users, Search, Mail, Phone, Calendar,
  TrendingUp, ClipboardCheck, BookOpen, GraduationCap,
  LogOut, Megaphone, AlertCircle, Settings
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Not provided';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not provided';
  return parsed.toLocaleDateString();
};

const MyStudents = () => {
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leaveStats, setLeaveStats] = useState({ pendingLeaves: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const teacherRes = await apiClient.get('/teachers/profile', {
        params: { email: user.email }
      });
      const profile = teacherRes.data;
      setTeacherProfile(profile);

      const [studentsRes, leavesRes] = await Promise.all([
        apiClient.get('/students', {
          params: {
            class: profile.class_assigned,
            section: profile.section_assigned
          }
        }),
        apiClient.get('/leave/teacher', {
          params: {
            class: profile.class_assigned,
            section: profile.section_assigned,
            status: 'pending'
          }
        })
      ]);

      setStudents(studentsRes.data || []);
      setLeaveStats({ pendingLeaves: leavesRes.data?.length || 0 });
    } catch (error) {
      console.error('Fetch Error:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return students;

    return students.filter((student) =>
      student.full_name?.toLowerCase().includes(needle) ||
      student.roll_number?.toString().toLowerCase().includes(needle)
    );
  }, [students, searchQuery]);

  const styles = {
    pageWrapper: {
      position: 'relative', minHeight: '100vh', width: '100%',
      overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: 'white'
    },
    sidebar: {
      position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      borderRight: '1px solid rgba(255,255,255,0.1)', padding: '28px 16px',
      display: 'flex', flexDirection: 'column', zIndex: 200,
      transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 190,
      opacity: menuOpen ? 1 : 0, visibility: menuOpen ? 'visible' : 'hidden', transition: '0.3s opacity'
    },
    headerGlass: {
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', borderRadius: 16,
      padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
    },
    mainContent: {
      marginLeft: isMobile ? 0 : '260px', paddingTop: '40px', padding: isMobile ? '40px 16px' : '40px 32px',
      transition: 'margin-left 0.3s ease'
    },
    glassCard: {
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)', borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.15)', padding: '24px', marginBottom: '32px'
    },
    statCard: {
      background: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)',
      padding: '18px 20px'
    },
    searchBox: {
      position: 'relative',
      width: isMobile ? '100%' : 260
    },
    searchInput: {
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24,
      padding: '10px 16px 10px 40px', color: 'white', fontSize: 13, outline: 'none', width: '100%'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={{ position: 'fixed', top: '-5%', left: '-5%', width: '110vw', height: '110vh', backgroundImage: 'url(/nature-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: -1 }} />

      {isMobile && <div style={styles.overlay} onClick={() => setMenuOpen(false)} />}

      <aside style={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>E</span>
            </div>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>EduSync</span>
          </div>
          {isMobile && <X size={24} onClick={() => setMenuOpen(false)} style={{ cursor: 'pointer', opacity: 0.7 }} />}
        </div>
        <nav style={{ flex: 1 }}>
          {[
            { label: 'Overview', icon: <TrendingUp size={20} />, path: '/dashboard/teacher' },
            { label: 'My Students', icon: <Users size={20} />, path: '/dashboard/teacher/students' },
            { label: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/dashboard/teacher/attendance' },
            { label: 'Homework', icon: <BookOpen size={20} />, path: '/dashboard/teacher/homework' },
            { label: 'Leave Requests', icon: <Calendar size={20} />, path: '/dashboard/teacher/leaves', badge: leaveStats.pendingLeaves },
            { label: 'Marks Entry', icon: <GraduationCap size={20} />, path: '/dashboard/teacher/marks' },
            { label: 'Announcements', icon: <Megaphone size={20} />, path: '/dashboard/teacher/announcements' },
            { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
            { label: 'Support', icon: <AlertCircle size={20} />, path: '/dashboard/support' },
          ].map((item) => (
            <button
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '16px',
                color: '#fff',
                opacity: window.location.pathname === item.path ? 1 : 0.6,
                background: window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '6px',
                transition: '0.2s',
                textAlign: 'left'
              }}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMenuOpen(false);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.icon} {item.label}
              </div>
              {item.badge !== undefined && (
                <span style={{ background: 'rgba(255,0,0,0.6)', borderRadius: '8px', padding: '2px 6px', fontSize: '12px', color: '#fff' }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#FF4D4D',
              fontSize: '14px',
              fontWeight: '700',
              backgroundColor: 'rgba(255, 77, 77, 0.1)',
              border: '1px solid rgba(255, 77, 77, 0.2)',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <div style={styles.headerGlass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            {isMobile && <Menu size={24} onClick={() => setMenuOpen(true)} style={{ cursor: 'pointer', color: 'white' }} />}
            <div>
              <h1 style={{ color: 'white', fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: 0 }}>
                Class Division: {teacherProfile?.class_assigned}-{teacherProfile?.section_assigned}
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                Teachers can review only their assigned roster. Enrollment and student archival stay in the principal panel.
              </p>
            </div>
          </div>
          <div style={styles.searchBox}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, opacity: 0.5, color: 'white' }} />
            <input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={styles.statCard}>
            <div style={{ fontSize: 12, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Roster Size</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{students.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 12, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Pending Leaves</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{leaveStats.pendingLeaves}</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 12, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Teacher Scope</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10 }}>
              {teacherProfile?.class_assigned || '--'} / {teacherProfile?.section_assigned || '--'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: isMobile ? 16 : 24 }}>
          {filteredStudents.map((student) => (
            <div key={student.id} style={{ ...styles.glassCard, marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', fontWeight: 800 }}>
                    {student.full_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'white' }}>{student.full_name}</h3>
                    <p style={{ fontSize: 12, opacity: 0.5, margin: 0, color: 'white' }}>
                      Roll No: {student.roll_number} | {student.gender?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                  Read only
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <Mail size={14} /> {student.parent_email || 'Parent email not provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <Phone size={14} /> {student.parent_phone || 'Parent phone not provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <Calendar size={14} /> Born: {formatDate(student.date_of_birth || student.dob)}
                </div>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div style={{ ...styles.glassCard, gridColumn: '1/-1', textAlign: 'center', padding: isMobile ? '40px 20px' : '60px' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, opacity: 0.75, margin: 0 }}>No students matched this search.</p>
              <p style={{ fontSize: 13, opacity: 0.5, margin: '10px 0 0' }}>Try a different name or roll number.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyStudents;
