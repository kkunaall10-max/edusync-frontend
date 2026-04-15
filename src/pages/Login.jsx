import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Principal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                throw new Error('Unable to verify account role. Please contact the administrator.');
            }

            const dbRole = profile.role.toLowerCase();
            const selectedRole = role.toLowerCase();

            if (dbRole !== selectedRole) {
                throw new Error(`Unauthorized: You are registered as a ${dbRole}, not a ${selectedRole}.`);
            }

            if (dbRole === 'principal') navigate('/dashboard/principal');
            else if (dbRole === 'teacher') {
                sessionStorage.setItem('teacherFirstLoad', 'true');
                navigate('/dashboard/teacher');
            }
            else if (dbRole === 'parent') navigate('/dashboard/parent');
            else navigate('/dashboard/student');

        } catch (err) {
            await supabase.auth.signOut().catch(() => {});
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            backgroundColor: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            padding: '20px',
            boxSizing: 'border-box'
        },
        card: {
            backgroundColor: 'white',
            width: '400px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            boxSizing: 'border-box'
        },
        title: {
            color: '#2563EB',
            fontSize: '32px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '8px',
            marginTop: 0
        },
        subtitle: {
            color: '#6B7280',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '32px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '6px'
        },
        input: {
            width: '100%',
            height: '44px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '0 12px',
            fontSize: '14px',
            marginBottom: '16px',
            boxSizing: 'border-box',
            outline: 'none'
        },
        button: {
            width: '100%',
            height: '44px',
            backgroundColor: '#2563EB',
            color: 'white',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
            transition: 'background-color 0.2s'
        },
        buttonDisabled: {
            opacity: 0.7,
            cursor: 'not-allowed'
        },
        error: {
            color: '#DC2626',
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '16px'
        },
        inputGroup: {
            marginBottom: '4px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>EduSync</h1>
                <p style={styles.subtitle}>School Management Platform</p>
                
                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Role</label>
                        <select 
                            style={styles.input}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="Principal">Principal</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Parent">Parent</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Institutional Email</label>
                        <input 
                            style={styles.input}
                            placeholder="name@edusync.edu" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            style={styles.input}
                            placeholder="••••••••" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={styles.error}>
                            {error}
                        </div>
                    )}

                    <button 
                        style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
