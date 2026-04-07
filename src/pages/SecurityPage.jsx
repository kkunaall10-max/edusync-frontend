import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (delay = 0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{delay,duration:.6,ease:'easeOut'} });

const secItems = [
  { icon: '', title: 'Row Level Security', tag: 'DATABASE', desc: 'Supabase PostgreSQL with RLS enabled. Each user can only query rows they own. Zero cross-contamination between schools, teachers, or parents.' },
  { icon: '️', title: 'Rate Limiting', tag: 'API', desc: '100 requests per 15 minutes per IP address. Brute force and credential stuffing attacks are automatically blocked at the API gateway.' },
  { icon: '', title: 'Role-Based Access Control', tag: 'AUTH', desc: 'Principal, Teacher and Parent have separate permission sets enforced at both application and database level. Teachers cannot access other classes.' },
  { icon: '', title: 'Environment Secrets', tag: 'CONFIG', desc: 'All API keys and connection strings live in environment variables on Vercel and Railway. Never in source code. Never pushed to GitHub.' },
  { icon: '️', title: '24/7 Cloud Uptime', tag: 'INFRA', desc: 'Frontend on Vercel CDN, backend on Railway with auto-restart. Works regardless of whether the school has internet — works from mobile data too.' },
  { icon: '', title: 'Input Validation', tag: 'SECURITY', desc: 'All user inputs are validated on both frontend and backend. Parameterized queries prevent SQL injection. XSS prevention built in.' },
  { icon: '', title: 'Auth via Supabase', tag: 'IDENTITY', desc: 'Supabase Auth handles password hashing, JWTs and session management. Passwords are never stored in plain text anywhere in the system.' },
  { icon: '', title: 'HTTPS Everywhere', tag: 'TRANSPORT', desc: 'All traffic is encrypted in transit using TLS 1.3. No unencrypted endpoints exist. All API calls go over HTTPS only.' },
  { icon: '️', title: 'Data Isolation', tag: 'MULTI-TENANT', desc: 'Each school\'s data is logically isolated at the database level. It is technically impossible for one school to access another school\'s records.' },
];

export default function SecurityPage() {
  const navigate = useNavigate();
  return (
    <LandingLayout>
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Security</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 20 }}>
            Enterprise-grade security.<br/>Always on.
          </h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 560, margin: '0 auto', fontFamily: C.sans, lineHeight: 1.7 }}>
            Student data is sensitive. EduSync is built with security at every layer — from database row-level policies to encrypted transport with TLS.
          </p>
        </motion.div>
      </section>

      {/* Trust bar */}
      <section style={{ background: C.white, padding: '36px 48px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
          {[['','Supabase RLS'],['','TLS 1.3'],['','Rate Limited'],['','RBAC Enforced'],['️','99.9% Uptime']].map(([icon,label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.muted, fontFamily: C.sans }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </section>

      {/* Security Cards */}
      <section style={{ background: C.bg, padding: '80px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, maxWidth: 1060, margin: '0 auto' }}>
          {secItems.map((s, i) => (
            <motion.div key={s.title} {...fade(.07 * i)}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 26 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ display: 'inline-block', background: `${C.blue}10`, borderRadius: 6, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: C.blue, letterSpacing: '1px', fontFamily: C.sans, marginBottom: 8 }}>{s.tag}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 7 }}>{s.title}</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.7 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Responsible disclosure */}
      <section style={{ background: C.white, padding: '64px 48px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(24px,3.5vw,40px)', color: C.text, marginBottom: 14 }}>Found a security issue?</h2>
          <p style={{ fontSize: 15, color: C.muted, fontFamily: C.sans, marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>
            We take all security reports seriously. Please reach out privately and we will respond within 24 hours.
          </p>
          <button onClick={() => navigate('/contact')}
            style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '13px 30px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, transition: 'background .2s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.blueHov; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = 'scale(1)'; }}
          >Report a Vulnerability</button>
        </motion.div>
      </section>
    </LandingLayout>
  );
}
