import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (d=0) => ({initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6}});

export default function Demo() {
  const navigate = useNavigate();
  const portals = [
    { title: 'Principal Portal', color: '#0071e3', icon: '️', desc: 'Full dashboard with student management, fee tracking, reports and analytics.', url: 'https://edusync-frontend-beta.vercel.app', cred: 'Email: principal@demo.com · Pass: demo1234' },
    { title: 'Teacher Portal', color: '#34c759', icon: '‍', desc: 'One-click attendance, marks entry, homework management and leave tracking.', url: 'https://edusync-frontend-beta.vercel.app', cred: 'Email: teacher@demo.com · Pass: demo1234' },
    { title: 'Parent Portal', color: '#5e5ce6', icon: '‍‍', desc: 'Attendance calendar, fee status, homework and PDF report card download.', url: 'https://edusync-frontend-beta.vercel.app', cred: 'Email: parent@demo.com · Pass: demo1234' },
  ];

  return (
    <LandingLayout>
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Live Demo</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>Try EduSync live.<br/>No account needed.</h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 520, margin: '0 auto', fontFamily: C.sans, lineHeight: 1.7 }}>
            The full platform is live with sample data. Explore every feature as Principal, Teacher, or Parent.
          </p>
        </motion.div>
      </section>

      <section style={{ background: C.white, padding: '64px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {portals.map((p, i) => (
            <motion.div key={p.title} {...fade(.1+i*.08)}
              style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: 28, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 8 }}>{p.title}</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>{p.desc}</p>
              <div style={{ background: C.bg, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: C.muted, fontFamily: 'monospace', marginBottom: 16 }}>{p.cred}</div>
              <button onClick={() => window.open(p.url, '_blank')}
                style={{ background: p.color, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans, transition: 'opacity .2s, transform .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scale(1)'; }}
              >Open {p.title} →</button>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ background: C.bg, padding: '64px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(24px,3.5vw,40px)', color: C.text, marginBottom: 12 }}>Ready to set it up for your school?</h2>
        <p style={{ fontSize: 15, color: C.muted, fontFamily: C.sans, marginBottom: 30 }}>We'll have your school live within 24 hours.</p>
        <button onClick={() => navigate('/contact')}
          style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans, transition: 'background .2s, transform .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background=C.blueHov; e.currentTarget.style.transform='scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.background=C.blue; e.currentTarget.style.transform='scale(1)'; }}
        >Contact Us Today</button>
      </section>
    </LandingLayout>
  );
}
